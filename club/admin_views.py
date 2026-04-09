from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework import status
from .models import ClubProfile
from .serializers import ClubProfileSerializer


class ClubProfileAdminView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        profile = ClubProfile.get()
        return Response(ClubProfileSerializer(profile).data)

    def patch(self, request):
        profile = ClubProfile.get()
        serializer = ClubProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request):
        profile = ClubProfile.get()
        serializer = ClubProfileSerializer(profile, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
