/* Основной скрипт сайта. Пока — только мобильное меню.
   Формы и маска телефона подключим на Этапе 3. */
(function () {
  "use strict";

  // Мобильное меню (бургер)
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");

  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      burger.setAttribute("aria-expanded", String(!open));
    });

    // Клик по пункту меню — закрыть
    nav.addEventListener("click", function (e) {
      if (e.target.closest(".nav__link")) {
        nav.setAttribute("data-open", "false");
        burger.setAttribute("aria-expanded", "false");
      }
    });
  }
})();
