from rest_framework.permissions import BasePermission


class IsAdminRole(BasePermission):
    """
    Grants access only to authenticated users whose role == 'admin'.
    Used on every endpoint under /api/admin/.
    """
    message = 'You must have the Admin role to access this resource.'

    def has_permission(self, request, view):
        return (
            request.user is not None
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )
