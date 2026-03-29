from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from core.contact import ContactView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/players/', include('players.urls')),
    path('api/fixtures/', include('fixtures.urls')),
    path('api/news/', include('news.urls')),
    path('api/sponsors/', include('sponsors.urls')),
    path('api/contact/', ContactView.as_view(), name='contact'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)