from rest_framework import serializers
from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)

    class Meta:
        model = Photo
        fields = ['id', 'title', 'image', 'category', 'category_display',
                  'caption', 'date_taken', 'is_published', 'created_at']
