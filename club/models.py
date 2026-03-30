from django.db import models


class ClubProfile(models.Model):
    # Identity
    founded_year = models.CharField(max_length=10, default='2024')
    home_ground = models.CharField(max_length=200, default='TOC Turf')
    district = models.CharField(max_length=100, default='Gorkha')
    province = models.CharField(max_length=100, default='Gandaki Pradesh')
    tagline = models.CharField(max_length=300, blank=True)

    # Story
    our_story_heading = models.CharField(max_length=200, default='Born from the Hills')
    our_story_body = models.TextField()

    # Mission / Vision / Values
    mission = models.TextField()
    vision = models.TextField()
    values = models.TextField()

    # Current programmes
    programmes_heading = models.CharField(max_length=200, default='Where We Are Today')
    programmes_body = models.TextField()
    active_programmes = models.TextField(help_text='One per line')
    coming_soon_programmes = models.TextField(help_text='One per line')

    # Home ground
    ground_story = models.TextField()

    # Social links
    facebook_url = models.URLField(blank=True, default='https://www.facebook.com/HillyFielders/')
    instagram_url = models.URLField(blank=True)
    youtube_url = models.URLField(blank=True)

    # Contact
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)

    class Meta:
        verbose_name = 'Club Profile'
        verbose_name_plural = 'Club Profile'

    def __str__(self):
        return 'Hillyfielders Gorkha FC — Club Profile'

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def get(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj
