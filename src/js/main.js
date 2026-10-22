/* Основной скрипт сайта: мобильное меню, маска телефона, формы → Web3Forms.
   Формы нативные — обычный submit, без тильдовских перехватов. */
(function () {
  "use strict";

  // Включаем reveal-анимации только когда работает JS
  document.documentElement.classList.add("js");

  /* ─── Мобильное меню (бургер) ─── */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        nav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ─── Эффект печати в hero ─── */
  var typeEl = document.querySelector("[data-type]");
  if (typeEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var words = (typeEl.getAttribute("data-words") || "").split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (words.length) {
      var wi = 0, ci = words[0].length, deleting = false;
      var tick = function () {
        var word = words[wi];
        if (!deleting) {
          ci++;
          if (ci >= word.length) { ci = word.length; deleting = true; setTimeout(tick, 1800); typeEl.textContent = word; return; }
        } else {
          ci--;
          if (ci <= 0) { ci = 0; deleting = false; wi = (wi + 1) % words.length; }
        }
        typeEl.textContent = words[wi].slice(0, ci);
        setTimeout(tick, deleting ? 55 : 120);
      };
      setTimeout(tick, 1800);
    }
  }

  /* ─── Scroll-reveal + счётчики цифр ─── */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var dur = 1100, start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString("ru-RU");
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString("ru-RU");
    }
    requestAnimationFrame(step);
  }

  var revealEls = [].slice.call(document.querySelectorAll("[data-reveal]"));
  if (!("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  } else {
    // стаггер внутри групп
    revealEls.forEach(function (el) {
      var group = el.closest("[data-reveal-group]");
      if (group) {
        var sibs = [].slice.call(group.querySelectorAll("[data-reveal]"));
        el.style.setProperty("--reveal-delay", (sibs.indexOf(el) * 0.08) + "s");
      }
    });
    function reveal(el) {
      if (el.classList.contains("is-in")) return;
      el.classList.add("is-in");
      el.querySelectorAll("[data-count]").forEach(animateCount);
      if (el.hasAttribute("data-count")) animateCount(el);
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        reveal(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });

    // Сразу показываем то, что уже в зоне видимости (не ждём асинхронный IO)
    requestAnimationFrame(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      revealEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) reveal(el);
      });
    });

    // Страховка: если ничего не показалось (скрытая вкладка и т.п.) — показать всё
    setTimeout(function () {
      if (!revealEls.some(function (el) { return el.classList.contains("is-in"); })) {
        revealEls.forEach(reveal);
      }
    }, 2000);
  }

  /* ─── Вкладки (секция «Проблема») ─── */
  document.querySelectorAll("[data-tabs]").forEach(function (root) {
    var btns = root.querySelectorAll(".tabs__btn");
    var panels = root.querySelectorAll(".tabs__panel");
    root.querySelector(".tabs__nav").addEventListener("click", function (e) {
      var btn = e.target.closest(".tabs__btn");
      if (!btn) return;
      var id = btn.getAttribute("data-tab");
      btns.forEach(function (b) { b.classList.toggle("is-active", b === btn); });
      panels.forEach(function (p) {
        p.classList.toggle("is-active", p.getAttribute("data-panel") === id);
      });
    });
  });

  /* ─── Маска телефона: +7 (999) 999-99-99 ─── */
  function formatPhone(value) {
    var d = value.replace(/\D/g, "");
    if (!d) return "";
    // нормализуем ведущую 8 или 7 к коду 7
    if (d[0] === "8") d = "7" + d.slice(1);
    if (d[0] !== "7") d = "7" + d;
    d = d.slice(0, 11);
    var r = "+7";
    if (d.length > 1) r += " (" + d.slice(1, 4);
    if (d.length >= 4) r += ") " + d.slice(4, 7);
    if (d.length >= 7) r += "-" + d.slice(7, 9);
    if (d.length >= 9) r += "-" + d.slice(9, 11);
    return r;
  }
  document.querySelectorAll('input[type="tel"], input[name="Телефон"]').forEach(function (inp) {
    inp.addEventListener("input", function () {
      var pos = inp.selectionStart === inp.value.length;
      inp.value = formatPhone(inp.value);
      if (pos) inp.setSelectionRange(inp.value.length, inp.value.length);
    });
    inp.addEventListener("focus", function () {
      if (!inp.value) inp.value = "+7 ";
    });
    inp.addEventListener("blur", function () {
      if (inp.value === "+7 " || inp.value === "+7") inp.value = "";
    });
  });

  /* ─── Формы → Web3Forms ─── */
  var ENDPOINT = "https://api.web3forms.com/submit";
  var CFG = window.SITE_FORM || {};
  var SUBJECTS = {
    calc: "Заявка на расчёт стоимости сайта",
    audit: "Заявка на бесплатный аудит сайта",
    lead: "Новая заявка с сайта"
  };

  function setStatus(form, type, text) {
    var box = form.querySelector(".form-status");
    if (!box) {
      box = document.createElement("div");
      box.className = "form-status";
      form.appendChild(box);
    }
    box.setAttribute("data-type", type);
    box.textContent = text;
  }

  document.querySelectorAll(".lead-form").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (form.checkValidity && !form.checkValidity()) {
        if (form.reportValidity) form.reportValidity();
        return;
      }

      var btn = form.querySelector('[type="submit"]');
      var btnText = btn ? btn.textContent : "";
      if (btn) {
        btn.disabled = true;
        btn.textContent = "Отправляю…";
      }

      // Собираем данные в объект (JSON с UTF-8 — кириллические подписи полей
      // приходят корректно, в отличие от multipart/form-data)
      var data = {};
      var lines = [];
      new FormData(form).forEach(function (val, key) {
        if (key === "botcheck" || key === "Согласие") return;
        var v = String(val).trim();
        if (!v) return;
        data[key] = v;
        lines.push(key + ": " + v);
      });
      data.access_key = CFG.key || "";
      data.subject = SUBJECTS[form.dataset.form] || SUBJECTS.lead;
      data.from_name = CFG.from || CFG.brand || "Сайт";
      data.message = lines.join("\n"); // читаемый текст письма

      fetch(ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.success) {
            form.reset();
            setStatus(form, "ok", "Спасибо! Заявка отправлена — свяжусь с вами в ближайшее время.");
          } else {
            setStatus(form, "err", "Не удалось отправить. Напишите мне в Telegram — отвечу сразу.");
          }
        })
        .catch(function () {
          setStatus(form, "err", "Ошибка сети. Напишите мне в Telegram — отвечу сразу.");
        })
        .finally(function () {
          if (btn) {
            btn.disabled = false;
            btn.textContent = btnText;
          }
        });
    });
  });
})();
