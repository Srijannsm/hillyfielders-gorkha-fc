from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SessionBooking, CompletedSession
from django.utils import timezone


@receiver(post_save, sender=SessionBooking)
def create_training_session(sender, instance, created, **kwargs):
    """
    Automatically create a CompletedSession when a booking is completed
    """
    if instance.status == "completed":
        # Check if a session already exists for this booking
        exists = CompletedSession.objects.filter(
            player=instance.player,
            training_type=instance.training_type,
            session_date=instance.scheduled_date,
            session_time=instance.scheduled_time,
        ).exists()

        if not exists:
            CompletedSession.objects.create(
                player=instance.player,
                training_type=instance.training_type,
                session_date=instance.scheduled_date,
                session_time=instance.scheduled_time,
                notes=f"Automatically created from booking #{instance.id}",
            )
