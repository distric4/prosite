/* Отправка заявок с форм на почту через Web3Forms (статический сайт).
   Tilda отправляет формы AJAX-ом по клику на кнопку submit — поэтому перехватываем
   КЛИК по кнопке (а не событие submit), блокируем отправку на серверы Tilda и шлём на email.
   Плюс сетевой предохранитель: глушим любые запросы к серверу форм Tilda. */
(function () {
  "use strict";
  var ACCESS_KEY = "cf3863c7-4967-4e9d-a65a-1d080192c678"; // Web3Forms (публичный ключ)
  var ENDPOINT = "https://api.web3forms.com/submit";

  // служебные поля Tilda, которые не нужны в письме
  var SKIP = /^(formservices|tildaspec|tranid|form_|form-spec|_|COMMENT$|Checkbox$)/i;

  function buildMessage(form) {
    var fd = new FormData(form);
    var lines = [], msgType = "", msgId = "";
    fd.forEach(function (value, key) {
      if (!key || value === "" || value == null) return;
      if (SKIP.test(key)) return;
      if (key === "messenger-type") { msgType = value; return; }
      if (key === "messenger-id") { msgId = value; return; }
      if (key === "Phone") { lines.push("Телефон: " + value); return; }
      lines.push(key + ": " + value);
    });
    if (msgId) lines.push("Связь (" + (msgType || "?") + "): " + msgId);
    return lines.join("\n") || "(без данных)";
  }

  function inlineMessage(scope, text, color) {
    var box = document.createElement("div");
    box.setAttribute("role", "status");
    box.style.cssText =
      "padding:28px 22px;text-align:center;font-family:'Helvetica Neue',Arial,sans-serif;" +
      "font-size:18px;line-height:1.5;color:#171717;border:2px solid " + color +
      ";border-radius:10px;background:#fff;max-width:480px;margin:16px auto;";
    box.innerHTML = text;
    var target = scope.querySelector(".t-form, .t-quiz__quiz-form-wrapper, .t-quiz__main") || scope;
    try { target.innerHTML = ""; target.appendChild(box); }
    catch (e) { scope.appendChild(box); }
    try { box.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
  }

  function showSuccess(form) {
    var scope = form.closest(".t-form, .t-form__wrapper, .t-quiz") || form.parentElement || document.body;
    var box = scope.querySelector(".t-form__successbox, .js-successbox");
    if (box) {
      box.style.display = "block";
      var inputs = scope.querySelector(".t-form__inputsbox, .js-form-proccesing");
      if (inputs) inputs.style.display = "none";
      try { box.scrollIntoView({ behavior: "smooth", block: "center" }); } catch (e) {}
    } else {
      inlineMessage(scope, "<b>Спасибо!</b><br>Заявка отправлена — я свяжусь с вами в ближайшее время.", "#00af92");
    }
  }

  function showError(form) {
    var scope = (form && (form.closest(".t-form, .t-form__wrapper, .t-quiz") || form.parentElement)) || document.body;
    inlineMessage(scope,
      "Не удалось отправить заявку. Напишите мне напрямую в Telegram <b>@a_dianov14</b>.", "#d33");
  }

  function sendToEmail(form, btn) {
    var payload = {
      access_key: ACCESS_KEY,
      subject: "Новая заявка с сайта diasite.ru",
      from_name: "Сайт diasite.ru",
      message: buildMessage(form)
    };
    if (btn) btn.setAttribute("disabled", "disabled");
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (d && d.success) showSuccess(form); else showError(form); })
      .catch(function () { showError(form); })
      .then(function () { if (btn) btn.removeAttribute("disabled"); });
  }

  // 1) Перехват клика по кнопке отправки (capture — раньше обработчиков Tilda)
  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest('button[type="submit"], input[type="submit"]');
    if (!btn) return;
    var form = btn.closest("form");
    if (!form) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (form.checkValidity && !form.checkValidity()) {
      if (form.reportValidity) form.reportValidity();
      return;
    }
    sendToEmail(form, btn);
  }, true);

  // 2) Предохранитель: не выпускаем запросы к серверу форм Tilda (чтобы не было её ошибок)
  var TILDA_FORM = /tildaapi\.com\/procces|tildacdn\.com\/procces|forms\.tilda/i;
  var _open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (m, u) { this.__tildaForm = TILDA_FORM.test("" + u); return _open.apply(this, arguments); };
  var _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function () { if (this.__tildaForm) { try { this.abort(); } catch (e) {} return; } return _send.apply(this, arguments); };
  var _fetch = window.fetch;
  window.fetch = function (u) { if (TILDA_FORM.test("" + u)) return Promise.resolve(new Response("{}", { status: 200 })); return _fetch.apply(this, arguments); };
})();
