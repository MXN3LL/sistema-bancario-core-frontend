document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registro-form");
  const authError = document.getElementById("auth-error");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("registro-submit");

  function showFieldError(input, message) {
    input.classList.toggle("invalid", Boolean(message));
    const errorEl = document.getElementById(`${input.id}-error`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function validateName() {
    if (!nameInput.value.trim()) {
      showFieldError(nameInput, "Ingresa tu nombre completo");
      return false;
    }
    showFieldError(nameInput, "");
    return true;
  }

  function validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      showFieldError(emailInput, "Ingresa tu correo electrónico");
      return false;
    }
    if (!emailPattern.test(emailInput.value.trim())) {
      showFieldError(emailInput, "Ese correo no parece válido (ej: nombre@dominio.com)");
      return false;
    }
    showFieldError(emailInput, "");
    return true;
  }

  function validatePassword() {
    if (!passwordInput.value || passwordInput.value.length < 8) {
      showFieldError(passwordInput, "La contraseña debe tener al menos 8 caracteres");
      return false;
    }
    showFieldError(passwordInput, "");
    return true;
  }

  function validate() {
    const nameOk = validateName();
    const emailOk = validateEmail();
    const passwordOk = validatePassword();
    return nameOk && emailOk && passwordOk;
  }

  // Validar mientras el usuario sale de cada campo (blur), y limpiar el error
  // apenas corrige mientras escribe (input) — sin regañarlo en cada tecla.
  nameInput.addEventListener("blur", validateName);
  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);

  nameInput.addEventListener("input", () => {
    if (nameInput.classList.contains("invalid")) validateName();
  });
  emailInput.addEventListener("input", () => {
    if (emailInput.classList.contains("invalid")) validateEmail();
  });
  passwordInput.addEventListener("input", () => {
    if (passwordInput.classList.contains("invalid")) validatePassword();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    authError.classList.remove("visible");

    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Creando cuenta...";

    try {
      await BancoAPI.register({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });

      window.location.href = "index.html?registrado=1";
    } catch (error) {
      authError.textContent = error.message;
      authError.classList.add("visible");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Crear cuenta";
    }
  });
});