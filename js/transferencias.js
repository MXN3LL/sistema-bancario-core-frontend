document.addEventListener("DOMContentLoaded", async () => {
  Auth.requireAuth();

  document.getElementById("logout-link").addEventListener("click", (e) => {
    e.preventDefault();
    Auth.logout();
  });

  const form = document.getElementById("transfer-form");
  const origenSelect = document.getElementById("origen");
  const destinoInput = document.getElementById("destino");
  const montoInput = document.getElementById("monto");
  const submitBtn = document.getElementById("transfer-submit");
  const errorBanner = document.getElementById("transfer-error");
  const successBanner = document.getElementById("transfer-success");

  const formatMoney = (value) =>
    new Intl.NumberFormat("es-MX", { style: "currency", currency: "USD" }).format(value || 0);

  function updateSummary() {
    const selected = origenSelect.options[origenSelect.selectedIndex];
    document.getElementById("summary-origen").textContent = selected?.dataset.label || "—";
    document.getElementById("summary-destino").textContent = destinoInput.value.trim() || "—";
    document.getElementById("summary-monto").textContent = formatMoney(parseFloat(montoInput.value) || 0);
  }

  [origenSelect, destinoInput, montoInput].forEach((el) => el.addEventListener("input", updateSummary));

  try {
    const cuentas = await BancoAPI.listarCuentas();
    if (!cuentas.length) {
      origenSelect.innerHTML = '<option value="">No tienes cuentas disponibles</option>';
    } else {
      origenSelect.innerHTML = cuentas
        .map(
          (c) =>
            `<option value="${c.idAccount}" data-label="${c.accountNumber || c.idAccount}">${c.accountNumber || `Cuenta ${c.idAccount}`}</option>`
        )
        .join("");
      updateSummary();
    }
  } catch (error) {
    origenSelect.innerHTML = `<option value="">${error.message}</option>`;
  }

  function showFieldError(input, message) {
    input.classList.toggle("invalid", Boolean(message));
    const errorEl = document.getElementById(`${input.id}-error`);
    if (errorEl) errorEl.textContent = message || "";
  }

  function validate() {
    let valid = true;
    if (!origenSelect.value) {
      showFieldError(origenSelect, "Selecciona una cuenta de origen");
      valid = false;
    } else {
      showFieldError(origenSelect, "");
    }
    if (!destinoInput.value.trim()) {
      showFieldError(destinoInput, "Ingresa la cuenta destino");
      valid = false;
    } else {
      showFieldError(destinoInput, "");
    }
    const monto = parseFloat(montoInput.value);
    if (!monto || monto <= 0) {
      showFieldError(montoInput, "Ingresa un monto válido");
      valid = false;
    } else {
      showFieldError(montoInput, "");
    }
    return valid;
  }

  const downloadReceiptBtn = document.getElementById("download-receipt-btn");
  let lastTransfer = null;

  function descargarComprobante() {
    if (!lastTransfer) return;
    const contenido = `BANCO CORE — Comprobante de transferencia
=========================================
Fecha:            ${new Date().toLocaleString("es-MX")}
Cuenta origen:     ${lastTransfer.origenLabel}
Cuenta destino:    ${lastTransfer.destino}
Monto:             ${formatMoney(lastTransfer.monto)}
=========================================
Este comprobante fue generado desde tu banca en línea.`;

    const blob = new Blob([contenido], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `comprobante-transferencia-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  downloadReceiptBtn.addEventListener("click", descargarComprobante);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBanner.classList.remove("visible");
    successBanner.classList.remove("visible");

    if (!validate()) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Transfiriendo...";

    try {
      await BancoAPI.transferir({
        idAccountOrigin: Number(origenSelect.value),
        numberAccountDestiny: destinoInput.value.trim(),
        amount: parseFloat(montoInput.value),
      });

      lastTransfer = {
        origenLabel: origenSelect.options[origenSelect.selectedIndex]?.dataset.label || origenSelect.value,
        destino: destinoInput.value.trim(),
        monto: parseFloat(montoInput.value),
      };

      successBanner.classList.add("visible");
      addNotification(`Transferencia enviada: ${formatMoney(parseFloat(montoInput.value))} a ${destinoInput.value.trim()} 💸`);
      form.reset();
      updateSummary();
    } catch (error) {
      errorBanner.textContent = error.message;
      errorBanner.classList.add("visible");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Transferir ahora";
    }
  });
});