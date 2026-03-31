from rest_framework import serializers
from .models import Photo


class PhotoSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    alt = serializers.SerializerMethodField()

    class Meta:
        model = Photo
        fields = [
            'id', 'title',
            'image', 'thumbnail', 'width', 'height',
            'category', 'category_display',
            'caption', 'alt',
            'date_taken', 'is_published', 'created_at',
        ]

    def get_alt(self, obj):
        return obj.caption or ''
