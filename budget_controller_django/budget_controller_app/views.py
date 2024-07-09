from datetime import datetime 
from django.http import HttpResponse, JsonResponse
from django.core.serializers.json import DjangoJSONEncoder
from django.shortcuts import get_object_or_404, redirect, render
from .models import *

def sign_up(request) -> HttpResponse:
    try:
        if request.method == "POST":
            name = request.POST.get("name", "Undefined")
            phone_number = request.POST.get("phone_number", 1)
            password = request.POST.get("password", "Undefined")
            User.objects.create(name=name, phone_number=phone_number, password=password)
            return HttpResponse(f"<h2> Successed")
        return render(request, "sign_up.html")
    except User.unique_error_message:
        return redirect('sign_up.html')

def login(request):
    try:
        if request.method == "POST":
            phone_number = request.POST.get("phone_number", None)
            password = request.POST.get("password", None)
            User.objects.get(phone_number=phone_number, password=password)
            request.session['phone_number'] = phone_number
            request.session['password'] = password
            return render(request, "index.html")
        return render(request, "login.html")
    except User.DoesNotExist:
        return redirect('login.html')

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

def add_income(request):
    if 'phone_number' in request.session and 'password' in request.session:
        amount_str = request.POST.get("amount", "")
        if amount_str:
            try:
                amount = float(amount_str)
            except ValueError:
                # обработка ошибки, если значение не может быть преобразовано в float
                amount = 0.0  # или другое значение по умолчанию
        else:
            amount = 0.0  # или другое значение по умолчанию, если amount_str пустая строка
        description = request.POST.get("description", None)
        category_id = request.POST.get("category", None)
        phone_number_session = request.session['phone_number']
        password_session = request.session['password']
        try:
            user = User.objects.get(phone_number=phone_number_session, password=password_session)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User not authenticated.'}, status=403)
        
        
        category = None
        if category_id:
            category = get_object_or_404(Category, pk=category_id)

        UserTransaction.objects.create(
            amount=amount,
            date=datetime.now().replace(second=0, microsecond=0),
            description=description,
            type=1, 
            category=category,
            user=user
        )

        history = UserTransaction.objects.filter(user=user)
        context = {
            'history': history,
        }
        return render(request, "index.html", context)
    else:
        return JsonResponse({'error': 'User not authenticated.'}, status=403)

def add_expense(request):
    if request.method == "POST":
        if 'phone_number' in request.session and 'password' in request.session:
            amount = float(request.POST.get("amount", 0))
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
                type=0, 
                category=category,
                user=user
            )

            return HttpResponse("Expense added successfully!")
        else:
            return HttpResponse("User not authenticated.")
    return render(request, "add_expense.html")

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
        'filter_res': filter_by_category_result,
    }

    return render(request, 'transactions_partial.html', context)

    # return render(request, 'transactions_partial.html', context)