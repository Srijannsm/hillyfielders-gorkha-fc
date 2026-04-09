from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Photo
from .serializers import PhotoAdminSerializer


class PhotoAdminViewSet(viewsets.ModelViewSet):
    """All photos (published + unpublished) for admin management."""
    queryset = Photo.objects.all()
    serializer_class = PhotoAdminSerializer
    permission_classes = [IsAdminUser]
