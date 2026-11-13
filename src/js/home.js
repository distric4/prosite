/* Новая главная (v2): анимации на GSAP + ScrollTrigger.
   Безопасно деградирует: нет библиотек / reduced-motion → контент просто виден. */
(function () {
  "use strict";
  var body = document.body;
  if (!body.classList.contains("v2")) return;

  // Шапка: плотный фон при скролле (дёшево, всегда)
  var head = document.querySelector(".v2-head");
  function headState() { if (head) head.classList.toggle("is-scrolled", window.scrollY > 24); }
  headState();
  window.addEventListener("scroll", headState, { passive: true });

  // Бургер (моб.)
  var burger = document.querySelector(".v2-burger");
  var nav = document.querySelector(".v2-nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = body.classList.toggle("v2-nav-open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!window.gsap || !window.ScrollTrigger || reduce) return; // ничего не прячем

  gsap.registerPlugin(ScrollTrigger);
  body.classList.add("v2-ready");

  // Интро героя
  var heroBits = [".v2-eyebrow", ".v2-hero__title", ".v2-hero__lead", ".v2-hero__cta", ".v2-stats", ".v2-hero__visual"];
  gsap.set(heroBits, { opacity: 0, y: 30 });
  gsap.set("[data-animate]", { opacity: 0, y: 34 });
  gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 }, delay: 0.1 })
    .to(".v2-eyebrow", { opacity: 1, y: 0 }, 0)
    .to(".v2-hero__title", { opacity: 1, y: 0, duration: 0.9 }, 0.08)
    .to(".v2-hero__lead", { opacity: 1, y: 0 }, 0.28)
    .to(".v2-hero__cta", { opacity: 1, y: 0 }, 0.4)
    .to(".v2-stats", { opacity: 1, y: 0 }, 0.5)
    .to(".v2-hero__visual", { opacity: 1, y: 0, duration: 1 }, 0.25);

  // Лёгкий параллакс телефона
  if (document.querySelector(".v2-phone")) {
    gsap.to(".v2-phone", {
      yPercent: -12, ease: "none",
      scrollTrigger: { trigger: ".v2-hero", start: "top top", end: "bottom top", scrub: true }
    });
  }

  // Появление секций по скроллу
  gsap.utils.toArray("[data-animate]").forEach(function (el) {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 86%" }
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener("load", function () { ScrollTrigger.refresh(); });

  // Страховка
  setTimeout(function () {
    document.querySelectorAll("[data-animate]").forEach(function (el) {
      if (parseFloat(getComputedStyle(el).opacity) === 0) {
        var r = el.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) gsap.set(el, { opacity: 1, y: 0 });
      }
    });
  }, 2800);
})();
