from django.db import models


class Photo(models.Model):
    CATEGORY_CHOICES = [
        ('training', 'Training'),
        ('matchday', 'Match Day'),
        ('academy', 'Academy'),
        ('team', 'Team Photo'),
    ]

    title = models.CharField(max_length=200)
    image = models.ImageField(upload_to='gallery/')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    caption = models.TextField(blank=True)
    date_taken = models.DateField(blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_taken']

    def __str__(self):
        return self.title
