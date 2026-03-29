from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny

class ContactView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        name = request.data.get('name', '').strip()
        email = request.data.get('email', '').strip()
        message = request.data.get('message', '').strip()

        # Basic validation
        if not name or not email or not message:
            return Response(
                {'error': 'All fields are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if '@' not in email:
            return Response(
                {'error': 'Please enter a valid email address.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            send_mail(
                subject=f'New message from {name} — Gorkha FC Website',
                message=f'Name: {name}\nEmail: {email}\n\nMessage:\n{message}',
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[settings.CONTACT_EMAIL],
                fail_silently=False,
            )
            return Response(
                {'success': 'Message sent successfully.'},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {'error': 'Failed to send message. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )