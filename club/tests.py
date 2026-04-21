from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from accounts.models import UserProfile
from .models import ClubProfile

User = get_user_model()


def make_staff(username, role):
    user = User.objects.create_user(username=username, password='Pass123!', is_staff=True)
    UserProfile.objects.create(user=user, role=role)
    return user


def as_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


def seed_profile(**kwargs):
    defaults = dict(
        our_story_body='A great story.',
        mission='Play football.',
        vision='Be champions.',
        values='Respect, Integrity.',
        programmes_body='Active programmes.',
        active_programmes='Men\nWomen',
        coming_soon_programmes='Youth',
        ground_story='Historic ground.',
    )
    defaults.update(kwargs)
    ClubProfile.objects.filter(pk=1).delete()
    return ClubProfile.objects.create(pk=1, **defaults)


# ─── ClubProfile Model Tests ──────────────────────────────────────────────────

class ClubProfileModelTests(APITestCase):

    def test_singleton_save_always_uses_pk_1(self):
        p = ClubProfile(
            our_story_body='Story', mission='M', vision='V', values='Val',
            programmes_body='Prog', active_programmes='Men', coming_soon_programmes='',
            ground_story='Ground',
        )
        p.save()
        self.assertEqual(p.pk, 1)

    def test_second_save_overwrites_pk_1(self):
        seed_profile()
        p2 = ClubProfile(
            our_story_body='New story', mission='New', vision='New V', values='New Val',
            programmes_body='New Prog', active_programmes='Men', coming_soon_programmes='',
            ground_story='New Ground',
        )
        p2.save()
        self.assertEqual(ClubProfile.objects.count(), 1)
        self.assertEqual(ClubProfile.objects.get(pk=1).our_story_body, 'New story')

    def test_classmethod_get_creates_if_missing(self):
        ClubProfile.objects.filter(pk=1).delete()
        profile = ClubProfile.get()
        self.assertEqual(profile.pk, 1)

    def test_classmethod_get_returns_existing(self):
        seed_profile(our_story_body='Existing')
        profile = ClubProfile.get()
        self.assertEqual(profile.our_story_body, 'Existing')


# ─── ClubProfile Public API ───────────────────────────────────────────────────

class ClubProfilePublicAPITests(APITestCase):

    def setUp(self):
        seed_profile(tagline='From the Hills')

    def test_club_profile_returns_200(self):
        res = self.client.get('/api/club/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_club_profile_contains_expected_fields(self):
        res = self.client.get('/api/club/')
        for field in ['founded_year', 'home_ground', 'district', 'tagline']:
            self.assertIn(field, res.data)


# ─── ClubProfile Admin API ────────────────────────────────────────────────────

class ClubProfileAdminAPITests(APITestCase):

    def setUp(self):
        seed_profile(tagline='Original Tagline')
        self.secretary = make_staff('sec', 'secretary')
        self.coach = make_staff('cch', 'coach')
        self.superadmin = User.objects.create_superuser('sa', password='Pass123!')

    def test_secretary_can_get_club_profile(self):
        res = as_client(self.secretary).get('/api/admin/club/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_secretary_can_update_club_profile(self):
        res = as_client(self.secretary).patch('/api/admin/club/', {'tagline': 'New Tagline'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['tagline'], 'New Tagline')

    def test_secretary_full_replace_club_profile(self):
        full_data = {
            'founded_year': '2020',
            'home_ground': 'New Ground',
            'district': 'Kathmandu',
            'province': 'Bagmati',
            'tagline': 'New Tag',
            'our_story_heading': 'New Heading',
            'our_story_body': 'New story.',
            'mission': 'New mission.',
            'vision': 'New vision.',
            'values': 'New values.',
            'programmes_heading': 'New prog heading',
            'programmes_body': 'New prog body.',
            'active_programmes': 'Men\nWomen',
            'coming_soon_programmes': 'Youth',
            'ground_story': 'New ground story.',
        }
        res = as_client(self.secretary).put('/api/admin/club/', full_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_coach_cannot_access_club_admin(self):
        res = as_client(self.coach).get('/api/admin/club/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_coach_cannot_update_club_profile(self):
        res = as_client(self.coach).patch('/api/admin/club/', {'tagline': 'Hack'}, format='json')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_can_access_club_admin(self):
        res = as_client(self.superadmin).get('/api/admin/club/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_unauthenticated_cannot_access_club_admin(self):
        res = self.client.get('/api/admin/club/')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
