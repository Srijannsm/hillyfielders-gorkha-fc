from django.db import models

class Team(models.Model):
    TEAM_CHOICES = [
        ('mens', "Men's First Team"),
        ('womens', "Women's First Team"),
    ]
    name = models.CharField(max_length=100)
    team_type = models.CharField(max_length=10, choices=TEAM_CHOICES)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Player(models.Model):
    POSITION_CHOICES = [
        ('GK', 'Goalkeeper'),
        ('DEF', 'Defender'),
        ('MID', 'Midfielder'),
        ('FWD', 'Forward'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=3, choices=POSITION_CHOICES)
    jersey_number = models.PositiveIntegerField()
    nationality = models.CharField(max_length=100, default='Nepali')
    photo = models.ImageField(upload_to='players/', blank=True, null=True)
    bio = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    joined_date = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.jersey_number}. {self.name} ({self.get_position_display()})"


class Staff(models.Model):
    ROLE_CHOICES = [
        ('head_coach', 'Head Coach'),
        ('assistant_coach', 'Assistant Coach'),
        ('goalkeeper_coach', 'Goalkeeper Coach'),
        ('physio', 'Physiotherapist'),
        ('manager', 'Manager'),
    ]

    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='staff')
    name = models.CharField(max_length=100)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    photo = models.ImageField(upload_to='staff/', blank=True, null=True)
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} — {self.get_role_display()}"