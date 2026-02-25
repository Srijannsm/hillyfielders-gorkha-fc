from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from phonenumber_field.modelfields import PhoneNumberField
from django.contrib.auth.models import User


class Player(models.Model):

    # Authentication Link
    # Link to Django User
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="player",
        null=True,    # Make nullable for now
        blank=True
    )

    # Basic Info
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    email = models.EmailField(null=True, blank=True)
    contact_number = PhoneNumberField(region="NP", null=True, blank=True)
    preferred_foot = models.CharField(max_length=10, null=True, blank=True)
    position = models.CharField(max_length=30)

    # Performance Metrics
    attendance = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    work_rate = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    passing_accuracy = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    decision_making = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    player_rating = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )

    sprint_speed = models.FloatField(default=0)  # meters/second

    stamina_score = models.FloatField(
        default=0, validators=[MinValueValidator(0), MaxValueValidator(10)]
    )  # 1-10 scale

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
