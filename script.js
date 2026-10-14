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

/* ============================================================
   INNOVATION: NOVA ASSIST - AI CHATBOT WIDGET (Task 1 SLA)
   Floating widget injected on every page. Answers common
   questions instantly, offers to log a ticket, and hands off
   to a human agent when it cannot help (triage handoff).
   ============================================================ */
(function () {
  /* ---------- Inject widget markup ---------- */
  var fab = document.createElement("button");
  fab.className = "nt-fab";
  fab.id = "ntFab";
  fab.setAttribute("aria-label", "Open Nova Assist chat");
  fab.innerHTML = "&#129302;<span class=\"nt-fab-badge\" id=\"ntBadge\">1</span>";

  var panel = document.createElement("div");
  panel.className = "nt-panel";
  panel.id = "ntPanel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Nova Assist chat");
  panel.innerHTML =
    '<div class="nt-head">' +
      '<span class="nt-head-avatar">NT</span>' +
      '<div><strong>Nova Assist</strong><span class="nt-status">Online - instant answers</span></div>' +
      '<button class="nt-close" id="ntClose" aria-label="Close chat">&times;</button>' +
    '</div>' +
    '<div class="nt-body" id="ntBody" aria-live="polite"></div>' +
    '<div class="nt-chips">' +
      '<button class="nt-chip" data-q="How do I reset my password?">Password reset</button>' +
      '<button class="nt-chip" data-q="Why is my Wi-Fi not working?">Wi-Fi help</button>' +
      '<button class="nt-chip" data-q="How do I set up VPN?">VPN setup</button>' +
      '<button class="nt-chip" data-q="How do I log a ticket?">Log a ticket</button>' +
    '</div>' +
    '<form class="nt-input" id="ntForm">' +
      '<input type="text" id="ntInput" placeholder="Ask Nova Assist..." autocomplete="off">' +
      '<button type="submit">Send</button>' +
    '</form>';

  document.body.appendChild(fab);
  document.body.appendChild(panel);

  /* ---------- State ---------- */
  var body = panel.querySelector("#ntBody");
  var form = panel.querySelector("#ntForm");
  var input = panel.querySelector("#ntInput");
  var badge = panel.querySelector("#ntBadge");
  var greeted = false;

  /* ---------- Knowledge base ---------- */
  var KB = [
    { keys: ["password", "reset"], answer: "To reset your password: open the NovaTech portal, select 'Forgot password', enter your employee ID, and follow the email link. If it does not arrive within 10 minutes, I can log a ticket for you." },
    { keys: ["wifi", "wi-fi", "internet", "network", "offline"], answer: "For Wi-Fi issues: confirm Wi-Fi is on, restart your device, then forget and reconnect to 'NovaTech-Corp'. If colleagues are offline too, it is likely a switch or access point fault, and downtime beyond 30 minutes is escalated automatically. Want me to log a network ticket?" },
    { keys: ["vpn"], answer: "To set up VPN: install the NovaTech VPN client from the software portal, sign in with your NovaTech credentials, and select the office region. Old client versions are the usual culprit when connections fail." },
    { keys: ["printer", "print"], answer: "For printer issues: check power and network cables, look for paper jams, then restart the Print Spooler on your PC (services.msc). If others cannot print either, it should be logged under Hardware." },
    { keys: ["ticket", "log", "issue", "report"], answer: "You can log a ticket in two ways: use the Submit a Ticket page on this portal, or I can take your details right here and create the ticket for you." },
    { keys: ["email", "outlook"], answer: "For email problems: first check your internet connection, then restart Outlook and verify your password still works on the portal. If the problem continues, log a ticket under Email." },
    { keys: ["slow", "performance", "freeze", "crash"], answer: "For a slow or crashing PC: restart it first, close unused applications, and check for pending updates. If it keeps happening, log a ticket so a Level 1 technician can investigate." },
    { keys: ["sla", "response", "time", "how long"], answer: "Our SLA response targets are: Level 1 within 2 hours, Level 2 within 24 hours, and Level 3 within 48 hours or more for complex cases." },
    { keys: ["escalat"], answer: "Escalation happens when an issue is unresolved after two follow-ups, or when network downtime exceeds 30 minutes. Tickets move Level 1 > Level 2 > Level 3, each with its own response target." },
    { keys: ["change", "software", "install"], answer: "To request an IT system change (like new software or a Wi-Fi upgrade), download the Change Request form from the Knowledge Base page and submit it to the service desk for approval." }
  ];
  var GREETING = "Hi! I'm Nova Assist, the NovaTech service desk assistant. Ask me about password resets, Wi-Fi, VPN, printers, or how to log a ticket.";

  function addMsg(text, who) {
    var div = document.createElement("div");
    div.className = "nt-msg " + who;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function showTyping() {
    var t = document.createElement("div");
    t.className = "nt-msg bot";
    t.innerHTML = '<span class="nt-typing"><span></span><span></span><span></span></span>';
    body.appendChild(t);
    body.scrollTop = body.scrollHeight;
    return t;
  }

  function handoff(promptText) {
    addMsg(promptText + " Type 'AGENT' and I will hand this to a human technician.", "bot");
    addMsg("Or use the Submit a Ticket page: submit-ticket.html", "bot");
  }

  function answer(q) {
    var lower = q.toLowerCase().trim();
    if (lower === "agent") {
      addMsg("Understood. I am handing this conversation to a human technician. They will follow up using the contact details on your ticket. Response target: Level 1 within 2 hours.", "bot");
      return;
    }
    if (!greeted) {
      greeted = true;
      badge.style.display = "none";
    }
    for (var i = 0; i < KB.length; i++) {
      var hit = KB[i].keys.some(function (k) { return lower.indexOf(k) !== -1; });
      if (hit) {
        addMsg(KB[i].answer, "bot");
        return;
      }
    }
    handoff("I could not find a confident answer for that.");
  }

  /* ---------- Open / close ---------- */
  function openPanel() {
    panel.classList.add("open");
    fab.style.display = "none";
    if (!greeted) { addMsg(GREETING, "bot"); }
    input.focus();
  }
  function closePanel() {
    panel.classList.remove("open");
    fab.style.display = "grid";
  }
  fab.addEventListener("click", openPanel);
  panel.querySelector("#ntClose").addEventListener("click", closePanel);

  /* ---------- Sending ---------- */
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = input.value;
    if (!q.trim()) return;
    addMsg(q, "user");
    input.value = "";
    var t = showTyping();
    setTimeout(function () {
      t.remove();
      answer(q);
    }, 700);
  });

  panel.querySelectorAll(".nt-chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      addMsg(chip.getAttribute("data-q"), "user");
      var t = showTyping();
      setTimeout(function () {
        t.remove();
        answer(chip.getAttribute("data-q"));
      }, 700);
    });
  });

  /* ---------- Esc key closes ---------- */
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && panel.classList.contains("open")) closePanel();
  });
})();
