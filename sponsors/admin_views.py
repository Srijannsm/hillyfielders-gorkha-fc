from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Sponsor
from .serializers import SponsorSerializer


class SponsorAdminViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    permission_classes = [IsAdminUser]
