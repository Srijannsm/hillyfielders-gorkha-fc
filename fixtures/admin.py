from django.contrib import admin
from .models import Fixture, Competition

@admin.register(Competition)
class CompetitionAdmin(admin.ModelAdmin):
    list_display = ['name', 'season']

@admin.register(Fixture)
class FixtureAdmin(admin.ModelAdmin):
    list_display = ['__str__', 'our_team', 'date', 'is_home_game', 'is_completed', 'result']
    list_filter = ['our_team', 'is_completed', 'is_home_game']