from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.contact import ContactView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # JWT auth
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain'),
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