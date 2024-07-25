from django.shortcuts import redirect
from django.urls import path, re_path
from budget_controller_app import views



urlpatterns = [
    path("about_user", views.about_user, name="about_user"),
    path("add_transaction", views.add_transaction, name='add_transaction'),
    path("sign_up", views.sign_up, name="sign_up"),
    path("login", views.login, name="login"),
    path('', views.display_index, name="index"),
    path('logout', views.logout_view, name='logout'),
    path('get_history', views.get_history, name='get_history'),
    path("filter_by_category",views.filter_by_category, name='filter_by_category'),
    path("search_description",views.search_description, name='search_description'),
    path("edit_transaction",views.edit_transaction, name='edit_transaction'),
    path("delete_transaction",views.delete_transaction, name='delete_transaction'),
    path('sorted_by_amount', views.sorted_by_amount, name='sorted_by_amount'),
    path('sorted_by_type', views.sorted_by_type, name='sorted_by_type'),
    path('sorted_by_category', views.sorted_by_category, name='sorted_by_category'),
    path('sorted_by_date', views.sorted_by_date, name='sorted_by_date'),
    path('clear_delete_message', views.clear_delete_message, name='clear_delete_message'),
    path('sorted_by_description', views.sorted_by_description, name='sorted_by_description'),
    path('get_balance', views.get_balance, name='get_balance'),
    path('get_category', views.get_category, name='get_category'),
    path('get_categoriesjson', views.get_categoriesjson, name='get_categoriesjson'),
    path('add_category_id', views.add_category_id, name='add_category_id'),
    path('delete_category_id', views.delete_category_id, name='delete_category_id'),
    path('edit_category', views.edit_category, name='edit_category'),
    re_path(r'^.*$', lambda request: redirect('index')),
]