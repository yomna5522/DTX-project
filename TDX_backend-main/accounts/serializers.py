from .models import Supplier

from djoser.serializers import UserSerializer as BaseUserSerializer
from rest_framework import serializers
from djoser.serializers import UserCreateSerializer as BaseUserCreateSerializer
from django.contrib.auth import get_user_model
from djoser.serializers import TokenCreateSerializer
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.utils import *
from django.core.validators import RegexValidator
User = get_user_model()
from rest_framework import serializers
from django.utils import timezone
from django.contrib.auth import get_user_model
import re

User = get_user_model()


def validate_strong_password(password):
    """Validate password strength"""
    if len(password) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters long.")
    
    if not re.search(r'[A-Z]', password):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    
    if not re.search(r'[a-z]', password):
        raise serializers.ValidationError("Password must contain at least one lowercase letter.")
    
    if not re.search(r'[0-9]', password):
        raise serializers.ValidationError("Password must contain at least one digit.")
    
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        raise serializers.ValidationError("Password must contain at least one special character (!@#$%^&*...).")
    
    return password




class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    # Optional: phone number validator (e.g., only digits, 10-13 chars)
    phone = serializers.CharField(
        validators=[
            RegexValidator(
                regex=r'^\+?\d{10,13}$',
                message="Phone number must be 10-13 digits and can start with +"
            )
        ]
    )

    class Meta:
        model = User
        fields = (
            'email',
            'phone',
            'password',
            'password_confirm',
            'fullname',
            'avatar',
        )

    def validate_email(self, value):
        """Check if email already exists"""
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Email is already registered.")
        return value.lower()

    def validate_phone(self, value):
        """Check if phone already exists"""
        if User.objects.filter(phone=value).exists():
            raise serializers.ValidationError("Phone number is already registered.")
        return value
    
    def validate_password(self, value):
        """Validate password strength"""
        return validate_strong_password(value)
    
    def validate(self, data):
        """Check password match"""
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            password=password,
            is_verified=False,
            **validated_data
        )

        # 🔐 Generate OTP
        otp_code = generate_otp()
        user.otp = otp_code
        user.otp_created_at = timezone.now()
        user.save(update_fields=["otp", "otp_created_at"])

        # 📩 Send OTP SMS
        send_sms_otp(user.phone, otp_code)
        print(send_sms_otp(user.phone, otp_code))

        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)

        # 🎟 JWT tokens
        data.update(generate_jwt_tokens(instance))

        data["is_verified"] = instance.is_verified
        data["is_admin"] = instance.is_admin
        data["role"] = instance.role if hasattr(instance, 'role') else ("admin" if instance.is_admin else "customer")
        data["message"] = "OTP sent to your phone"

        return data





class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        phone = attrs.get("phone")
        password = attrs.get("password")

        # Check if at least one identifier is provided
        if not email and not phone:
            raise serializers.ValidationError("Please provide either email or phone number")

        user = None
        
        # Try to find user by email first
        if email:
            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                pass
        
        # If not found by email, try phone
        if not user and phone:
            try:
                user = User.objects.get(phone=phone)
            except User.DoesNotExist:
                pass

        if not user:
            raise serializers.ValidationError("Invalid email/phone or password")

        if not user.check_password(password):
            raise serializers.ValidationError("Invalid email/phone or password")

        if not user.is_verified:
            raise serializers.ValidationError("Account is not verified")

        tokens = generate_jwt_tokens(user)
        role = "admin" if user.is_admin else "customer"

        return {
            "user": {
                "id": user.id,
                "email": user.email,
                "phone": user.phone,
                "fullname": user.fullname,
                "is_verified": user.is_verified,
                "is_admin": user.is_admin,
                "role": role
            },
            **tokens
        }


class SetPasswordSerializer(serializers.Serializer):
    """Serializer for setting password (for users who don't have one)"""
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    def validate_new_password(self, value):
        """Validate password strength"""
        return validate_strong_password(value)
    
    def validate(self, data):
        """Check password match"""
        if data.get('new_password') != data.get('new_password_confirm'):
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)
    
    def validate_new_password(self, value):
        """Validate password strength"""
        return validate_strong_password(value)
    
    def validate(self, data):
        """Check password match"""
        if data.get('new_password') != data.get('new_password_confirm'):
            raise serializers.ValidationError({"new_password_confirm": "Passwords do not match."})
        return data


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    class Meta:
        model = User
        fields = ['id', 'email', 'phone', 'fullname', 'avatar', 'address', 'is_verified', 'is_admin', 'role', 'created_at']
        read_only_fields = ['id', 'email', 'phone', 'is_verified', 'is_admin', 'role', 'created_at']



class SupplierSerializer(serializers.ModelSerializer):
    """Name required; email and phone optional (contact fields)."""
    email = serializers.EmailField(required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    class Meta:
        model = Supplier
        fields = ['id', 'name', 'email', 'phone', 'balance', 'avatar', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_email(self, value):
        if value and value.strip():
            return value.strip().lower()
        return None

    def validate_phone(self, value):
        if value and value.strip():
            return value.strip()
        return None