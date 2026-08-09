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

const transferForm = document.getElementById('transfer-form');
const originSelect = document.getElementById('origin-account');
const destinationInput = document.getElementById('destination-account');
const conceptInput = document.getElementById('concept');
const amountInput = document.getElementById('amount');

const destinationError = document.getElementById('destination-account-error');
const conceptError = document.getElementById('concept-error');
const amountError = document.getElementById('amount-error');
const resultMessage = document.getElementById('result-message');

let myAccounts = [];

function loadAccounts() {
    authFetch('/api/cuentas')
        .then(function (response) { return response.json(); })
        .then(function (accounts) {
            myAccounts = accounts;
            originSelect.innerHTML = '';

            if (accounts.length === 0) {
                const option = document.createElement('option');
                option.textContent = 'No tienes cuentas todavía';
                originSelect.appendChild(option);
                return;
            }

            accounts.forEach(function (account) {
                const option = document.createElement('option');
                option.value = account.idAccount;
                option.textContent = `Cuenta ${account.accountNumber} (${formatCurrency(account.balance)})`;
                originSelect.appendChild(option);
            });
        });
}

transferForm.addEventListener('submit', function (event) {
    event.preventDefault();

    resultMessage.textContent = '';
    resultMessage.className = 'result-message';

    let isValid = true;

    if (destinationInput.value.trim() === '') {
        destinationError.textContent = 'La cuenta destino es obligatoria';
        isValid = false;
    } else {
        destinationError.textContent = '';
    }

    if (conceptInput.value.trim() === '') {
        conceptError.textContent = 'El concepto es obligatorio';
        isValid = false;
    } else {
        conceptError.textContent = '';
    }

    const amount = Number(amountInput.value);

    if (!amountInput.value || amount <= 0) {
        amountError.textContent = 'El monto debe ser mayor a cero';
        isValid = false;
    } else {
        amountError.textContent = '';
    }

    if (!isValid || myAccounts.length === 0) {
        return;
    }

    authFetch('/api/transacciones/transferir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            idAccountOrigin: Number(originSelect.value),
            numberAccountDestiny: destinationInput.value.trim(),
            amount: amount
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(data.message || 'No se pudo completar la transferencia');
                }
                return data;
            });
        })
        .then(function (data) {
            resultMessage.textContent = `Transferencia exitosa por ${formatCurrency(data.amount)} a ${data.nameDestiny}`;
            resultMessage.classList.add('success');
            transferForm.reset();
            loadAccounts();
        })
        .catch(function (error) {
            resultMessage.textContent = error.message;
            resultMessage.classList.add('error');
        });
});

loadAccounts();