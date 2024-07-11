from django.urls import path
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
    path('api/get_transactions_count', views.get_transactions_count, name='api/get_transactions_count'),
]