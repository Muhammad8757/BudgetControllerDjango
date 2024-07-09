from django.urls import path
from budget_controller_app import views

urlpatterns = [
    path("add_income/", views.add_income, name='add_income'),
    path("add_expense/", views.add_expense, name='add_expense'),
    path("sign_up.html", views.sign_up),
    path("login.html", views.login),
    path("index.html", views.get_history),
    path('get_history/', views.get_history, name='get_history'),
    path("transactions_partial.html",views.filter_by_category, name='filter_by_category'),

]