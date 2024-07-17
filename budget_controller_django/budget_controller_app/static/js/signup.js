document.getElementById('signUpForm').addEventListener('submit', async function(event) {
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
        alert('Пароль должен содержать не менее 6 символов.');
    }

    if (!isValid) {
        event.preventDefault();
        return; // Досрочный выход из функции при невалидных данных
    }

    try {
        // Ваш код для отправки данных формы на сервер
        // Предполагаем, что регистрация прошла успешно
        createToast('Регистрация прошла успешно', 'success');
        saveToastState('Регистрация прошла успешно', 'success');
    } catch (error) {
        // Обработка ошибок при регистрации
        console.error('Ошибка регистрации:', error);
        createToast('Ошибка регистрации', 'error');
        saveToastState('Ошибка регистрации', 'error');
    }
});
