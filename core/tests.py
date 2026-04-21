from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from accounts.models import UserProfile

User = get_user_model()


class ContactAPITests(APITestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()

    def tearDown(self):
        from django.core.cache import cache
        cache.clear()

    def test_contact_missing_fields_returns_400(self):
        res = self.client.post('/api/contact/', {'name': 'Test', 'email': 'test@example.com'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_contact_invalid_email_returns_400(self):
        res = self.client.post('/api/contact/', {
            'name': 'Test', 'email': 'notanemail', 'message': 'Hello there'
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_contact_empty_fields_returns_400(self):
        res = self.client.post('/api/contact/', {'name': '', 'email': '', 'message': ''})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_contact_valid_submission_returns_200(self):
        res = self.client.post('/api/contact/', {
            'name': 'Jane Doe', 'email': 'jane@example.com', 'message': 'I love this club!'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class HealthCheckTests(APITestCase):

    def test_health_check_returns_200(self):
        res = self.client.get('/api/health/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_health_check_contains_required_fields(self):
        res = self.client.get('/api/health/')
        self.assertIn('status', res.data)
        self.assertIn('database', res.data)
        self.assertIn('timestamp', res.data)

    def test_health_check_database_ok(self):
        res = self.client.get('/api/health/')
        self.assertEqual(res.data['database'], 'ok')

    def test_health_check_accessible_without_auth(self):
        res = APIClient().get('/api/health/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)


class AdminDashboardTests(APITestCase):

    def setUp(self):
        self.admin = User.objects.create_user('dash_admin', password='Pass123!', is_staff=True)
        UserProfile.objects.create(user=self.admin, role='secretary')

    def test_dashboard_returns_200_for_admin(self):
        c = APIClient()
        c.force_authenticate(user=self.admin)
        res = c.get('/api/admin/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_dashboard_contains_expected_stat_keys(self):
        c = APIClient()
        c.force_authenticate(user=self.admin)
        res = c.get('/api/admin/dashboard/')
        for key in ['players', 'active_players', 'teams', 'fixtures_total',
                    'articles_total', 'enquiries_total', 'enquiries_unread']:
            self.assertIn(key, res.data, f'Missing key: {key}')

    def test_dashboard_requires_authentication(self):
        res = self.client.get('/api/admin/dashboard/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_dashboard_unauthenticated_user_blocked(self):
        user = User.objects.create_user('nonadmin', password='Pass123!', is_staff=False)
        c = APIClient()
        c.force_authenticate(user=user)
        res = c.get('/api/admin/dashboard/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
