from rest_framework.generics import ListAPIView
from .models import Photo
from .serializers import PhotoSerializer


class PhotoListView(ListAPIView):
    serializer_class = PhotoSerializer

    def get_queryset(self):
        queryset = Photo.objects.filter(is_published=True)
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category=category)
        return queryset
