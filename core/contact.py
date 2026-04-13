import logging
import threading
from django.core.mail import send_mail
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from accounts.models import Enquiry

logger = logging.getLogger(__name__)


class ContactRateThrottle(AnonRateThrottle):
    scope = 'contact'


class ContactView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]

    def post(self, request):
        name    = request.data.get('name', '').strip()[:100]
        email   = request.data.get('email', '').strip()[:254]
        message = request.data.get('message', '').strip()[:2000]

        if not name or not email or not message:
            return Response(
                {'error': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {'error': 'Please enter a valid email address.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Save to database so admin can view enquiries
        Enquiry.objects.create(name=name, email=email, message=message)

        # Notify club inbox in a background thread — response is instant
        def _notify():
            try:
                send_mail(
                    subject=f'New message from {name} — Gorkha FC Website',
                    message=f'Name: {name}\nEmail: {email}\n\nMessage:\n{message}',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[settings.CONTACT_EMAIL],
                    fail_silently=False,
                )
            except Exception:
                logger.exception('Failed to send contact notification email from %s', email)

        threading.Thread(target=_notify, daemon=True).start()

        return Response(
            {'success': 'Message sent successfully.'},
            status=status.HTTP_200_OK
        )
