"""
Utility functions for the API
"""
import os
import logging
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
import requests
from django.conf import settings
import random

import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

# Load project-level .env (if present) then app-level .env as fallback
load_dotenv(BASE_DIR / ".env")
# also try loading accounts/.env (useful when env is stored inside the app folder)
load_dotenv(Path(__file__).resolve().parent / ".env")


def _get_env(key: str):
    v = os.getenv(key)
    if v is None:
        return None
    # strip possible surrounding quotes and whitespace
    return v.strip().strip('"').strip("'")



def generate_jwt_tokens(user):
    refresh = RefreshToken.for_user(user)

   
 
    refresh["email"] = user.email
    refresh["username"] = user.username

    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        
    }


def generate_acess_tokens(user):
    refresh = RefreshToken.for_user(user)

   
 
    refresh["email"] = user.email
    refresh["username"] = user.username

    return {
        "access": str(refresh.access_token),

        
    }




def generate_otp():
    return str(random.randint(100000, 999999))




FLOKI_SMS_TOKEN = _get_env("FLOKI_SMS_TOKEN")
FLOKI_SMS_URL = _get_env("FLOKI_SMS_URL")
WHATSAPP_API_URL = _get_env('WHATSAPP_API_URL')
WHATSAPP_API_TOKEN = _get_env('WHATSAPP_API_TOKEN')

def send_sms_otp(phone: str, otp_code: str, app_name: str = "Brandit") -> dict:
 headers = {
"Authorization": f"Bearer {FLOKI_SMS_TOKEN}",
"Content-Type": "application/x-www-form-urlencoded",
}


 payload = {
"app_name": app_name,
"otp_code": otp_code,
"phone": phone,
}


 try:
  response = requests.post(FLOKI_SMS_URL, headers=headers, data=payload, timeout=10)
  response.raise_for_status()
  return response.json()
 except requests.RequestException as e:
  return {
"status": False,
"message": f"Failed to send OTP: {str(e)}"
}





import requests

def send_whatsapp_otp(phone: str, otp_code: str, app_name: str = "MatchWatch") -> dict:
    """
    Send OTP code via Facebook WhatsApp Business API.

    :param phone: Phone number (with or without +)
    :param otp_code: The OTP code to send
    :param app_name: Application name (default: "MatchWatch")
    :return: Dict with 'status' (bool) and 'message' (str) keys
    """
    # Strip + from phone number for WhatsApp API
    phone_clean = phone.lstrip('+')
    
    headers = {
        "Authorization": f"Bearer {WHATSAPP_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": phone_clean,
        "type": "template",
        "template": {
            "name": "matchwatch_otp",  # Make sure this template exists in WhatsApp Business
            "language": {"code": "en"},  # Template language code
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": otp_code}
                    ]
                },
                # Optional button component (only if template has a button)
                # Remove if your template does not have a button
                {
                    "type": "button",
                    "sub_type": "url",
                    "index": 0,
                    "parameters": [
                        {"type": "text", "text": otp_code}
                    ]
                }
            ]
        }
    }

    try:
        response = requests.post(WHATSAPP_API_URL, headers=headers, json=payload, timeout=10)
        response.raise_for_status()  # Raise exception if HTTP status >= 400
        result = response.json()
        
        # Log response for debugging
        print("WhatsApp API Response:", result)
        
        return {
            "status": True,
            "message": "OTP sent successfully"
        }

    except requests.RequestException as e:
        return {
            "status": False,
            "message": f"Failed to send OTP: {str(e)}"
        }
    except ValueError as e:  # JSON decoding errors
        return {
            "status": False,
            "message": f"Invalid response from WhatsApp API: {str(e)}"
        }
