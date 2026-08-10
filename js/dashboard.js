document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireAuth();

  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    Auth.logout();
  });

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(value || 0);

  const formatDate = (value) => {
    if (!value) return "";
    return new Date(value).toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
  };

  let currentAccountId = null;
  let currentAccountNumber = null;

  async function loadDashboardData() {
    try {
      const user = await BancoAPI.me();
      document.getElementById("user-name").textContent = user.name || user.email || "Cliente";
      document.getElementById("user-initial").textContent = (user.name || user.email || "?")
        .trim()
        .charAt(0)
        .toUpperCase();

      const cuentas = await BancoAPI.listarCuentas();
      document.getElementById("stat-cuentas").textContent = cuentas.length;

      const openAccountBtn = document.getElementById("open-account-btn");
      if (cuentas.length >= 1) {
        openAccountBtn.disabled = true;
        openAccountBtn.textContent = "Ya tienes una cuenta";
        document.getElementById("open-account-card").style.display = "none";
      } else {
        openAccountBtn.disabled = false;
        openAccountBtn.textContent = "+ Abrir cuenta";
      }

      if (cuentas.length) {
        const principal = cuentas[0];
        currentAccountId = principal.idAccount;
        currentAccountNumber = principal.accountNumber || String(principal.idAccount);
        document.getElementById("account-number-text").textContent = `Cuenta: ${currentAccountNumber}`;
        document.getElementById("copy-account-btn").style.display = "inline-flex";
        document.getElementById("balance-amount").textContent = formatMoney(principal.balance);

        const movimientos = await BancoAPI.movimientos(principal.idAccount);
        const lista = document.getElementById("recent-movements");

        if (!movimientos.length) {
          lista.innerHTML = '<div class="empty-state">Aún no tienes movimientos. Realiza tu primera transferencia.</div>';
        } else {
          lista.innerHTML = "";
          const recientes = movimientos.slice(0, 5);
          const entradas = recientes.filter((m) => m.type === "IN" || m.tipo === "entrada");
          const salidas = recientes.filter((m) => m.type === "OUT" || m.tipo === "salida");

          if (entradas[0]) document.getElementById("stat-ingreso").textContent = formatMoney(entradas[0].amount);
          else document.getElementById("stat-ingreso").textContent = "—";

          if (salidas[0]) document.getElementById("stat-egreso").textContent = formatMoney(salidas[0].amount);
          else document.getElementById("stat-egreso").textContent = "—";

          recientes.forEach((mov) => {
            const esEntrada = mov.type === "IN" || mov.tipo === "entrada";
            const item = document.createElement("div");
            item.className = "movement-item glass-card";
            item.innerHTML = `
              <div class="movement-info">
                <span class="movement-icon ${esEntrada ? "in" : "out"}">${esEntrada ? "↓" : "↑"}</span>
                <div>
                  <div class="movement-title">${mov.description || (esEntrada ? "Transferencia recibida" : "Transferencia enviada")}</div>
                  <div class="movement-date">${formatDate(mov.date || mov.fecha)}</div>
                </div>
              </div>
              <div class="movement-amount ${esEntrada ? "in" : "out"}">${esEntrada ? "+" : "-"}${formatMoney(mov.amount)}</div>
            `;
            lista.appendChild(item);
          });
        }
      } else {
        document.getElementById("account-number-text").textContent = "Cuenta: —";
        document.getElementById("copy-account-btn").style.display = "none";
        document.getElementById("balance-amount").textContent = formatMoney(0);
        document.getElementById("recent-movements").innerHTML =
          '<div class="empty-state">Aún no tienes una cuenta abierta. Usa el botón "+ Abrir cuenta" arriba.</div>';
      }
    } catch (error) {
      document.getElementById("recent-movements").innerHTML = `<div class="empty-state">${error.message}</div>`;
    }
  }

  await loadDashboardData();

  // ---- Copiar número de cuenta ----
  const copyAccountBtn = document.getElementById("copy-account-btn");
  copyAccountBtn.addEventListener("click", async () => {
    if (!currentAccountNumber) return;
    try {
      await navigator.clipboard.writeText(currentAccountNumber);
      const original = copyAccountBtn.textContent;
      copyAccountBtn.textContent = "¡Copiado!";
      setTimeout(() => (copyAccountBtn.textContent = original), 1500);
    } catch {
      alert(`Tu número de cuenta es: ${currentAccountNumber}`);
    }
  });

  // ---- Abrir cuenta ----
  const openAccountBtn = document.getElementById("open-account-btn");
  const openAccountCard = document.getElementById("open-account-card");
  const openAccountForm = document.getElementById("open-account-form");
  const openAccountCancel = document.getElementById("open-account-cancel");
  const openAccountError = document.getElementById("open-account-error");
  const openAccountSuccess = document.getElementById("open-account-success");
  const depositInput = document.getElementById("initial-deposit");
  const openAccountSubmit = document.getElementById("open-account-submit");

  openAccountBtn.addEventListener("click", () => {
    if (openAccountBtn.disabled) return;
    const isHidden = openAccountCard.style.display === "none";
    openAccountCard.style.display = isHidden ? "block" : "none";
    openAccountBtn.textContent = isHidden ? "Ocultar" : "+ Abrir cuenta";
  });

  openAccountCancel.addEventListener("click", () => {
    openAccountCard.style.display = "none";
    openAccountBtn.textContent = "+ Abrir cuenta";
    openAccountForm.reset();
  });

  openAccountForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    openAccountError.classList.remove("visible");
    openAccountSuccess.classList.remove("visible");

    const deposit = parseFloat(depositInput.value);
    const depositErrorEl = document.getElementById("initial-deposit-error");

    if (isNaN(deposit) || deposit < 0) {
      depositInput.classList.add("invalid");
      depositErrorEl.textContent = "Ingresa un monto válido (puede ser 0)";
      return;
    }
    if (deposit > 200) {
      depositInput.classList.add("invalid");
      depositErrorEl.textContent = "El depósito inicial no puede superar $200";
      return;
    }
    depositInput.classList.remove("invalid");
    depositErrorEl.textContent = "";

    openAccountSubmit.disabled = true;
    openAccountSubmit.textContent = "Creando...";

    try {
      await BancoAPI.abrirCuenta({ initialDeposit: deposit });
      openAccountSuccess.classList.add("visible");
      addNotification("Cuenta creada con éxito ✅");
      openAccountForm.reset();
      await loadDashboardData();
    } catch (error) {
      openAccountError.textContent = error.message;
      openAccountError.classList.add("visible");
    } finally {
      openAccountSubmit.disabled = false;
      openAccountSubmit.textContent = "Crear cuenta";
    }
  });
});