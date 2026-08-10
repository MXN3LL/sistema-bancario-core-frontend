document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("recuperar-form");
  const authError = document.getElementById("auth-error");
  const successBanner = document.getElementById("success-banner");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("recuperar-submit");

  // Nota: el backend (API_Bank_School) todavía no expone un endpoint de
  // recuperación de contraseña. Este formulario valida y confirma en
  // pantalla; conecta aquí la llamada real cuando el endpoint exista.
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    authError.classList.remove("visible");
    successBanner.classList.remove("visible");

    const errorEl = document.getElementById("email-error");
    if (!emailInput.value.trim()) {
      emailInput.classList.add("invalid");
      errorEl.textContent = "Ingresa tu correo electrónico";
      return;
    }
    emailInput.classList.remove("invalid");
    errorEl.textContent = "";

    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    setTimeout(() => {
      successBanner.classList.add("visible");
      submitBtn.disabled = false;
      submitBtn.textContent = "Enviar instrucciones";
      form.reset();
    }, 700);
  });
});