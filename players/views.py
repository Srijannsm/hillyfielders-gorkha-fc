from rest_framework import generics
from .models import Programme, Player, Team
from .serializers import PlayerSerializer, TeamSerializer, ProgrammeSerializer


class ProgrammeListView(generics.ListAPIView):
    """All active programmes with their active teams nested inside."""
    serializer_class = ProgrammeSerializer

    def get_queryset(self):
        return Programme.objects.filter(is_active=True).prefetch_related(
            'teams__players', 'teams__staff'
        )


class TeamListView(generics.ListAPIView):
    """All active teams (flat list)."""
    serializer_class = TeamSerializer

    def get_queryset(self):
        return (
            Team.objects
            .filter(is_active=True, programme__is_active=True)
            .select_related('programme')
            .prefetch_related('players', 'staff')
        )


class TeamDetailView(generics.RetrieveAPIView):
    """Single team looked up by slug, with nested players and staff."""
    serializer_class = TeamSerializer
    lookup_field     = 'slug'

    def get_queryset(self):
        return (
            Team.objects
            .filter(is_active=True)
            .select_related('programme')
            .prefetch_related('players', 'staff')
        )


class PlayerListView(generics.ListAPIView):
    serializer_class = PlayerSerializer

    def get_queryset(self):
        queryset  = Player.objects.filter(is_active=True)
        team_slug = self.request.query_params.get('team')
        if team_slug:
            queryset = queryset.filter(team__slug=team_slug)
        return queryset


class PlayerDetailView(generics.RetrieveAPIView):
    queryset         = Player.objects.all()
    serializer_class = PlayerSerializer
