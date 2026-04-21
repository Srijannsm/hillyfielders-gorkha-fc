from django.test import TestCase
from django.db import IntegrityError, transaction
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import UserProfile
from .models import Programme, Team, Player, Staff

User = get_user_model()


def make_staff_user(username, role):
    user = User.objects.create_user(username=username, password='Pass123!', is_staff=True)
    UserProfile.objects.create(user=user, role=role)
    return user


class PlayerModelTests(TestCase):
    def setUp(self):
        self.prog, _ = Programme.objects.get_or_create(gender='mens', defaults={'name': "Men's Programme"})
        self.team, _ = Team.objects.get_or_create(programme=self.prog, name='Senior', defaults={'slug': 'mens-senior'})
        Player.objects.get_or_create(team=self.team, jersey_number=1, defaults={'name': 'Player One', 'position': 'GK'})

    def test_duplicate_jersey_number_raises(self):
        """Two players on the same team cannot share a jersey number."""
        with transaction.atomic():
            with self.assertRaises(IntegrityError):
                Player.objects.create(
                    team=self.team, name='Player Two', position='DEF', jersey_number=1
                )

    def test_same_jersey_different_teams_allowed(self):
        """Jersey number 1 can exist on two different teams."""
        team2, _ = Team.objects.get_or_create(programme=self.prog, name='U-16-test', defaults={'slug': 'mens-u16-test'})
        player = Player.objects.create(
            team=team2, name='Other Player', position='GK', jersey_number=1
        )
        self.assertIsNotNone(player.pk)


class ProgrammeAPITests(APITestCase):
    def setUp(self):
        prog, _ = Programme.objects.get_or_create(gender='mens', defaults={'name': "Men's Programme"})
        team, _ = Team.objects.get_or_create(programme=prog, name='Senior', defaults={'slug': 'mens-senior'})
        Player.objects.get_or_create(team=team, jersey_number=1, defaults={'name': 'Active Player', 'position': 'GK', 'is_active': True})
        Player.objects.get_or_create(team=team, jersey_number=2, defaults={'name': 'Inactive Player', 'position': 'DEF', 'is_active': False})

    def test_programmes_list_returns_200(self):
        res = self.client.get('/api/players/programmes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)

    def test_teams_list_returns_200(self):
        res = self.client.get('/api/players/teams/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_team_detail_by_slug(self):
        res = self.client.get('/api/players/teams/mens-senior/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['slug'], 'mens-senior')

    def test_team_detail_unknown_slug_returns_404(self):
        res = self.client.get('/api/players/teams/does-not-exist/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_players_list_excludes_inactive(self):
        res = self.client.get('/api/players/')
        names = [p['name'] for p in res.data['results']]
        self.assertIn('Active Player', names)
        self.assertNotIn('Inactive Player', names)

    def test_inactive_team_excluded_from_list(self):
        prog, _ = Programme.objects.get_or_create(gender='mens', defaults={'name': "Men's Programme"})
        Team.objects.get_or_create(programme=prog, name='Inactive Team', defaults={'slug': 'mens-inactive', 'is_active': False})
        res = self.client.get('/api/players/teams/')
        slugs = [t['slug'] for t in res.data['results']]
        self.assertNotIn('mens-inactive', slugs)


class PlayerAdminTests(APITestCase):

    def setUp(self):
        self.prog, _ = Programme.objects.get_or_create(gender='mens', defaults={'name': "Men's Programme"})
        self.team, _ = Team.objects.get_or_create(programme=self.prog, name='Senior Adm', defaults={'slug': 'mens-senior-adm'})
        self.manager = make_staff_user('mgr_pl', 'team_manager')
        self.media = make_staff_user('med_pl', 'media_officer')

    def _client(self, user):
        c = APIClient()
        c.force_authenticate(user=user)
        return c

    def test_team_manager_can_create_player(self):
        res = self._client(self.manager).post('/api/admin/players/', {
            'name': 'New Player', 'position': 'GK', 'jersey_number': 99,
            'team': self.team.pk, 'nationality': 'Nepali', 'is_active': True,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Player.objects.filter(name='New Player').exists())

    def test_team_manager_can_update_player(self):
        player = Player.objects.create(team=self.team, name='Update Me', position='DEF', jersey_number=88)
        res = self._client(self.manager).patch(
            f'/api/admin/players/{player.pk}/', {'position': 'MID'}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        player.refresh_from_db()
        self.assertEqual(player.position, 'MID')

    def test_team_manager_can_delete_player(self):
        player = Player.objects.create(team=self.team, name='Delete Me', position='FWD', jersey_number=77)
        res = self._client(self.manager).delete(f'/api/admin/players/{player.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Player.objects.filter(pk=player.pk).exists())

    def test_media_officer_cannot_create_player(self):
        res = self._client(self.media).post('/api/admin/players/', {
            'name': 'Hack Player', 'position': 'GK', 'jersey_number': 55,
            'team': self.team.pk,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_list_admin_players(self):
        res = self.client.get('/api/admin/players/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_delete_soft_deletes_player(self):
        player = Player.objects.create(team=self.team, name='Soft Delete Me', position='MID', jersey_number=66)
        res = self._client(self.manager).delete(f'/api/admin/players/{player.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Player.objects.filter(pk=player.pk).exists())
        player.refresh_from_db()
        self.assertIsNotNone(player.deleted_at)

    def test_deleted_player_hidden_from_default_list(self):
        player = Player.objects.create(team=self.team, name='Hidden Player', position='GK', jersey_number=65)
        self._client(self.manager).delete(f'/api/admin/players/{player.pk}/')
        res = self._client(self.manager).get('/api/admin/players/')
        ids = [p['id'] for p in res.data['results']]
        self.assertNotIn(player.pk, ids)

    def test_deleted_player_appears_with_deleted_filter(self):
        player = Player.objects.create(team=self.team, name='Trashed Player', position='DEF', jersey_number=64)
        self._client(self.manager).delete(f'/api/admin/players/{player.pk}/')
        res = self._client(self.manager).get('/api/admin/players/?deleted=true')
        ids = [p['id'] for p in res.data['results']]
        self.assertIn(player.pk, ids)

    def test_restore_player(self):
        player = Player.objects.create(team=self.team, name='Restore Me', position='FWD', jersey_number=63)
        self._client(self.manager).delete(f'/api/admin/players/{player.pk}/')
        res = self._client(self.manager).post(f'/api/admin/players/{player.pk}/restore/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        player.refresh_from_db()
        self.assertIsNone(player.deleted_at)
