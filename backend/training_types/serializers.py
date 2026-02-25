from rest_framework import serializers
from .models import TrainingType, SessionBooking
from players.models import Player


class TrainingTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingType
        fields = "__all__"


class SessionBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SessionBooking
        fields = "__all__"
