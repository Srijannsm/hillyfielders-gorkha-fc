from django.contrib import admin
from .models import Player


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ("first_name", "last_name","email","contact_number","preferred_foot", "position", "attendance", "player_rating")
