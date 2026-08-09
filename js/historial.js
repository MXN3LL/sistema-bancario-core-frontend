const API_BASE_URL = 'http://localhost:8080';

const token = localStorage.getItem('authToken');
if (!token) {
    window.location.href = 'index.html';
}

function authFetch(path, options) {
    options = options || {};
    options.headers = Object.assign({ 'Authorization': 'Bearer ' + token }, options.headers || {});
    return fetch(`${API_BASE_URL}${path}`, options).then(function (response) {
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            window.location.href = 'index.html';
            return Promise.reject(new Error('Sesión inválida'));
        }
        return response;
    });
}

function formatCurrency(amount) {
    return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const accountSelector = document.getElementById('account-selector');
const movementsBody = document.getElementById('movements-body');

function loadAccounts() {
    authFetch('/api/cuentas')
        .then(function (response) { return response.json(); })
        .then(function (accounts) {
            accountSelector.innerHTML = '';

            if (accounts.length === 0) {
                const option = document.createElement('option');
                option.textContent = 'No tienes cuentas todavía';
                accountSelector.appendChild(option);
                movementsBody.innerHTML = '<tr><td colspan="4">No tienes cuentas todavía.</td></tr>';
                return;
            }

            accounts.forEach(function (account) {
                const option = document.createElement('option');
                option.value = account.idAccount;
                option.textContent = `Cuenta ${account.accountNumber}`;
                accountSelector.appendChild(option);
            });

            loadMovements(accountSelector.value);
        });
}

function loadMovements(accountId) {
    authFetch(`/api/cuentas/${accountId}/movimientos`)
        .then(function (response) { return response.json(); })
        .then(renderMovements);
}

function renderMovements(movements) {
    movementsBody.innerHTML = '';

    if (movements.length === 0) {
        movementsBody.innerHTML = '<tr><td colspan="4">Todavía no hay movimientos en esta cuenta.</td></tr>';
        return;
    }

    movements.sort(function (a, b) {
        return new Date(b.transferDate) - new Date(a.transferDate);
    });

    movements.forEach(function (movement) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(movement.transferDate)}</td>
            <td>${movement.nameOrigin}</td>
            <td>${movement.nameDestiny}</td>
            <td>${formatCurrency(movement.amount)}</td>
        `;
        movementsBody.appendChild(row);
    });
}

accountSelector.addEventListener('change', function () {
    loadMovements(accountSelector.value);
});

loadAccounts();