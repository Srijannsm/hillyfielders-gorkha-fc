from django.contrib import admin
from .models import Programme, Team, Player, Staff


class TeamInline(admin.TabularInline):
    model    = Team
    extra    = 1
    fields   = ['name', 'slug', 'order', 'is_active']
    readonly_fields = ['slug']
    ordering = ['order', 'name']


@admin.register(Programme)
class ProgrammeAdmin(admin.ModelAdmin):
    list_display  = ['name', 'gender', 'is_active']
    list_editable = ['is_active']
    inlines       = [TeamInline]


class PlayerInline(admin.TabularInline):
    model    = Player
    extra    = 1
    fields   = ['jersey_number', 'name', 'position', 'nationality', 'is_active']
    ordering = ['jersey_number']


class StaffInline(admin.TabularInline):
    model  = Staff
    extra  = 1
    fields = ['name', 'role', 'photo']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display  = ['name', 'programme', 'slug', 'order', 'is_active']
    list_filter   = ['programme', 'is_active']
    list_editable = ['order', 'is_active']
    readonly_fields = ['slug']
    inlines       = [StaffInline, PlayerInline]


@admin.register(Player)
class PlayerAdmin(admin.ModelAdmin):
    list_display  = ['jersey_number', 'name', 'position', 'team', 'is_active']
    list_filter   = ['team__programme', 'team', 'position', 'is_active']
    search_fields = ['name']


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'team']
    list_filter  = ['team__programme', 'team']
