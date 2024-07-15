document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("addTransactionModal").reset();
});

$(document).ready(function() {
    // Обработчик кнопки удаления транзакции
    $('.delete-btn').on('click', function(event) {
        event.preventDefault();
        var transactionId = $(this).data('id');
        var deleteUrl = $('#confirmDeleteLink').attr('href') + '?id=' + transactionId;
        $('#confirmDeleteLink').attr('href', deleteUrl);
        $('#confirmDeleteModal').modal('show');
    });

    // Обновление истории транзакций по клику на кнопку "Обновить"
    function loadHistoryindex() {
        if (
            window.location.href === 'http://127.0.0.1:8000/' 
            || window.location.href === 'http://127.0.0.1:8000/login' 
            || window.location.href.startsWith('http://127.0.0.1:8000/delete_transaction?id=')
            ) {
            fetch(getHistoryUrl)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelector('.table-responsive').innerHTML;
                    document.querySelector('.table-responsive').innerHTML = newContent;
                })
                .catch(error => console.error('Error:', error));
        } else {
            console.log('This function should only be called on http://127.0.0.1:8000/');
        }
    }

    loadHistoryindex();

    function get_balance() {
        const url = window.location.href;
        console.log("Current URL:", url);
        const validUrls = [
            'http://127.0.0.1:8000/',
            'http://127.0.0.1:8000/login',
            'http://127.0.0.1:8000/add_transaction',
            'http://127.0.0.1:8000/sorted_by_amount',
            'http://127.0.0.1:8000/sorted_by_type',
            'http://127.0.0.1:8000/sorted_by_category',
            'http://127.0.0.1:8000/sorted_by_date',
            'http://127.0.0.1:8000/sorted_by_description'
        ];
    
        const isValid = validUrls.includes(url) ||
            url.startsWith('http://127.0.0.1:8000/delete_transaction?id=') ||
            url.startsWith('http://127.0.0.1:8000/filter_by_category?id=');
    
        console.log("Is valid URL:", isValid);
    
        if (isValid) {
            fetch(getBalanceUrl)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelector('.balance').innerHTML;
                    document.querySelector('.balance').innerHTML = newContent;
                    console.log("Balance updated.");
                })
                .catch(error => console.error('Error:', error));
        } else {
            console.log('This function should only be called on specified URLs.');
        }
    }
    

    get_balance();

    function loadHistory() {
        fetch(getHistoryUrl)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('.table-responsive').innerHTML;
                document.querySelector('.table-responsive').innerHTML = newContent;
            })
            .catch(error => console.error('Error:', error));
    }


    function loadCategory() {
        fetch(getCategoryUrl)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('#categoryId').innerHTML;
                document.querySelector('#categoryId').innerHTML = newContent;
            })
            .catch(error => console.error('Error:', error));
    }


    document.getElementById('category').addEventListener('click', function() {
        loadCategory();
    });


    function loadCategory() {
        fetch(getCategoryUrl)
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const newContent = doc.querySelector('#categoryId').innerHTML;
                document.querySelector('#categoryId').innerHTML = newContent;
            })
            .catch(error => console.error('Error:', error));
    }


    document.getElementById('transactionCategory').addEventListener('click', function() {
        loadCategory();
    });

    function addCategoryid(categoryName) {
        const formData = new FormData();
        formData.append('category_name', categoryName);
    
        fetch(add_category_id, {
            method: 'POST',
            body: formData
        })
        .then(response => response.text())
        .then(html => {
            // Обработка успешного ответа, если необходимо
            console.log('Успешно добавлена новая категория:', html);
            
            // Предположим, что вы хотите обновить список категорий после добавления
            loadCategory(); // Перезагрузка списка категорий после добавления новой
        })
        .catch(error => {
            console.error('Ошибка при добавлении категории:', error);
        });
    }
    
    // Пример обработчика события для кнопки добавления категории
    document.addEventListener('DOMContentLoaded', function() {
        document.getElementById('addCategoryButton').addEventListener('click', function() {
            console.log(document.getElementById('categoryName').value)
            const categoryName = document.getElementById('categoryName').value;
            addCategoryid(categoryName); // Вызов функции для добавления категории
        });
    });
    



    document.getElementById('refreshHistoryBtn').addEventListener('click', function() {
        loadHistory();
    });



    document.getElementById('saveTransactionBtn').addEventListener('click', function() {
        loadHistory();
    });

    document.getElementById('user').addEventListener('click', function() {
        fetch(aboutUserUrl)
            .then(response => response.text())
            .then(html => {
                const tempElement = document.createElement('div');
                tempElement.innerHTML = html;

                const aboutUserContent = tempElement.querySelector('.aboutuser').innerHTML;
                document.querySelector('.aboutuser').innerHTML = aboutUserContent;
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const transactionCategorySelect = document.getElementById('deleteTransactionCategory');

    // Функция для загрузки категорий из Django
    function deleteTransactionCategory() {
        fetch(getHistoryUrljson)  // URL для получения категорий
            .then(response => response.json())
            .then(data => {
                // Очистить текущие опции в select
                transactionCategorySelect.innerHTML = '';

                // Добавить первую опцию
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Выберите категорию';
                transactionCategorySelect.appendChild(defaultOption);

                // Добавить остальные категории
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    transactionCategorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка загрузки категорий:', error));
    }

    // Вызвать функцию загрузки категорий при загрузке страницы
    deleteTransactionCategory();
});



document.addEventListener('DOMContentLoaded', function() {
    const transactionCategorySelect = document.getElementById('editTransactionCategory');

    // Функция для загрузки категорий из Django
    function loadCategories() {
        fetch(getHistoryUrljson)  // URL для получения категорий
            .then(response => response.json())
            .then(data => {
                // Очистить текущие опции в select
                transactionCategorySelect.innerHTML = '';

                // Добавить первую опцию
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Выберите категорию';
                transactionCategorySelect.appendChild(defaultOption);

                // Добавить остальные категории
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    transactionCategorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка загрузки категорий:', error));
    }

    // Вызвать функцию загрузки категорий при загрузке страницы
    loadCategories();
});



document.addEventListener('DOMContentLoaded', function() {
    const transactionCategorySelect = document.getElementById('transactionCategory');

    // Функция для загрузки категорий из Django
    function loadCategories() {
        fetch(getHistoryUrljson)  // URL для получения категорий
            .then(response => response.json())
            .then(data => {
                // Очистить текущие опции в select
                transactionCategorySelect.innerHTML = '';

                // Добавить первую опцию
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Выберите категорию';
                transactionCategorySelect.appendChild(defaultOption);

                // Добавить остальные категории
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    transactionCategorySelect.appendChild(option);
                });
            })
            .catch(error => console.error('Ошибка загрузки категорий:', error));
    }

    // Вызвать функцию загрузки категорий при загрузке страницы
    loadCategories();
});


// Функция для загрузки данных транзакции в модальное окно редактирования
// Функция для загрузки данных транзакции в модальное окно редактирования
function loadTransactionData(id, amount, type, categoryId, description) {
    document.getElementById("editTransactionId").value = id;
    document.getElementById("editTransactionAmount").value = amount;
    document.getElementById("editTransactionCategory").value = categoryId;
    document.getElementById("editTransactionDescription").value = description;

    // Установка значения типа транзакции
    if (type === 'Доход') {
        $('#editTransactionType').val('1'); // Устанавливаем значение '1' для Дохода
    } else {
        $('#editTransactionType').val('0'); // Устанавливаем значение '0' для Расхода
    }
    console.log("Loading transaction data:", id, amount, type, categoryId, description);
}

// При клике на кнопку "Изменить" загружаем данные транзакции в модальное окно редактирования
$(document).on("click", ".editTransactionModal", function () {
    var transactionId = $(this).data('transaction-id');
    var amount = $(this).data('amount');
    var type = $(this).data('transaction-type'); // Предположим, что у вас есть атрибут data-transaction-type для определения типа транзакции
    var categoryId = $(this).data('category-id');
    var description = $(this).data('description');

    loadTransactionData(transactionId, amount, type, categoryId, description);
});







document.addEventListener('DOMContentLoaded', function() {
    // Сброс формы при закрытии модального окна добавления транзакции
    $('#addTransactionModal').on('hidden.bs.modal', function () {
        document.getElementById("addTransactionForm").reset();
    });

    // Сброс формы при закрытии модального окна редактирования транзакции
    $('#editTransactionModal').on('hidden.bs.modal', function () {
        document.getElementById("editTransactionForm").reset();
    });

    // Очистка полей формы вручную при открытии модального окна добавления транзакции
    $('#addTransactionModal').on('shown.bs.modal', function () {
        document.getElementById("addTransactionForm").reset();
    });
});


document.addEventListener('DOMContentLoaded', function() {
    $('.toast').toast();

    // Обработчик клика на кнопку для зеленого toast
    $('#saveTransactionBtn').click(function() {
        // Закрываем модальное окно (если необходимо)
        $('#myModal').modal('hide');

        // Сохраняем состояние тоста в localStorage
        localStorage.setItem('showGreenToast', 'true');
        $('#greenToast').toast('show');
    });

    $('#editTransactionSaveBtn').click(function(event) {
 // Предотвращаем стандартное действие кнопки (отправку формы)
    
        // Закрываем модальное окно
        $('#myModal').modal('hide');
        localStorage.setItem('showGreenToast', 'true');
        // Показываем зеленый тост
        $('#greenToast').toast('show');
        
    });

    $('#addCategoryModalId').click(function(event) {
 // Предотвращаем стандартное действие кнопки (отправку формы)
    
        // Закрываем модальное окно
        $('#myModal').modal('hide');
        localStorage.setItem('showGreenToast', 'true');
        // Показываем зеленый тост
        $('#greenToast').toast('show');
        
    });

    $('#deleteCategoryModalId').click(function(event) {
 // Предотвращаем стандартное действие кнопки (отправку формы)
    
        // Закрываем модальное окно
        $('#myModal').modal('hide');
        localStorage.setItem('showGreenToast', 'true');
        // Показываем зеленый тост0
        $('#greenToast').toast('show');
        
    });

    $(document).ready(function() {
        $('#delete_transactionId').click(function(event) {
            // Предотвращаем стандартное действие кнопки (если это форма)
            event.preventDefault();
    
            // Закрываем модальное окно
            $('#myModal').modal('hide');
            
            // Устанавливаем значение в localStorage
            localStorage.setItem('showGreenToast', 'true');
    
            // Показываем зеленый тост
            $('#greenToast').toast('show');
        });
    });
    




    if (localStorage.getItem('showGreenToast') === 'true') {
        $('#greenToast').toast('show');
        localStorage.removeItem('showGreenToast'); // Очищаем после показа
    }
    if (localStorage.getItem('showRedToast') === 'true') {
        $('#redToast').toast('show');
        localStorage.removeItem('showRedToast'); // Очищаем после показа
    }
});
