const API_BASE_URL = 'http://localhost:8080';

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const authError = document.getElementById('auth-error');
const loginSubmit = document.getElementById('login-submit');
const rememberCheckbox = document.getElementById('remember-email');
const togglePasswordBtn = document.getElementById('toggle-password');

const savedEmail = localStorage.getItem('rememberedEmail');
if (savedEmail) {
    emailInput.value = savedEmail;
    rememberCheckbox.checked = true;
}

togglePasswordBtn.addEventListener('click', function () {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.textContent = isHidden ? 'Ocultar' : 'Mostrar';
});

loginForm.addEventListener('submit', function (event) {
    event.preventDefault();

    authError.textContent = '';
    authError.classList.remove('visible');

    let isValid = true;

    if (emailInput.value.trim() === '' || !emailInput.value.includes('@')) {
        emailError.textContent = 'Ingresa un correo válido';
        isValid = false;
    } else {
        emailError.textContent = '';
    }

    if (passwordInput.value.trim() === '') {
        passwordError.textContent = 'La contraseña es obligatoria';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }

    if (!isValid) {
        return;
    }

    if (rememberCheckbox.checked) {
        localStorage.setItem('rememberedEmail', emailInput.value.trim());
    } else {
        localStorage.removeItem('rememberedEmail');
    }

    loginSubmit.disabled = true;
    loginSubmit.textContent = 'Verificando...';

    fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: emailInput.value.trim(),
            password: passwordInput.value
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(data.message || 'Credenciales incorrectas');
                }
                return data;
            });
        })
        .then(function (data) {
            localStorage.setItem('authToken', data.token);
            window.location.href = 'dashboard.html';
        })
        .catch(function (error) {
            if (error instanceof TypeError) {
                authError.textContent = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            } else {
                authError.textContent = error.message;
            }
            authError.classList.add('visible');
            loginSubmit.disabled = false;
            loginSubmit.textContent = 'Entrar';
        });
});