from django.shortcuts import render
from rest_framework import generics
from .models import TrainingType, SessionBooking
from .serializers import TrainingTypeSerializer, SessionBookingSerializer

class TrainingTypeListView(generics.ListAPIView):
    queryset = TrainingType.objects.all()
    serializer_class = TrainingTypeSerializer

class SessionBookingCreateView(generics.CreateAPIView):
    queryset = SessionBooking.objects.all()
    serializer_class = SessionBookingSerializer
    
class PlayerBookingListView(generics.ListAPIView):
    serializer_class = SessionBookingSerializer

    def get_queryset(self):
        player_id = self.kwargs['player_id']
        return SessionBooking.objects.filter(player_id=player_id)    