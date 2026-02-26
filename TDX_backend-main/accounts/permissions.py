from rest_framework import permissions
class IsAdmin(permissions.BasePermission):
 

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )
    


class IsCustomer(permissions.BasePermission):
 

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True

        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'customer'
            and not request.user.is_staff
            and not request.user.is_admin
        )
    



class IsStrictAdmin(permissions.BasePermission):
 

    def has_permission(self, request, view):
       

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )
    