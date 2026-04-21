from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from accounts.permissions import role_permission
from .models import ClubProfile
from .serializers import ClubProfileSerializer


class ClubProfileAdminView(APIView):
    permission_classes = [role_permission('secretary')]

    @extend_schema(tags=['admin-club'], summary='Get club profile (admin)', responses={200: ClubProfileSerializer})
    def get(self, request):
        profile = ClubProfile.get()
        return Response(ClubProfileSerializer(profile).data)

    @extend_schema(tags=['admin-club'], summary='Partial update club profile', request=ClubProfileSerializer, responses={200: ClubProfileSerializer})
    def patch(self, request):
        profile = ClubProfile.get()
        serializer = ClubProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @extend_schema(tags=['admin-club'], summary='Full replace club profile', request=ClubProfileSerializer, responses={200: ClubProfileSerializer})
    def put(self, request):
        profile = ClubProfile.get()
        serializer = ClubProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
