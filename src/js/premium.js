/* Премиум-страницы: движок анимаций (GSAP + ScrollTrigger + Lenis).
   Безопасно деградирует: если библиотек нет или включён reduced-motion —
   контент просто показывается без анимаций. */
(function () {
  "use strict";
  var body = document.body;
  if (!body.classList.contains("premium")) return;

  // Шапка: прозрачная поверх героя → плотная при скролле (дёшево, всегда)
  var header = document.querySelector(".site-header");
  function headerState() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 40);
  }
  headerState();
  window.addEventListener("scroll", headerState, { passive: true });

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ready = window.gsap && window.ScrollTrigger;
  if (!ready || reduce) return; // без pm-ready ничего не прячется — контент виден

  gsap.registerPlugin(ScrollTrigger);
  body.classList.add("pm-ready"); // теперь [data-animate] скрыты через CSS — анимируем их ниже

  // ─── Плавный скролл (Lenis) в связке со ScrollTrigger ───
  if (window.Lenis) {
    var lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  // ─── Исходные состояния ───
  gsap.set("[data-animate]", { opacity: 0, y: 34 });
  gsap.set(".pm-hero__kicker, .pm-hero__lead, .pm-hero__cta, .pm-hero__scroll", { opacity: 0, y: 26 });
  gsap.set(".pm-hero h1 .line > span", { yPercent: 115 });
  gsap.set(".pm-statement .word", { opacity: 0, y: 22 });

  // ─── Интро героя ───
  var tl = gsap.timeline({ defaults: { ease: "power3.out" }, delay: 0.15 });
  tl.to(".pm-hero__kicker", { opacity: 1, y: 0, duration: 0.7 }, 0)
    .to(".pm-hero h1 .line > span", { yPercent: 0, duration: 1.05, stagger: 0.11 }, 0.15)
    .to(".pm-hero__lead", { opacity: 1, y: 0, duration: 0.8 }, 0.55)
    .to(".pm-hero__cta", { opacity: 1, y: 0, duration: 0.8 }, 0.72)
    .to(".pm-hero__scroll", { opacity: 1, y: 0, duration: 0.7 }, 0.9);

  // ─── Параллакс героя ───
  var heroST = { trigger: ".pm-hero", start: "top top", end: "bottom top", scrub: true };
  gsap.to(".pm-hero__orb", { yPercent: 28, ease: "none", scrollTrigger: heroST });
  gsap.to(".pm-hero__inner", { yPercent: 14, opacity: 0.55, ease: "none", scrollTrigger: heroST });

  // ─── Появление секций ───
  gsap.utils.toArray("[data-animate]").forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  // ─── Фраза-утверждение по словам ───
  if (document.querySelector(".pm-statement .word")) {
    gsap.to(".pm-statement .word", {
      opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.045,
      scrollTrigger: { trigger: ".pm-statement", start: "top 72%" }
    });
  }

  // Пересчёт после подгрузки шрифтов
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  // Страховка: если что-то осталось скрытым в зоне видимости — показать
  setTimeout(function () {
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      if (parseFloat(getComputedStyle(el).opacity) === 0) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) gsap.set(el, { opacity: 1, y: 0 });
      }
    });
  }, 2800);
})();
