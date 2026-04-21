import logging
from celery import shared_task

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=5)
def process_photo(self, photo_pk):
    from gallery.models import Photo
    try:
        photo = Photo.objects.get(pk=photo_pk)
    except Photo.DoesNotExist:
        logger.warning('Photo %s not found for processing — skipping', photo_pk)
        return

    try:
        photo._process_image()
        photo.save(update_fields=['image', 'thumbnail', 'width', 'height'])
    except Exception as exc:
        logger.exception('Failed to process photo %s', photo_pk)
        raise self.retry(exc=exc)
