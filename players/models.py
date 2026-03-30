from django.db import models
from django.utils.text import slugify


class Programme(models.Model):
    GENDER_CHOICES = [
        ('mens',   "Men's"),
        ('womens', "Women's"),
    ]
    gender    = models.CharField(max_length=10, choices=GENDER_CHOICES, unique=True)
    name      = models.CharField(max_length=100)   # e.g. "Men's Programme"
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['gender']

    def __str__(self):
        return self.name


class Team(models.Model):
    programme = models.ForeignKey(Programme, on_delete=models.CASCADE, related_name='teams')
    name      = models.CharField(max_length=100)   # free text: "Senior Team", "U-16", "U-10"
    slug      = models.SlugField(max_length=60, unique=True, blank=True,
                                  help_text="Auto-generated from programme + name. You can override it.")
    is_active = models.BooleanField(default=True)
    order     = models.PositiveIntegerField(default=0,
                                             help_text="Lower number appears first in navigation.")
    description = models.TextField(blank=True)

    class Meta:
        ordering  = ['programme__gender', 'order', 'name']
        unique_together = [('programme', 'name')]

    def save(self, *args, **kwargs):
        correct_prefix = f"{self.programme.gender}-"
        # Auto-generate if slug is empty OR if it doesn't start with the
        # programme's gender prefix (e.g. admin JS filled it with just the name)
        if not self.slug or not self.slug.startswith(correct_prefix):
            self.slug = slugify(f"{self.programme.gender}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.programme.name} — {self.name}"


class Player(models.Model):
    POSITION_CHOICES = [
        ('GK',  'Goalkeeper'),
        ('DEF', 'Defender'),
        ('MID', 'Midfielder'),
        ('FWD', 'Forward'),
    ]

    team         = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    name         = models.CharField(max_length=100)
    position     = models.CharField(max_length=3, choices=POSITION_CHOICES)
    jersey_number = models.PositiveIntegerField()
    nationality  = models.CharField(max_length=100, default='Nepali')
    photo        = models.ImageField(upload_to='players/', blank=True, null=True)
    bio          = models.TextField(blank=True)
    is_active    = models.BooleanField(default=True)
    joined_date  = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.jersey_number}. {self.name} ({self.get_position_display()})"


class Staff(models.Model):
    ROLE_CHOICES = [
        ('head_coach',        'Head Coach'),
        ('assistant_coach',   'Assistant Coach'),
        ('goalkeeper_coach',  'Goalkeeper Coach'),
        ('physio',            'Physiotherapist'),
        ('manager',           'Manager'),
    ]

    team  = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='staff')
    name  = models.CharField(max_length=100)
    role  = models.CharField(max_length=50, choices=ROLE_CHOICES)
    photo = models.ImageField(upload_to='staff/', blank=True, null=True)
    bio   = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} — {self.get_role_display()}"
