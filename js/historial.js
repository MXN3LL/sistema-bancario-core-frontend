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
let myName = '';

const arrowDown = '<svg class="icon-sm" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>';
const arrowUp = '<svg class="icon-sm" viewBox="0 0 24 24"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';

function loadProfile() {
    return authFetch('/api/auth/me')
        .then(function (response) { return response.json(); })
        .then(function (data) { myName = data.name; });
}

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
        const sentByMe = movement.nameOrigin === myName;
        const receivedByMe = movement.nameDestiny === myName;
        let badge = `<span class="movement-badge">Transferencia</span>`;
        if (sentByMe && !receivedByMe) {
            badge = `<span class="movement-badge out">${arrowUp} -${formatCurrency(movement.amount)}</span>`;
        } else if (receivedByMe && !sentByMe) {
            badge = `<span class="movement-badge in">${arrowDown} +${formatCurrency(movement.amount)}</span>`;
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(movement.transferDate)}</td>
            <td>${movement.nameOrigin}</td>
            <td>${movement.nameDestiny}</td>
            <td>${badge}</td>
        `;
        movementsBody.appendChild(row);
    });
}

accountSelector.addEventListener('change', function () {
    loadMovements(accountSelector.value);
});

loadProfile().then(loadAccounts);