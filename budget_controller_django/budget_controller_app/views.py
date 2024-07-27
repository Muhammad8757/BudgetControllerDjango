from django.urls import reverse
from datetime import datetime
import json
from django.contrib import messages
from django.http import Http404, HttpResponseRedirect, JsonResponse, HttpResponse
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404, redirect, render
from .models import User, UserTransaction, Category
from django.db.models import Q
from django.views.decorators.http import require_http_methods
from .functions import dict_to_obj, get_models, hasher

def sign_up(request) -> HttpResponse:
    if request.method == "POST":
        name = request.POST.get("name", "Undefined")
        phone_number = request.POST.get("phone_number", 1)
        password = request.POST.get("password", "Undefined")
        password_hash = hasher(password)

        try:
            get_models(User, {'phone_number': phone_number})
            sign_up = reverse('sign_up')
            return HttpResponseRedirect(f"{sign_up}?toast=user_exist")
        except Http404:
            # Пользователь не найден, продолжаем регистрацию
            user = User.objects.create(name=name, phone_number=phone_number, password=password_hash)
            request.session['name'] = name
            request.session['phone_number'] = phone_number
            request.session['password'] = password_hash
            categories = ["Медицина", "Транспорт", "Еда и напитки", "Образование", "Другое"]
            for category in categories:
                add_category_id(request, id=user, name=category)
            return redirect('index')
    return render(request, "sign_up.html")

def login(request):
    if request.method == "POST":
        phone_number = request.POST.get("phone_number")
        password = request.POST.get("password")
        password_hash = hasher(password)

        user = get_models(User, {'phone_number': phone_number, 'password': password_hash}, exception_message="Неверный номер телефона или пароль. Попробуйте снова.", redirect_url=reverse("login"))
        if user:
            request.session['phone_number'] = phone_number
            request.session['password'] = password_hash
            messages.success(request, "Вы успешно вошли в аккаунт.")
            return redirect('index')
        
        messages.error(request, "Неверный номер телефона или пароль. Попробуйте снова.")
        return redirect()
    
    return render(request, "login.html")


def get_history(request):
    history = UserTransaction.objects.filter(user=request.user).order_by('-date')
    return render(request, "index.html", {'history': history})

def add_transaction(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            amount = float(data.get("amount", 0))
            type_transaction = int(data.get("type", None))
            description = data.get("description")
            category_id = data.get("categoryId")
            category = get_models(Category, {"id": category_id})
            UserTransaction.objects.create(
                amount=amount, date=datetime.now().replace(second=0, microsecond=0),
                description=description, type=type_transaction, category=category, user=request.user
            )
            return JsonResponse({"message": "Транзакция успешно добавлена."}, status=200)
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            print(e)
            return JsonResponse({"error": "Некорректные данные."}, status=400)
    login_url = reverse('login')
    return HttpResponseRedirect(f"{login_url}?toast=unauthorized")


def filter_by_category(request):
    choosen_category = request.GET.get("id")
    filter_by_category_result = UserTransaction.objects.filter(user=request.user, category_id=choosen_category)
    return render(request, 'index.html', {'history': filter_by_category_result})

def about_user(request):
    user = request.user
    context = {'user_name': user.name, 'phone_number': user.phone_number}
    return render(request, "index.html", context)

def search_description(request):
    query = request.GET.get('q')
    if query:
        results = UserTransaction.objects.filter(
            Q(description__icontains=query) | Q(amount__icontains=query), user=request.user
        )
        return render(request, 'index.html', {'history': results, 'query': query})
    return render(request, 'index.html', {'history': UserTransaction.objects.none(), 'query': query})


def display_index(request):
    return render(request, 'index.html')

def logout_view(request):
    if request.method == "POST":
        request.session.flush()
        logout(request)
        return JsonResponse({'message': 'Вы вышли из системы'}, status=200)
    else:
        login_url = reverse('login')
        # избегаем перенаправления на страницу входа, если уже на странице входа или регистрации
        if not request.path.startswith(login_url) and not request.path.startswith(reverse('sign_up')):
            return HttpResponseRedirect(f"{login_url}?toast=unauthorized")
        return HttpResponse(status=200)

@require_http_methods(["DELETE"])
def delete_transaction(request):
    try:
        transaction_id = request.GET.get('id')
        transaction = get_models(UserTransaction, {"user": request.user, "id": transaction_id})
        transaction.delete()
        request.session['delete_message'] = 'Транзакция была удалена успешно.'
        return JsonResponse({'message': 'Транзакция успешно удалена!'}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def clear_delete_message(request):
    request.session.pop('delete_message', None)
    return JsonResponse({'status': 'success'})

def edit_transaction(request):
    if request.method == "POST":
        try:
            data = dict_to_obj(request.POST, ['id', 'amount', 'type', 'description', 'category'])
            
            transaction_id = data.id
            amount = float(data.amount)
            type_transaction = int(data.type)
            description = data.description
            category_id = data.category

            transaction = get_models(UserTransaction, {"id": transaction_id, "user": request.user})
            category = get_models(Category, {"id": category_id})
            transaction.category = category
            transaction.amount = amount
            transaction.description = description
            transaction.type = type_transaction
            transaction.save()
            messages.success(request, "Транзакция успешно отредактирована.")
            return redirect('index')
        except Exception as e:
            messages.error(request, f"Произошла ошибка: {e}")
    return redirect('index')

def sorted_transactions(request, sort_field):
    sort_order = request.session.get('sort_order', 'desc')
    order = f'-{sort_field}' if sort_order == 'desc' else sort_field
    transactions = UserTransaction.objects.filter(user=request.user).order_by(order)
    request.session['sort_order'] = 'asc' if sort_order == 'desc' else 'desc'
    return render(request, 'index.html', {'history': transactions})

def sorted_by_amount(request):
    return sorted_transactions(request, 'amount')

def sorted_by_type(request):
    return sorted_transactions(request, 'type')

def sorted_by_category(request):
    return sorted_transactions(request, 'category_id')

def sorted_by_date(request):
    return sorted_transactions(request, 'date')

def sorted_by_description(request):
    return sorted_transactions(request, 'description')

def get_balance(request):
    user_transactions = UserTransaction.objects.filter(user=request.user)
    sum_zero = sum(item.amount for item in user_transactions if item.type == 0)
    sum_one = sum(item.amount for item in user_transactions if item.type == 1)
    total_sum = sum_one - sum_zero

    if total_sum == 0:
        formatted_balance = "0"
    else:
        formatted_balance = "{:.5f}".format(total_sum).rstrip('0').rstrip('.')

    return render(request, "index.html", {"balance": formatted_balance})
    
def get_category(request):
    categories = Category.objects.filter(Q(created_category_by=request.user) | Q(created_category_by=None))
    return render(request, "index.html", {"categories": categories})

def get_categoriesjson(request):
    categories = Category.objects.filter(Q(created_category_by=request.user) | Q(created_category_by=None))

    categories_list = list(categories.values())

    return JsonResponse(categories_list, safe=False)

def add_category_id(request, id=None, name=None):
    if id is None and name is None:
        name = request.POST.get('categoryName')
        Category.objects.create(name=name, created_category_by=request.user)
    elif id is not None and name is not None:
        Category.objects.create(name=name, created_category_by=id)
    return HttpResponseRedirect(reverse('index'))

def delete_category_id(request):
    id = request.POST.get('category')

    category = get_object_or_404(Category, id=id)
    
    if UserTransaction.objects.filter(category=category, user=request.user).exists():
        return JsonResponse({'status': 'error', 'message': 'С этой категорией связаны данные, удаление невозможно!'})
    elif category.created_category_by is None or category.created_category_by == request.user:
        category.delete()
        return JsonResponse({'status': 'success', 'message': 'Категория успешно удалена!'})
    
def edit_category(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        category_name = data.get("editcategoryName", "")
        category_id = data.get("category", "")
        category = get_models(Category, {"id": category_id})
        category.name = category_name
        category.save()
        return JsonResponse({'message': 'Категория успешно отредактирована!'}, status=200)
    return redirect('index')