from django.contrib import admin
from .models import ClubProfile


@admin.register(ClubProfile)
class ClubProfileAdmin(admin.ModelAdmin):
    fieldsets = [
        ('Club Identity', {
            'fields': ['founded_year', 'home_ground', 'district', 'province', 'tagline']
        }),
        ('Our Story', {
            'fields': ['our_story_heading', 'our_story_body']
        }),
        ('Mission, Vision & Values', {
            'fields': ['mission', 'vision', 'values']
        }),
        ('Programmes', {
            'fields': ['programmes_heading', 'programmes_body',
                       'active_programmes', 'coming_soon_programmes']
        }),
        ('Home Ground', {
            'fields': ['ground_story']
        }),
        ('Social Media', {
            'fields': ['facebook_url', 'instagram_url', 'youtube_url']
        }),
        ('Contact', {
            'fields': ['email', 'phone']
        }),
    ]
