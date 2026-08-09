const recoverForm = document.getElementById('recover-form');
const recoverEmailInput = document.getElementById('recover-email');
const recoverEmailError = document.getElementById('recover-email-error');
const recoverResult = document.getElementById('recover-result');
const submitBtn = recoverForm.querySelector('button[type="submit"]');

recoverForm.addEventListener('submit', function (event) {
    event.preventDefault();

    recoverResult.textContent = '';
    recoverResult.className = 'result-message';

    if (recoverEmailInput.value.trim() === '' || !recoverEmailInput.value.includes('@')) {
        recoverEmailError.textContent = 'Ingresa un correo válido';
        return;
    } else {
        recoverEmailError.textContent = '';
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando...';

    // Simulación — cuando el backend tenga este endpoint, aquí va el fetch real
    setTimeout(function () {
        recoverResult.textContent = 'Si el correo existe en el sistema, vas a recibir instrucciones en unos minutos.';
        recoverResult.classList.add('success');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar instrucciones';
        recoverForm.reset();
    }, 1200);
});