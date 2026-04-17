from rest_framework import viewsets
from accounts.permissions import role_permission
from .models import Sponsor
from .serializers import SponsorSerializer


class SponsorAdminViewSet(viewsets.ModelViewSet):
    queryset = Sponsor.objects.all()
    serializer_class = SponsorSerializer
    permission_classes = [role_permission('secretary')]
