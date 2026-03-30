from django.urls import path
from .views import ClubProfileView

urlpatterns = [
    path('', ClubProfileView.as_view(), name='club-profile'),
]
