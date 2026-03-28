from rest_framework import serializers
from .models import Player, Team, Staff

class PlayerSerializer(serializers.ModelSerializer):
    position_display = serializers.CharField(
        source='get_position_display', read_only=True
    )
    team_name = serializers.CharField(
        source='team.name', read_only=True
    )

    class Meta:
        model = Player
        fields = [
            'id', 'name', 'position', 'position_display',
            'jersey_number', 'nationality', 'photo',
            'bio', 'is_active', 'team', 'team_name'
        ]


class StaffSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(
        source='get_role_display', read_only=True
    )

    class Meta:
        model = Staff
        fields = ['id', 'name', 'role', 'role_display', 'photo', 'bio', 'team']


class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True, read_only=True)
    staff = StaffSerializer(many=True, read_only=True)

    class Meta:
        model = Team
        fields = ['id', 'name', 'team_type', 'description', 'players', 'staff']