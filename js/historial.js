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
    return new Date(value).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const lista = document.getElementById("movement-list");
  let todosLosMovimientos = [];

  function esMovimientoEntrada(mov) {
    return mov.type === "IN" || mov.tipo === "entrada";
  }

  function renderMovimientos(movimientos) {
    if (!movimientos.length) {
      lista.innerHTML = '<div class="empty-state">No hay movimientos que coincidan con estos filtros.</div>';
      return;
    }

    lista.innerHTML = "";
    movimientos.forEach((mov, i) => {
      const esEntrada = esMovimientoEntrada(mov);
      const item = document.createElement("div");
      item.className = "movement-item glass-card reveal";
      item.style.setProperty("--stagger-index", i % 8);
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

    initScrollReveal();
  }

  function aplicarFiltros() {
    const desde = document.getElementById("filter-date-from").value;
    const hasta = document.getElementById("filter-date-to").value;
    const montoMin = parseFloat(document.getElementById("filter-amount-min").value);
    const montoMax = parseFloat(document.getElementById("filter-amount-max").value);
    const tipo = document.getElementById("filter-type").value;

    const filtrados = todosLosMovimientos.filter((mov) => {
      const fechaMov = new Date(mov.date || mov.fecha);

      if (desde && fechaMov < new Date(desde)) return false;
      if (hasta) {
        const hastaFin = new Date(hasta);
        hastaFin.setHours(23, 59, 59, 999);
        if (fechaMov > hastaFin) return false;
      }
      if (!isNaN(montoMin) && mov.amount < montoMin) return false;
      if (!isNaN(montoMax) && mov.amount > montoMax) return false;

      const esEntrada = esMovimientoEntrada(mov);
      if (tipo === "in" && !esEntrada) return false;
      if (tipo === "out" && esEntrada) return false;

      return true;
    });

    renderMovimientos(filtrados);
  }

  try {
    const cuentas = await BancoAPI.listarCuentas();
    if (!cuentas.length) {
      lista.innerHTML = '<div class="empty-state">Aún no tienes una cuenta abierta.</div>';
      return;
    }

    todosLosMovimientos = await BancoAPI.movimientos(cuentas[0].idAccount);

    if (!todosLosMovimientos.length) {
      lista.innerHTML = '<div class="empty-state">Aún no tienes movimientos registrados.</div>';
      return;
    }

    renderMovimientos(todosLosMovimientos);

    ["filter-date-from", "filter-date-to", "filter-amount-min", "filter-amount-max", "filter-type"].forEach((id) => {
      document.getElementById(id).addEventListener("input", aplicarFiltros);
    });

    document.getElementById("clear-filters-btn").addEventListener("click", () => {
      document.getElementById("filters-form").reset();
      renderMovimientos(todosLosMovimientos);
    });
  } catch (error) {
    lista.innerHTML = `<div class="empty-state">${error.message}</div>`;
  }
});