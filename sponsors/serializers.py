from rest_framework import serializers
from .models import Sponsor

class SponsorSerializer(serializers.ModelSerializer):
    tier_display = serializers.CharField(
        source='get_tier_display', read_only=True
    )

    class Meta:
        model = Sponsor
        fields = ['id', 'name', 'logo', 'website', 'tier', 'tier_display', 'is_active']