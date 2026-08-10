// ==========================================================================
// Notificaciones — campanita compartida en dashboard, historial y transferencias
// ==========================================================================

const NOTIF_KEY = "banco_core_notifications";
const MAX_NOTIFICATIONS = 20;

function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(NOTIF_KEY)) || [];
  } catch {
    return [];
  }
}

function saveNotifications(list) {
  localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, MAX_NOTIFICATIONS)));
}

/** Agrega una notificación nueva y refresca la campanita si está en pantalla */
function addNotification(message) {
  const list = getNotifications();
  list.unshift({ message, time: new Date().toISOString(), read: false });
  saveNotifications(list);
  renderNotifications();
}

function formatNotifTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderNotifications() {
  const badge = document.getElementById("notif-badge");
  const list = document.getElementById("notif-list");
  if (!badge || !list) return;

  const notifications = getNotifications();
  const unread = notifications.filter((n) => !n.read).length;

  badge.textContent = unread > 9 ? "9+" : unread;
  badge.classList.toggle("hidden", unread === 0);

  if (!notifications.length) {
    list.innerHTML = '<div class="notif-empty">No tienes notificaciones todavía.</div>';
    return;
  }

  list.innerHTML = notifications
    .map(
      (n) => `
      <div class="notif-item">
        <span>${n.message}</span>
        <span class="notif-time">${formatNotifTime(n.time)}</span>
      </div>`
    )
    .join("");
}

function markAllRead() {
  const list = getNotifications().map((n) => ({ ...n, read: true }));
  saveNotifications(list);
  renderNotifications();
}

function initNotificationBell() {
  const bell = document.getElementById("notif-bell");
  const panel = document.getElementById("notif-panel");
  const clearBtn = document.getElementById("notif-clear");
  if (!bell || !panel) return;

  renderNotifications();

  bell.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = panel.classList.toggle("open");
    if (isOpen) markAllRead();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== bell) {
      panel.classList.remove("open");
    }
  });

  clearBtn?.addEventListener("click", () => {
    saveNotifications([]);
    renderNotifications();
  });
}

document.addEventListener("DOMContentLoaded", initNotificationBell);