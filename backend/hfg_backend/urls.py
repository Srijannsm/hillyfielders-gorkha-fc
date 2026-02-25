from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from players.views import PlayerViewSet

router = DefaultRouter()
router.register(r"players", PlayerViewSet)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(router.urls)),
    path("api/", include("training_sessions.urls")),
    path('api/', include('training_types.urls')),
    path('accounts/', include('django.contrib.auth.urls')),  # login, logout, password
    path("players/", include("players.urls")),
]
