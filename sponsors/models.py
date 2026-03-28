from django.db import models

class Sponsor(models.Model):
    TIER_CHOICES = [
        ('platinum', 'Platinum'),
        ('gold', 'Gold'),
        ('silver', 'Silver'),
    ]

    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='sponsors/')
    website = models.URLField(blank=True)
    tier = models.CharField(max_length=20, choices=TIER_CHOICES, default='silver')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.get_tier_display()})"