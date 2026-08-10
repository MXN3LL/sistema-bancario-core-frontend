// ==========================================================================
// Animaciones compartidas: fondo aurora, scroll reveal, toggle de contraseña
// ==========================================================================

/** Inserta el fondo animado "aurora" y el overlay de textura */
function mountAuroraBackground() {
  if (document.querySelector(".aurora-bg")) return;

  const aurora = document.createElement("div");
  aurora.className = "aurora-bg";
  aurora.setAttribute("aria-hidden", "true");
  const blob = document.createElement("div");
  blob.className = "blob";
  aurora.appendChild(blob);

  const grain = document.createElement("div");
  grain.className = "grain-overlay";
  grain.setAttribute("aria-hidden", "true");

  document.body.prepend(grain);
  document.body.prepend(aurora);
}

/** Activa animaciones de entrada al hacer scroll para todo [data-reveal] */
function initScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
  );

  items.forEach((el, i) => {
    el.style.setProperty("--stagger-index", i % 8);
    el.style.transitionDelay = `${(i % 8) * 70}ms`;
    observer.observe(el);
  });
}

/** Habilita el botón "Mostrar/Ocultar" en campos de contraseña */
function initPasswordToggles() {
  document.querySelectorAll(".toggle-password").forEach((btn) => {
    btn.addEventListener("click", () => {
      const wrapper = btn.closest(".password-wrapper");
      const input = wrapper?.querySelector("input");
      if (!input) return;
      const isHidden = input.type === "password";
      input.type = isHidden ? "text" : "password";
      btn.textContent = isHidden ? "Ocultar" : "Mostrar";
    });
  });
}

/** Resalta el link de navegación activo según la página actual */
function markActiveNavLink() {
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".app-nav a").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) link.classList.add("active");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  mountAuroraBackground();
  initScrollReveal();
  initPasswordToggles();
  markActiveNavLink();
});