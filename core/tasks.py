from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings


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

    sender = getattr(settings, 'EMAIL_HOST_USER', None)
    contact_email = getattr(settings, 'CONTACT_EMAIL', sender)

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
        raise self.retry(exc=exc)
