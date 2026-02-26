from django.urls import path
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('verify-otp/',   VerifyOtpView.as_view(), name='register'),
    path('resend_otp/',  ResendOtpView.as_view(), name='register'),
    path('change-password/',  ChangePasswordAPIView.as_view(), name='register'),
    path('set-password/',  SetPasswordAPIView.as_view(), name='register'),
    path('profile/', ProfileRetrieveUpdateView.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]