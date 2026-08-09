const API_BASE_URL = 'http://localhost:8080';

const token = localStorage.getItem('authToken');
if (!token) {
    window.location.href = 'index.html';
}

const greetingEl = document.querySelector('.dashboard-header h1');
const accountsContainer = document.getElementById('accounts-container');
const totalBalanceEl = document.getElementById('total-balance');
const logoutBtn = document.getElementById('logout-btn');
const emptyState = document.getElementById('empty-state');
const openAccountBtn = document.getElementById('open-account-btn');
const initialDepositInput = document.getElementById('initial-deposit');

function formatCurrency(amount) {
    return Number(amount).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
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

function loadProfile() {
    authFetch('/api/auth/me')
        .then(function (response) { return response.json(); })
        .then(function (data) {
            greetingEl.textContent = `Hola, ${data.name}`;
        });
}

function loadAccounts() {
    authFetch('/api/cuentas')
        .then(function (response) { return response.json(); })
        .then(renderAccounts);
}

function renderAccounts(accounts) {
    accountsContainer.innerHTML = '';

    if (accounts.length === 0) {
        emptyState.hidden = false;
        totalBalanceEl.textContent = formatCurrency(0);
        return;
    }

    emptyState.hidden = true;

    accounts.forEach(function (account) {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>Cuenta ${account.accountNumber}<br><small>${account.isActive ? 'Activa' : 'Inactiva'}</small></span>
            <span>${formatCurrency(account.balance)}</span>
        `;
        accountsContainer.appendChild(li);
    });

    const totalBalance = accounts.reduce(function (sum, account) {
        return sum + account.balance;
    }, 0);

    totalBalanceEl.textContent = formatCurrency(totalBalance);
}

openAccountBtn.addEventListener('click', function () {
    const deposit = Number(initialDepositInput.value) || 0;

    openAccountBtn.disabled = true;
    openAccountBtn.textContent = 'Abriendo...';

    authFetch('/api/cuentas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialDeposit: deposit })
    })
        .then(function (response) { return response.json(); })
        .then(function () {
            openAccountBtn.disabled = false;
            openAccountBtn.textContent = 'Abrir mi primera cuenta';
            loadAccounts();
        });
});

logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('authToken');
    window.location.href = 'index.html';
});

loadProfile();
loadAccounts();