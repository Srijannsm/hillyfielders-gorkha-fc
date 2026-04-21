from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework import status
from django.db.models import ProtectedError
from accounts.permissions import role_permission
from .models import Fixture, Competition
from .serializers import FixtureSerializer, CompetitionSerializer

_fixtures_perm = role_permission('team_manager', 'secretary', 'coach')


class CompetitionAdminViewSet(viewsets.ModelViewSet):
    queryset = Competition.objects.all()
    serializer_class = CompetitionSerializer
    permission_classes = [_fixtures_perm]

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'detail': 'Cannot delete this competition — fixtures are still linked to it.'},
                status=status.HTTP_409_CONFLICT,
            )


class FixtureAdminViewSet(viewsets.ModelViewSet):
    queryset = Fixture.objects.select_related('our_team', 'competition').all()
    serializer_class = FixtureSerializer
    permission_classes = [_fixtures_perm]
