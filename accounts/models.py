from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class UserProfile(models.Model):
    ROLES = [
        ('media_officer', 'Media Officer'),
        ('team_manager', 'Team Manager'),
        ('secretary', 'Secretary'),
        ('coach', 'Coach'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLES)

    def __str__(self):
        return f'{self.user.username} ({self.role})'


class Enquiry(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Enquiries'

    def __str__(self):
        return f'{self.name} <{self.email}> — {self.created_at:%Y-%m-%d}'
