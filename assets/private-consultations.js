/* Keep availability requests matched to the consultation a visitor chose. */
(function () {
  'use strict';
  var interest = document.getElementById('pf-interest');
  if (!interest) return;
  var form = interest.form;
  // Derive the email subject at submission, including after card preselection or a reset.
  // Capture runs before the shared inquiry handler builds FormData.
  form.addEventListener('submit', function () {
    var option = interest.options[interest.selectedIndex];
    form.elements.subject.value = option.dataset.consultation
      ? 'PYMTW consultation request: ' + option.textContent.split(' — ')[0]
      : 'PYMTW program inquiry: ' + option.textContent;
  }, true);
  document.querySelectorAll('a[data-consultation]').forEach(function (link) {
    link.addEventListener('click', function () {
      var id = link.dataset.consultation;
      var option = Array.from(interest.options).find(function (item) {
        return item.dataset.consultation === id;
      });
      if (option) interest.value = option.value;
    });
  });
})();
