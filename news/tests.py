from django.test import TestCase
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from accounts.models import UserProfile
from .models import Category, Article

User = get_user_model()


def make_media_officer(username='mo'):
    user = User.objects.create_user(username=username, password='Pass123!', is_staff=True)
    UserProfile.objects.create(user=user, role='media_officer')
    return user


class NewsAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user('author', password='testpass123')
        self.cat = Category.objects.create(name='Club News')
        self.published = Article.objects.create(
            title='Published Article',
            slug='published-article',
            category=self.cat,
            author=self.user,
            content='This is published content.',
            is_published=True,
        )
        self.draft = Article.objects.create(
            title='Draft Article',
            slug='draft-article',
            category=self.cat,
            author=self.user,
            content='This is draft content.',
            is_published=False,
        )

    def test_news_list_returns_200(self):
        res = self.client.get('/api/news/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('results', res.data)

    def test_news_list_only_shows_published(self):
        res = self.client.get('/api/news/')
        titles = [a['title'] for a in res.data['results']]
        self.assertIn('Published Article', titles)
        self.assertNotIn('Draft Article', titles)

    def test_article_detail_published(self):
        res = self.client.get('/api/news/published-article/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['title'], 'Published Article')

    def test_article_detail_draft_returns_404(self):
        res = self.client.get('/api/news/draft-article/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)

    def test_article_detail_nonexistent_returns_404(self):
        res = self.client.get('/api/news/does-not-exist/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)


class ArticleAdminTests(APITestCase):

    def setUp(self):
        self.mo = make_media_officer('mo_news')
        self.cat = Category.objects.create(name='Match Reports')

    def _client(self):
        c = APIClient()
        c.force_authenticate(user=self.mo)
        return c

    def test_media_officer_can_list_all_articles_including_drafts(self):
        Article.objects.create(title='Draft', slug='draft-1', content='X', is_published=False, category=self.cat)
        res = self._client().get('/api/admin/articles/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        titles = [a['title'] for a in res.data['results']]
        self.assertIn('Draft', titles)

    def test_media_officer_can_create_article(self):
        res = self._client().post('/api/admin/articles/', {
            'title': 'New Article',
            'content': 'Content here.',
            'is_published': False,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertTrue(Article.objects.filter(title='New Article').exists())

    def test_article_slug_auto_generated_from_title(self):
        res = self._client().post('/api/admin/articles/', {
            'title': 'Auto Slug Test Article',
            'content': 'Content.',
            'is_published': False,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['slug'], 'auto-slug-test-article')

    def test_article_slug_collision_auto_incremented(self):
        Article.objects.create(title='Collision', slug='collision', content='X', is_published=False)
        res = self._client().post('/api/admin/articles/', {
            'title': 'Collision',
            'content': 'Y',
            'is_published': False,
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['slug'], 'collision-1')

    def test_media_officer_can_publish_article(self):
        article = Article.objects.create(
            title='To Publish', slug='to-publish', content='X', is_published=False, category=self.cat
        )
        res = self._client().patch(f'/api/admin/articles/{article.pk}/', {'is_published': True}, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        article.refresh_from_db()
        self.assertTrue(article.is_published)

    def test_media_officer_can_delete_article(self):
        article = Article.objects.create(title='Delete Me', slug='delete-me', content='X', is_published=False)
        res = self._client().delete(f'/api/admin/articles/{article.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Article.objects.filter(pk=article.pk).exists())

    def test_non_media_officer_cannot_access_articles_admin(self):
        coach = User.objects.create_user('cch', password='Pass123!', is_staff=True)
        UserProfile.objects.create(user=coach, role='coach')
        c = APIClient()
        c.force_authenticate(user=coach)
        res = c.get('/api/admin/articles/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_delete_soft_deletes_article(self):
        article = Article.objects.create(title='Soft Del', slug='soft-del', content='X', is_published=False)
        res = self._client().delete(f'/api/admin/articles/{article.pk}/')
        self.assertEqual(res.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Article.objects.filter(pk=article.pk).exists())
        article.refresh_from_db()
        self.assertIsNotNone(article.deleted_at)

    def test_deleted_article_hidden_from_admin_list(self):
        article = Article.objects.create(title='Hidden Art', slug='hidden-art', content='X', is_published=False)
        self._client().delete(f'/api/admin/articles/{article.pk}/')
        res = self._client().get('/api/admin/articles/')
        ids = [a['id'] for a in res.data['results']]
        self.assertNotIn(article.pk, ids)

    def test_restore_article(self):
        article = Article.objects.create(title='Restore Art', slug='restore-art', content='X', is_published=False)
        self._client().delete(f'/api/admin/articles/{article.pk}/')
        res = self._client().post(f'/api/admin/articles/{article.pk}/restore/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        article.refresh_from_db()
        self.assertIsNone(article.deleted_at)
