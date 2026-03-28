from django.contrib import admin
from .models import Player, Team, Staff

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ['name', 'team_type']

@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display = ['jersey_number', 'name', 'position', 'team', 'is_active']
    list_filter = ['team', 'position', 'is_active']
    search_fields = ['name']

@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'team']