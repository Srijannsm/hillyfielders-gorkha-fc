from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from accounts.models import UserProfile
from .models import Sponsor

User = get_user_model()


def make_logo():
    buf = BytesIO()
    Image.new('RGB', (100, 100), color=(255, 255, 255)).save(buf, format='PNG')
    buf.seek(0)
    return SimpleUploadedFile('logo.png', buf.read(), content_type='image/png')


def make_staff(username, role):
    user = User.objects.create_user(username=username, password='Pass123!', is_staff=True)
    UserProfile.objects.create(user=user, role=role)
    return user


def as_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


class SponsorPublicAPITests(APITestCase):

    def setUp(self):
        Sponsor.objects.create(name='Platinum Co', logo=make_logo(), tier='platinum', is_active=True)
        Sponsor.objects.create(name='Gold Co', logo=make_logo(), tier='gold', is_active=True)
        Sponsor.objects.create(name='Inactive Co', logo=make_logo(), tier='silver', is_active=False)

    def test_sponsors_list_returns_200(self):
        res = self.client.get('/api/sponsors/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_active_sponsors_visible(self):
        res = self.client.get('/api/sponsors/')
        names = [s['name'] for s in res.data['results']]
        self.assertIn('Platinum Co', names)
        self.assertIn('Gold Co', names)

    def test_inactive_sponsors_excluded(self):
        res = self.client.get('/api/sponsors/')
        names = [s['name'] for s in res.data['results']]
        self.assertNotIn('Inactive Co', names)

    def test_sponsors_ordered_by_tier(self):
        res = self.client.get('/api/sponsors/')
        tiers = [s['tier'] for s in res.data['results']]
        tier_order = {'platinum': 0, 'gold': 1, 'silver': 2}
        ordered = sorted(tiers, key=lambda t: tier_order.get(t, 99))
        self.assertEqual(tiers, ordered)


class SponsorAdminAPITests(APITestCase):

    def setUp(self):
        self.secretary = make_staff('sec', 'secretary')
        self.coach = make_staff('cch', 'coach')
        self.sponsor = Sponsor.objects.create(
            name='Test Sponsor', logo=make_logo(), tier='gold', is_active=True
        )

    def test_secretary_can_list_sponsors(self):
        res = as_client(self.secretary).get('/api/admin/sponsors/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_secretary_can_create_sponsor(self):
        res = as_client(self.secretary).post('/api/admin/sponsors/', {
            'name': 'New Sponsor',
            'logo': make_logo(),
            'tier': 'silver',
            'is_active': True,
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Sponsor.objects.filter(name='New Sponsor').exists())

    def test_secretary_can_update_sponsor(self):
        res = as_client(self.secretary).patch(
            f'/api/admin/sponsors/{self.sponsor.pk}/',
            {'name': 'Updated Name'},
            format='json',
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.sponsor.refresh_from_db()
        self.assertEqual(self.sponsor.name, 'Updated Name')

    def test_secretary_can_delete_sponsor(self):
        res = as_client(self.secretary).delete(f'/api/admin/sponsors/{self.sponsor.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Sponsor.objects.filter(pk=self.sponsor.pk).exists())

    def test_coach_cannot_access_sponsors_admin(self):
        res = as_client(self.coach).get('/api/admin/sponsors/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_secretary_cannot_create_sponsor(self):
        res = as_client(self.coach).post('/api/admin/sponsors/', {
            'name': 'Unauthorized',
            'logo': make_logo(),
            'tier': 'silver',
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_cannot_access_sponsor_admin(self):
        res = self.client.get('/api/admin/sponsors/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
