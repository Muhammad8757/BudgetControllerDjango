document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("addTransactionModal").reset();
});

$(document).ready(function() {
    // Обновление истории транзакций по клику на кнопку "Обновить"
    function loadHistoryindex() {
        if (
            window.location.href === 'http://127.0.0.1:8000/' 
            || window.location.href === 'http://127.0.0.1:8000/login' 
            || window.location.href.startsWith('http://127.0.0.1:8000/delete_transaction?id=')
            || window.location.href.startsWith('http://127.0.0.1:8000/edit_category')
            ) {
            fetch("get_history")
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
            url.startsWith('http://127.0.0.1:8000')
    
        console.log("Is valid URL:", isValid);
    
        if (isValid) {
            fetch("get_balance")
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
        fetch("get_history")
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
        fetch("get_category")
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


    function loadCategoryTransaction() {
        fetch("get_category")
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

    document.getElementById('editTransactionCategory').addEventListener('click', function() {
        loadCategoryTransaction();
    });

    function addCategoryid(categoryName) {
        const formData = new FormData();
        formData.append('category_name', categoryName);
    
        fetch("add_category_id", {
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
        fetch("about_user")
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



function handleEditCategory(event) {
    const categoryNameInput = document.getElementById('editcategoryName');
    const errorElement = document.getElementById('editCategoryError');
    
    // Clear any existing error messages
    errorElement.style.display = 'none';
    
    if (categoryNameInput.value.trim() === '') {
      event.preventDefault(); // Stop form submission
      errorElement.style.display = 'block'; // Show error message
      return false;
    }
    
    return true;
  }


document.addEventListener('DOMContentLoaded', function() {
    const transactionCategorySelect = document.getElementById('deleteTransactionCategory');

    // Функция для загрузки категорий из Django
    function deleteTransactionCategory() {
        fetch("get_categoriesjson")  // URL для получения категорий
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
    const transactionCategorySelect = document.getElementById('editCategory');
    const categoryNameInput = document.getElementById('editcategoryName');
    const categoryError = document.getElementById('categoryMessage');
    const editCategoryModal = new bootstrap.Modal(document.getElementById('editCategoryModal'));
    const editCategoryButton = document.getElementById('editCategoryModalId'); // Кнопка редактирования категории
    const csrftoken = document.querySelector('[name=csrfmiddlewaretoken]').value; // Получение CSRF токена

    // Функция для загрузки категорий из Django
    function editCategory() {
        fetch("get_categoriesjson")  // URL для получения категорий
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

    // Обработчик изменения выбора категории
    transactionCategorySelect.addEventListener('change', function() {
        const selectedOption = transactionCategorySelect.options[transactionCategorySelect.selectedIndex];
        const selectedId = selectedOption.value;
        const selectedName = selectedOption.textContent; // Получаем отображаемое имя опции

        console.log("Selected ID:", selectedId);
        console.log("Selected Name:", selectedName);

        if (selectedId === '') {
            categoryNameInput.value = '';
            categoryError.textContent = 'Пожалуйста, выберите категорию.';
            categoryError.style.display = 'block';
        } else {
            categoryNameInput.value = selectedName;
            categoryError.textContent = '';
            categoryError.style.display = 'none';
        }
    });
    
    // Обработчик для кнопки редактирования категории
    if (editCategoryButton) {
        editCategoryButton.addEventListener('click', function(event) {
            event.preventDefault();
            $('#editCategoryModal').modal('hide');
            setTimeout(function() {
                window.location.href = "/"
            }, 1500); // 5000 миллисекунд = 5 секунд
            
            const selectedOption = transactionCategorySelect.options[transactionCategorySelect.selectedIndex];
            const selectedId = selectedOption.value;
            const new_name = categoryNameInput.value;

            // Вызов функции с новыми данными
            handleAndEditCategory(new_name, selectedId);
        });
    }

    document.getElementById('editCategoryModal').addEventListener('hidden.bs.modal', function () {
        categoryError.textContent = '';
        categoryError.style.display = 'none';
        categoryNameInput.value = ''; // Очистка поля названия
        transactionCategorySelect.value = ''; // Сброс выбора категории
    });

    // Вызвать функцию загрузки категорий при загрузке страницы
    editCategory();
});

function handleAndEditCategory(new_name, category_id) {
    console.log("Handling category edit. new_name:", new_name);
    console.log("Handling category edit. category_id:", category_id);
    
    let xhr = new XMLHttpRequest();
    let url = 'edit_category'; // Используйте корректный URL
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader('X-CSRFToken', csrftoken); // Убедитесь, что csrftoken доступен
    
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            console.log("XHR readyState:", xhr.readyState);
            console.log("XHR status:", xhr.status);
            console.log("XHR response:", xhr.responseText);
            
            try {
                let response = JSON.parse(xhr.responseText);
                
                if (xhr.status === 200 && response.success) {
                    localStorage.setItem('dataKey', JSON.stringify({ message: "Отправлен" }));
                    console.log("Данные сохранены в localStorage");
    
                    document.getElementById('editCategoryModal').classList.remove('show');
                    
                    createToast(response.message, 'success');
                } else {
                    console.error(response.error);
                    showErrorUnderField('editcategoryName', response.error || 'Ошибка при редактировании категории');
                    createToast(response.message, 'success');
                }
            } catch (e) {
                console.error("Ошибка при парсинге ответа сервера:", e);
            }
        }
    };
    
    let data = JSON.stringify({
        editcategoryName: new_name,
        category: category_id // Добавляем category_id в данные
    });
    console.log("Data to be sent:", data);

    xhr.send(data);
}






document.addEventListener('DOMContentLoaded', function() {
    const transactionCategorySelect = document.getElementById('transactionCategory');

    // Функция для загрузки категорий из Django
    function loadCategories() {
        fetch("get_categoriesjson")  // URL для получения категорий
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
    const editTransactionCategory = document.getElementById('editTransactionCategory');
    
    function loadCategories() {
        fetch("get_categoriesjson")  // URL для получения категорий
            .then(response => response.json())
            .then(data => {
                // Очистить текущие опции в select
                editTransactionCategory.innerHTML = '';

                // Добавить первую опцию
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = 'Выберите категорию';
                editTransactionCategory.appendChild(defaultOption);

                // Добавить остальные категории
                data.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    editTransactionCategory.appendChild(option);
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
    document.getElementById("transactionAmountDisplayValue").textContent = amount;

    // Отладочное логирование
    console.log("Transaction type received:", type);

    // Установка значения типа транзакции
    let action = {
        income: 1,
        outgoing: 0
    }
    var currentTypeValue = $('#editTransactionType').val(); // Получаем текущее значение
    var transactionTypeValue = (type.trim() === currentTypeValue) ? 1 : 0; // Определяем новое значение
    $('#editTransactionType').val(transactionTypeValue); 
    console.log("Setting transaction type:", transactionTypeValue);

    // Проверка текущего значения после установки
    console.log("Current value of #editTransactionType:", $('#editTransactionType').val());

    console.log("Loading transaction data:", id, amount, type, categoryId, description);
}

$(document).on("click", ".editTransactionModal", function () {
    var transactionId = $(this).data('transaction-id');
    var amount = $(this).data('amount');
    var type = $(this).data('transaction-type'); // Должен быть строкой
    var categoryId = $(this).data('category-id');
    var description = $(this).data('description');

    loadTransactionData(transactionId, amount, type, categoryId, description);
});

function loadAmountData(amount) {
    document.getElementById("transactionAmountDisplay").textContent = amount;
}

$(document).on("click", ".confirmDeleteModal", function () {
    var amount = $(this).data('amount');
    console.log(amount)
    loadAmountData(amount)
});


document.addEventListener('DOMContentLoaded', function() {
    // Сброс формы при закрытии модального окна добавления транзакции
    $('#addTransactionModal').on('hidden.bs.modal', function () {
        document.getElementById("addTransactionForm").reset();
    });

    // Сброс формы при закрытии модального окна редактирования транзакции


    // Очистка полей формы вручную при открытии модального окна добавления транзакции
    $('#addTransactionModal').on('shown.bs.modal', function () {
        document.getElementById("addTransactionForm").reset();
    });
});

document.addEventListener('DOMContentLoaded', function() {
    // Обработчик клика на кнопку для зеленого toast при сохранении транзакции
    $('#saveTransactionBtn').click(function() {
        // Закрываем модальное окно (если необходимо)
        $('#myModal').modal('hide');

        // Сохраняем состояние тоста в localStorage
        // Сохраняем состояние тоста в localStorage
        const localMessage = localStorage.getItem('toastMessage', JSON.stringify({message: 'Транзакция успешно добавлена!', type: 'success'}));
        
        localStorage.setItem('toastMessage', JSON.stringify({message: 'Транзакция успешно добавлена!', type: 'success'}));
    });

    $('#editTransactionSaveBtn').click(function(event) {
        // Предотвращаем стандартное действие кнопки (отправку формы)

        // Закрываем модальное окно
        $('#myModal').modal('hide');

        // Сохраняем состояние тоста в localStorage
        localStorage.setItem('toastMessage', JSON.stringify({message: 'Транзакция успешно отредактирована!', type: 'success'}));
    });

    $('#delete_transactionId').click(function(event) {
        // Предотвращаем стандартное действие кнопки (если это форма)

        // Закрываем модальное окно
        $('#myModal').modal('hide');

        // Сохраняем состояние тоста в localStorage
        localStorage.setItem('toastMessage', JSON.stringify({message: 'Транзакция успешно удалена!', type: 'success'}));
    });

    $('#addCategoryModalId').click(function(event) {
        // Предотвращаем стандартное действие кнопки (если это форма)

        // Закрываем модальное окно
        $('#myModal').modal('hide');

        // Сохраняем состояние тоста в localStorage
        localStorage.setItem('toastMessage', JSON.stringify({message: 'Категория успешно добавлена!', type: 'success'}));
    });

    // Сброс данных формы после закрытия модального окна
$('#editCategoryModal').on('hidden.bs.modal', function () {
    // Сброс формы
    $(this).find('form')[0].reset();

    // Очистка значений полей ввода и текстовых областей
    $(this).find('input, textarea').val('');

    // Если есть сообщения об ошибках или уведомления
    $('#editCategoryError').hide();
    $('#deleteCategoryMessage').hide();
});

// Обработка клика по кнопке "Сохранить

    




    $(document).ready(function() {
        const toastMessage = localStorage.getItem('toastMessage');
        if (toastMessage) {
            const {message, type} = JSON.parse(toastMessage);
            createToast(message, type);
            localStorage.removeItem('toastMessage'); // Очищаем после показа
        }
    });
});




function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');

let deleteTransactionId = null;

function setTransactionId(transactionId) {
  deleteTransactionId = transactionId;
  
}

document.getElementById('deleteTransactionBtn').addEventListener('click', function() {
  if (deleteTransactionId) {
    const url = "delete_transaction?id=" + deleteTransactionId;
    fetch(url, {
      method: 'DELETE',
      headers: {
        'X-CSRFToken': csrftoken,
      },
    })
    .then(response => {
      if (response.ok) {
        console.log(url);
        $('#confirmDeleteModal').modal('hide'); // Скрыть модальное окно
        localStorage.setItem('toastMessage', JSON.stringify({message: 'Транзакция успешно удалена!', type: 'success'}));
        location.reload(); 
      } else {
        localStorage.setItem('toastMessage', JSON.stringify({message: 'Транзакция успешно удалена!', type: 'success'}));
      }
    })
    .catch(error => {
      console.error('Ошибка:', error);
      alert("Произошла ошибка при удалении транзакции");
    });
  } else {
    console.error('Transaction ID is null or undefined');
    alert("Неверный ID транзакции");
  }
});

function createToast(message, type) {
    const toastContainer = document.getElementById('toastContainer');

    const toastId = 'toast' + Date.now(); // Уникальный ID для каждого тоста
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
    const toast = new bootstrap.Toast(toastElement);
    toast.show();

    toastElement.addEventListener('hidden.bs.toast', function () {
        toastElement.remove(); // Удаляем тост из DOM после того, как он исчез
    });
}



  function handleDeleteCategory(event) {
    event.preventDefault();
    const form = document.getElementById('deleteCategoryForm');
    const formData = new FormData(form);
    const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch("delete_category_id", {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': csrfToken
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        createToast('Категория успешно удалена!', 'success');
      } else {
        createToast(data.message || 'Произошла ошибка!', 'error');
      }
      $('#deleteCategoryModal').modal('hide');
      setTimeout(() => location.reload(), 1000); 
    })
    .catch(error => {
      console.error('Error:', error);
      createToast('Произошла ошибка!', 'error');
      $('#deleteCategoryModal').modal('hide');
    });
}


  function showToast(toastId) {
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }


document.addEventListener('DOMContentLoaded', function() {
    // Получаем все элементы с ID, начинающимся с "delete_transactionModalId-"
    var deleteButtons = document.querySelectorAll('[id^=delete_transactionModalId-]');

    deleteButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            var transactionId = button.getAttribute('data-id');  // Получаем идентификатор транзакции
            
            // Создаем и настраиваем XMLHttpRequest
            var xhr = new XMLHttpRequest();
            var url = 'delete_transaction' + transactionId;  // URL для удаления транзакции
            xhr.open('DELETE', url, true);

            // Обработчик успешного ответа сервера
            xhr.onload = function() {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Действия после успешного удаления (например, закрытие модального окна)
                    var confirmDeleteModal = document.getElementById('confirmDeleteModal-' + transactionId);
                    if (confirmDeleteModal) {
                        // Закрываем модальное окно (если используете Bootstrap, замените метод на `modal('hide')`)
                        $('#confirmDeleteModal').modal('hide');
                    }

                    // Возможно, добавление уведомления или обновление списка транзакций
                } else {
                    // Обработка ошибки удаления, если нужно
                    console.error('Ошибка при удалении транзакции:', xhr.statusText);
                }
            };

            // Обработчик ошибки запроса
            xhr.onerror = function() {
                console.error('Ошибка при удалении транзакции:', xhr.statusText);
            };

            // Отправляем запрос
            xhr.send();
        });
    });
});





function create_transaction(amount, type, categoryId, description) {
    // Создаем и настраиваем XMLHttpRequest
    let xhr = new XMLHttpRequest();
    let url = "add_transaction";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.setRequestHeader('X-CSRFToken', csrftoken); 

    // Обработчик ответа сервера
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            let response = JSON.parse(xhr.responseText);
            if (xhr.status === 200) {
                // Обработка успешного ответа сервера
                console.log(response.message);
                $('#addTransactionModal').modal('hide');
                createToast(response.message, 'success');
                window.location.href = '/';
            } else {
                // Обработка ошибки
                console.error(response.error);
                 // или другой способ отображения сообщения
                showErrorUnderField('transactionAmount', 'Введите сумму');
            }
        }
    };

    // Данные для отправки
    let data = JSON.stringify({
        amount: amount,
        type: type,
        categoryId: categoryId,
        description: description
    });

    // Отправляем запрос
    xhr.send(data);
}




// Добавляем обработчик событий для кнопки с id saveTransactionBtn
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('addTransactionForm').addEventListener('submit', function(event) {
        event.preventDefault();  
        // Получаем значения из формы
        var amount = document.getElementById('transactionAmount').value;
        var type = document.getElementById('transactionType').value;
        var categoryId = document.getElementById('transactionCategory').value;
        var description = document.getElementById('transactionDescription').value;

        // Очищаем старые ошибки перед новой проверкой
        clearModalErrors();

        // Проверяем, что все поля заполнены корректно
        let isValid = true;

        if (!type) {
            showErrorUnderField('transactionType', 'Выберите тип транзакции');
            isValid = false;
        }

        if (!amount.match(/^\d+(\.\d{1,2})?$/)) {
            showErrorUnderField('transactionAmount', 'Введите корректную сумму');
            isValid = false;
        }
        // Если все проверки прошли успешно, вызываем функцию create_transaction
        if (isValid) {
            create_transaction(amount, type, categoryId, description);
        }
    });
});

document.getElementById('editTransactionForm').addEventListener('submit', function(event) {
    var amountInput = document.getElementById('editTransactionAmount');
    var amountValue = amountInput.value;
    var amountError = document.getElementById('amountError');
    var amountRegex = /^\d+(\.\d{1,2})?$/;

    if (!amountRegex.test(amountValue)) {
        amountError.style.display = 'block';
        event.preventDefault();
    } else {
        amountError.style.display = 'none';
    }
});


function logoutUser() {
    $.ajax({
        url: 'logout',  // Убедитесь, что этот URL соответствует URL в вашем Django проекте
        type: 'POST',
        data: {
            csrfmiddlewaretoken: csrftoken  // Вставьте этот токен в шаблон Django
        },
        success: function(response) {
            createToast(response.message, "success")
            window.location.href = "login";  // Перенаправляем пользователя на главную страницу после выхода
        },
        error: function(response) {
            createToast(response.responseJSON.error, "error")
        }
    });
}

// Функция для показа сообщений об ошибках под полями формы
// Функция для показа и обновления сообщений об ошибках под полем
function showErrorUnderField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('div');
    errorElement.classList.add('text-danger', 'mt-1');
    errorElement.innerText = errorMessage;

    // Проверяем, есть ли уже сообщение об ошибке под полем
    const existingError = field.nextElementSibling;
    if (existingError && existingError.classList.contains('text-danger')) {
        existingError.innerText = errorMessage;
    } else {
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
}

// Функция для очистки всех сообщений об ошибках
function clearModalErrors() {
    const errorElements = document.querySelectorAll('.text-danger');
    errorElements.forEach(element => element.remove());
}

// Функция для проверки и отправки формы
function handleFormSubmission(formId, fieldValidations) {
    // Функция для показа и обновления сообщений об ошибках под полем
    function showErrorUnderField(fieldId, errorMessage) {
        const field = document.getElementById(fieldId);
        const errorElement = document.createElement('div');
        errorElement.classList.add('text-danger', 'mt-1');
        errorElement.innerText = errorMessage;

        // Проверяем, есть ли уже сообщение об ошибке под полем
        const existingError = field.nextElementSibling;
        if (existingError && existingError.classList.contains('text-danger')) {
            existingError.innerText = errorMessage;
        } else {
            field.parentNode.insertBefore(errorElement, field.nextSibling);
        }
    }

    // Функция для очистки всех сообщений об ошибках
    function clearModalErrors() {
        const errorElements = document.querySelectorAll('.text-danger');
        errorElements.forEach(element => element.remove());
    }

    // Обработчик отправки формы
    document.getElementById(formId).addEventListener('submit', function(event) {
        clearModalErrors(); // Очищаем все предыдущие сообщения об ошибках

        let isValid = true;

        // Выполняем проверки для каждого поля
        fieldValidations.forEach(({ fieldId, validationFn, errorMessage }) => {
            const field = document.getElementById(fieldId);
            if (!validationFn(field.value)) {
                showErrorUnderField(fieldId, errorMessage);
                isValid = false;
            }
        });

        if (!isValid) {
            event.preventDefault(); // Останавливаем отправку формы, если есть ошибки
        }
    });
}



// Функция для получения CSRF-токена из cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Проверить, совпадает ли строка cookie с ожидаемым значением
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
