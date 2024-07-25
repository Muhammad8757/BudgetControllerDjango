import hashlib
from django.http import HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse
from .models import models
from .models import User

def hasher(password) -> str:
    return hashlib.md5(str(password).encode()).hexdigest()

def get_user_from_session(request) -> models.Model:
    phone_number = request.session.get('phone_number')
    password = request.session.get('password')
    if phone_number and password:
        try:
            user = User.objects.filter(phone_number=phone_number, password=hasher(password)).first()
            return user
        except User.DoesNotExist:
            login_url = reverse('login')
            return HttpResponseRedirect(f"{login_url}?toast=unauthorized")

def check_redirect(request, path:str):
    phone_number = request.session.get('phone_number')
    password = request.session.get('password')
    user = User.objects.filter(phone_number=phone_number, password=hasher(password)).first()
    if user is not None:
        return redirect(path)