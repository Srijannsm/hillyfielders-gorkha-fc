from rest_framework import generics
from .models import Article
from .serializers import ArticleSerializer, ArticleListSerializer

class ArticleListView(generics.ListAPIView):
    serializer_class = ArticleListSerializer

    def get_queryset(self):
        return Article.objects.filter(is_published=True).select_related('category', 'author')

class ArticleDetailView(generics.RetrieveAPIView):
    queryset = Article.objects.filter(is_published=True)
    serializer_class = ArticleSerializer
    lookup_field = 'slug'