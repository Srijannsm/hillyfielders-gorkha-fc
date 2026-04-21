from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError
from accounts.permissions import role_permission
from core.soft_delete import SoftDeleteAdminMixin
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

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': 'Cannot delete this team — other records depend on it. Remove those first.'},
                status=status.HTTP_409_CONFLICT,
            )


class PlayerAdminViewSet(SoftDeleteAdminMixin, viewsets.ModelViewSet):
    queryset = Player.objects.select_related('team').all()
    serializer_class = PlayerSerializer
    permission_classes = [_squad_perm]


class StaffAdminViewSet(viewsets.ModelViewSet):
    queryset = Staff.objects.select_related('team').all()
    serializer_class = StaffSerializer
    permission_classes = [_squad_perm]
