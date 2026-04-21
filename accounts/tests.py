from unittest.mock import patch
from django.test import TestCase, override_settings
from django.contrib.auth import get_user_model
from django.core.cache import cache
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from .models import UserProfile, Enquiry

User = get_user_model()


def make_staff_user(username, role, password='TestPass123!'):
    user = User.objects.create_user(username=username, password=password, is_staff=True)
    UserProfile.objects.create(user=user, role=role)
    return user


def make_superuser(username='superadmin', password='TestPass123!'):
    return User.objects.create_superuser(username=username, password=password)


# ─── Authentication ────────────────────────────────────────────────────────────

class AuthenticationTests(APITestCase):

    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user(
            username='testadmin', password='TestPass123!', is_staff=True
        )
        UserProfile.objects.create(user=self.user, role='secretary')

    def tearDown(self):
        cache.clear()

    def test_login_valid_credentials_returns_200(self):
        res = self.client.post('/api/auth/login/', {'username': 'testadmin', 'password': 'TestPass123!'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('username', res.data)
        self.assertIn('gfc_access', res.cookies)
        self.assertIn('gfc_refresh', res.cookies)

    def test_login_invalid_credentials_returns_401(self):
        res = self.client.post('/api/auth/login/', {'username': 'testadmin', 'password': 'wrongpass'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_missing_fields_returns_401(self):
        res = self.client.post('/api/auth/login/', {'username': 'testadmin'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_response_contains_role(self):
        res = self.client.post('/api/auth/login/', {'username': 'testadmin', 'password': 'TestPass123!'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['role'], 'secretary')

    def test_login_remember_me_sets_persistent_cookie(self):
        res = self.client.post(
            '/api/auth/login/',
            {'username': 'testadmin', 'password': 'TestPass123!', 'remember_me': True},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIsNotNone(res.cookies['gfc_access']['max-age'])
        self.assertIsNotNone(res.cookies['gfc_refresh']['max-age'])

    def test_login_without_remember_me_is_session_cookie(self):
        res = self.client.post(
            '/api/auth/login/',
            {'username': 'testadmin', 'password': 'TestPass123!', 'remember_me': False},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.cookies['gfc_access']['max-age'], '')

    def test_token_refresh_with_valid_cookie_returns_200(self):
        login_res = self.client.post('/api/auth/login/', {'username': 'testadmin', 'password': 'TestPass123!'}, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_200_OK)
        refresh_res = self.client.post('/api/auth/refresh/')
        self.assertEqual(refresh_res.status_code, status.HTTP_200_OK)
        self.assertIn('gfc_access', refresh_res.cookies)

    def test_token_refresh_without_cookie_returns_401(self):
        res = self.client.post('/api/auth/refresh/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_clears_cookies(self):
        self.client.post('/api/auth/login/', {'username': 'testadmin', 'password': 'TestPass123!'}, format='json')
        res = self.client.post('/api/auth/logout/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.cookies['gfc_access']['max-age'], 0)
        self.assertEqual(res.cookies['gfc_refresh']['max-age'], 0)

    def test_login_rate_limit_throttle_is_configured(self):
        from accounts.cookie_views import LoginRateThrottle, CookieLoginView
        view = CookieLoginView()
        throttle_classes = [type(t).__name__ for t in [c() for c in view.throttle_classes]]
        self.assertIn('LoginRateThrottle', throttle_classes)
        self.assertEqual(LoginRateThrottle.scope, 'login')

    def test_login_rate_limit_triggers_429_via_cache_injection(self):
        import time
        from accounts.cookie_views import LoginRateThrottle
        # Inject a full 10/hour history into the cache so the next request is throttled
        throttle = LoginRateThrottle()
        now = time.time()
        history = [now - i for i in range(10)]
        cache_key = f'throttle_login_127.0.0.1'
        cache.set(cache_key, history, timeout=3600)
        res = self.client.post('/api/auth/login/', {'username': 'wrong', 'password': 'wrong'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


# ─── Role-Based Permissions ────────────────────────────────────────────────────

class RolePermissionTests(APITestCase):

    def setUp(self):
        self.superadmin = make_superuser('superadmin_test')
        self.media_officer = make_staff_user('media1', 'media_officer')
        self.team_manager = make_staff_user('manager1', 'team_manager')
        self.secretary = make_staff_user('secretary1', 'secretary')
        self.coach = make_staff_user('coach1', 'coach')

    def _as(self, user):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def test_superadmin_can_access_user_management(self):
        res = self._as(self.superadmin).get('/api/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_non_superadmin_cannot_access_user_list(self):
        for user in [self.media_officer, self.team_manager, self.secretary, self.coach]:
            res = self._as(user).get('/api/admin/users/')
            self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN, f'{user.username} should be forbidden')

    def test_media_officer_can_access_news(self):
        res = self._as(self.media_officer).get('/api/admin/articles/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_media_officer_cannot_access_players(self):
        res = self._as(self.media_officer).get('/api/admin/players/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_media_officer_cannot_access_enquiries(self):
        res = self._as(self.media_officer).get('/api/admin/enquiries/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_team_manager_can_access_players(self):
        res = self._as(self.team_manager).get('/api/admin/players/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_team_manager_can_access_teams(self):
        res = self._as(self.team_manager).get('/api/admin/teams/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_team_manager_cannot_access_news(self):
        res = self._as(self.team_manager).get('/api/admin/articles/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_secretary_can_access_enquiries(self):
        res = self._as(self.secretary).get('/api/admin/enquiries/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_secretary_can_access_sponsors(self):
        res = self._as(self.secretary).get('/api/admin/sponsors/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_secretary_cannot_access_players(self):
        res = self._as(self.secretary).get('/api/admin/players/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_can_access_players(self):
        res = self._as(self.coach).get('/api/admin/players/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_coach_can_access_gallery(self):
        res = self._as(self.coach).get('/api/admin/photos/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_coach_cannot_access_news(self):
        res = self._as(self.coach).get('/api/admin/articles/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_admin_endpoints(self):
        for url in ['/api/admin/players/', '/api/admin/articles/', '/api/admin/enquiries/', '/api/admin/users/']:
            res = self.client.get(url)
            self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN], f'{url} should require auth')

    def test_dashboard_requires_authentication(self):
        res = self.client.get('/api/admin/dashboard/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_authenticated_admin_can_access_dashboard(self):
        res = self._as(self.secretary).get('/api/admin/dashboard/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_superadmin_can_access_all_admin_sections(self):
        for url in ['/api/admin/players/', '/api/admin/articles/', '/api/admin/enquiries/',
                    '/api/admin/sponsors/', '/api/admin/photos/', '/api/admin/fixtures/']:
            res = self._as(self.superadmin).get(url)
            self.assertEqual(res.status_code, status.HTTP_200_OK, f'superadmin should access {url}')


# ─── User Management ───────────────────────────────────────────────────────────

class UserManagementTests(APITestCase):

    def setUp(self):
        self.superadmin = make_superuser('sa')
        self.client.force_authenticate(user=self.superadmin)

    def test_superadmin_can_list_staff_users(self):
        make_staff_user('staffer', 'coach')
        res = self.client.get('/api/admin/users/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)

    def test_superadmin_can_create_user(self):
        res = self.client.post('/api/admin/users/', {
            'username': 'newstaff',
            'password': 'StrongPass99!',
            'role': 'media_officer',
            'first_name': 'Jane',
            'last_name': 'Doe',
            'email': 'jane@example.com',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newstaff').exists())
        self.assertTrue(UserProfile.objects.filter(user__username='newstaff', role='media_officer').exists())

    def test_created_user_is_staff(self):
        self.client.post('/api/admin/users/', {
            'username': 'staffcheck',
            'password': 'StrongPass99!',
            'role': 'coach',
        }, format='json')
        user = User.objects.get(username='staffcheck')
        self.assertTrue(user.is_staff)

    def test_superadmin_cannot_delete_own_account(self):
        res = self.client.delete(f'/api/admin/users/{self.superadmin.pk}/')
        self.assertIn(res.status_code, [status.HTTP_400_BAD_REQUEST, status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_superadmin_can_delete_other_user(self):
        other = make_staff_user('tobedeleted', 'coach')
        res = self.client.delete(f'/api/admin/users/{other.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='tobedeleted').exists())

    def test_superadmin_can_update_user_role(self):
        user = make_staff_user('rolechange', 'coach')
        res = self.client.patch(f'/api/admin/users/{user.pk}/', {'role': 'media_officer'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        user.profile.refresh_from_db()
        self.assertEqual(user.profile.role, 'media_officer')

    def test_create_user_with_weak_password_rejected(self):
        res = self.client.post('/api/admin/users/', {
            'username': 'weakuser',
            'password': '123',
            'role': 'coach',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_superadmin_excluded_from_user_list(self):
        make_superuser('anothersuperadmin')
        res = self.client.get('/api/admin/users/')
        usernames = [u['username'] for u in res.data['results']]
        self.assertNotIn('anothersuperadmin', usernames)


# ─── Admin Profile ─────────────────────────────────────────────────────────────

class ProfileManagementTests(APITestCase):

    def setUp(self):
        self.user = make_staff_user('profuser', 'secretary')
        self.client.force_authenticate(user=self.user)

    def test_profile_get_returns_own_info(self):
        res = self.client.get('/api/admin/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['username'], 'profuser')

    def test_profile_update_changes_name(self):
        res = self.client.patch('/api/admin/profile/', {'first_name': 'Updated'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Updated')

    def test_profile_requires_authentication(self):
        self.client.force_authenticate(user=None)
        res = self.client.get('/api/admin/profile/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])

    def test_password_change_requires_current_password(self):
        res = self.client.patch('/api/admin/profile/', {
            'new_password': 'NewPass123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_change_with_wrong_current_password_rejected(self):
        res = self.client.patch('/api/admin/profile/', {
            'current_password': 'WrongPass!',
            'new_password': 'NewPass123!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_password_change_with_correct_current_password_succeeds(self):
        res = self.client.patch('/api/admin/profile/', {
            'current_password': 'TestPass123!',
            'new_password': 'NewPass456!',
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPass456!'))


# ─── Enquiries ─────────────────────────────────────────────────────────────────

class EnquiryTests(APITestCase):

    def setUp(self):
        cache.clear()
        self.secretary = make_staff_user('sec', 'secretary')
        self.enquiry = Enquiry.objects.create(
            name='Test User', email='test@example.com', message='Hello there'
        )

    def test_contact_form_creates_enquiry(self):
        initial_count = Enquiry.objects.count()
        res = self.client.post('/api/contact/', {
            'name': 'Jane', 'email': 'jane@example.com', 'message': 'Test message'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(Enquiry.objects.count(), initial_count + 1)

    def test_contact_form_missing_fields_returns_400(self):
        res = self.client.post('/api/contact/', {'name': 'Jane'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_contact_form_invalid_email_returns_400(self):
        res = self.client.post('/api/contact/', {
            'name': 'Jane', 'email': 'not-an-email', 'message': 'Test'
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_secretary_can_list_enquiries(self):
        self.client.force_authenticate(user=self.secretary)
        res = self.client.get('/api/admin/enquiries/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)

    def test_secretary_can_mark_enquiry_as_read(self):
        self.client.force_authenticate(user=self.secretary)
        res = self.client.post(f'/api/admin/enquiries/{self.enquiry.pk}/mark_read/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.enquiry.refresh_from_db()
        self.assertTrue(self.enquiry.is_read)

    def test_secretary_can_mark_all_enquiries_as_read(self):
        Enquiry.objects.create(name='B', email='b@b.com', message='Hi')
        Enquiry.objects.create(name='C', email='c@c.com', message='Ho')
        self.client.force_authenticate(user=self.secretary)
        res = self.client.post('/api/admin/enquiries/mark_all_read/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(Enquiry.objects.filter(is_read=False).count(), 0)

    def test_secretary_can_delete_enquiry(self):
        self.client.force_authenticate(user=self.secretary)
        res = self.client.delete(f'/api/admin/enquiries/{self.enquiry.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Enquiry.objects.filter(pk=self.enquiry.pk).exists())

    def test_non_secretary_cannot_access_enquiries(self):
        coach = make_staff_user('coachx', 'coach')
        self.client.force_authenticate(user=coach)
        res = self.client.get('/api/admin/enquiries/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_enquiries(self):
        res = self.client.get('/api/admin/enquiries/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
