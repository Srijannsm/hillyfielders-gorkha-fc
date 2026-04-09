from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from players.models import Player, Staff, Team
from fixtures.models import Fixture
from news.models import Article
from gallery.models import Photo
from sponsors.models import Sponsor
from django.utils import timezone


class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()
        return Response({
            'players':          Player.objects.count(),
            'staff':            Staff.objects.count(),
            'teams':            Team.objects.count(),
            'fixtures_total':   Fixture.objects.count(),
            'fixtures_upcoming':Fixture.objects.filter(is_completed=False, date__gte=now).count(),
            'articles_total':   Article.objects.count(),
            'articles_published':Article.objects.filter(is_published=True).count(),
            'photos':           Photo.objects.count(),
            'sponsors':         Sponsor.objects.filter(is_active=True).count(),
        })
