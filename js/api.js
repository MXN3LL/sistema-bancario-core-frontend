// ==========================================================================
// Cliente API — Banco Core
// Conecta con el backend Spring Boot (API_Bank_School)
// Ajusta API_BASE_URL según dónde despliegues el backend.
// ==========================================================================

const API_BASE_URL = "http://localhost:8080/api";
const TOKEN_KEY = "banco_core_token";

const Auth = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated() {
    return Boolean(this.getToken());
  },
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = "index.html";
    }
  },
  logout() {
    if (!confirm("¿Seguro que quieres cerrar sesión?")) return;
    this.clearToken();
    window.location.href = "index.html";
  },
};

/**
 * Wrapper de fetch que agrega la URL base, el header de autorización (si hay
 * token) y normaliza los errores de la API para mostrarlos en pantalla.
 */
async function apiRequest(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };

  if (auth && Auth.getToken()) {
    headers.Authorization = `Bearer ${Auth.getToken()}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error("No se pudo conectar con el servidor. Intenta de nuevo.");
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401) Auth.clearToken();
    const message = data?.message || data?.error || "Ocurrió un error. Intenta de nuevo.";
    throw new Error(message);
  }

  return data;
}

const BancoAPI = {
  register: (payload) => apiRequest("/auth/register", { method: "POST", body: payload, auth: false }),
  login: (payload) => apiRequest("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => apiRequest("/auth/me"),
  listarCuentas: () => apiRequest("/cuentas"),
  abrirCuenta: (payload) => apiRequest("/cuentas", { method: "POST", body: payload }),
  saldo: (idCuenta) => apiRequest(`/cuentas/${idCuenta}/saldo`),
  movimientos: (idCuenta) => apiRequest(`/cuentas/${idCuenta}/movimientos`),
  transferir: (payload) => apiRequest("/transacciones/transferir", { method: "POST", body: payload }),
};