from rest_framework import permissions
from .models import User


class IsAdminUserOrStaff(permissions.BasePermission):
    """Allows access only to super admins or staff users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_admin_or_staff)


class IsSuperAdmin(permissions.BasePermission):
    """Allows access only to Super Admins."""
    def has_permission(self, request, view):
        return bool(
            request.user and request.user.is_authenticated and
            (request.user.is_superuser or request.user.role == User.Role.SUPER_ADMIN)
        )


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows access to object owners or admin staff."""
    def has_object_permission(self, request, view, obj):
        if request.user.is_admin_or_staff:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False
