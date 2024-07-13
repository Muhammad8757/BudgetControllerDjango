function loadTransactionData(id, amount, type, category, description) {
    console.log("Loading transaction data:", id, amount, type, category, description);
    document.getElementById('transactionId').value = id;
    document.getElementById('transactionAmount').value = amount;
    document.getElementById('transactionType').value = type;
    document.getElementById('transactionCategory').value = category;
    document.getElementById('transactionDescription').value = description;
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("addTransactionForm").reset();
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
        if (window.location.href === 'http://127.0.0.1:8000/' 
        || window.location.href === 'http://127.0.0.1:8000/login' 
        || window.location.href === 'http://127.0.0.1:8000/add_transaction' 
        || window.location.href.startsWith('http://127.0.0.1:8000/delete_transaction?id=')
        || window.location.href.startsWith('http://127.0.0.1:8000/sorted_by_category?id=')
        || window.location.href === "http://127.0.0.1:8000/sorted_by_amount"
        || window.location.href === "http://127.0.0.1:8000/sorted_by_type"
        || window.location.href === "http://127.0.0.1:8000/sorted_by_category"
        || window.location.href === "http://127.0.0.1:8000/sorted_by_date"
        || window.location.href === "http://127.0.0.1:8000/sorted_by_description")
        {
            fetch(getBalanceUrl)
                .then(response => response.text())
                .then(html => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');
                    const newContent = doc.querySelector('.balance').innerHTML;
                    document.querySelector('.balance').innerHTML = newContent;
                })
                .catch(error => console.error('Error:', error));
        } else {
            console.log('This function should only be called on http://127.0.0.1:8000/');
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