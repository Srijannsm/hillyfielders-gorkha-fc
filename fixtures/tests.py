from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.utils import timezone
from django.contrib.auth import get_user_model
from players.models import Programme, Team
from .models import Competition, Fixture
from accounts.models import UserProfile

User = get_user_model()


def make_staff(username, role):
    user = User.objects.create_user(username=username, password='Pass123!', is_staff=True)
    UserProfile.objects.create(user=user, role=role)
    return user


class FixtureAPITests(APITestCase):
    def setUp(self):
        prog, _  = Programme.objects.get_or_create(gender='mens',   defaults={'name': "Men's Programme"})
        prog2, _ = Programme.objects.get_or_create(gender='womens', defaults={'name': "Women's Programme"})
        self.team,  _ = Team.objects.get_or_create(programme=prog,  name='Senior', defaults={'slug': 'mens-senior-fix'})
        self.team2, _ = Team.objects.get_or_create(programme=prog2, name='U-16',   defaults={'slug': 'womens-u16-fix'})
        self.comp, _ = Competition.objects.get_or_create(name='Friendly', season='2025/26')

        Fixture.objects.get_or_create(
            our_team=self.team, home_team_name='Gorkha FC', away_team_name='Rival FC',
            defaults=dict(
                competition=self.comp,
                date=timezone.now() + timezone.timedelta(days=7),
                is_home_game=True, is_completed=False,
            ),
        )
        Fixture.objects.get_or_create(
            our_team=self.team, home_team_name='Gorkha FC', away_team_name='Other FC',
            defaults=dict(
                competition=self.comp,
                date=timezone.now() - timezone.timedelta(days=3),
                is_home_game=True, is_completed=True,
                home_score=2, away_score=1,
            ),
        )
        Fixture.objects.get_or_create(
            our_team=self.team2, home_team_name='Gorkha FC Women', away_team_name='City FC',
            defaults=dict(
                competition=self.comp,
                date=timezone.now() + timezone.timedelta(days=14),
                is_home_game=True, is_completed=False,
            ),
        )

    def test_fixtures_list_returns_200(self):
        res = self.client.get('/api/fixtures/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)

    def test_fixtures_filter_by_team(self):
        res = self.client.get(f'/api/fixtures/?team={self.team.slug}')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 2)

    def test_fixtures_filter_completed_true(self):
        res = self.client.get(f'/api/fixtures/?team={self.team.slug}&completed=true')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)
        self.assertTrue(res.data['results'][0]['is_completed'])

    def test_fixtures_filter_completed_false(self):
        res = self.client.get(f'/api/fixtures/?team={self.team.slug}&completed=false')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)
        self.assertFalse(res.data['results'][0]['is_completed'])

    def test_fixture_result_computed_correctly(self):
        res = self.client.get(f'/api/fixtures/?team={self.team.slug}&completed=true')
        self.assertEqual(res.data['results'][0]['result'], 'W')

    def test_fixture_result_draw(self):
        Fixture.objects.create(
            our_team=self.team, home_team_name='Gorkha FC', away_team_name='Draw FC',
            competition=self.comp,
            date=timezone.now() - timezone.timedelta(days=5),
            is_home_game=True, is_completed=True,
            home_score=1, away_score=1,
        )
        res = self.client.get(f'/api/fixtures/?team={self.team.slug}&completed=true')
        results = {f['away_team_name']: f['result'] for f in res.data['results']}
        self.assertEqual(results.get('Draw FC'), 'D')

    def test_fixture_result_loss_home_game(self):
        Fixture.objects.create(
            our_team=self.team, home_team_name='Gorkha FC', away_team_name='Strong FC',
            competition=self.comp,
            date=timezone.now() - timezone.timedelta(days=6),
            is_home_game=True, is_completed=True,
            home_score=0, away_score=3,
        )
        res = self.client.get(f'/api/fixtures/?team={self.team.slug}&completed=true')
        results = {f['away_team_name']: f['result'] for f in res.data['results']}
        self.assertEqual(results.get('Strong FC'), 'L')


class FixtureAdminTests(APITestCase):

    def setUp(self):
        prog, _ = Programme.objects.get_or_create(gender='mens', defaults={'name': "Men's Programme"})
        self.team, _ = Team.objects.get_or_create(programme=prog, name='Senior Admin', defaults={'slug': 'mens-senior-admin'})
        self.comp, _ = Competition.objects.get_or_create(name='Cup', season='2025/26')
        self.manager = make_staff('mgr', 'team_manager')
        self.media = make_staff('med', 'media_officer')

    def _client(self, user):
        c = APIClient()
        c.force_authenticate(user=user)
        return c

    def test_team_manager_can_create_fixture(self):
        res = self._client(self.manager).post('/api/admin/fixtures/', {
            'our_team': self.team.pk,
            'home_team_name': 'Gorkha FC',
            'away_team_name': 'Cup Rival',
            'competition': self.comp.pk,
            'date': (timezone.now() + timezone.timedelta(days=10)).isoformat(),
            'is_home_game': True,
            'is_completed': False,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_team_manager_can_update_fixture(self):
        fixture = Fixture.objects.create(
            our_team=self.team, home_team_name='GFC', away_team_name='Old Rival',
            competition=self.comp, date=timezone.now() + timezone.timedelta(days=2),
            is_home_game=True, is_completed=False,
        )
        res = self._client(self.manager).patch(
            f'/api/admin/fixtures/{fixture.pk}/', {'away_team_name': 'New Rival'}, format='json'
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        fixture.refresh_from_db()
        self.assertEqual(fixture.away_team_name, 'New Rival')

    def test_media_officer_cannot_create_fixture(self):
        res = self._client(self.media).post('/api/admin/fixtures/', {
            'our_team': self.team.pk, 'home_team_name': 'GFC', 'away_team_name': 'Unauthorized',
            'date': timezone.now().isoformat(), 'is_home_game': True, 'is_completed': False,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_past_incomplete_fixture_rejected(self):
        res = self._client(self.manager).post('/api/admin/fixtures/', {
            'our_team': self.team.pk,
            'home_team_name': 'GFC',
            'away_team_name': 'Past Rival',
            'competition': self.comp.pk,
            'date': (timezone.now() - timezone.timedelta(days=1)).isoformat(),
            'is_home_game': True,
            'is_completed': False,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_past_completed_fixture_allowed(self):
        res = self._client(self.manager).post('/api/admin/fixtures/', {
            'our_team': self.team.pk,
            'home_team_name': 'GFC',
            'away_team_name': 'Past Done',
            'competition': self.comp.pk,
            'date': (timezone.now() - timezone.timedelta(days=1)).isoformat(),
            'is_home_game': True,
            'is_completed': True,
            'home_score': 2,
            'away_score': 1,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_competition_delete_blocked_when_fixtures_exist(self):
        Fixture.objects.create(
            our_team=self.team, home_team_name='GFC', away_team_name='Protected',
            competition=self.comp,
            date=timezone.now() + timezone.timedelta(days=5),
            is_home_game=True, is_completed=False,
        )
        res = self._client(self.manager).delete(f'/api/admin/competitions/{self.comp.pk}/')
        self.assertEqual(res.status_code, status.HTTP_409_CONFLICT)

    def test_competition_delete_allowed_when_no_fixtures(self):
        empty_comp, _ = Competition.objects.get_or_create(name='Empty', season='2025/26')
        res = self._client(self.manager).delete(f'/api/admin/competitions/{empty_comp.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
