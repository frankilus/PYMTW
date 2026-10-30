/* Keep availability requests matched to the consultation a visitor chose. */
(function () {
  'use strict';
  var interest = document.getElementById('pf-interest');
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
