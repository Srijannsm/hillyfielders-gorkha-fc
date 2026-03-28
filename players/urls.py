from django.urls import path
from . import views

urlpatterns = [
    path('', views.PlayerListView.as_view(), name='player-list'),
    path('<int:pk>/', views.PlayerDetailView.as_view(), name='player-detail'),
    path('teams/', views.TeamListView.as_view(), name='team-list'),
    path('teams/<int:pk>/', views.TeamDetailView.as_view(), name='team-detail'),
]