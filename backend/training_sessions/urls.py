from rest_framework import routers
from .views import TrainingSessionViewSet
from django.urls import path, include

router = routers.DefaultRouter()
router.register(r'training_sessions', TrainingSessionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]