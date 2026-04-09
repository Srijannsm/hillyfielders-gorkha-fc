from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Programme, Team, Player, Staff
from .serializers import PlayerSerializer, StaffSerializer, TeamSerializer, ProgrammeSerializer


class ProgrammeAdminViewSet(viewsets.ModelViewSet):
    queryset = Programme.objects.all()
    serializer_class = ProgrammeSerializer
    permission_classes = [IsAdminUser]


class TeamAdminViewSet(viewsets.ModelViewSet):
    queryset = (
        Team.objects
        .select_related('programme')
        .prefetch_related('players', 'staff')
        .all()
    )
    serializer_class = TeamSerializer
    permission_classes = [IsAdminUser]


class PlayerAdminViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.select_related('team').all()
    serializer_class = PlayerSerializer
    permission_classes = [IsAdminUser]


class StaffAdminViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.select_related('team').all()
    serializer_class = StaffSerializer
    permission_classes = [IsAdminUser]
