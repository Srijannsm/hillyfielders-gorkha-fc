import logging
import threading
from rest_framework import viewsets, serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.mail import send_mail
from django.conf import settings
from .models import Enquiry, UserProfile
from .permissions import IsSuperAdmin, role_permission

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
    permission_classes = [role_permission('secretary')]
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

        enquiry.is_read = True
        enquiry.save(update_fields=['is_read'])

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


# ─── User Management (Super Admin only) ───────────────────────────────────────

class UserAdminSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'role', 'is_active', 'is_superuser', 'date_joined', 'password']
        read_only_fields = ['id', 'is_superuser', 'date_joined']

    def get_role(self, obj):
        return getattr(getattr(obj, 'profile', None), 'role', None)

    def validate_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value


class UserCreateSerializer(UserAdminSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLES)
    password = serializers.CharField(write_only=True, required=True)

    class Meta(UserAdminSerializer.Meta):
        fields = ['username', 'first_name', 'last_name', 'email', 'role', 'password']

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.is_staff = True
        user.save()
        UserProfile.objects.create(user=user, role=role)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLES, required=False)
    new_password = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'is_active', 'role', 'new_password']

    def validate_new_password(self, value):
        if value:
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def update(self, instance, validated_data):
        role = validated_data.pop('role', None)
        new_pw = validated_data.pop('new_password', '').strip()
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if new_pw:
            instance.set_password(new_pw)
        instance.save()
        if role is not None:
            UserProfile.objects.update_or_create(user=instance, defaults={'role': role})
        return instance


class UserAdminViewSet(viewsets.ModelViewSet):
    permission_classes = [IsSuperAdmin]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        return (
            User.objects
            .filter(is_superuser=False)
            .select_related('profile')
            .order_by('username')
        )

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        return UserAdminSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        response_data = UserAdminSerializer(user).data
        headers = self.get_success_headers(response_data)
        return Response(response_data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserAdminSerializer(user).data)

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.pk == request.user.pk:
            return Response({'error': 'You cannot delete your own account.'}, status=status.HTTP_400_BAD_REQUEST)
        return super().destroy(request, *args, **kwargs)
