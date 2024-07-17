from datetime import datetime
import hashlib
from django.contrib import messages
from django.http import JsonResponse, HttpResponse
from django.contrib.auth import logout
from django.shortcuts import get_object_or_404, redirect, render
from .models import User, UserTransaction, Category
from django.db.models import Q
from django.views.decorators.http import require_http_methods

def hasher(password) -> str:
    return hashlib.md5(str(password).encode()).hexdigest()

def get_user_from_session(request):
    phone_number = request.session.get('phone_number')
    password = request.session.get('password')
    return User.objects.filter(phone_number=phone_number, password=password).first()

def sign_up(request) -> HttpResponse:
    if request.method == "POST":
        name = request.POST.get("name", "Undefined")
        phone_number = request.POST.get("phone_number", 1)
        password = request.POST.get("password", "Undefined")
        password_hash = hasher(password)

        user = User.objects.filter(phone_number=phone_number).first()
        if user:
            return render(request, "login_error.html", {
                "error_message": "Пользователь с таким номером уже существует.", 
                "target_path": "login"
            })
        
        User.objects.create(name=name, phone_number=phone_number, password=password_hash)
        request.session['name'] = name
        request.session['phone_number'] = phone_number
        request.session['password'] = password_hash
        return redirect('index')
    
    return render(request, "sign_up.html")

def login(request):
    if request.method == "POST":
        phone_number = request.POST.get("phone_number")
        password = request.POST.get("password")
        password_hash = hasher(password)
        
        user = User.objects.filter(phone_number=phone_number, password=password_hash).first()
        if user:
            request.session['phone_number'] = phone_number
            request.session['password'] = password_hash
            messages.success(request, "Вы успешно вошли в аккаунт.")
            return redirect('index')
        
        messages.error(request, "Неверный номер телефона или пароль. Попробуйте снова.")
        return render(request, "login_error.html")
    
    return render(request, "login.html")

def get_history(request):
    user = get_user_from_session(request)
    if user:
        history = UserTransaction.objects.filter(user=user).order_by('-date')
        return render(request, "index.html", {'history': history})
    return redirect('login')

def add_transaction(request):
    if request.method == "POST":
        user = get_user_from_session(request)
        if user:
            amount = float(request.POST.get("amount", 0))
            type_transaction = int(request.POST.get("type", None))
            description = request.POST.get("description")
            category_id = request.POST.get("category")
            
            category = get_object_or_404(Category, pk=category_id) if category_id else None
            UserTransaction.objects.create(
                amount=amount, date=datetime.now().replace(second=0, microsecond=0),
                description=description, type=type_transaction, category=category, user=user
            )
            messages.success(request, "Транзакция успешно добавлена.")
            return redirect('index')
        
        messages.error(request, "Пользователь не авторизован.")
    
    return redirect('index')

def filter_by_category(request):
    try:
        choosen_category = request.GET.get("id")
        user = get_user_from_session(request)
        if user:
            filter_by_category_result = UserTransaction.objects.filter(user=user, category_id=choosen_category)
            return render(request, 'index.html', {'history': filter_by_category_result})
    except UserTransaction.DoesNotExist:
        pass
    return redirect('error_404')

def about_user(request):
    user = get_user_from_session(request)
    if user:
        context = {'user_name': user.name, 'phone_number': user.phone_number}
        return render(request, "index.html", context)
    return redirect('error_404')

def search_description(request):
    user = get_user_from_session(request)
    if user:
        query = request.GET.get('q')
        if query:
            results = UserTransaction.objects.filter(
                Q(description__icontains=query) | Q(amount__icontains=query), user=user
            )
            return render(request, 'index.html', {'history': results, 'query': query})
        return render(request, 'index.html', {'history': UserTransaction.objects.none(), 'query': query})
    return redirect('error_404')

def display_index(request):
    return render(request, 'index.html')

def logout_view(request):
    request.session.flush()
    logout(request)
    return redirect('login')

def get_transactions_count(request):
    user = get_user_from_session(request)
    if user:
        id_category = request.GET.get('category')
        transactions = UserTransaction.objects.filter(user=user, category_id=id_category)
        return JsonResponse({'count': transactions.count()})
    return JsonResponse({'error': 'Session data not found'}, status=400)

@require_http_methods(["DELETE"])
def delete_transaction(request):
    try:
        transaction_id = request.GET.get('id')
        user = get_user_from_session(request)
        if user:
            transaction = UserTransaction.objects.get(user=user, id=transaction_id)
            transaction.delete()
            request.session['delete_message'] = 'Транзакция была удалена успешно.'
            return JsonResponse({'message': 'Транзакция успешно удалена!'}, status=200)
    except (User.DoesNotExist, UserTransaction.DoesNotExist) as e:
        return JsonResponse({'error': str(e)}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def clear_delete_message(request):
    request.session.pop('delete_message', None)
    return JsonResponse({'status': 'success'})

def edit_transaction(request):
    if request.method == "POST":
        try:
            transaction_id = request.POST.get('id')
            amount = float(request.POST.get("amount", 0))
            type_transaction = int(request.POST.get("type", 0))
            description = request.POST.get("description")
            category_id = request.POST.get("category")
            user = get_user_from_session(request)
            if user:
                transaction = UserTransaction.objects.filter(user=user, id=transaction_id).first()
                if transaction:
                    if category_id:
                        category = get_object_or_404(Category, pk=category_id)
                        transaction.category = category
                    transaction.amount = amount
                    transaction.date = datetime.now().replace(second=0, microsecond=0)
                    transaction.description = description
                    transaction.type = type_transaction
                    transaction.save()
                    messages.success(request, "Транзакция успешно отредактирована.")
                    return redirect('index')
                messages.error(request, "Транзакция не найдена.")
            else:
                messages.error(request, "Пользователь не авторизован.")
        except Exception as e:
            messages.error(request, f"Произошла ошибка: {e}")
    return redirect('index')

def sorted_transactions(request, sort_field):
    user = get_user_from_session(request)
    if user:
        sort_order = request.session.get('sort_order', 'desc')
        order = f'-{sort_field}' if sort_order == 'desc' else sort_field
        transactions = UserTransaction.objects.filter(user=user).order_by(order)
        request.session['sort_order'] = 'asc' if sort_order == 'desc' else 'desc'
        return render(request, 'index.html', {'history': transactions})
    return redirect('login')

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
    user = get_user_from_session(request)
    if user:
        user_transaction = UserTransaction.objects.filter(user=user)
        sum_zero = sum(item.amount for item in user_transaction if item.type == 0)
        sum_one = sum(item.amount for item in user_transaction if item.type == 1)
        total_sum = sum_one - sum_zero
        return render(request, "index.html", {"balance": total_sum})
    return redirect('login')

def get_category(request):
    categories = Category.objects.all()
    return render(request, "index.html", {"categories": categories})

def get_categoriesjson(request):
    categories = list(Category.objects.values('id', 'name'))
    return JsonResponse(categories, safe=False)

def add_category_id(request):
    name = request.POST.get('categoryName')
    Category.objects.create(name=name)
    return redirect("index")

def delete_category_id(request):
    id = request.POST.get('category')
    category = get_object_or_404(Category, id=id)
    if UserTransaction.objects.filter(category=category).exists():
        return JsonResponse({'status': 'error', 'message': 'С этой категорией связаны данные, удаление невозможно!'})
    category.delete()
    return JsonResponse({'status': 'success', 'message': 'Категория успешно удалена!'})