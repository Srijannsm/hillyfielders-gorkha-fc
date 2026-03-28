from django.urls import path
from . import views

urlpatterns = [
    path('', views.FixtureListView.as_view(), name='fixture-list'),
]