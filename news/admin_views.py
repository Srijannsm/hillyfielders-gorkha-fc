from rest_framework import viewsets
from accounts.permissions import role_permission
from core.soft_delete import SoftDeleteAdminMixin
from .models import Article, Category
from .serializers import ArticleAdminSerializer, CategorySerializer

_news_perm = role_permission('media_officer')


class CategoryAdminViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [_news_perm]


class ArticleAdminViewSet(SoftDeleteAdminMixin, viewsets.ModelViewSet):
    """All articles (published + drafts) for admin management."""
    queryset = Article.objects.select_related('category', 'author').all()
    serializer_class = ArticleAdminSerializer
    permission_classes = [_news_perm]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)
