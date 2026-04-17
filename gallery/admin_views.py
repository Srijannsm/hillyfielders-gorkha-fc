from rest_framework import viewsets
from accounts.permissions import role_permission
from .models import Photo
from .serializers import PhotoAdminSerializer


class PhotoAdminViewSet(viewsets.ModelViewSet):
    """All photos (published + unpublished) for admin management."""
    queryset = Photo.objects.all()
    serializer_class = PhotoAdminSerializer
    permission_classes = [role_permission('media_officer', 'coach')]
