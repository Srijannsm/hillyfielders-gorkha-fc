from django.contrib import admin
from .models import TrainingType
from .models import SessionBooking
from .models import CompletedSession


@admin.register(TrainingType)
class TrainingTypeAdmin(admin.ModelAdmin):
    list_display = ("name", "duration_minutes", "price", "max_players", "is_active")
    list_filter = ("is_active",)
    search_fields = ("name",)


@admin.register(SessionBooking)
class SessionBookingAdmin(admin.ModelAdmin):
    list_display = (
        "player",
        "training_type",
        "scheduled_date",
        "scheduled_time",
        "status",
    )
    list_filter = ("status", "scheduled_date")
    search_fields = ("player__first_name", "training_type__name")


@admin.register(CompletedSession)
class CompletedSessionAdmin(admin.ModelAdmin):
    list_display = (
        "player",
        "training_type",
        "session_date",
        "session_time",
        "notes",
    )
    list_filter = ("session_date", "training_type")
    search_fields = ("player__first_name", "training_type__name")
