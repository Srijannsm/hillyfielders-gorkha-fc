from io import BytesIO

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from PIL import Image
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from accounts.models import UserProfile
from .models import Photo

User = get_user_model()


def make_test_image(name='test.jpg', width=400, height=300, fmt='JPEG'):
    buf = BytesIO()
    img = Image.new('RGB', (width, height), color=(100, 150, 200))
    img.save(buf, format=fmt)
    buf.seek(0)
    return SimpleUploadedFile(name, buf.read(), content_type='image/jpeg')


def make_staff(username, role):
    user = User.objects.create_user(username=username, password='Pass123!', is_staff=True)
    UserProfile.objects.create(user=user, role=role)
    return user


def as_client(user):
    c = APIClient()
    c.force_authenticate(user=user)
    return c


# ─── Photo Model Tests ────────────────────────────────────────────────────────

class PhotoModelTests(APITestCase):

    def _create_photo(self, **kwargs):
        defaults = dict(
            title='Test Photo',
            image=make_test_image(),
            category='training',
            is_published=True,
        )
        defaults.update(kwargs)
        return Photo.objects.create(**defaults)

    def test_photo_thumbnail_generated_on_upload(self):
        photo = self._create_photo()
        self.assertTrue(bool(photo.thumbnail))

    def test_photo_dimensions_stored(self):
        photo = self._create_photo()
        self.assertGreater(photo.width, 0)
        self.assertGreater(photo.height, 0)

    def test_photo_image_converted_to_webp(self):
        photo = self._create_photo()
        self.assertIn('.webp', photo.image.name)

    def test_large_image_resized_to_max_1200(self):
        photo = self._create_photo(image=make_test_image('big.jpg', 2400, 1800))
        self.assertLessEqual(max(photo.width, photo.height), 1200)

    def test_thumbnail_max_20px(self):
        photo = self._create_photo()
        from PIL import Image as PILImage
        thumb_img = PILImage.open(photo.thumbnail)
        self.assertLessEqual(max(thumb_img.size), 20)


# ─── Photo Public API Tests ───────────────────────────────────────────────────

class PhotoPublicAPITests(APITestCase):

    def setUp(self):
        buf = BytesIO()
        Image.new('RGB', (100, 100)).save(buf, format='JPEG')
        buf.seek(0)
        img_file = SimpleUploadedFile('p.jpg', buf.read(), content_type='image/jpeg')
        self.photo = Photo.objects.create(
            title='Published Photo', image=img_file, category='training', is_published=True
        )
        buf2 = BytesIO()
        Image.new('RGB', (100, 100)).save(buf2, format='JPEG')
        buf2.seek(0)
        img_file2 = SimpleUploadedFile('p2.jpg', buf2.read(), content_type='image/jpeg')
        Photo.objects.create(
            title='Draft Photo', image=img_file2, category='matchday', is_published=False
        )

    def test_gallery_list_returns_200(self):
        res = self.client.get('/api/gallery/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_published_photos_visible(self):
        res = self.client.get('/api/gallery/')
        titles = [p['title'] for p in res.data['results']]
        self.assertIn('Published Photo', titles)

    def test_unpublished_photos_excluded(self):
        res = self.client.get('/api/gallery/')
        titles = [p['title'] for p in res.data['results']]
        self.assertNotIn('Draft Photo', titles)

    def test_category_filter_works(self):
        res = self.client.get('/api/gallery/?category=training')
        titles = [p['title'] for p in res.data['results']]
        self.assertIn('Published Photo', titles)

    def test_category_filter_excludes_other_categories(self):
        res = self.client.get('/api/gallery/?category=academy')
        self.assertEqual(len(res.data['results']), 0)


# ─── Photo Admin API Tests ────────────────────────────────────────────────────

class PhotoAdminAPITests(APITestCase):

    def setUp(self):
        self.media_officer = make_staff('mediaofficer', 'media_officer')
        self.coach = make_staff('coachuser', 'coach')
        self.secretary = make_staff('secuser', 'secretary')

    def test_media_officer_can_list_all_photos(self):
        res = as_client(self.media_officer).get('/api/admin/photos/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_coach_can_list_photos(self):
        res = as_client(self.coach).get('/api/admin/photos/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_secretary_cannot_access_photos_admin(self):
        res = as_client(self.secretary).get('/api/admin/photos/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_media_officer_can_upload_photo(self):
        res = as_client(self.media_officer).post('/api/admin/photos/', {
            'title': 'New Upload',
            'image': make_test_image(),
            'category': 'training',
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Photo.objects.filter(title='New Upload').exists())

    def test_coach_can_upload_photo(self):
        res = as_client(self.coach).post('/api/admin/photos/', {
            'title': 'Coach Upload',
            'image': make_test_image(),
            'category': 'matchday',
        }, format='multipart')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_media_officer_can_delete_photo(self):
        buf = BytesIO()
        Image.new('RGB', (100, 100)).save(buf, format='JPEG')
        buf.seek(0)
        photo = Photo.objects.create(
            title='To Delete',
            image=SimpleUploadedFile('del.jpg', buf.read(), content_type='image/jpeg'),
            category='training',
        )
        res = as_client(self.media_officer).delete(f'/api/admin/photos/{photo.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Photo.objects.filter(pk=photo.pk).exists())

    def test_unauthenticated_cannot_upload_photo(self):
        res = self.client.post('/api/admin/photos/', {
            'title': 'Anon Upload',
            'image': make_test_image(),
            'category': 'training',
        }, format='multipart')
        self.assertIn(res.status_code, [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN])
