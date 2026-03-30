from rest_framework import serializers
from .models import ClubProfile


class ClubProfileSerializer(serializers.ModelSerializer):
    active_programmes_list = serializers.SerializerMethodField()
    coming_soon_list = serializers.SerializerMethodField()

    class Meta:
        model = ClubProfile
        fields = '__all__'

    def get_active_programmes_list(self, obj):
        return [p.strip() for p in obj.active_programmes.split('\n') if p.strip()]

    def get_coming_soon_list(self, obj):
        return [p.strip() for p in obj.coming_soon_programmes.split('\n') if p.strip()]
