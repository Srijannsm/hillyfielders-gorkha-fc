import time
from django.db import IntegrityError
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
    # required=False so validate() can auto-generate from title when omitted
    slug = serializers.SlugField(required=False, allow_blank=True)

    class Meta:
        model  = Article
        fields = [
            'id', 'title', 'slug', 'category', 'category_name',
            'author', 'author_name', 'cover_image',
            'content', 'is_published', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'author', 'author_name', 'created_at', 'updated_at']

    def validate(self, attrs):
        if not attrs.get('slug') and attrs.get('title'):
            attrs['slug'] = slugify(attrs['title']) or f'article-{int(time.time())}'
        return attrs

    def create(self, validated_data):
        from django.db import transaction
        base_slug = validated_data.get('slug', f'article-{int(time.time())}')
        n = 1
        while True:
            # Nested atomic() creates a savepoint; rolls it back cleanly on IntegrityError
            # so the outer transaction stays usable for the retry.
            try:
                with transaction.atomic():
                    return Article.objects.create(**validated_data)
            except IntegrityError:
                validated_data['slug'] = f'{base_slug}-{n}'
                n += 1
                if n > 20:
                    validated_data['slug'] = f'{base_slug}-{int(time.time())}'
                    return Article.objects.create(**validated_data)