from django.urls import path, include
from rest_framework.routers import DefaultRouter
from players.admin_views import PlayerAdminViewSet, StaffAdminViewSet, TeamAdminViewSet, ProgrammeAdminViewSet
from fixtures.admin_views import FixtureAdminViewSet, CompetitionAdminViewSet
from news.admin_views import ArticleAdminViewSet, CategoryAdminViewSet
from gallery.admin_views import PhotoAdminViewSet
from sponsors.admin_views import SponsorAdminViewSet
from club.admin_views import ClubProfileAdminView
from core.admin_dashboard import DashboardView
from accounts.admin_views import EnquiryAdminViewSet, ProfileView

router = DefaultRouter()
router.register('players',      PlayerAdminViewSet,     basename='admin-players')
router.register('staff',        StaffAdminViewSet,      basename='admin-staff')
router.register('teams',        TeamAdminViewSet,       basename='admin-teams')
router.register('programmes',   ProgrammeAdminViewSet,  basename='admin-programmes')
router.register('fixtures',     FixtureAdminViewSet,    basename='admin-fixtures')
router.register('competitions', CompetitionAdminViewSet,basename='admin-competitions')
router.register('articles',     ArticleAdminViewSet,    basename='admin-articles')
router.register('categories',   CategoryAdminViewSet,   basename='admin-categories')
router.register('photos',       PhotoAdminViewSet,      basename='admin-photos')
router.register('sponsors',     SponsorAdminViewSet,    basename='admin-sponsors')
router.register('enquiries',    EnquiryAdminViewSet,    basename='admin-enquiries')

urlpatterns = [
    path('dashboard/', DashboardView.as_view(),  name='admin-dashboard'),
    path('club/',      ClubProfileAdminView.as_view(), name='admin-club'),
    path('profile/',   ProfileView.as_view(),    name='admin-profile'),
    path('',           include(router.urls)),
]
