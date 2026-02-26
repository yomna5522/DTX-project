from .models import Supplier

# myapp/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _
from .models import *
from django.contrib.auth.models import Group

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    ordering = ['email']
    search_fields = ['email', 'phone', 'fullname']
    list_display = ['email', 'phone', 'fullname', 'role', 'is_active', 'is_admin']
    list_filter = ['is_active', 'is_staff', 'is_superuser', 'role']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Personal Info'), {
            'fields': (
                'fullname',
                'phone',
                'avatar',
                'role',
                "is_admin"
               
            )
        }),
        (_('Verification'), {
            'fields': (
                'is_verified', 
               
                'is_forget',
                'otp',
                
                'otp_created_at',
               
            )
        }),
        (_('Permissions'), {
            'fields': (
                'is_active', 
                'is_staff', 
                'is_superuser', 
                'groups', 
                'user_permissions'
            )
        }),
        (_('Important dates'), {'fields': ('created_at', 'last_login')}),
    )
    readonly_fields = ('created_at', 'otp_created_at')

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'phone', 'password1', 'password2'),
        }),
    )





@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'phone', 'balance')
    search_fields = ('name', 'email', 'phone')


