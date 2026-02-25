from django.db import models
from django.utils import timezone
from players.models import Player


class TrainingType(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField()
    duration_minutes = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    max_players = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class SessionBooking(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("confirmed", "Confirmed"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="bookings"
    )
    training_type = models.ForeignKey(
        TrainingType, on_delete=models.CASCADE, related_name="bookings"
    )

    scheduled_date = models.DateField(blank=True)
    scheduled_time = models.TimeField(blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def clean(self):
        if self.scheduled_date < timezone.now().date():
            raise ValueError("Cannot book a session in the past.")

    def __str__(self):
        return f"{self.player.first_name} - {self.training_type.name} - {self.scheduled_date}"


class CompletedSession(models.Model):
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="training_sessions"
    )
    training_type = models.ForeignKey(
        "TrainingType", on_delete=models.CASCADE, related_name="training_sessions"
    )

    session_date = models.DateField(blank=True)
    session_time = models.TimeField()

    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.player.first_name} - {self.training_type.name} - {self.session_date}"
