from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_superuser
        )


def role_permission(*roles):
    """Factory returning a DRF permission class that allows superusers and staff with a matching role."""
    class P(BasePermission):
        allowed_roles = roles

        def has_permission(self, request, view):
            if not request.user or not request.user.is_authenticated:
                return False
            if request.user.is_superuser:
                return True
            if not request.user.is_staff:
                return False
            role = getattr(getattr(request.user, 'profile', None), 'role', None)
            return role in self.allowed_roles

    P.__name__ = f"IsOneOf_{'_'.join(roles)}"
    return P
