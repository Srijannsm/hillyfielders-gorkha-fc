from rest_framework import serializers
from django.utils.text import slugify
from .models import Article, Category

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class ArticleSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )
    author_name = serializers.CharField(
        source='author.get_full_name', read_only=True
    )

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category',
            'category_name', 'author_name', 'cover_image',
            'content', 'is_published', 'created_at'
        ]


class ArticleListSerializer(serializers.ModelSerializer):
    # Lighter version for listing — doesn't include full content
    category_name = serializers.CharField(
        source='category.name', read_only=True
    )

    class Meta:
        model = Article
        fields = [
            'id', 'title', 'slug', 'category_name',
            'cover_image', 'is_published', 'created_at'
        ]


class ArticleAdminSerializer(serializers.ModelSerializer):
    """Writable serializer for admin CRUD. Slug auto-generated from title if not provided."""
    category_name = serializers.CharField(source='category.name', read_only=True)
    author_name   = serializers.CharField(source='author.get_full_name', read_only=True)

    class Meta:
        model  = Article
        fields = [
            'id', 'title', 'slug', 'category', 'category_name',
            'author', 'author_name', 'cover_image',
            'content', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'author_name', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Auto-generate slug from title if not provided
        if not attrs.get('slug') and attrs.get('title'):
            attrs['slug'] = slugify(attrs['title'])
        return attrs