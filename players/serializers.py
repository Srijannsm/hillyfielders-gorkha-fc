from rest_framework import serializers
from .models import Programme, Player, Team, Staff


class PlayerSerializer(serializers.ModelSerializer):
    position_display = serializers.CharField(source='get_position_display', read_only=True)
    team_name        = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model  = Player
        fields = [
            'id', 'name', 'position', 'position_display',
            'jersey_number', 'nationality', 'photo',
            'bio', 'is_active', 'team', 'team_name',
        ]


class StaffSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    team_name    = serializers.CharField(source='team.name', read_only=True)

    class Meta:
        model  = Staff
        fields = ['id', 'name', 'role', 'role_display', 'photo', 'bio', 'team', 'team_name']


class TeamSerializer(serializers.ModelSerializer):
    players          = PlayerSerializer(many=True, read_only=True)
    staff            = StaffSerializer(many=True, read_only=True)
    programme_name   = serializers.CharField(source='programme.name', read_only=True)
    programme_gender = serializers.CharField(source='programme.gender', read_only=True)

    class Meta:
        model  = Team
        fields = [
            'id', 'name', 'slug', 'description', 'is_active', 'order',
            'programme', 'programme_name', 'programme_gender',
            'players', 'staff',
        ]


class ProgrammeSerializer(serializers.ModelSerializer):
    teams = TeamSerializer(many=True, read_only=True)

    class Meta:
        model  = Programme
        fields = ['id', 'gender', 'name', 'is_active', 'teams']
