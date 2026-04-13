import logging
import threading
from rest_framework import viewsets, serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.conf import settings
from .models import Enquiry

logger = logging.getLogger(__name__)
User = get_user_model()


# ─── Enquiry ──────────────────────────────────────────────────────────────────

class EnquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = Enquiry
        fields = ['id', 'name', 'email', 'message', 'is_read', 'created_at']


class EnquiryAdminViewSet(viewsets.ModelViewSet):
    queryset = Enquiry.objects.all()
    serializer_class = EnquirySerializer
    permission_classes = [IsAdminUser]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        enquiry = self.get_object()
        enquiry.is_read = True
        enquiry.save()
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Enquiry.objects.filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=True, methods=['post'])
    def reply(self, request, pk=None):
        enquiry = self.get_object()
        message = request.data.get('message', '').strip()
        if not message:
            return Response({'error': 'Reply message is required.'}, status=status.HTTP_400_BAD_REQUEST)

        sender = getattr(settings, 'EMAIL_HOST_USER', None)
        contact_email = getattr(settings, 'CONTACT_EMAIL', sender)

        if not sender:
            return Response({'error': 'Email is not configured on this server.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Mark as read immediately — don't wait for SMTP
        enquiry.is_read = True
        enquiry.save(update_fields=['is_read'])

        # Send email in a background thread so the response is instant
        def _send():
            try:
                send_mail(
                    subject='Re: Your enquiry to HillyFielders Gorkha FC',
                    message=message,
                    from_email=contact_email,
                    recipient_list=[enquiry.email],
                    fail_silently=False,
                )
            except Exception:
                logger.exception('Failed to send reply email to %s for enquiry #%s', enquiry.email, enquiry.pk)

        threading.Thread(target=_send, daemon=True).start()
        return Response({'status': 'sent'})


# ─── Admin Profile ────────────────────────────────────────────────────────────

class ProfileSerializer(serializers.ModelSerializer):
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'new_password', 'current_password']
        read_only_fields = ['id']

    def validate(self, data):
        new_pw = data.get('new_password', '').strip()
        cur_pw = data.get('current_password', '').strip()
        if new_pw:
            if not cur_pw:
                raise serializers.ValidationError({'current_password': 'Required to set a new password.'})
            if not self.instance.check_password(cur_pw):
                raise serializers.ValidationError({'current_password': 'Incorrect current password.'})
        return data

    def update(self, instance, validated_data):
        new_pw = validated_data.pop('new_password', '').strip()
        validated_data.pop('current_password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_pw:
            instance.set_password(new_pw)
        instance.save()
        return instance


class ProfileView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        password_being_changed = bool(request.data.get('new_password', '').strip())
        serializer = ProfileSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        if password_being_changed and user.email:
            def _notify():
                try:
                    send_mail(
                        subject='Your Gorkha FC admin password was changed',
                        message=(
                            f'Hi {user.get_full_name() or user.username},\n\n'
                            'Your admin account password was just changed.\n\n'
                            'If you did not make this change, contact your system administrator immediately.'
                        ),
                        from_email=settings.EMAIL_HOST_USER,
                        recipient_list=[user.email],
                        fail_silently=False,
                    )
                except Exception:
                    logger.exception('Failed to send password-change notification to %s', user.email)
            threading.Thread(target=_notify, daemon=True).start()

        return Response(serializer.data)
