from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import ClubProfile
from .serializers import ClubProfileSerializer


class ClubProfileView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(tags=['club'], summary='Get club profile', responses={200: ClubProfileSerializer})
    def get(self, request):
        profile = ClubProfile.get()
        serializer = ClubProfileSerializer(profile)
        return Response(serializer.data)
