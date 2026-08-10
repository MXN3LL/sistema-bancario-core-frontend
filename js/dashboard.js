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

function animateBalance(target) {
    const duration = 700;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        totalBalanceEl.textContent = formatCurrency(target * eased);
        if (progress < 1) {
            requestAnimationFrame(step);
        }
    }

    requestAnimationFrame(step);
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
        animateBalance(0);
        return;
    }

    emptyState.hidden = true;

    accounts.forEach(function (account, index) {
        const li = document.createElement('li');
        li.className = 'account-card';
        li.style.animationDelay = (index * 0.08) + 's';
        const last4 = account.accountNumber.slice(-4);
        li.innerHTML = `
            <div class="account-card-top">
                <span class="account-card-type">Cuenta ${account.accountNumber}</span>
                <svg class="chip-icon" viewBox="0 0 24 18"><rect x="0.5" y="0.5" width="23" height="17" rx="3"/><line x1="0.5" y1="6" x2="23.5" y2="6"/><line x1="9" y1="0.5" x2="9" y2="17.5"/></svg>
            </div>
            <div class="account-card-number">•••• ${last4}</div>
            <div class="account-card-bottom">
                <span class="account-card-status">${account.isActive ? 'Activa' : 'Inactiva'}</span>
                <span class="account-card-balance">${formatCurrency(account.balance)}</span>
            </div>
        `;
        accountsContainer.appendChild(li);
    });

    const totalBalance = accounts.reduce(function (sum, account) {
        return sum + account.balance;
    }, 0);

    animateBalance(totalBalance);
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