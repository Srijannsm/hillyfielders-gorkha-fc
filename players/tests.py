from django.test import TestCase
from django.db import IntegrityError, transaction
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Programme, Team, Player


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
