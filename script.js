/* ============ NOVATECH SERVICE PORTAL - SCRIPTS ============ */

/* ---------- Mobile navigation toggle ---------- */
(function () {
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
})();

/* ---------- Knowledge base toggles ---------- */
(function () {
  document.querySelectorAll(".kb-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var item = btn.closest(".kb-item");
      item.classList.toggle("open");
      btn.textContent = item.classList.contains("open") ? "Hide answer" : "Show answer";
    });
  });
})();

/* ---------- Fade-in on scroll ---------- */
(function () {
  var targets = document.querySelectorAll(".card, .kb-item, .team-card, .dash-card, .download-item, .steps-list li");
  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) { el.classList.add("visible"); });
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  targets.forEach(function (el) { el.classList.add("reveal"); observer.observe(el); });
})();
