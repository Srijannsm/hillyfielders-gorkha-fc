from django.urls import path
from . import views

urlpatterns = [
    path('',                    views.PlayerListView.as_view(),    name='player-list'),
    path('<int:pk>/',           views.PlayerDetailView.as_view(),  name='player-detail'),
    path('teams/',              views.TeamListView.as_view(),      name='team-list'),
    path('teams/<slug:slug>/',  views.TeamDetailView.as_view(),    name='team-detail'),
    path('programmes/',         views.ProgrammeListView.as_view(), name='programme-list'),
]
