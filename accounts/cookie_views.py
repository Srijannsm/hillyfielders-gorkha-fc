"""
Cookie-based JWT authentication views.

Login  → sets gfc_access (8 h) + gfc_refresh (7 d) as httpOnly cookies
Refresh→ reads gfc_refresh cookie, sets a new gfc_access cookie
Logout → clears both cookies
"""
import logging
from django.conf import settings
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import CustomTokenObtainPairSerializer

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


def _set_auth_cookie(response, name, value, max_age=None):
    """Attach a JWT cookie. max_age=None → session cookie (expires when browser closes)."""
    kwargs = dict(
        httponly=True,
        secure=getattr(settings, 'AUTH_COOKIE_SECURE', not settings.DEBUG),
        samesite=getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Strict'),
        path='/',
    )
    if max_age is not None:
        kwargs['max_age'] = max_age
    response.set_cookie(name, value, **kwargs)


class CookieLoginView(APIView):
    """
    POST /api/auth/login/
    Body: { username, password }
    On success sets httpOnly cookies and returns { username, is_staff }.
    """
    permission_classes = [AllowAny]
    throttle_classes   = [LoginRateThrottle]

    @extend_schema(
        tags=['auth'],
        summary='Login',
        description='Authenticates with username/password. Sets httpOnly JWT cookies (`gfc_access`, `gfc_refresh`). Rate-limited to 10/hour.',
        request=inline_serializer('LoginRequest', fields={
            'username': serializers.CharField(),
            'password': serializers.CharField(),
            'remember_me': serializers.BooleanField(required=False),
        }),
        responses={
            200: inline_serializer('LoginResponse', fields={
                'username': serializers.CharField(),
                'is_staff': serializers.BooleanField(),
                'is_superuser': serializers.BooleanField(),
                'role': serializers.CharField(allow_null=True),
            }),
            401: inline_serializer('LoginError', fields={'error': serializers.CharField()}),
        },
    )
    def post(self, request):
        serializer = CustomTokenObtainPairSerializer(
            data=request.data,
            context={'request': request},
        )
        try:
            serializer.is_valid(raise_exception=True)
        except Exception:
            return Response(
                {'error': 'Invalid username or password.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token  = serializer.validated_data['access']
        refresh_token = serializer.validated_data['refresh']

        # Decode payload (already validated by the serializer)
        payload = AccessToken(access_token).payload

        remember_me = bool(request.data.get('remember_me', False))

        response = Response({
            'username':     payload.get('username', ''),
            'is_staff':     payload.get('is_staff', False),
            'is_superuser': payload.get('is_superuser', False),
            'role':         payload.get('role', None),
        })

        if remember_me:
            # Persistent cookies: access 8 h, refresh 7 days
            _set_auth_cookie(response, 'gfc_access',  access_token,  max_age=8 * 3600)
            _set_auth_cookie(response, 'gfc_refresh', refresh_token, max_age=7 * 24 * 3600)
        else:
            # Session cookies: no max_age — expire when the browser closes
            _set_auth_cookie(response, 'gfc_access',  access_token)
            _set_auth_cookie(response, 'gfc_refresh', refresh_token)

        return response


class CookieRefreshView(APIView):
    """
    POST /api/auth/refresh/
    Reads gfc_refresh cookie, issues a new gfc_access cookie.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['auth'],
        summary='Refresh access token',
        description='Reads the `gfc_refresh` httpOnly cookie and issues a new `gfc_access` cookie.',
        request=None,
        responses={
            200: inline_serializer('RefreshResponse', fields={'detail': serializers.CharField()}),
            401: inline_serializer('RefreshError', fields={'error': serializers.CharField()}),
        },
    )
    def post(self, request):
        refresh_token = request.COOKIES.get('gfc_refresh')
        if not refresh_token:
            return Response(
                {'error': 'No refresh token.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        try:
            refresh  = RefreshToken(refresh_token)
            new_access = str(refresh.access_token)
        except TokenError:
            response = Response(
                {'error': 'Session expired. Please log in again.'},
                status=status.HTTP_401_UNAUTHORIZED,
            )
            response.delete_cookie('gfc_access')
            response.delete_cookie('gfc_refresh')
            return response

        response = Response({'detail': 'Token refreshed.'})
        _set_auth_cookie(response, 'gfc_access', new_access, max_age=8 * 3600)
        return response


class LogoutView(APIView):
    """
    POST /api/auth/logout/
    Clears the auth cookies.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['auth'],
        summary='Logout',
        description='Clears the `gfc_access` and `gfc_refresh` httpOnly cookies.',
        request=None,
        responses={200: inline_serializer('LogoutResponse', fields={'detail': serializers.CharField()})},
    )
    def post(self, request):
        refresh_token = request.COOKIES.get('gfc_refresh')
        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except TokenError:
                pass  # already expired or invalid — safe to ignore

        response = Response({'detail': 'Logged out.'})
        response.delete_cookie('gfc_access',  path='/')
        response.delete_cookie('gfc_refresh', path='/')
        return response
