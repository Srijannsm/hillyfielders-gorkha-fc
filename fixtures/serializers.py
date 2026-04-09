from rest_framework import serializers
from .models import Fixture, Competition

class CompetitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Competition
        fields = ['id', 'name', 'season']


class FixtureSerializer(serializers.ModelSerializer):
    competition_name = serializers.CharField(
        source='competition.name', read_only=True
    )
    team_name = serializers.CharField(
        source='our_team.name', read_only=True
    )
    result = serializers.CharField(read_only=True)

    class Meta:
        model = Fixture
        fields = [
            'id', 'home_team_name', 'away_team_name',
            'our_team', 'team_name', 'competition', 'competition_name',
            'date', 'venue', 'is_home_game',
            'home_score', 'away_score',
            'is_completed', 'result'
        ]