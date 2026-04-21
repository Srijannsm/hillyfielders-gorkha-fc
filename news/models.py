from django.db import models
from django.contrib.auth.models import User
from core.soft_delete import SoftDeleteMixin

class Category(models.Model):
    name = models.CharField(max_length=100)  # e.g. "Match Report", "Club News"

    def __str__(self):
        return self.name


class Article(SoftDeleteMixin, models.Model):
    title = models.CharField(max_length=300)
    slug = models.SlugField(unique=True)  # URL-friendly version of title
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True)
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    cover_image = models.ImageField(upload_to='news/', blank=True, null=True)
    content = models.TextField()
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['is_published']),
        ]

    def __str__(self):
        return self.title