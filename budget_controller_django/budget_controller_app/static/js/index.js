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
            || window.location.href === 'http://127.0.0.1:8000/add_transaction' 
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
        || window.location.href.startsWith('http://127.0.0.1:8000/filter_by_category?category=')
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
