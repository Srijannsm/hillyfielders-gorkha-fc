from rest_framework import viewsets
from accounts.permissions import role_permission
from .models import Programme, Team, Player, Staff
from .serializers import PlayerSerializer, StaffSerializer, TeamSerializer, ProgrammeSerializer

_squad_perm = role_permission('team_manager', 'coach')


class ProgrammeAdminViewSet(viewsets.ModelViewSet):
    queryset = Programme.objects.all()
    serializer_class = ProgrammeSerializer
    permission_classes = [_squad_perm]


class TeamAdminViewSet(viewsets.ModelViewSet):
    queryset = (
        Team.objects
        .select_related('programme')
        .prefetch_related('players', 'staff')
        .all()
    )
    serializer_class = TeamSerializer
    permission_classes = [_squad_perm]


class PlayerAdminViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.select_related('team').all()
    serializer_class = PlayerSerializer
    permission_classes = [_squad_perm]


class StaffAdminViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.select_related('team').all()
    serializer_class = StaffSerializer
    permission_classes = [_squad_perm]
