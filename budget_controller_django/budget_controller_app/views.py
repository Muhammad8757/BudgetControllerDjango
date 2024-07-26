from django.urls import reverse
from datetime import datetime
import json
from django.contrib import messages
from django.http import HttpResponseRedirect, JsonResponse, HttpResponse
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404, redirect, render
from .models import User, UserTransaction, Category
from django.db.models import Q
from django.views.decorators.http import require_http_methods
from .functions import dict_to_obj, hasher

def sign_up(request) -> HttpResponse:
    if request.method == "POST":
        name = request.POST.get("name", "Undefined")
        phone_number = request.POST.get("phone_number", 1)
        password = request.POST.get("password", "Undefined")
        password_hash = hasher(password)
        
        existing_user = User.objects.filter(phone_number=phone_number).first()
        if existing_user:
            sign_up = reverse('sign_up')
            return HttpResponseRedirect(f"{sign_up}?toast=user_exist")

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
        """Нужно уменьшить код. Много повторения"""
        phone_number = request.POST.get("phone_number")
        password = request.POST.get("password")
        password_hash = hasher(password)

        user = User.objects.filter(phone_number=phone_number, password=password_hash).first()
        """Нужно уменьшить код. Много повторения"""
        if user:
            request.session['phone_number'] = phone_number
            request.session['password'] = password_hash
            messages.success(request, "Вы успешно вошли в аккаунт.")
            return redirect('index')
        
        messages.error(request, "Неверный номер телефона или пароль. Попробуйте снова.")
        
        login_url = reverse('login')
        return HttpResponseRedirect(f"{login_url}?toast=wrong_pass")
    
    return render(request, "login.html")


def get_history(request):
    """Пользователь используется только один раз."""
    user = request.user
    history = UserTransaction.objects.filter(user=user).order_by('-date')
    return render(request, "index.html", {'history': history})

def add_transaction(request):
    
    if request.method == "POST":
        user = request.user
        try:
            data = json.loads(request.body)
            amount = float(data.get("amount", 0))
            type_transaction = int(data.get("type", None))
            description = data.get("description")
            category_id = data.get("categoryId")
            
            category = get_object_or_404(Category, pk=category_id) if category_id else None
            UserTransaction.objects.create(
                amount=amount, date=datetime.now().replace(second=0, microsecond=0),
                description=description, type=type_transaction, category=category, user=user
            )
            return JsonResponse({"message": "Транзакция успешно добавлена."}, status=200)
        except (json.JSONDecodeError, ValueError, TypeError) as e:
            print(e)
            return JsonResponse({"error": "Некорректные данные."}, status=400)
    login_url = reverse('login')
    return HttpResponseRedirect(f"{login_url}?toast=unauthorized")


def filter_by_category(request):
    try:
        choosen_category = request.GET.get("id")
        user = request.user
        if user:
            filter_by_category_result = UserTransaction.objects.filter(user=user, category_id=choosen_category)
            return render(request, 'index.html', {'history': filter_by_category_result})
    except UserTransaction.DoesNotExist:
        login_url = reverse('login')
        return HttpResponseRedirect(f"{login_url}?toast=unauthorized")

def about_user(request):
    user = request.user
    context = {'user_name': user.name, 'phone_number': user.phone_number}
    return render(request, "index.html", context)

def search_description(request):
    """Иногда, лучше всего использовать request.user, чем user = request.user и потом ...=user"""
    user = request.user
    query = request.GET.get('q')
    if query:
        results = UserTransaction.objects.filter(
            Q(description__icontains=query) | Q(amount__icontains=query), user=user
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
    """Много повторений кода. Нужен единый метод, через который будешь получать объект любой модели"""
    try:
        transaction_id = request.GET.get('id')
        user = request.user
        if user:
            transaction = UserTransaction.objects.get(user=user, id=transaction_id)
            transaction.delete()
            request.session['delete_message'] = 'Транзакция была удалена успешно.'
            return JsonResponse({'message': 'Транзакция успешно удалена!'}, status=200)
    except (User.DoesNotExist, UserTransaction.DoesNotExist) as e:
        login_url = reverse('login')
        return HttpResponseRedirect(f"{login_url}?toast=unauthorized")
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def clear_delete_message(request):
    request.session.pop('delete_message', None)
    return JsonResponse({'status': 'success'})

def edit_transaction(request):
    """Маппинга нет, очень много функционала в одной функции, simple responsibility 0, повтор кода"""
    if request.method == "POST":
        try:
            transaction_id = request.POST.get('id')
            amount = float(request.POST.get("amount", 0))
            type_transaction = int(request.POST.get("type", 0))
            description = request.POST.get("description")
            category_id = request.POST.get("category")
            user = request.user
            transaction = UserTransaction.objects.filter(user=user, id=transaction_id).first()
            if transaction:
                if category_id:
                    category = get_object_or_404(Category, pk=category_id)
                    transaction.category = category
                transaction.amount = amount
                transaction.description = description
                transaction.type = type_transaction
                transaction.save()
                messages.success(request, "Транзакция успешно отредактирована.")
                return redirect('index')
            messages.error(request, "Транзакция не найдена.")
        except Exception as e:
            messages.error(request, f"Произошла ошибка: {e}")
    return redirect('index')

def sorted_transactions(request, sort_field):
    """Можно напрямую использовать request.user, если пользователь нужен только пару раз"""
    user = request.user
    sort_order = request.session.get('sort_order', 'desc')
    order = f'-{sort_field}' if sort_order == 'desc' else sort_field
    transactions = UserTransaction.objects.filter(user=user).order_by(order)
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
    """Опять же, нужен единый метод для получения объектов. """
    user = request.user
    if user:
        user_transactions = UserTransaction.objects.filter(user=user)
        sum_zero = sum(item.amount for item in user_transactions if item.type == 0)
        sum_one = sum(item.amount for item in user_transactions if item.type == 1)
        total_sum = sum_one - sum_zero

        if total_sum == 0:
            formatted_balance = "0"
        else:
            formatted_balance = "{:.5f}".format(total_sum).rstrip('0').rstrip('.')

        return render(request, "index.html", {"balance": formatted_balance})
    login_url = reverse('login')
    return HttpResponseRedirect(f"{login_url}?toast=unauthorized")

def get_category(request):
    """Объект request тут не нужен. Это лишняя трата памяти и перфоманса,
    объекты получать через один метод"""
    user_data = dict_to_obj(request.session, ['phone_number', 'password'])

    user = User.objects.get(phone_number = user_data.phone_number, password=user_data.password)
    categories = Category.objects.filter(Q(created_category_by=user) | Q(created_category_by=None))
    return render(request, "index.html", {"categories": categories})

def get_categoriesjson(request):
    """Пользователь находится в request.user, зачем его заново запрашивать с бд?
    user_data в этом кейса бесполезен, категории брать при помощи единого метода для изъятия с бд"""

    user_data = dict_to_obj(request.session, ['phone_number', 'password'])

    user = User.objects.filter(phone_number=user_data.phone_number, password=user_data.password).first()

    categories = Category.objects.filter(Q(created_category_by=user) | Q(created_category_by=None))

    categories_list = list(categories.values())

    return JsonResponse(categories_list, safe=False)

def add_category_id(request, id=None, name=None):
    """Пользователь используется только раз"""
    user = request.user
    if id is None and name is None:
        name = request.POST.get('categoryName')
        Category.objects.create(name=name, created_category_by=user)
    elif id is not None and name is not None:
        Category.objects.create(name=name, created_category_by=id)
    return HttpResponseRedirect(reverse('index'))

def delete_category_id(request):
    """Авторизирован ли пользователь, нужно проверять через user.is_authenticated.
    Его тоже нужно в ручную, один метод делают слишком много вещей"""
    user = request.user
    if user:
        id = request.POST.get('category')

        category = get_object_or_404(Category, id=id)
        
        if UserTransaction.objects.filter(category=category, user=user).exists():
            return JsonResponse({'status': 'error', 'message': 'С этой категорией связаны данные, удаление невозможно!'})
        elif category.created_category_by is None or category.created_category_by == user:
            category.delete()
            return JsonResponse({'status': 'success', 'message': 'Категория успешно удалена!'})
    else:
        login_url = reverse('login')
        return HttpResponseRedirect(f"{login_url}?toast=unauthorized")

def edit_category(request):
    """Получать объекты через единый метод"""
    if request.method == 'POST':
        data = json.loads(request.body)
        category_name = data.get("editcategoryName", "")
        category_id = data.get("category", "")
        if category_id and category_name:
            try:
                category = Category.objects.get(id=category_id)
                category.name = category_name
                category.save()
                return JsonResponse({'message': 'Категория успешно отредактирована!'}, status=200)
            except Category.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'Категория не найдена'})
        else:
            return JsonResponse({'success': False, 'error': 'Недостаточно данных'})
    return redirect('index')



"""Обобщить ошибки через новый middleware!!!!!!"""