from rest_framework import viewsets
from rest_framework.permissions import IsAdminUser
from .models import Article, Category
from .serializers import ArticleAdminSerializer, CategorySerializer


class CategoryAdminViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsAdminUser]


class ArticleAdminViewSet(viewsets.ModelViewSet):
    """All articles (published + drafts) for admin management."""
    queryset = Article.objects.select_related('category', 'author').all()
    serializer_class = ArticleAdminSerializer
    permission_classes = [IsAdminUser]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
