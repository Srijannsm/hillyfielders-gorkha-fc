from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError


class CookieJWTAuthentication(JWTAuthentication):
    """
    Reads the JWT access token from the 'gfc_access' httpOnly cookie instead of
    the Authorization header.  Falls back to the header so the Django admin site
    and DRF browsable API still work.
    """

    def authenticate(self, request):
        # Try cookie first
        raw_token = request.COOKIES.get('gfc_access')
        if raw_token:
            try:
                validated = self.get_validated_token(raw_token)
                return self.get_user(validated), validated
            except (InvalidToken, TokenError):
                # Cookie present but invalid/expired — fall through so the
                # response will be 401 rather than silently treating as anonymous.
                return None

        # Fall back to Authorization header (Django admin, browsable API, etc.)
        return super().authenticate(request)
