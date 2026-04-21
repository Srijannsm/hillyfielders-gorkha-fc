import logging
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_contact_notification(self, name, email, message):
    """
    Notify the club inbox of a new contact form submission.
    Retried up to 3 times on SMTP failure (60 s apart).
    """
    try:
        send_mail(
            subject=f'New message from {name} — Gorkha FC Website',
            message=f'Name: {name}\nEmail: {email}\n\nMessage:\n{message}',
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[settings.CONTACT_EMAIL],
            fail_silently=False,
        )
    except Exception as exc:
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_enquiry_reply(self, enquiry_id, reply_message):
    """
    Send a reply email to an enquiry and mark it as read.
    Can be called with .delay() for async or .apply() for sync.
    """
    from accounts.models import Enquiry

    try:
        enquiry = Enquiry.objects.get(pk=enquiry_id)
    except Enquiry.DoesNotExist:
        return  # deleted before task ran — nothing to do

    contact_email = getattr(settings, 'CONTACT_EMAIL', settings.EMAIL_HOST_USER)

    try:
        send_mail(
            subject='Re: Your enquiry to HillyFielders Gorkha FC',
            message=reply_message,
            from_email=contact_email,
            recipient_list=[enquiry.email],
            fail_silently=False,
        )
        enquiry.is_read = True
        enquiry.save(update_fields=['is_read'])
    except Exception as exc:
        logger.exception('Failed to send reply email to %s for enquiry #%s', enquiry.email, enquiry_id)
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def send_password_change_notification(self, user_email, display_name):
    try:
        send_mail(
            subject='Your Gorkha FC admin password was changed',
            message=(
                f'Hi {display_name},\n\n'
                'Your admin account password was just changed.\n\n'
                'If you did not make this change, contact your system administrator immediately.'
            ),
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[user_email],
            fail_silently=False,
        )
    except Exception as exc:
        logger.exception('Failed to send password-change notification to %s', user_email)
        raise self.retry(exc=exc)
