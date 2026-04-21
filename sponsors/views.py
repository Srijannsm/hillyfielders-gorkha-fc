from django.db.models import Case, IntegerField, Value, When
from drf_spectacular.utils import extend_schema
from rest_framework import generics
from .models import Sponsor
from .serializers import SponsorSerializer

_TIER_ORDER = Case(
    When(tier='platinum', then=Value(0)),
    When(tier='gold', then=Value(1)),
    When(tier='silver', then=Value(2)),
    default=Value(3),
    output_field=IntegerField(),
)


class SponsorListView(generics.ListAPIView):
    queryset = Sponsor.objects.filter(is_active=True).annotate(tier_order=_TIER_ORDER).order_by('tier_order', 'name')
    serializer_class = SponsorSerializer

    @extend_schema(tags=['sponsors'], summary='List active sponsors')
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)