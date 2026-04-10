from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from players.models import Programme, Team
from .models import Competition, Fixture


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
