from django.urls import path
from budget_controller_app import views

urlpatterns = [
    path("about_user", views.about_user, name="about_user"),
    path("add_transaction/", views.add_transaction, name='add_transaction'),
    path("sign_up.html", views.sign_up),
    path("login.html", views.login),
    path("index.html", views.get_history),
    path('get_history/', views.get_history, name='get_history'),
    path("transactions_partial.html",views.filter_by_category, name='filter_by_category'),
]