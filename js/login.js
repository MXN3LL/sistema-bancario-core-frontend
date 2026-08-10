document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  const authError = document.getElementById("auth-error");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("login-submit");
  const rememberEmail = document.getElementById("remember-email");

  const savedEmail = localStorage.getItem("banco_core_remembered_email");
  if (savedEmail) {
    emailInput.value = savedEmail;
    rememberEmail.checked = true;
  }

  function showFieldError(input, message) {
    input.classList.toggle("invalid", Boolean(message));
    const errorEl = document.getElementById(`${input.id}-error`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function validateEmail() {
    if (!emailInput.value.trim()) {
      showFieldError(emailInput, "Ingresa tu correo electrónico");
      return false;
    }
    showFieldError(emailInput, "");
    return true;
  }

  function validatePassword() {
    if (!passwordInput.value) {
      showFieldError(passwordInput, "Ingresa tu contraseña");
      return false;
    }
    showFieldError(passwordInput, "");
    return true;
  }

  function validate() {
    const emailOk = validateEmail();
    const passwordOk = validatePassword();
    return emailOk && passwordOk;
  }

  emailInput.addEventListener("blur", validateEmail);
  passwordInput.addEventListener("blur", validatePassword);
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
    submitBtn.textContent = "Entrando...";

    try {
      const data = await BancoAPI.login({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      });

      Auth.setToken(data.token);

      if (rememberEmail.checked) {
        localStorage.setItem("banco_core_remembered_email", emailInput.value.trim());
      } else {
        localStorage.removeItem("banco_core_remembered_email");
      }

      window.location.href = "dashboard.html";
    } catch (error) {
      authError.textContent = error.message;
      authError.classList.add("visible");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Entrar";
    }
  });
});