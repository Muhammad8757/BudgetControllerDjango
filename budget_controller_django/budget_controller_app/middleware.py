from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from .functions import get_user_from_session

class Middleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        url = request.path

        request.user = get_user_from_session(request)
        if not url.startswith('/login') and not url.startswith('/sign_up'):
            user = get_user_from_session(request)
            if user is None:
                login_url = reverse('login')
                return redirect(f"{login_url}?toast=unauthorized")

        if url.startswith('/login') or url.startswith('/sign_up'):
            user_check = get_user_from_session(request)
            if user_check:
                return redirect('index')

        response = self.get_response(request)
        return response