from rest_framework import generics
from .models import Fixture, Competition
from .serializers import FixtureSerializer, CompetitionSerializer

class FixtureListView(generics.ListAPIView):
    serializer_class = FixtureSerializer

    def get_queryset(self):
        queryset = Fixture.objects.all()
        team_type = self.request.query_params.get('team')
        completed = self.request.query_params.get('completed')
        if team_type:
            queryset = queryset.filter(our_team__team_type=team_type)
        if completed is not None:
            queryset = queryset.filter(is_completed=completed == 'true')
        return queryset