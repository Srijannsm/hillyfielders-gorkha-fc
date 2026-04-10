from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from players.models import Player, Staff, Team
from fixtures.models import Fixture
from news.models import Article
from gallery.models import Photo
from sponsors.models import Sponsor
from accounts.models import Enquiry
from django.utils import timezone


class DashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        now = timezone.now()

        # Recent fixtures (last 5 completed)
        recent_fixtures = Fixture.objects.filter(is_completed=True).order_by('-date')[:5]
        recent_fixture_data = [
            {
                'id': f.id,
                'home': f.home_team_name,
                'away': f.away_team_name,
                'home_score': f.home_score,
                'away_score': f.away_score,
                'date': f.date.isoformat(),
                'result': f.result,
            }
            for f in recent_fixtures
        ]

        # Upcoming fixtures (next 5)
        upcoming_fixtures = Fixture.objects.filter(
            is_completed=False, date__gte=now
        ).order_by('date')[:5]
        upcoming_fixture_data = [
            {
                'id': f.id,
                'home': f.home_team_name,
                'away': f.away_team_name,
                'date': f.date.isoformat(),
                'venue': f.venue,
            }
            for f in upcoming_fixtures
        ]

        # Recent articles (last 5)
        recent_articles = Article.objects.order_by('-created_at')[:5]
        recent_article_data = [
            {
                'id': a.id,
                'title': a.title,
                'slug': a.slug,
                'is_published': a.is_published,
                'created_at': a.created_at.isoformat(),
            }
            for a in recent_articles
        ]

        # Recent enquiries (last 5)
        recent_enquiries = Enquiry.objects.order_by('-created_at')[:5]
        recent_enquiry_data = [
            {
                'id': e.id,
                'name': e.name,
                'email': e.email,
                'is_read': e.is_read,
                'created_at': e.created_at.isoformat(),
            }
            for e in recent_enquiries
        ]

        return Response({
            # Counts
            'players':              Player.objects.count(),
            'active_players':       Player.objects.filter(is_active=True).count(),
            'staff':                Staff.objects.count(),
            'teams':                Team.objects.count(),
            'fixtures_total':       Fixture.objects.count(),
            'fixtures_upcoming':    Fixture.objects.filter(is_completed=False, date__gte=now).count(),
            'fixtures_completed':   Fixture.objects.filter(is_completed=True).count(),
            'articles_total':       Article.objects.count(),
            'articles_published':   Article.objects.filter(is_published=True).count(),
            'photos':               Photo.objects.count(),
            'sponsors':             Sponsor.objects.filter(is_active=True).count(),
            'enquiries_total':      Enquiry.objects.count(),
            'enquiries_unread':     Enquiry.objects.filter(is_read=False).count(),

            # Recent data
            'recent_fixtures':      recent_fixture_data,
            'upcoming_fixtures':    upcoming_fixture_data,
            'recent_articles':      recent_article_data,
            'recent_enquiries':     recent_enquiry_data,
        })
