from datetime import datetime
import hashlib
import json
from django.contrib import messages
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404, redirect, render
from .models import *
from django.db.models import Q
from django.views.decorators.http import require_http_methods

def hasher(password) -> hash: #хэширует пароль
    if isinstance(password, int):
        # Если password является числом, преобразуйте его в строк
        password = str(password)
    password_bytes = password.encode()
    hash = hashlib.md5(password_bytes)
    return hash.hexdigest()

def sign_up(request) -> HttpResponse:
    if request.method == "POST":
        name = request.POST.get("name", "Undefined")
        phone_number = request.POST.get("phone_number", 1)
        password = request.POST.get("password", "Undefined")
        password_hash = hasher(password)
        user = User.objects.get(phone_number=phone_number, password=password_hash)

        try:
            # Проверяем наличие пользователя с таким же именем или номером телефона
            existing_user = User.objects.get(phone_number=user.phone_number)  # Или phone_number=phone_number
            # Если пользователь существует, показываем сообщение об ошибке и предлагаем вернуться на страницу входа
            return render(request, "login_error.html", {"error_message": "Пользователь с таким номером уже существует.", "target_path": "login"})
        
        except User.DoesNotExist:
            # Создаем нового пользователя, если пользователь не найден
            User.objects.create(name=name, phone_number=phone_number, password=password_hash)
            
            # Сохраняем данные в сессии
            request.session['name'] = name
            request.session['phone_number'] = phone_number
            request.session['password'] = password_hash
            
            # Перенаправляем на страницу index
            return redirect('index')
    
    return render(request, "sign_up.html")


def login(request):
    if request.method == "POST":
        phone_number = request.POST.get("phone_number", None)
        password = request.POST.get("password", None)
        password_hash = hasher(password)
        try:
            User.objects.get(phone_number=phone_number, password=password_hash)
            request.session['phone_number'] = phone_number
            request.session['password'] = password_hash
            return render(request, 'index.html')
        except User.DoesNotExist:
            return render(request, "login_error.html")
    return render(request, "login.html")

def get_history(request):
    phone_number_session = request.session['phone_number']
    password_session = request.session['password']
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    history = UserTransaction.objects.filter(user=user).order_by('-date')
    context = {
        'history': history,
    }
    return render(request, "index.html", context)

def add_transaction(request):
    if request.method == "POST":
        try:
            if 'phone_number' in request.session and 'password' in request.session:
                amount = float(request.POST.get("amount", 0))
                type_transaction = int(request.POST.get("type", None))
                description = request.POST.get("description", None)
                category_id = request.POST.get("category", None)
                phone_number_session = request.session['phone_number']
                password_session = request.session['password']

                try:
                    user = User.objects.get(phone_number=phone_number_session, password=password_session)
                except User.DoesNotExist:
                    messages.error(request, "Пользователь не авторизован.")
                    return redirect('index')

                category = None
                if category_id:  # Проверяем, что category_id не пустой
                    category = get_object_or_404(Category, pk=category_id)

                UserTransaction.objects.create(
                    amount=amount,
                    date=datetime.now().replace(second=0, microsecond=0),
                    description=description,
                    type=type_transaction, 
                    category=category,
                    user=user
                )

                # Show success toast
                messages.success(request, "Транзакция успешно добавлена.")
                return redirect('index')
            
            else:
                messages.error(request, "Пользователь не авторизован.")
        
        except Exception as e:
            messages.error(request, f"Произошла ошибка: {e}")
    
    # If request method is not POST or if any exception occurred, render the index page or appropriate view
    return redirect('index')
def filter_by_category(request):
    try:
        choosen_category = request.GET.get("id", None)
        if choosen_category is not None:
            choosen_category = int(choosen_category)
        else:
            choosen_category = None
        phone_number_session = request.session.get('phone_number')
        password_session = request.session.get('password')

        if not phone_number_session or not password_session:
            return redirect('login')  

        try:
            user = User.objects.get(phone_number=phone_number_session, password=password_session)
        except User.DoesNotExist:
            return redirect('login')  

        filter_by_category_result = UserTransaction.objects.filter(user=user, category_id=choosen_category)
        print(f"Found transactions: {filter_by_category_result.count()}") 
        context = {
            'history': filter_by_category_result,
        }

        return render(request, 'index.html', context)
    except UserTransaction.DoesNotExist:
        return redirect('error_404')

def about_user(request):
    try:
        phone_number_session = request.session.get('phone_number')
        password_session = request.session.get('password')
        user = User.objects.get(phone_number=phone_number_session, password=password_session)
        context = {
            'user_name': user.name,
            'phone_number': user.phone_number,
        }
        return render(request, "index.html", context)
    except:
        return redirect('error_404')

def search_description(request):
    try:
        phone_number_session = request.session['phone_number']
        password_session = request.session['password']
        user = User.objects.get(phone_number=phone_number_session, password=password_session)
        query = request.GET.get('q')
        if query:
            results = UserTransaction.objects.filter(
            Q(description__icontains=query) | Q(amount__icontains=query),
            user=user
            )

        else:
            results = User.objects.none()
        
        context = {
            'history': results,
            'query': query,
        }
        return render(request, 'index.html', context=context)
    except:
        return redirect('error_404')

def display_index(request):
    return render(request, 'index.html')

def logout_view(request):
    # Очистить сессию
    if 'password' in request.session:
        del request.session['password']
    if 'phone' in request.session:
        del request.session['phone']
    
    # Выйти из аккаунта
    logout(request)
    
    # Перенаправить на страницу входа или главную страницу
    return redirect('login')

def get_transactions_count(request):
    try:
        if 'phone_number' in request.session and 'password' in request.session:
            phone_number_session = request.session['phone_number']
            password_session = request.session['password']
            user = get_object_or_404(User, phone_number=phone_number_session, password=password_session)
            id_category = request.GET.get('category')
            transactions = UserTransaction.objects.filter(user=user, category_id=id_category)
            count = transactions.count()
            return JsonResponse({'count': count})
        else:
            return JsonResponse({'error': 'Session data not found'}, status=400)
    except:
        return redirect('error_404')

@require_http_methods(["DELETE"])
def delete_transaction(request):
    try:
        # Получаем данные из тела запроса
        if request.method == 'DELETE':
            transaction_id = request.GET.get('id')
            
            # Получаем пользователя из сессии
            phone_number_session = request.session.get('phone_number')
            password_session = request.session.get('password')
            user = User.objects.get(phone_number=phone_number_session, password=password_session)
            
            # Получаем транзакцию пользователя по ID
            transaction = UserTransaction.objects.get(user=user, id=transaction_id)
            
            # Удаляем транзакцию
            transaction.delete()

            request.session['delete_message'] = 'Транзакция была удалена успешно.'
            
            # Возвращаем успешный ответ
            return JsonResponse({'message': 'Транзакция успешно удалена!'}, status=200)
        else:
            return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    except (User.DoesNotExist, UserTransaction.DoesNotExist) as e:
        # Обработка случаев, когда пользователь или транзакция не найдены
        return JsonResponse({'error': str(e)}, status=404)

    except Exception as e:
        # Обработка других ошибок
        return JsonResponse({'error': str(e)}, status=500)



def clear_delete_message(request):
    if 'delete_message' in request.session:
        del request.session['delete_message']
    return JsonResponse({'status': 'success'})

def edit_transaction(request):
    if request.method == "POST":
        try:
            transaction_id = request.POST.get('id')
            amount = float(request.POST.get("amount", 0))
            type_transaction = int(request.POST.get("type", 0))
            description = request.POST.get("description", None)
            category_id = request.POST.get("category", None)
            
            # Retrieve user based on session data (example assuming session management)
            phone_number_session = request.session.get('phone_number')
            password_session = request.session.get('password')
            
            if phone_number_session and password_session:
                try:
                    user = User.objects.get(phone_number=phone_number_session, password=password_session)
                except User.DoesNotExist:
                    messages.error(request, "Пользователь не авторизован.")
                    return redirect('index')

                try:
                    transaction = UserTransaction.objects.get(user=user, id=transaction_id)
                except UserTransaction.DoesNotExist:
                    messages.error(request, "Транзакция не найдена.")
                    return redirect('index')

                # Update transaction details
                if category_id:
                    category = get_object_or_404(Category, pk=category_id)
                    transaction.category = category

                transaction.amount = amount
                transaction.date = datetime.now().replace(second=0, microsecond=0)
                transaction.description = description
                transaction.type = type_transaction
                transaction.save()

                # Show success toast
                messages.success(request, "Транзакция успешно отредактирована.")
                return redirect('index')
            
            else:
                messages.error(request, "Пользователь не авторизован.")
        
        except Exception as e:
            messages.error(request, f"Произошла ошибка: {e}")
    
    # If request method is not POST or if any exception occurred, render the index page or appropriate view
    return redirect('index')

def sorted_by_amount(request):
    phone_number_session = request.session.get('phone_number')
    password_session = request.session.get('password')
    user = User.objects.get(phone_number=phone_number_session, password=password_session)

    # Получаем текущее состояние сортировки из сессии
    sort_order = request.session.get('sort_order', 'desc')

    # Определяем порядок сортировки в зависимости от текущего состояния
    if sort_order == 'desc':
        sorted_by_amount = UserTransaction.objects.filter(user=user).order_by('-amount')
        request.session['sort_order'] = 'asc'  # Обновляем состояние на противоположное
    else:
        sorted_by_amount = UserTransaction.objects.filter(user=user).order_by('amount')
        request.session['sort_order'] = 'desc'  # Обновляем состояние на противоположное

    context = {
        "history": sorted_by_amount
    }
    return render(request, 'index.html', context=context)

def sorted_by_type(request):
    phone_number_session = request.session.get('phone_number')
    password_session = request.session.get('password')
    user = User.objects.get(phone_number=phone_number_session, password=password_session)

    # Получаем текущее состояние сортировки из сессии
    sort_order = request.session.get('sort_order', 'desc')

    # Определяем порядок сортировки в зависимости от текущего состояния
    if sort_order == 'desc':
        sorted_by_type = UserTransaction.objects.filter(user=user).order_by('-type')
        request.session['sort_order'] = 'asc'  # Обновляем состояние на противоположное
    else:
        sorted_by_type = UserTransaction.objects.filter(user=user).order_by('type')
        request.session['sort_order'] = 'desc'  # Обновляем состояние на противоположное

    context = {
        "history": sorted_by_type
    }
    return render(request, 'index.html', context=context)


def sorted_by_category(request):
    phone_number_session = request.session.get('phone_number')
    password_session = request.session.get('password')
    user = User.objects.get(phone_number=phone_number_session, password=password_session)

    # Получаем текущее состояние сортировки из сессии
    sort_order = request.session.get('sort_order', 'desc')

    # Определяем порядок сортировки в зависимости от текущего состояния
    if sort_order == 'desc':
        sorted_by_category = UserTransaction.objects.filter(user=user).order_by('-category_id')
        request.session['sort_order'] = 'asc'  # Обновляем состояние на противоположное
    else:
        sorted_by_category = UserTransaction.objects.filter(user=user).order_by('category_id')
        request.session['sort_order'] = 'desc'  # Обновляем состояние на противоположное

    context = {
        "history": sorted_by_category
    }
    return render(request, 'index.html', context=context)

def sorted_by_date(request):
    phone_number_session = request.session.get('phone_number')
    password_session = request.session.get('password')
    user = User.objects.get(phone_number=phone_number_session, password=password_session)

    # Получаем текущее состояние сортировки из сессии
    sort_order = request.session.get('sort_order', 'desc')

    # Определяем порядок сортировки в зависимости от текущего состояния
    if sort_order == 'desc':
        sorted_by_date = UserTransaction.objects.filter(user=user).order_by('-date')
        request.session['sort_order'] = 'asc'  # Обновляем состояние на противоположное
    else:
        sorted_by_date = UserTransaction.objects.filter(user=user).order_by('date')
        request.session['sort_order'] = 'desc'  # Обновляем состояние на противоположное

    context = {
        "history": sorted_by_date
    }
    return render(request, 'index.html', context=context)


def sorted_by_description(request):
    phone_number_session = request.session.get('phone_number')
    password_session = request.session.get('password')
    user = User.objects.get(phone_number=phone_number_session, password=password_session)

    # Получаем текущее состояние сортировки из сессии
    sort_order = request.session.get('sort_order', 'desc')

    # Определяем порядок сортировки в зависимости от текущего состояния
    if sort_order == 'desc':
        sorted_by_description = UserTransaction.objects.filter(user=user).order_by('-description')
        request.session['sort_order'] = 'asc'  # Обновляем состояние на противоположное
    else:
        sorted_by_description = UserTransaction.objects.filter(user=user).order_by('description')
        request.session['sort_order'] = 'desc'  # Обновляем состояние на противоположное

    context = {
        "history": sorted_by_description
    }
    return render(request, 'index.html', context=context)

def get_balance(request):
    phone_number_session = request.session['phone_number']
    password_session = request.session['password']
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    user_transaction = list(UserTransaction.objects.filter(user=user))
    zero_list = [item.amount for item in user_transaction if item.type == 0]
    one_list = [item.amount for item in user_transaction if item.type == 1]

    sum_zero = sum(zero_list)
    sum_one = sum(one_list)

    total_sum = sum_one - sum_zero
    context={
        "balance": total_sum
    }
    return render(request, "index.html", context)


def get_category(request):
    category = Category.objects.all()
    context={
        "categories":category
    }
    return render(request, "index.html", context)

def get_categoriesjson(request):
    categories = Category.objects.all()  # Получаем все категории из базы данных
    data = list(categories.values('id', 'name'))  # Преобразуем категории в список словарей
    return JsonResponse(data, safe=False)

def add_category_id(request):
    name = request.POST.get('categoryName')
    print(name)
    Category.objects.create(name=name)
    return redirect("index")


def delete_category_id(request):
    id = request.POST.get('category')
    category = Category.objects.get(id=id)
    
    # Проверка наличия данных, связанных с категорией
    if UserTransaction.objects.filter(category=category).exists():
        return JsonResponse({'status': 'error', 'message': 'С этой категорией связаны данные, удаление невозможно!'})
    
    category.delete()
    return JsonResponse({'status': 'success', 'message': 'Категория успешно удалена!'})
