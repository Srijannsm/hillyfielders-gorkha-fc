"""
drf-spectacular extensions — registers custom auth class so Swagger UI shows the lock icon.
"""
from drf_spectacular.extensions import OpenApiAuthenticationExtension


class CookieJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    """Register the custom cookie-based JWT auth so Swagger UI shows the lock icon."""
    target_class = 'accounts.cookie_auth.CookieJWTAuthentication'
    name = 'cookieAuth'

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'cookie',
            'name': 'gfc_access',
            'description': 'httpOnly JWT access cookie set by POST /api/auth/login/',
        }
