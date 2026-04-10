from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from .models import Category, Article


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
