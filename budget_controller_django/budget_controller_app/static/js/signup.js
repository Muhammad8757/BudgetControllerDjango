
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
        <div id="${toastId}" class="toast" role="alert" aria-live="assertive" aria-atomic="true" data-delay="3000">
            <div class="toast-header ${bgClass} text-white">
                <strong class="mr-auto">${title}</strong>
                <button type="button" class="ml-2 mb-1 close" data-bs-dismiss="toast" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { delay: 3000 });
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove();
    });
}

function saveToastState(message, type) {
    localStorage.setItem('toastMessage', JSON.stringify({ message: message, type: type }));
}

function showSavedToast() {
    const savedToast = localStorage.getItem('toastMessage');
    if (savedToast) {
        const { message, type } = JSON.parse(savedToast);
        createToast(message, type);
        localStorage.removeItem('toastMessage');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    showSavedToast();
});

document.getElementById('signUpForm').addEventListener('submit', function(event) {
    let isValid = true;
    const name = document.getElementById('name').value;
    const phoneNumber = document.getElementById('phone_number').value;
    const password = document.getElementById('password').value;

    if (name.trim() === '') {
        isValid = false;
        alert('Please enter your name.');
    }

    if (isNaN(phoneNumber) || phoneNumber.length < 10) {
        isValid = false;
        alert('Пожалуйста, введите действительный номер телефона, содержащий не менее 10 цифр.');
    }

    if (password.length < 6) {
        isValid = false;
        alert('Пароль должен содержать не менее 6 знаков.');
    }

    if (!isValid) {
        event.preventDefault();
    }
});
