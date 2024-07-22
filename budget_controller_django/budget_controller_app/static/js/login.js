function createToast(message, type) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        console.error('Toast container not found');
        return;
    }

    const toastId = 'toast' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    const title = type === 'success' ? 'Успешно' : 'Ошибка';

    const toastHTML = `
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="1500">
            <div class="toast-header ${bgClass} text-white">
                <div class="toast-body">
                ${message}
                </div>
                <button type="button" class="ml-2 mb-1 close" data-bs-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 5000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

function showToastFromUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const toastType = urlParams.get('toast');
    console.log("Toast type from URL:", toastType); // Отладка
    if (toastType === 'unauthorized') {
        createToast('Вы не зарегистрированы. Пожалуйста, войдите в систему.', 'danger');
    }
    else if (toastType === 'wrong_pass') {
        createToast('Неправильный пароль или телефонный номер.', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log("Loading toasts...");
    showToastFromUrlParams();

    const form = document.getElementById('loginForm');
    form.addEventListener('submit', function(event) {
        const phoneNumberInput = document.getElementById('phone_number');
        const phoneNumberError = document.getElementById('phone_number_error');
        let isValid = true;

        // Очистка предыдущих ошибок
        phoneNumberError.textContent = '';

        // Проверка на правильность введенных данных
        if (!phoneNumberInput.value.match(/^\d+$/)) {
            phoneNumberError.textContent = 'Введите только цифры для номера телефона';
            isValid = false;
        }

        // Другие проверки для поля пароля, если нужно
        const passwordInput = document.getElementById('password');
        const passwordError = document.getElementById('password_error');

        if (passwordInput.value.trim() === '') {
            // Пример проверки для пароля (если нужно)
            // Создание элемента для отображения ошибки, если его нет
            if (!passwordError) {
                const errorSpan = document.createElement('span');
                errorSpan.id = 'password_error';
                errorSpan.className = 'error-message';
                passwordInput.parentElement.appendChild(errorSpan);
            }
            document.getElementById('password_error').textContent = 'Пароль не может быть пустым';
            isValid = false;
        }

        if (!isValid) {
            event.preventDefault(); // Останавливаем отправку формы, если есть ошибки
        }
    });
});