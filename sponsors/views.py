from rest_framework import generics
from .models import Sponsor
from .serializers import SponsorSerializer

class SponsorListView(generics.ListAPIView):
    queryset = Sponsor.objects.filter(is_active=True).order_by('tier')
    serializer_class = SponsorSerializer