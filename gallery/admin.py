from django.contrib import admin
from .models import Photo


@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'date_taken', 'is_published']
    list_filter = ['category', 'is_published']
    search_fields = ['title']
