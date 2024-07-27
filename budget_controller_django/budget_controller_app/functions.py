import hashlib
from django.http import Http404, HttpResponseRedirect
from django.shortcuts import redirect
from django.urls import reverse
from .models import models
from .models import User

def hasher(password) -> str:
    return hashlib.md5(str(password).encode()).hexdigest()

def get_user_from_session(request):
    phone_number = request.session.get('phone_number')
    password = request.session.get('password')
    if phone_number and password:
        return User.objects.filter(phone_number=phone_number, password=password).first()
    return None

def check_user(request):
    user = get_user_from_session(request)
    if user is None:
        login_url = reverse('login')
        return HttpResponseRedirect(f"{login_url}?toast=unauthorized")
    return None

def get_model(model: models, **kwargs):
    return model.objects.get(**kwargs)

class SimpleObject:
    pass

def dict_to_obj(data: dict, keys: list):
    obj = SimpleObject()
    for key in keys:
        if key in data:
            setattr(obj, key, data[key])
    return obj

def get_models(model: models.Model, filter: dict, exception_message=None, redirect_url=None):
    try:
        return model.objects.get(**filter)
    except model.DoesNotExist:
        if redirect_url:
            return HttpResponseRedirect(f"{redirect_url}?error={exception_message}")
        else:
            raise Http404(exception_message if exception_message else "Model does not exist")