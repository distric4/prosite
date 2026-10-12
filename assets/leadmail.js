/* Отправка заявок с форм на почту через Web3Forms (статический сайт, без своего сервера).
   Перехватывает submit форм Tilda, блокирует отправку на серверы Tilda и шлёт данные на email. */
(function () {
  "use strict";
  var ACCESS_KEY = "cf3863c7-4967-4e9d-a65a-1d080192c678"; // Web3Forms (публичный ключ, email: aleksey.dianov.1996@gmail.com)
  var ENDPOINT = "https://api.web3forms.com/submit";

  // какие поля не показывать в письме (служебные поля Tilda)
  var SKIP = /^(formservices|tildaspec|tranid|form_|form-spec|_|COMMENT$|Checkbox$)/i;

  function buildMessage(form) {
    var fd = new FormData(form);
    var lines = [];
    var msgType = "", msgId = "";
    fd.forEach(function (value, key) {
      if (!key || value === "" || value == null) return;
      if (SKIP.test(key)) return;
      if (key === "messenger-type") { msgType = value; return; }
      if (key === "messenger-id") { msgId = value; return; }
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
      "Не удалось отправить заявку. Напишите мне напрямую в Telegram <b>@a_dianov14</b>.",
      "#d33");
  }

  function onSubmit(e) {
    var form = e.target;
    if (!form || form.tagName !== "FORM") return;
    // блокируем штатную отправку Tilda (на её серверы) и обрабатываем сами
    e.preventDefault();
    e.stopImmediatePropagation();
    if (form.checkValidity && !form.checkValidity()) {
      if (form.reportValidity) form.reportValidity();
      return;
    }
    var payload = {
      access_key: ACCESS_KEY,
      subject: "Новая заявка с сайта diasite.ru",
      from_name: "Сайт diasite.ru",
      message: buildMessage(form)
    };
    var btn = form.querySelector('[type="submit"]');
    if (btn) btn.setAttribute("disabled", "disabled");

    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d && d.success) showSuccess(form); else showError(form);
      })
      .catch(function () { showError(form); })
      .then(function () { if (btn) btn.removeAttribute("disabled"); });
  }

  document.addEventListener("submit", onSubmit, true); // capture — срабатывает раньше Tilda
})();
