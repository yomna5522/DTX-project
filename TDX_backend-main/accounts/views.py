from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import RegisterSerializer, LoginSerializer, SetPasswordSerializer, ChangePasswordSerializer, ProfileSerializer
from rest_framework.generics import *
from .utils import*
from .models import*
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError


class RegisterView(CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]




class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)
    

class ResendOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        forget = request.query_params.get("forget", "false").lower() == "true"

        if not phone:
            return Response({"error": "Phone is required"}, status=400)

        user = User.objects.filter(phone=phone).first()
        if not user:
            return Response({"error": "User with this phone not found"}, status=404)

        # Block if already verified (normal flow)
        if not forget and user.is_verified:
            return Response({"message": "Phone already verified"}, status=400)

        # Block resend if OTP still valid
        if user.otp and not user.is_otp_expired():
            remaining = int((user.otp_created_at + timedelta(minutes=user.OTP_EXPIRY_MINUTES) - timezone.now()).total_seconds())
            return Response({"error": "OTP already sent", "retry_after_seconds": remaining}, status=429)

        # Generate new OTP
        user.otp = generate_otp()
        user.otp_created_at = timezone.now()
        user.save(update_fields=["otp", "otp_created_at"])

        # Send OTP via SMS
        result = send_sms_otp(phone=user.phone, otp_code=user.otp)
        if not result.get("status", False):
            return Response({"error": "Failed to send OTP"}, status=500)

        return Response({"message": "OTP sent successfully"}, status=200)


class VerifyOtpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        phone = request.data.get("phone")
        otp_code = request.data.get("otp")
        forget = request.query_params.get("forget", "false").lower() == "true"

        if not phone or not otp_code:
            return Response({"error": "Phone and OTP are required"}, status=400)

        user = User.objects.filter(phone=phone).first()
        if not user:
            return Response({"error": "User with this phone not found"}, status=404)

        if user.is_otp_expired():
            user.clear_otp()
            return Response({"error": "OTP expired"}, status=400)

        if user.otp != otp_code:
            user.clear_otp()
            return Response({"error": "Invalid OTP"}, status=400)

        # OTP verified
        user.clear_otp()

        if forget:
            user.is_forget = True
            user.save(update_fields=["is_forget"])
            tokens = generate_acess_tokens(user)
            return Response({"message": "OTP verified for password reset", "tokens": tokens}, status=200)

        # Normal verification
        user.is_verified = True
        user.save(update_fields=["is_verified"])
        return Response({"message": "Phone verified successfully"}, status=200)


class SetPasswordAPIView(APIView):
    """Set password for users who don't have one (after OTP verification)"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = SetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password set successfully"},
            status=status.HTTP_200_OK
        )


class ChangePasswordAPIView(APIView):
    """Allows an authenticated user to change their password"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get("old_password")
        
        # Check old password
        if not old_password or not user.check_password(old_password):
            return Response(
                {"error": "Old password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set new password
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK
        )


class ProfileRetrieveUpdateView(RetrieveUpdateAPIView):
    """
    Get and update user profile information
    """
    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user