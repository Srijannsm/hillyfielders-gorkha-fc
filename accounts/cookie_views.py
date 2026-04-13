"""
Cookie-based JWT authentication views.

Login  → sets gfc_access (8 h) + gfc_refresh (7 d) as httpOnly cookies
Refresh→ reads gfc_refresh cookie, sets a new gfc_access cookie
Logout → clears both cookies
"""
import logging
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.throttling import AnonRateThrottle
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError

from .serializers import CustomTokenObtainPairSerializer

logger = logging.getLogger(__name__)


class LoginRateThrottle(AnonRateThrottle):
    scope = 'login'


def _set_auth_cookie(response, name, value, max_age):
    """Helper: attach a JWT cookie with consistent security settings."""
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        httponly=True,
        secure=getattr(settings, 'AUTH_COOKIE_SECURE', not settings.DEBUG),
        samesite=getattr(settings, 'AUTH_COOKIE_SAMESITE', 'Strict'),
        path='/',
    )


class CookieLoginView(APIView):
    """
    POST /api/auth/login/
    Body: { username, password }
    On success sets httpOnly cookies and returns { username, is_staff }.
    """
    permission_classes = [AllowAny]
    throttle_classes   = [LoginRateThrottle]

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

        response = Response({
            'username': payload.get('username', ''),
            'is_staff': payload.get('is_staff', False),
        })
        _set_auth_cookie(response, 'gfc_access',  access_token,  max_age=8 * 3600)
        _set_auth_cookie(response, 'gfc_refresh', refresh_token, max_age=7 * 24 * 3600)
        return response


class CookieRefreshView(APIView):
    """
    POST /api/auth/refresh/
    Reads gfc_refresh cookie, issues a new gfc_access cookie.
    """
    permission_classes = [AllowAny]

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

    def post(self, request):
        response = Response({'detail': 'Logged out.'})
        response.delete_cookie('gfc_access',  path='/')
        response.delete_cookie('gfc_refresh', path='/')
        return response
