const API_BASE_URL = 'http://localhost:8080';

const registerForm = document.getElementById('register-form');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const nameError = document.getElementById('name-error');
const emailError = document.getElementById('email-error');
const passwordError = document.getElementById('password-error');
const registerError = document.getElementById('register-error');
const registerSubmit = document.getElementById('register-submit');
const registerResult = document.getElementById('register-result');
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordStrength = document.getElementById('password-strength');
const strengthFill = document.getElementById('password-strength-fill');
const strengthLabel = document.getElementById('password-strength-label');

togglePasswordBtn.addEventListener('click', function () {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    togglePasswordBtn.textContent = isHidden ? 'Ocultar' : 'Mostrar';
});

function evaluatePasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { percent: 33, label: 'Débil', color: '#b23a3a' };
    if (score <= 3) return { percent: 66, label: 'Media', color: '#c78a2e' };
    return { percent: 100, label: 'Fuerte', color: '#2f7a4d' };
}

passwordInput.addEventListener('input', function () {
    passwordStrength.hidden = passwordInput.value.length === 0;
    if (passwordInput.value.length === 0) return;

    const result = evaluatePasswordStrength(passwordInput.value);
    strengthFill.style.width = result.percent + '%';
    strengthFill.style.backgroundColor = result.color;
    strengthLabel.textContent = result.label;
});

registerForm.addEventListener('submit', function (event) {
    event.preventDefault();

    registerError.textContent = '';
    registerError.classList.remove('visible');
    registerResult.textContent = '';
    registerResult.className = 'result-message';

    let isValid = true;

    if (nameInput.value.trim().length < 2) {
        nameError.textContent = 'Escribe tu nombre completo';
        isValid = false;
    } else {
        nameError.textContent = '';
    }

    if (emailInput.value.trim() === '' || !emailInput.value.includes('@')) {
        emailError.textContent = 'Ingresa un correo válido';
        isValid = false;
    } else {
        emailError.textContent = '';
    }

    if (passwordInput.value.length < 8 || passwordInput.value.length > 20) {
        passwordError.textContent = 'La contraseña debe tener entre 8 y 20 caracteres';
        isValid = false;
    } else {
        passwordError.textContent = '';
    }

    if (!isValid) {
        return;
    }

    registerSubmit.disabled = true;
    registerSubmit.textContent = 'Creando cuenta...';

    fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            password: passwordInput.value
        })
    })
        .then(function (response) {
            return response.json().then(function (data) {
                if (!response.ok) {
                    throw new Error(data.message || 'No se pudo crear la cuenta');
                }
                return data;
            });
        })
        .then(function (data) {
            registerResult.textContent = `Cuenta creada para ${data.email}. Redirigiendo a iniciar sesión...`;
            registerResult.classList.add('success');
            setTimeout(function () {
                window.location.href = 'index.html';
            }, 1800);
        })
        .catch(function (error) {
            if (error instanceof TypeError) {
                registerError.textContent = 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.';
            } else {
                registerError.textContent = error.message;
            }
            registerError.classList.add('visible');
            registerSubmit.disabled = false;
            registerSubmit.textContent = 'Crear cuenta';
        });
});