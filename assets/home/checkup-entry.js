/* Homepage checkup entry. Answers never enter a URL or network request.
   The tab-scoped handoff is consumed and cleared by the full checkup. */
(function () {
  'use strict';
  var card = document.getElementById('home-checkup');
  if (!card) return;
  var key = 'pymtw-checkup-entry-v1', selected = null;
  var choices = Array.prototype.slice.call(card.querySelectorAll('[data-checkup-answer]'));
  var status = document.getElementById('checkup-status');
  var continueLink = document.getElementById('checkup-continue');
  choices.forEach(function (button) {
    button.addEventListener('click', function () {
      selected = button.getAttribute('data-checkup-answer');
      choices.forEach(function (other) { other.setAttribute('aria-pressed', String(other === button)); });
      status.textContent = 'Answer selected. Continue to question 2.';
    });
  });
  continueLink.addEventListener('click', function () {
    try {
      sessionStorage.removeItem(key);
      if (selected) sessionStorage.setItem(key, JSON.stringify({ version: 1, answer: selected, created: Date.now() }));
    } catch (_) {
      // If tab storage is blocked, the destination still works and begins at question 1.
    }
  });
  var mobile = window.matchMedia('(max-width: 760px)');
  function fitCard() { if (!selected) card.open = !mobile.matches; }
  fitCard();
  if (mobile.addEventListener) mobile.addEventListener('change', fitCard);
})();
