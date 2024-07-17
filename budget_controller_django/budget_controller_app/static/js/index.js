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
            url.startsWith('http://127.0.0.1:8000/delete_transaction?id=2') ||
            url.startsWith('http://127.0.0.1:8000/search_description?q=bn') ||
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
    // Обработчик клика на кнопку для зеленого toast при сохранении транзакции
    $('#saveTransactionBtn').click(function() {
        // Закрываем модальное окно (если необходимо)
        $('#myModal').modal('hide');

        // Сохраняем состояние тоста в localStorage
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
  document.getElementById('transactionIdDisplay').innerText = transactionId;
}

document.getElementById('deleteTransactionBtn').addEventListener('click', function() {
  if (deleteTransactionId) {
    const url = delete_transaction + deleteTransactionId;
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
        alert("Не удалось удалить транзакцию");
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




document.getElementById('addTransactionForm').addEventListener('submit', function(event) {
    let isValid = true;
    const amount = document.getElementById('transactionAmount').value;

    // Проверка, что сумма является числом
    if (isNaN(amount) || amount <= 0) {
        isValid = false;
        alert('Пожалуйста, введите правильную сумму.');
    }

    if (!isValid) {
        event.preventDefault(); // Предотвращает отправку формы, если данные невалидные
    }
  });




  document.getElementById('editTransactionForm').addEventListener('submit', function(event) {
    let isValid = true;
    const amount = document.getElementById('editTransactionAmount').value;
  
    // Проверка, что сумма является числом
    if (isNaN(amount) || amount <= 0) {
        isValid = false;
        alert('Пожалуйста, введите правильную сумму.');
    }
  
    if (!isValid) {
        event.preventDefault(); // Предотвращает отправку формы, если данные невалидные
    }
  });



  function handleDeleteCategory(event) {
    event.preventDefault();
    const form = document.getElementById('deleteCategoryForm');
    const formData = new FormData(form);
    const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;

    fetch(delete_category_id, {
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








// JavaScript (jQuery)
$(document).ready(function() {
    // Обработчик клика на кнопку "Удалить" в модальном окне
    $('[id^=delete_transactionModalId-]').click(function() {
        var transactionId = $(this).data('id');  // Получаем идентификатор транзакции
        
        // AJAX-запрос на удаление транзакции
        $.ajax({
            url: '/delete_transaction/' + transactionId,  // URL для удаления транзакции
            type: 'DELETE',  // Метод запроса
            success: function(response) {
                // Действия после успешного удаления (например, закрытие модального окна)
                $('#confirmDeleteModal-' + transactionId).modal('hide');  // Закрываем модальное окно

                // Возможно, добавление уведомления или обновление списка транзакций
            },
            error: function(xhr, status, error) {
                // Обработка ошибки удаления, если нужно
                console.error('Ошибка при удалении транзакции:', error);
            }
        });
    });
});

