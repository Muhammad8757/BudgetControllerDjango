from datetime import datetime
import hashlib
from pyexpat.errors import messages 
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404, redirect, render
from .models import *
from django.db.models import Q

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

        # Создаем нового пользователя
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
        try:
            User.objects.get(phone_number=phone_number, password=password)
            request.session['phone_number'] = phone_number
            request.session['password'] = password
            return render(request, 'index.html')
        except User.DoesNotExist:
            return redirect('error_404')
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
                    return HttpResponse("User not authenticated.")

                category = None

                """
                Чтобы избежать этой ошибки, нужно либо инициализировать category заранее, либо убедиться, 
                что она всегда будет иметь значение до того, как будет использоваться в коде.
                """
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

                return redirect('index')
            else:
                return HttpResponse("User not authenticated.")
        except:
            return redirect('error_404')
    return render(request, "index.html")

def filter_by_category(request):
    try:
        choosen_category = request.GET.get("category", None)
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

def delete_transaction(request):
    try:
        id_user = request.GET.get('id')
        phone_number_session = request.session['phone_number']
        password_session = request.session['password']
        
        # Получаем пользователя
        user = User.objects.get(phone_number=phone_number_session, password=password_session)
        
        # Получаем транзакцию пользователя по ID
        transaction = UserTransaction.objects.get(user=user, id=id_user)
        
        # Удаляем транзакцию
        transaction.delete()

        request.session['delete_message'] = 'Транзакция была удалена успешно.'
        
        # Возвращаем пользователю страницу index.html
        return render(request, 'index.html')
    
    except User.DoesNotExist:
        # Обработка случая, когда пользователь не найден
        return redirect('error')

    except UserTransaction.DoesNotExist:
        # Обработка случая, когда транзакция пользователя не найдена
        # Здесь можно перенаправить пользователя на другую страницу или выполнить другие действия
        return render(request, 'error.html', {'error_message': 'Транзакция не найдена.'})


def clear_delete_message(request):
    if 'delete_message' in request.session:
        del request.session['delete_message']
    return JsonResponse({'status': 'success'})

def edit_transaction(request):
    if request.method == "POST":
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
                return redirect('index')

            try:
                transaction = UserTransaction.objects.get(user=user, id=transaction_id)
            except UserTransaction.DoesNotExist:
                return redirect('login')

            # Update transaction details
            if category_id:
                category = get_object_or_404(Category, pk=category_id)
                transaction.category = category
            
            transaction.amount = amount
            transaction.date = datetime.now().replace(second=0, microsecond=0)
            transaction.description = description
            transaction.type = type_transaction
            transaction.save()
        
        else:
            messages.error(request, "Пользователь не авторизован.")
        
        return redirect('index')

    # If request method is not POST, render the index page or appropriate view
    return render(request, "index.html")


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



def test(request):
    data_from = {"key": "value"}
    return render(request, "index.html", {'data': data_from})
