from io import BytesIO
import os

from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.validators import FileExtensionValidator
from django.db import models
from PIL import Image

_IMAGE_EXTENSIONS = FileExtensionValidator(
    allowed_extensions=['jpg', 'jpeg', 'png', 'webp', 'gif']
)
_MAX_UPLOAD_BYTES = 50 * 1024 * 1024  # 50 MB


class Photo(models.Model):
    CATEGORY_CHOICES = [
        ('training', 'Training'),
        ('matchday', 'Match Day'),
        ('academy', 'Academy'),
        ('team', 'Team Photo'),
    ]

    title      = models.CharField(max_length=200)
    image      = models.ImageField(upload_to='gallery/', validators=[_IMAGE_EXTENSIONS])
    thumbnail  = models.ImageField(upload_to='gallery/thumbs/', blank=True, null=True)
    width      = models.PositiveIntegerField(default=0)
    height     = models.PositiveIntegerField(default=0)
    category   = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    caption    = models.TextField(blank=True)
    date_taken = models.DateField(blank=True, null=True)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_taken', '-created_at']
        indexes = [
            models.Index(fields=['category', 'is_published']),
        ]

    def __str__(self):
        return self.title

    def clean(self):
        super().clean()
        if self.image and hasattr(self.image, 'size') and self.image.size > _MAX_UPLOAD_BYTES:
            raise ValidationError('Image must be smaller than 50 MB.')

    # ── Save override ──────────────────────────────────────────────────────────

    def save(self, *args, **kwargs):
        image_is_new = False
        if not self.pk:
            image_is_new = bool(self.image)
        else:
            try:
                old = Photo.objects.get(pk=self.pk)
                image_is_new = old.image.name != self.image.name
            except Photo.DoesNotExist:
                image_is_new = bool(self.image)

        if image_is_new and self.image:
            self._process_image()

        super().save(*args, **kwargs)

    def _process_image(self):
        """Convert to WebP, resize to ≤1200 px, store dimensions, make thumbnail."""
        img = Image.open(self.image)

        # Normalise colour mode
        if img.mode == 'RGBA':
            bg = Image.new('RGB', img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        elif img.mode != 'RGB':
            img = img.convert('RGB')

        # Resize so longest side ≤ 1200 px
        w, h = img.size
        if max(w, h) > 1200:
            ratio = 1200 / max(w, h)
            img = img.resize((round(w * ratio), round(h * ratio)), Image.LANCZOS)

        self.width, self.height = img.size

        # ── Full WebP (quality 82) ─────────────────────────────────────────────
        full_buf = BytesIO()
        img.save(full_buf, format='WEBP', quality=82, method=6)
        full_buf.seek(0)

        base = os.path.splitext(os.path.basename(self.image.name))[0]
        self.image.save(f'{base}.webp', ContentFile(full_buf.read()), save=False)

        # ── Thumbnail: max 20 px on longest side (quality 60) ─────────────────
        tw, th = img.size
        t_ratio = 20 / max(tw, th)
        thumb = img.resize(
            (max(1, round(tw * t_ratio)), max(1, round(th * t_ratio))),
            Image.LANCZOS,
        )

        thumb_buf = BytesIO()
        thumb.save(thumb_buf, format='WEBP', quality=60)
        thumb_buf.seek(0)

        self.thumbnail.save(
            f'{base}_thumb.webp',
            ContentFile(thumb_buf.read()),
            save=False,
        )
