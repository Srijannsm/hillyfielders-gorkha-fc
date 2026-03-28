from rest_framework import generics
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Player, Team, Staff
from .serializers import PlayerSerializer, TeamSerializer, StaffSerializer

class TeamListView(generics.ListAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class TeamDetailView(generics.RetrieveAPIView):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer

class PlayerListView(generics.ListAPIView):
    serializer_class = PlayerSerializer

    def get_queryset(self):
        queryset = Player.objects.filter(is_active=True)
        team_type = self.request.query_params.get('team')
        if team_type:
            queryset = queryset.filter(team__team_type=team_type)
        return queryset

class PlayerDetailView(generics.RetrieveAPIView):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer