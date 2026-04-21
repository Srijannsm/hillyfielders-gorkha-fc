import logging
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from accounts.models import Enquiry
from core.tasks import send_contact_notification

logger = logging.getLogger(__name__)


class ContactRateThrottle(AnonRateThrottle):
    scope = 'contact'


class ContactView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [ContactRateThrottle]

    @extend_schema(
        tags=['contact'],
        summary='Submit contact form',
        description='Rate-limited to 5 requests/hour per IP. Saves enquiry to database and sends email notification.',
        request=inline_serializer('ContactRequest', fields={
            'name': serializers.CharField(),
            'email': serializers.EmailField(),
            'message': serializers.CharField(),
        }),
        responses={
            200: inline_serializer('ContactSuccess', fields={'success': serializers.CharField()}),
            400: inline_serializer('ContactError', fields={'error': serializers.CharField()}),
        },
    )
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

        # Notify club inbox via Celery (retried automatically on SMTP failure)
        send_contact_notification.delay(name, email, message)

        return Response(
            {'success': 'Message sent successfully.'},
            status=status.HTTP_200_OK
        )
