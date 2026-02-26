from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import TrainingType, SessionBooking
from .serializers import TrainingTypeSerializer, SessionBookingSerializer

class TrainingTypeListView(generics.ListAPIView):
    queryset = TrainingType.objects.filter(is_active=True)
    serializer_class = TrainingTypeSerializer
    permission_classes = [AllowAny]

class SessionBookingCreateView(generics.CreateAPIView):
    queryset = SessionBooking.objects.all()
    serializer_class = SessionBookingSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(player=self.request.user.player)

class PlayerBookingListView(generics.ListAPIView):
    serializer_class = SessionBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SessionBooking.objects.filter(player=self.request.user.player).order_by(
            "-scheduled_date", "-scheduled_time"
        )