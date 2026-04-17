from rest_framework import viewsets
from accounts.permissions import role_permission
from .models import Fixture, Competition
from .serializers import FixtureSerializer, CompetitionSerializer

_fixtures_perm = role_permission('team_manager', 'secretary', 'coach')


class CompetitionAdminViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [_fixtures_perm]


class FixtureAdminViewSet(viewsets.ModelViewSet):
    queryset = Fixture.objects.select_related('our_team', 'competition').all()
    serializer_class = FixtureSerializer
    permission_classes = [_fixtures_perm]
