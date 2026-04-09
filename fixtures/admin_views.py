from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Fixture, Competition
from .serializers import FixtureSerializer, CompetitionSerializer


class CompetitionAdminViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [IsAdminUser]


class FixtureAdminViewSet(viewsets.ModelViewSet):
    queryset = Fixture.objects.select_related('our_team', 'competition').all()
    serializer_class = FixtureSerializer
    permission_classes = [IsAdminUser]
