from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from core.contact import ContactView
from core.sitemaps import StaticSitemap, ArticleSitemap, TeamSitemap
from accounts.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView

sitemaps = {
    'static': StaticSitemap,
    'articles': ArticleSitemap,
    'teams': TeamSitemap,
}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),

    # JWT auth
    path('api/auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Public API
    path('api/players/', include('players.urls')),
    path('api/fixtures/', include('fixtures.urls')),
    path('api/news/', include('news.urls')),
    path('api/sponsors/', include('sponsors.urls')),
    path('api/contact/', ContactView.as_view(), name='contact'),
    path('api/gallery/', include('gallery.urls')),
    path('api/club/', include('club.urls')),

    # Admin API
    path('api/admin/', include('core.admin_urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)