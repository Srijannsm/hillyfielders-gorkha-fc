from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.sitemaps.views import sitemap
from django.views.generic import TemplateView
from core.contact import ContactView
from core.health import HealthCheckView
from core.sitemaps import StaticSitemap, ArticleSitemap, TeamSitemap
from accounts.cookie_views import CookieLoginView, CookieRefreshView, LogoutView
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
import core.openapi  # noqa: F401 — registers CookieJWTAuthenticationScheme extension

sitemaps = {
    'static': StaticSitemap,
    'articles': ArticleSitemap,
    'teams': TeamSitemap,
}

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),

    # JWT auth (httpOnly cookie-based)
    path('api/auth/login/',   CookieLoginView.as_view(),   name='token_obtain'),
    path('api/auth/refresh/', CookieRefreshView.as_view(), name='token_refresh'),
    path('api/auth/logout/',  LogoutView.as_view(),        name='token_logout'),

    # Health check (used by Railway and monitoring tools)
    path('api/health/', HealthCheckView.as_view(), name='health-check'),

    # OpenAPI schema + Swagger UI
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

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

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) + [
    # Catch-all MUST be last — after media URLs — so /media/ requests are
    # served as files and not intercepted by the React SPA fallback.
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]