from django.urls import path
from .views import (
    TrainingTypeListView,
    SessionBookingCreateView,
    PlayerBookingListView
)

urlpatterns = [
    path('training_types/', TrainingTypeListView.as_view()),
    path('book_session/', SessionBookingCreateView.as_view()),
    path('bookings/player/<int:player_id>/', PlayerBookingListView.as_view()),
]