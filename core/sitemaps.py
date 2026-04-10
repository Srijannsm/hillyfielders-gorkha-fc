from django.contrib.sitemaps import Sitemap
from news.models import Article
from players.models import Team


class StaticSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.8

    def items(self):
        return ['/', '/news/', '/gallery/', '/about/', '/sponsors/', '/contact/']

    def location(self, item):
        return item


class ArticleSitemap(Sitemap):
    changefreq = 'monthly'
    priority = 0.6

    def items(self):
        return Article.objects.filter(is_published=True).order_by('-updated_at')

    def location(self, obj):
        return f'/news/{obj.slug}/'

    def lastmod(self, obj):
        return obj.updated_at


class TeamSitemap(Sitemap):
    changefreq = 'weekly'
    priority = 0.7

    def items(self):
        return Team.objects.filter(is_active=True, programme__is_active=True)

    def location(self, obj):
        return f'/{obj.slug}/squad'
