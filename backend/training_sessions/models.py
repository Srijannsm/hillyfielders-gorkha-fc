from django.db import models
from players.models import Player
from django.db.models import Avg
from django.core.validators import MinValueValidator, MaxValueValidator


class TrainingSession(models.Model):
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="sessions"
    )
    coach_name = models.CharField(max_length=50)
    date = models.DateField()
    duration_minutes = models.PositiveIntegerField()
    focus_area = models.CharField(max_length=100)  # e.g., Passing, Shooting
    rating = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )  # 1-10 coach evaluation
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)

        # Calculate average rating for this player
        average_rating = self.player.sessions.aggregate(Avg("rating"))["rating__avg"]

        # Update player's match rating
        self.player.match_rating = round(average_rating, 2)
        self.player.save()

    def __str__(self):
        return f"{self.player.first_name} - {self.date} - {self.focus_area}"
