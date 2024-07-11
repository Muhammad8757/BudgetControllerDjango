from datetime import datetime 
from django.http import HttpResponse, JsonResponse
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404, redirect, render
from .models import *

def sign_up(request) -> HttpResponse:
    if request.method == "POST":
        name = request.POST.get("name", "Undefined")
        phone_number = request.POST.get("phone_number", 1)
        password = request.POST.get("password", "Undefined")
        
        # Создаем нового пользователя
        User.objects.create(name=name, phone_number=phone_number, password=password)
        
        # Сохраняем данные в сессии
        request.session['name'] = name
        request.session['phone_number'] = phone_number
        request.session['password'] = password
        
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
            return redirect('display_index')
    return render(request, "login.html")

def get_history(request):
    phone_number_session = request.session['phone_number']
    password_session = request.session['password']
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    history = UserTransaction.objects.filter(user=user).order_by('-date')
    for result in history:
        if result.category:
            print(result.category.name)
        else:
            print("Category is None for this transaction")
    context = {
        'history': history,
    }
    return render(request, "index.html", context)


def add_transaction(request):
    if request.method == "POST":
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

            return render(request, "index.html")
        else:
            return HttpResponse("User not authenticated.")
    return render(request, "index.html")

def filter_by_category(request):
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
    for result in filter_by_category_result:
        if result.category:
            print(result.category.name)
        else:
            print("Category is None for this transaction")
    context = {
        'history': filter_by_category_result,
    }

    return render(request, 'index.html', context)

def about_user(request):
    phone_number_session = request.session.get('phone_number')
    password_session = request.session.get('password')
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    context = {
        'user_name': user.name,
        'phone_number': user.phone_number,
        'amount': check_balance(request),
    }
    return render(request, "index.html", context)

def check_balance(request) -> float:
    phone_number_session = request.session['phone_number']
    password_session = request.session['password']
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    user_transaction = list(UserTransaction.objects.filter(user=user))
    zero_list = [item.amount for item in user_transaction if item.type == 0]
    one_list = [item.amount for item in user_transaction if item.type == 1]

    sum_zero = sum(zero_list)
    sum_one = sum(one_list)

    total_sum = sum_one - sum_zero
    return total_sum

def search_description(request):
    phone_number_session = request.session['phone_number']
    password_session = request.session['password']
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    query = request.GET.get('q')
    if query:
        results = UserTransaction.objects.filter(user=user,description=query)
    else:
        results = User.objects.none()

    
    context = {
        'history': results,
        'query': query,
    }
    return render(request, 'index.html', context)

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

def delete_transaction(request):
    id_user = request.GET.get('id')
    phone_number_session = request.session['phone_number']
    password_session = request.session['password']
    user = User.objects.get(phone_number=phone_number_session, password=password_session)
    transaction = UserTransaction.objects.get(user=user, id=id_user)
    transaction.delete()
    return render(request, 'index.html')


def edit_transaction(request):
    if request.method == "POST":
        id_user = request.GET.get('id')
        amount = float(amount)
        type_transaction = int(type_transaction)
        description = request.POST.get("description", None)
        category_id = request.POST.get("category", None)
        phone_number_session = request.session['phone_number']
        password_session = request.session['password']

        user = User.objects.get(phone_number=phone_number_session, password=password_session)
        transaction = UserTransaction.objects.get(user=user, id=id_user)


        category = None
        """
        Чтобы избежать этой ошибки, нужно либо инициализировать category заранее, либо убедиться, 
        что она всегда будет иметь значение до того, как будет использоваться в коде.
        """
        if category_id:
            category = get_object_or_404(Category, pk=category_id)
            transaction.category = category

        transaction.amount = amount
        transaction.date = datetime.now().replace(second=0, microsecond=0)
        transaction.description = description
        transaction.type = type_transaction
        transaction.save()

        return redirect('index')
    return render(request, "index.html")