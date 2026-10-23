/* Основной скрипт сайта: мобильное меню, выпадашки, печать в hero,
   scroll-reveal, счётчики и вкладки. Форм на сайте нет — связь через
   мессенджеры (Telegram/MAX), персональные данные не собираются. */
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
        // свернуть раскрытые выпадашки при переходе по ссылке
        nav.querySelectorAll(".has-dropdown.is-open").forEach(function (d) {
          d.classList.remove("is-open");
          var t = d.querySelector(".nav__toggle");
          if (t) t.setAttribute("aria-expanded", "false");
        });
      }
    });
  }

  /* ─── Выпадающее меню (раскрытие по клику — моб. + клавиатура) ─── */
  document.querySelectorAll(".nav__toggle").forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      var item = toggle.closest(".has-dropdown");
      var open = item.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
  });

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

})();
