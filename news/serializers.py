from rest_framework import serializers
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