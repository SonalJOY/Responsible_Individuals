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


class IsApprovedVolunteer(permissions.BasePermission):
    """
    Allows access only to authenticated users who have an APPROVED and ACTIVE VolunteerProfile
    or who are administrators / staff members.
    """
    message = "Only verified and approved volunteers can perform this action. Please complete your volunteer onboarding application."

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.is_admin_or_staff:
            return True
        try:
            profile = getattr(request.user, 'volunteer_profile', None)
            if not profile:
                self.message = "Only verified and approved volunteers can perform this action. Please complete your volunteer onboarding application."
                return False
            if hasattr(profile, 'refresh_from_db'):
                profile.refresh_from_db(fields=['is_active', 'approval_status'])
            if profile.approval_status != 'APPROVED':
                self.message = "Only verified and approved volunteers can perform this action. Please complete your volunteer onboarding application."
                return False
            if not profile.is_active:
                self.message = "Your volunteer profile is currently inactive or suspended. Please contact administration."
                return False
            return True
        except Exception:
            return False
