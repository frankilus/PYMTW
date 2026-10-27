/* Bitcoin Household Plan: the guided flow. Everything happens in this tab.
   This file makes no network requests. Browser storage is used only when the person turns on "Remember".
   When the paywall flag is on, license.js sends the typed license key (never the answers) to Lemon Squeezy. */
(function () {
  'use strict';
  var B = window.HHPBinder, S = window.HHPSafety, LIC = window.HHPLicense, CFG = window.HHP_CONFIG || { paywall: { enabled: false } };
  var PAY = CFG.paywall || { enabled: false }, PAYWALL = !!PAY.enabled && !!LIC;
  var KEY = 'pymtw-hhp-v1';
  var $ = function (id) { return document.getElementById(id); };
  var form = $('plan-form'), steps = [].slice.call(document.querySelectorAll('.step'));
  var state = B.blank(), current = 0, saveTimer = null;

  function storage() { try { return window.localStorage; } catch (e) { return null; } }
  function remembering() { return $('remember').checked; }

  /* ---------- paths ---------- */
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, state); }
  function set(path, v) { var ks = path.split('.'), o = state; for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = v; }

  /* ---------- secret guard ---------- */
  function showAlert(msg) {
    var box = $('secret-alert');
    $('secret-alert-text').textContent = msg;
    box.hidden = false;
    box.classList.remove('pulse'); void box.offsetWidth; box.classList.add('pulse');
  }
  /* Returns true if the element held a secret and was cleared. */
  function guard(el) {
    if (!el || el.type === 'checkbox' || el.type === 'radio' || el.type === 'file' || el.tagName === 'SELECT') return false;
    var hit = S.check(el.value);
    if (!hit) return false;
    el.value = '';
    showAlert(hit.message);
    el.setAttribute('aria-invalid', 'true');
    setTimeout(function () { el.removeAttribute('aria-invalid'); }, 4000);
    return true;
  }

  /* ---------- choices from shared labels ---------- */
  function buildChoices() {
    document.querySelectorAll('[data-choices]').forEach(function (box) {
      var map = B.L[box.getAttribute('data-choices')], k = box.getAttribute('data-k'), type = box.getAttribute('data-type');
      box.innerHTML = Object.keys(map).map(function (v) {
        return '<label class="check"><input type="' + type + '" name="' + k + '" data-k="' + k + '" value="' + v + '"><span>' + B.esc(map[v]) + '</span></label>';
      }).join('');
    });
    var month = $('review-month'), day = $('review-day');
    B.MONTHS.forEach(function (m, i) { month.add(new Option(m, String(i + 1))); });
    for (var d = 1; d <= 28; d++) day.add(new Option(String(d), String(d)));
    $('step-list').innerHTML = steps.map(function (s, i) { return '<li><button type="button" data-go="' + i + '">' + B.esc(s.getAttribute('data-title')) + '</button></li>'; }).join('');
  }

  /* ---------- write state into the static fields ---------- */
  function fill() {
    form.querySelectorAll('[data-k]').forEach(function (el) {
      var v = get(el.getAttribute('data-k'));
      if (el.type === 'checkbox' && el.hasAttribute('data-bool')) el.checked = !!v;
      else if (el.type === 'checkbox') el.checked = Array.isArray(v) && v.indexOf(el.value) >= 0;
      else if (el.type === 'radio') el.checked = v === el.value;
      else el.value = v == null ? '' : v;
    });
    renderAccounts(); renderContacts(); refresh();
  }
  function readField(el) {
    var k = el.getAttribute('data-k');
    if (el.type === 'checkbox' && el.hasAttribute('data-bool')) set(k, el.checked);
    else if (el.type === 'checkbox') set(k, [].slice.call(form.querySelectorAll('input[type=checkbox][data-k="' + k + '"]:checked')).map(function (x) { return x.value; }));
    else if (el.type === 'radio') { if (el.checked) set(k, el.value); }
    else set(k, el.value);
  }

  /* ---------- repeaters ---------- */
  var TYPE_OPTS = '<option value="">Choose…</option>' + Object.keys(B.L.type).map(function (v) { return '<option value="' + v + '">' + B.esc(B.L.type[v]) + '</option>'; }).join('');
  var ROLE_OPTS = '<option value="">Choose…</option>' + Object.keys(B.L.role).map(function (v) { return '<option value="' + v + '">' + B.esc(B.L.role[v]) + '</option>'; }).join('');
  function inp(list, i, f, label, ph, max, extra) {
    var id = list + '-' + i + '-' + f;
    return '<label class="field" for="' + id + '"><span>' + label + '</span><input id="' + id + '" data-list="' + list + '" data-i="' + i + '" data-f="' + f + '" maxlength="' + (max || 160) + '" placeholder="' + B.esc(ph || '') + '" spellcheck="false" autocomplete="off"></label>' + (extra || '');
  }
  function renderAccounts() {
    var box = $('accounts');
    box.innerHTML = state.accounts.map(function (a, i) {
      var self = !!B.SELF[a.type];
      return '<fieldset class="repeat" data-row="' + i + '"><legend>Account or wallet ' + (i + 1) + '</legend>' +
        '<label class="field" for="accounts-' + i + '-type"><span>What kind is it?</span><select id="accounts-' + i + '-type" data-list="accounts" data-i="' + i + '" data-f="type">' + TYPE_OPTS + '</select></label>' +
        '<div class="fields two">' + inp('accounts', i, 'provider', 'Company or wallet brand', 'e.g. the exchange or device maker', 120) + inp('accounts', i, 'nickname', 'Nickname <small>(optional)</small>', 'e.g. “Long-term savings”', 80) + '</div>' +
        inp('accounts', i, 'holder', 'In whose name', 'e.g. mine, joint, my IRA', 120) +
        '<div class="self-fields"' + (self ? '' : ' hidden') + '>' +
        inp('accounts', i, 'device', 'Where the device is kept', 'e.g. desk drawer, home office', 200) +
        inp('accounts', i, 'backup', 'Where the backup is kept <small>(the place, never the words)</small>', 'e.g. fireproof box, hall closet', 200, '<p class="field-warn">Describe the place only. Never type recovery words here or anywhere online.</p>') +
        '</div>' + inp('accounts', i, 'knows', 'Who else knows where it is', 'e.g. my spouse', 160) +
        '<label class="field" for="accounts-' + i + '-notes"><span>Notes <small>(optional, no secrets)</small></span><textarea id="accounts-' + i + '-notes" data-list="accounts" data-i="' + i + '" data-f="notes" rows="2" maxlength="600" spellcheck="false"></textarea></label>' +
        '<button type="button" class="text-button" data-remove="accounts" data-i="' + i + '">Remove this one</button></fieldset>';
    }).join('');
    syncRepeat(box, state.accounts);
  }
  function renderContacts() {
    var box = $('contacts');
    box.innerHTML = state.people.contacts.map(function (c, i) {
      return '<fieldset class="repeat" data-row="' + i + '"><legend>Trusted contact ' + (i + 1) + '</legend><div class="fields three">' +
        inp('contacts', i, 'name', 'Name', '', 120) +
        '<label class="field" for="contacts-' + i + '-role"><span>Role</span><select id="contacts-' + i + '-role" data-list="contacts" data-i="' + i + '" data-f="role">' + ROLE_OPTS + '</select></label>' +
        inp('contacts', i, 'reach', 'How to reach them', 'Phone or email', 160) + '</div>' +
        '<button type="button" class="text-button" data-remove="contacts" data-i="' + i + '">Remove this one</button></fieldset>';
    }).join('');
    syncRepeat(box, state.people.contacts);
  }
  function listOf(name) { return name === 'accounts' ? state.accounts : state.people.contacts; }
  function syncRepeat(box, list) { box.querySelectorAll('[data-f]').forEach(function (el) { el.value = list[+el.getAttribute('data-i')][el.getAttribute('data-f')] || ''; }); }

  /* ---------- derived bits of the UI ---------- */
  function refresh() {
    var t = parseFloat(state.alloc.target), c = parseFloat(state.alloc.cap);
    $('alloc-hint').textContent = isFinite(t) && isFinite(c) && t > c ? 'Your target is above your limit. Most people set the limit a little higher than the target.' : (isFinite(t) && (t < 0 || t > 100)) || (isFinite(c) && (c < 0 || c > 100)) ? 'Use a number from 0 to 100.' : '';
    $('recurring-fields').hidden = state.buy.method !== 'recurring';
    var next = B.nextReview(state.review, new Date());
    $('next-review').textContent = next ? 'Next review: ' + B.longDate(next) + ', then every year.' : '';
    $('ics').disabled = $('ics-2').disabled = !next;
    parts().forEach(function (x) { var li = document.querySelector('#side-list [data-part=' + x[2] + ']'); if (li) li.classList.toggle('done', !!x[1]); });
    if (steps[current].getAttribute('data-step') === 'letter') $('letter-preview').innerHTML = B.renderLetter(state);
    if (steps[current].getAttribute('data-step') === 'binder') renderBinder();
  }
  function parts() { return [['Policy', state.why.reasons.length || state.why.words || state.buy.method, 'policy'], ['Letter', state.letter.to || state.people.executor, 'letter'], ['Inventory', state.accounts.some(B.used), 'inventory'], ['Review date', state.review.month, 'review'], ['Records', state.records.exports || state.records.basis, 'records']]; }
  function renderBinder() {
    $('binder').innerHTML = B.renderBinder(state, new Date());
    var p = parts(), done = p.filter(function (p) { return p[1]; }).length, missing = B.readinessGaps(state);
    $('h-binder').textContent = missing.length === 0 ? 'Review your household plan.' : 'Your plan has unfinished sections.';
    $('completeness').textContent = done === 5 ? 'All five sections contain some answers. Review them for accuracy and missing details; this is not a readiness certification.' : done + ' of 5 sections have your answers. Still blank: ' + p.filter(function (p) { return !p[1]; }).map(function (p) { return p[0]; }).join(', ') + '.';
    $('completeness').textContent += missing.length ? ' Next steps: ' + missing.join('; ') + '.' : ' Family checks marked reviewed. Recheck after any change.';
  }
  function choosePath(family) {
    var order = family ? ['start','you','inventory','people','letter','records','review','why','amount','buying','selling','binder'] : ['start','you','why','amount','buying','selling','inventory','people','letter','review','records','binder'];
    steps.sort(function(a,b){return order.indexOf(a.dataset.step)-order.indexOf(b.dataset.step);});
    steps.forEach(function(s){form.appendChild(s);});
    buildStepList(); go(1,true);
  }
  function buildStepList(){ $('step-list').innerHTML = steps.map(function(s,i){return '<li><button type="button" data-go="'+i+'">'+B.esc(s.getAttribute('data-title'))+'</button></li>';}).join(''); }
  function checklistPreview() {
    $('checklist-preview').innerHTML = '<h3>What you’ll check each year</h3>' + B.CHECKLIST.map(function (g) { return '<details><summary>' + B.esc(g[0]) + '</summary><ul>' + g[1].map(function (i) { return '<li>' + B.esc(i) + '</li>'; }).join('') + '</ul></details>'; }).join('');
  }

  /* ---------- saving ---------- */
  function status(msg) { $('save-status').textContent = msg; }
  function persist() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      var st = storage();
      if (remembering() && st) { try { st.setItem(KEY, B.exportFile(state)); } catch (e) { status('This browser couldn’t save your answers. Save a file instead.'); } }
    }, 250);
  }
  function changed() { refresh(); persist(); }

  /* ---------- steps ---------- */
  function go(i, focus) {
    current = Math.max(0, Math.min(steps.length - 1, i));
    steps.forEach(function (s, n) { s.hidden = n !== current; });
    var name = steps[current].getAttribute('data-step');
    if (name === 'inventory' && !state.accounts.length) { state.accounts.push(B.account()); renderAccounts(); }
    $('step-count').textContent = 'Step ' + (current + 1) + ' of ' + steps.length + ' · ' + steps[current].getAttribute('data-title');
    $('flow-bar').style.width = Math.round((current / (steps.length - 1)) * 100) + '%';
    $('back').hidden = current === 0;
    $('next').hidden = current === steps.length - 1;
    $('next').textContent = current === 0 ? 'Start my plan' : current === steps.length - 2 ? 'See my binder' : 'Continue';
    $('binder-wrap').hidden = name !== 'binder';
    document.querySelectorAll('#step-list button').forEach(function (b, n) { if (n === current) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
    $('flow-menu').open = false;
    refresh();
    if (focus) { var h = steps[current].querySelector('h2'); h.focus({ preventScroll: true }); $('plan').scrollIntoView({ block: 'start' }); }
  }

  /* ---------- downloads ---------- */
  function download(name, text, type) {
    var url = URL.createObjectURL(new Blob([text], { type: type })), a = document.createElement('a');
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function ics() { var t = B.buildIcs(state.review, new Date()); if (t) { download('bitcoin-household-plan-review.ics', t, 'text/calendar'); status('Calendar reminder downloaded. Open it to add it to your calendar.'); } }
  function canExport() { return !(PAY && PAY.enabled) || !!(LIC && LIC.load(PAY)); }

  /* ---------- unlock panel (only when the paywall flag is on) ---------- */
  function lockUI() {
    var rec = LIC.load(PAY), open = !!rec;
    document.documentElement.classList.toggle('hhp-locked', !open);
    $('paywall').hidden = open;
    $('unlock-owned').hidden = !open;
    if (open) $('unlock-owned-text').textContent = 'Printing is unlocked on this device (key ' + LIC.mask(rec.key) + ').';
  }
  function showKeyBox(focus) {
    $('unlock-key-box').hidden = false; $('unlock-have').setAttribute('aria-expanded', 'true');
    if (focus) $('unlock-key').focus();
  }
  function unlockStatus(msg, kind) { var el = $('unlock-status'); el.textContent = msg; el.className = 'unlock-status' + (kind ? ' ' + kind : ''); }
  var checking = false;
  function submitKey() {
    if (checking) return;
    var key = $('unlock-key').value;
    checking = true; $('unlock-submit').disabled = true; unlockStatus('Checking your key…', 'busy');
    LIC.activate(key, PAY).then(function (r) {
      checking = false; $('unlock-submit').disabled = false;
      if (!r.ok) { unlockStatus(r.message, 'error'); $('unlock-key').setAttribute('aria-invalid', 'true'); return; }
      $('unlock-key').removeAttribute('aria-invalid');
      if (!LIC.save(r.record)) { unlockStatus('Your key is valid, but this browser blocks storage, so it can’t stay unlocked. Allow site storage, or print right away.', 'error'); return; }
      $('unlock-key').value = ''; unlockStatus('', '');
      lockUI(); renderBinder();
      status('Unlocked. Your binder is ready to print or save as a PDF.');
      $('print').focus();
    });
  }
  function setupPaywall() {
    $('paywall-text').textContent = PAY.message || '';
    var buy = $('unlock-buy');
    if (PAY.checkoutUrl) { buy.href = PAY.checkoutUrl; buy.textContent = 'Get the binder, ' + (PAY.price || '$29'); } else buy.hidden = true;
    $('unlock-have').addEventListener('click', function () { if ($('unlock-key-box').hidden) showKeyBox(true); else { $('unlock-key-box').hidden = true; this.setAttribute('aria-expanded', 'false'); } });
    $('unlock-submit').addEventListener('click', submitKey);
    $('unlock-key').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); submitKey(); } });
    $('unlock-remove').addEventListener('click', function () {
      LIC.clear(); lockUI();
      status('The key is removed from this device. Enter it again any time to print.');
      $('unlock-have').focus();
    });
    window.addEventListener('storage', function (e) { if (e.key === LIC.STORE_KEY || e.key === null) lockUI(); });
    lockUI();
    if (/(^|[?&])unlock=1(&|$)/.test(location.search)) {
      $('unlock-note').hidden = false; showKeyBox(false);
      try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* keep the URL */ }
      return true;
    }
    return false;
  }

  /* ---------- import / erase ---------- */
  /* Clears any value that looks like a secret; returns how many were cleared. */
  function scrub(obj) {
    var removed = 0;
    B.strings(obj, '').forEach(function (p) {
      if (S.check(p[1])) { removed++; var o = obj, ks = p[0].replace(/\[(\d+)\]/g, '.$1').split('.'); for (var i = 0; i < ks.length - 1; i++) o = o[ks[i]]; o[ks[ks.length - 1]] = ''; }
    });
    return removed;
  }
  function importFile(file) {
    var out = $('import-status');
    if (!file) return;
    if (file.size > 400000) { out.textContent = 'That file is too large to be a plan file.'; return; }
    var r = new FileReader();
    r.onload = function () {
      try {
        var next = B.parseFile(String(r.result)), removed = scrub(next);
        state = next; fill(); persist();
        out.textContent = 'Your answers are back.' + (removed ? ' We removed ' + removed + ' field' + (removed > 1 ? 's' : '') + ' that looked like a recovery phrase or key.' : '') + ' Press “Start my plan” to continue.';
        if (removed) showAlert('Part of that file looked like a recovery phrase or private key, so we removed it. Delete that file and keep secrets offline.');
      } catch (e) { out.textContent = e.message; }
      $('import-file').value = '';
    };
    r.onerror = function () { out.textContent = 'That file couldn’t be read.'; };
    r.readAsText(file);
  }
  function erase() {
    clearTimeout(saveTimer);
    var st = storage(); if (st) { try { st.removeItem(KEY); } catch (e) { /* nothing stored */ } }
    state = B.blank(); $('remember').checked = false; form.reset(); fill();
    $('binder').innerHTML = ''; $('letter-preview').innerHTML = ''; $('import-status').textContent = ''; $('secret-alert').hidden = true;
    $('erase-confirm').hidden = true; $('erase').hidden = false;
    go(0, true);
    status('Everything is erased from this tab and this device. Any files you downloaded stay where you saved them.');
  }

  /* ---------- events ---------- */
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  form.addEventListener('input', onEdit);
  form.addEventListener('change', onEdit);
  function onEdit(e) {
    var el = e.target;
    if (el.id === 'remember' || el.id === 'import-file' || el.id === 'unlock-key') return;
    var hit = guard(el);
    if (el.hasAttribute('data-k')) { readField(el); changed(); return; }
    if (el.hasAttribute('data-list')) {
      var list = listOf(el.getAttribute('data-list')), i = +el.getAttribute('data-i'), f = el.getAttribute('data-f');
      list[i][f] = el.value;
      if (f === 'type' && e.type === 'change') { el.closest('.repeat').querySelector('.self-fields').hidden = !B.SELF[el.value]; }
      changed();
    }
    return hit;
  }
  form.addEventListener('click', function (e) {
    var rm = e.target.closest('[data-remove]');
    if (!rm) return;
    var name = rm.getAttribute('data-remove');
    listOf(name).splice(+rm.getAttribute('data-i'), 1);
    if (name === 'accounts') renderAccounts(); else renderContacts();
    changed();
    var btn = $(name === 'accounts' ? 'add-account' : 'add-contact'); btn.focus();
  });
  $('add-account').addEventListener('click', function () { state.accounts.push(B.account()); renderAccounts(); changed(); $('accounts-' + (state.accounts.length - 1) + '-type').focus(); });
  $('add-contact').addEventListener('click', function () { state.people.contacts.push(B.contact()); renderContacts(); changed(); $('contacts-' + (state.people.contacts.length - 1) + '-name').focus(); });
  $('remember').addEventListener('change', function () {
    var st = storage();
    if (this.checked) { persist(); status(st ? 'Your answers will be remembered in this browser on this device.' : 'This browser blocks storage. Save a file instead.'); }
    else { if (st) st.removeItem(KEY); status('Answers are no longer remembered on this device.'); }
  });
  $('import-file').addEventListener('change', function () { importFile(this.files && this.files[0]); });
  $('next').addEventListener('click', function () { go(current + 1, true); });
  $('back').addEventListener('click', function () { go(current - 1, true); });
  $('step-list').addEventListener('click', function (e) { var b = e.target.closest('[data-go]'); if (b) go(+b.getAttribute('data-go'), true); });
  $('secret-alert-close').addEventListener('click', function () { $('secret-alert').hidden = true; });
  $('ics').addEventListener('click', ics);
  $('ics-2').addEventListener('click', ics);
  $('print').addEventListener('click', function () {
    if (!canExport()) { if (PAYWALL) { lockUI(); $('paywall').focus(); $('paywall').scrollIntoView({ block: 'center' }); } return; }
    renderBinder(); window.print();
  });
  $('export-json').addEventListener('click', function () { download('bitcoin-household-plan-answers.json', B.exportFile(state), 'application/json'); status('Answers file downloaded. Keep it as private as the binder.'); });
  $('erase').addEventListener('click', function () { this.hidden = true; $('erase-confirm').hidden = false; $('erase-no').focus(); });
  $('erase-no').addEventListener('click', function () { $('erase-confirm').hidden = true; $('erase').hidden = false; $('erase').focus(); });
  $('erase-yes').addEventListener('click', erase);
  window.addEventListener('beforeprint', function () { if (canExport()) renderBinder(); });

  /* ---------- start ---------- */
  buildChoices(); checklistPreview();
  $('family-first').addEventListener('click',function(){choosePath(true);});
  $('policy-first').addEventListener('click',function(){choosePath(false);});
  var sample = B.blank(); sample.owner.name='Alex Example (fictional)'; sample.owner.household='Example household — demonstration only'; sample.why.words='Bitcoin is one part of our long-term investments, not our emergency fund.'; sample.people.executor='Morgan Example'; sample.letter.note='Please take your time. Contact our professional advisers before acting.'; sample.accounts=[B.account()]; sample.accounts[0].type='brokerage'; sample.accounts[0].provider='Example brokerage (fictional)'; sample.records.exports='Fictional example: annual tax folder held with our adviser'; sample.people.executorContact='Contact details held with our estate documents (example)'; sample.ready.incapacity='Authorized adviser named in our legal documents (example)'; sample.review.month='6'; sample.review.day='1'; sample.ready.aware=true; sample.ready.locate=true;
  $('sample-binder').innerHTML=B.renderBinder(sample,new Date()).replace(/id="([^"]+)"/g,'id="sample-$1"');
  var arrivedToUnlock = PAYWALL && setupPaywall();
  if (PAY.enabled && !LIC) { document.documentElement.classList.add('hhp-locked'); $('print').disabled = true; }
  var saved = null, st = storage();
  try { saved = st && st.getItem(KEY); } catch (e) { saved = null; }
  if (saved) {
    try { state = B.parseFile(saved); scrub(state); $('remember').checked = true; status('Welcome back. Your remembered answers are loaded.'); }
    catch (e) { state = B.blank(); }
  }
  if (!state.owner.prepared) state.owner.prepared = B.ymd(new Date());
  $('plan').hidden = false;
  fill();
  if (arrivedToUnlock) { go(steps.length - 1, false); if (!$('paywall').hidden) { $('paywall').scrollIntoView({ block: 'center' }); $('unlock-key').focus({ preventScroll: true }); } }
  else go(0, false);
})();
