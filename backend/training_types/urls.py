from django.urls import path
from .views import (
    TrainingTypeListView,
    SessionBookingCreateView,
    PlayerBookingListView
)

urlpatterns = [
    path("training-types/", TrainingTypeListView.as_view(), name="training_type_list"),
    path("book-session/", SessionBookingCreateView.as_view(), name="book_session"),
    path("player-bookings/", PlayerBookingListView.as_view(), name="player_bookings"),
]