/* Bitcoin Household Plan: answers model, binder renderer and calendar file.
   Pure functions only: no storage, no network, no DOM access. Works in a browser tab or Node. */
(function (root) {
  'use strict';
  var APP = 'pymtw-bitcoin-household-plan', VERSION = 1, MAX = 2000;
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  var L = {
    reasons: {
      longterm: 'Long-term savings I won’t need for years',
      diversify: 'A small slice alongside my other investments',
      money: 'I believe it can play a long-term role as money',
      learn: 'Learning by owning a small amount',
      family: 'Something to pass on to my family'
    },
    horizon: { lt1: 'Less than 1 year', y1_3: '1–3 years', y3_5: '3–5 years', y5_10: '5–10 years', y10: '10+ years' },
    overCap: { stop: 'Stop buying until it’s back under my limit', trim: 'Sell some to get back to my target, after the cooling-off period', nothing: 'Do nothing until my yearly review', decide: 'Decide at my yearly review, with my notes in hand' },
    method: { recurring: 'A fixed amount on a schedule (dollar-cost averaging)', lump: 'One-time purchases only, when I decide', none: 'I’m not buying more for now', undecided: 'I haven’t decided yet' },
    frequency: { weekly: 'every week', biweekly: 'every two weeks', monthly: 'every month', paycheck: 'with each paycheck', quarterly: 'every quarter' },
    onDrop: { keep: 'Keep my plan exactly as written', pause: 'Pause and review my written plan before changing anything', more: 'Buy extra, but only within my limit' },
    onRise: { keep: 'Keep my plan exactly as written', pause: 'Pause new purchases if I’m over my limit', rebalance: 'Rebalance back to my target at my review' },
    wouldSell: {
      expense: 'To pay for a planned major expense',
      rebalance: 'To get back to my target allocation',
      reason: 'If my reason for holding it no longer holds',
      emergency: 'In a real emergency, after my other savings',
      taxes: 'To pay taxes I owe'
    },
    wontSell: {
      drop: 'Just because the price dropped sharply',
      headline: 'Because of a headline, prediction or social post',
      pressure: 'Because someone pressures me or promises a better return',
      panic: 'On the same day I first feel panic'
    },
    coolOff: { h24: '24 hours', d3: '3 days', w1: '1 week', d30: '30 days' },
    rules: {
      panic: 'No same-day panic decisions.',
      process: 'Review this written plan before changing my routine.',
      borrow: 'No borrowed money for Bitcoin.',
      social: 'Social media posts are not instructions.',
      predict: 'Don’t chase price predictions.'
    },
    type: {
      exchange: 'Exchange or app account (a company holds it)',
      brokerage: 'Brokerage or retirement account (fund or ETF)',
      hardware: 'Hardware wallet (a device I control)',
      mobile: 'Phone or computer wallet app',
      multisig: 'Multisig or collaborative custody',
      other: 'Other'
    },
    role: { family: 'Family', tech: 'Trusted technical helper', attorney: 'Estate attorney', cpa: 'CPA or tax preparer', planner: 'Financial planner', custody: 'Custody provider support', other: 'Other' },
    attorneySeen: { yes: 'Yes, my attorney has seen this plan', notyet: 'Not yet, it’s on my list', none: 'I don’t have an estate attorney yet' },
    basis: { yes: 'Yes, for each account', some: 'For some accounts', no: 'Not yet' }
  };
  var SELF = { hardware: 1, mobile: 1, multisig: 1 };

  var CHECKLIST = [
    ['Account security', ['Passwords are in a password manager, not on paper next to this binder.', 'Two-step login is on for every exchange account; avoid text-message codes where a stronger option exists.', 'Consider hardware security keys for important accounts.', 'Old phones, computers and logged-in sessions are removed.']],
    ['Wallets & backups', ['The inventory in this binder still matches what I actually have.', 'Every backup is still where this binder says, and still readable.', 'I still understand my recovery plan, and could do a small test transaction if I needed to.', 'Device and app updates come only from the maker’s official website or app store.']],
    ['Records & taxes', ['Download this year’s transaction exports from each exchange.', 'Cost-basis records are complete, and transfers between my own accounts are labeled.', 'Tax documents (such as Form 1099-DA from a broker) are saved with my records.', 'Write down questions for my tax professional.']],
    ['Family & documents', ['Trusted contacts and phone numbers are current.', 'My family knows never to share recovery words, keys or passwords with anyone who asks.', 'My will and estate documents still reflect my wishes.', 'No secrets are stored in unsafe places: email, photos, cloud notes or this binder.']],
    ['What changed this year', ['Did my holdings grow enough to deserve stronger custody or professional help?', 'Did a job, family or address change affect my plan?', 'Did a device, backup or account change?', 'Update this binder and print a fresh copy.']]
  ];

  var SOURCES = [
    ['IRS: Digital assets', 'https://www.irs.gov/filing/digital-assets'],
    ['IRS: Frequently asked questions on digital asset transactions (basis, recordkeeping)', 'https://www.irs.gov/individuals/international-taxpayers/frequently-asked-questions-on-digital-asset-transactions'],
    ['IRS: How long should I keep records?', 'https://www.irs.gov/businesses/small-businesses-self-employed/how-long-should-i-keep-records'],
    ['IRS: About Form 1099-DA, Digital Asset Proceeds From Broker Transactions', 'https://www.irs.gov/forms-pubs/about-form-1099-da'],
    ['National Institute on Aging: Getting your affairs in order checklist', 'https://www.nia.nih.gov/health/advance-care-planning/getting-your-affairs-order-checklist-documents-prepare-future'],
    ['Consumer Financial Protection Bureau: Managing someone else’s money', 'https://www.consumerfinance.gov/consumer-tools/managing-someone-elses-money/'],
    ['Uniform Law Commission: Fiduciary Access to Digital Assets Act, Revised', 'https://www.uniformlaws.org/committees/community-home?CommunityKey=f7237fc4-74c2-4728-81c6-b39a91ecdf22'],
    ['FTC: What to know about cryptocurrency and scams', 'https://consumer.ftc.gov/articles/what-know-about-cryptocurrency-scams'],
    ['Bitcoin.org: Securing your wallet', 'https://bitcoin.org/en/secure-your-wallet']
  ];

  function blank() {
    return {
      owner: { name: '', household: '', prepared: '' },
      why: { reasons: [], words: '', horizon: '', revisit: '' },
      alloc: { target: '', cap: '', emergencyFirst: true, shortTerm: true, overCap: '', notes: '' },
      buy: { method: '', amount: '', frequency: '', platform: '', onDrop: '', onRise: '', notes: '' },
      sell: { would: [], wouldWords: '', wont: ['drop', 'headline', 'pressure', 'panic'], coolOff: '', rules: ['panic', 'process', 'borrow', 'social', 'predict'] },
      accounts: [],
      people: { executor: '', executorRelation: '', executorContact: '', contacts: [], willLocation: '', attorneySeen: '' },
      letter: { to: '', note: '' },
      review: { month: '', day: '' },
      records: { exports: '', software: '', preparer: '', basis: '', notes: '' }
    };
  }
  function account() { return { type: '', provider: '', nickname: '', holder: '', device: '', backup: '', knows: '', notes: '' }; }
  function contact() { return { name: '', role: '', reach: '' }; }

  /* Copy only known keys and expected types from untrusted input (an imported file or storage). */
  function str(v) { return typeof v === 'string' ? v.slice(0, MAX) : (typeof v === 'number' && isFinite(v) ? String(v) : ''); }
  function shape(model, input) {
    var out = {};
    Object.keys(model).forEach(function (k) {
      var m = model[k], v = input && typeof input === 'object' ? input[k] : undefined;
      if (Array.isArray(m)) {
        if (k === 'accounts') out[k] = (Array.isArray(v) ? v : []).slice(0, 30).map(function (a) { return shape(account(), a); });
        else if (k === 'contacts') out[k] = (Array.isArray(v) ? v : []).slice(0, 30).map(function (c) { return shape(contact(), c); });
        else out[k] = Array.isArray(v) ? v.filter(function (x) { return typeof x === 'string'; }).slice(0, 20).map(str) : (v === undefined ? m.slice() : []);
      } else if (typeof m === 'boolean') out[k] = v === undefined ? m : v === true;
      else if (m && typeof m === 'object') out[k] = shape(m, v);
      else out[k] = v === undefined ? m : str(v);
    });
    return out;
  }
  function sanitize(input) { return shape(blank(), input); }

  /* Every free-text value with its path, for the secret scan. */
  function strings(obj, path, out) {
    out = out || [];
    if (typeof obj === 'string') out.push([path, obj]);
    else if (Array.isArray(obj)) obj.forEach(function (v, i) { strings(v, path + '[' + i + ']', out); });
    else if (obj && typeof obj === 'object') Object.keys(obj).forEach(function (k) { strings(obj[k], path ? path + '.' + k : k, out); });
    return out;
  }

  function exportFile(state, now) {
    return JSON.stringify({ app: APP, version: VERSION, saved: (now || new Date()).toISOString(), note: 'Your Bitcoin Household Plan answers. Contains no passwords, recovery words or keys. Keep this file private.', answers: sanitize(state) }, null, 2);
  }
  function parseFile(text) {
    if (typeof text !== 'string' || text.length > 400000) throw new Error('That file is too large to be a plan file.');
    var data;
    try { data = JSON.parse(text); } catch (e) { throw new Error('That file isn’t a saved plan. Choose the .json file this tool downloaded.'); }
    if (!data || data.app !== APP || typeof data.answers !== 'object') throw new Error('That file isn’t a saved Bitcoin Household Plan.');
    return sanitize(data.answers);
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function ymd(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  /* Next yearly review on or after tomorrow. Day is clamped to the month's length. */
  function nextReview(review, today) {
    var m = parseInt(review && review.month, 10), d = parseInt(review && review.day, 10);
    if (!(m >= 1 && m <= 12)) return null;
    if (!(d >= 1 && d <= 31)) d = 1;
    today = today || new Date();
    for (var y = today.getFullYear(); y <= today.getFullYear() + 1; y++) {
      var last = new Date(y, m, 0).getDate(), c = new Date(y, m - 1, Math.min(d, last));
      if (c > today) return c;
    }
    return null;
  }
  function longDate(d) { return d ? MONTHS[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear() : ''; }
  function parseDate(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null; }

  function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function fold(line) {
    var out = [], cur = '', bytes = 0;
    for (var i = 0; i < line.length; i++) {
      var ch = line[i], b = encodeURIComponent(ch).replace(/%[0-9A-F]{2}/g, 'x').length;
      if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ''; bytes = 0; }
      cur += ch; bytes += b;
    }
    out.push(cur);
    return out.join('\r\n ');
  }
  /* A yearly all-day reminder with a one-week heads-up. It names no people, places or accounts. */
  function buildIcs(review, now) {
    now = now || new Date();
    var start = nextReview(review, now);
    if (!start) return null;
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1);
    function day(d) { return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); }
    var stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    var desc = 'Time for your yearly Bitcoin household plan review. Check account security, wallets and backups, records and taxes, family and documents, and what changed this year. Then print a fresh binder. Never share recovery words, keys or passwords with anyone. https://pymtw.com/tools/bitcoin-household-plan/';
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PYMTW//Bitcoin Household Plan//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:hhp-' + day(start) + '-' + stamp + '@pymtw.com', 'DTSTAMP:' + stamp, 'DTSTART;VALUE=DATE:' + day(start), 'DTEND;VALUE=DATE:' + day(end), 'RRULE:FREQ=YEARLY',
      'SUMMARY:' + icsText('Yearly Bitcoin household plan review'), 'DESCRIPTION:' + icsText(desc), 'URL:https://pymtw.com/tools/bitcoin-household-plan/', 'TRANSP:TRANSPARENT',
      'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:' + icsText('Bitcoin household plan review next week'), 'TRIGGER:-P7D', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'];
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function para(s) { return esc(s.trim()).split(/\n{2,}/).map(function (p) { return '<p>' + p.replace(/\n/g, '<br>') + '</p>'; }).join(''); }
  function blankLine(label) { return '<span class="b-blank" aria-label="' + esc(label || 'Not filled in yet') + '"></span>'; }
  function val(s, label) { return s && String(s).trim() ? esc(String(s).trim()) : blankLine(label); }
  function row(k, v) { return '<div class="b-row"><dt>' + esc(k) + '</dt><dd>' + v + '</dd></div>'; }
  function list(items, emptyText) { return items.length ? '<ul class="b-list">' + items.map(function (i) { return '<li>' + i + '</li>'; }).join('') + '</ul>' : '<p class="b-muted">' + esc(emptyText) + '</p>'; }
  function picked(keys, map) { return (keys || []).filter(function (k) { return map[k]; }).map(function (k) { return esc(map[k]); }); }
  function pct(s) { var n = parseFloat(String(s).replace(/[^0-9.]/g, '')); return isFinite(n) && n >= 0 && n <= 100 ? (Math.round(n * 10) / 10) + '%' : ''; }
  function money(s) { var t = String(s || '').trim(); if (!t) return ''; return /^[0-9.,]+$/.test(t) ? '$' + t : t; }

  function sectionHead(n, title, lede) { return '<header class="b-head"><p class="b-num">Section ' + n + '</p><h2>' + esc(title) + '</h2>' + (lede ? '<p class="b-lede">' + esc(lede) + '</p>' : '') + '</header>'; }

  function sectionPolicy(s) {
    var why = picked(s.why.reasons, L.reasons);
    if (s.why.words.trim()) why.push('In my words: ' + esc(s.why.words.trim()));
    var a = s.alloc, b = s.buy, sl = s.sell, buyLine;
    if (b.method === 'recurring') buyLine = 'I buy ' + (money(b.amount) ? esc(money(b.amount)) : 'a fixed amount') + ' ' + esc(L.frequency[b.frequency] || 'on a regular schedule') + (b.platform.trim() ? ' through ' + esc(b.platform.trim()) : '') + '.';
    else buyLine = b.method ? esc(L.method[b.method]) + (b.platform.trim() && b.method === 'lump' ? ' Through ' + esc(b.platform.trim()) + '.' : '') : blankLine();
    var limits = [];
    if (a.emergencyFirst) limits.push('My emergency fund comes first.');
    if (a.shortTerm) limits.push('Money I’ll need within the next few years stays out of Bitcoin.');
    var would = picked(sl.would, L.wouldSell); if (sl.wouldWords.trim()) would.push(esc(sl.wouldWords.trim()));
    return '<section class="b-section" id="b-policy">' + sectionHead(1, 'My Bitcoin policy', 'Written while calm, so I can lean on it when the price isn’t.') +
      '<div class="b-card"><h3>Why I hold Bitcoin</h3>' + list(why, 'Not written yet.') + '<dl>' + row('Time horizon', val(L.horizon[s.why.horizon])) + row('What would make me revisit this', val(s.why.revisit)) + '</dl></div>' +
      '<div class="b-card"><h3>How much</h3><dl>' + row('Target share of my investments', val(pct(a.target))) + row('Upper limit', val(pct(a.cap))) + row('If I go over my limit', val(L.overCap[a.overCap])) + '</dl>' + list(limits.map(esc), '') + (a.notes.trim() ? '<div class="b-note">' + para(a.notes) + '</div>' : '') + '</div>' +
      '<div class="b-card"><h3>How I buy</h3><p>' + buyLine + '</p><dl>' + row('If the price drops a lot', val(L.onDrop[b.onDrop])) + row('If the price rises a lot', val(L.onRise[b.onRise])) + '</dl>' + (b.notes.trim() ? '<div class="b-note">' + para(b.notes) + '</div>' : '') + '</div>' +
      '<div class="b-card"><h3>When I would and wouldn’t sell</h3><div class="b-cols"><div><h4>I would consider selling</h4>' + list(would, 'Not written yet.') + '</div><div><h4>I won’t sell</h4>' + list(picked(sl.wont, L.wontSell), 'Not written yet.') + '</div></div><dl>' + row('Cooling-off period before any big change', val(L.coolOff[sl.coolOff])) + '</dl></div>' +
      '<div class="b-card"><h3>My rules</h3>' + list(picked(sl.rules, L.rules), 'No rules chosen yet.') + '</div></section>';
  }

  function accountCard(a, i) {
    var self = SELF[a.type];
    return '<div class="b-card b-account"><h3>' + (i + 1) + '. ' + val(a.nickname || a.provider, 'Unnamed') + '</h3><dl>' + row('Type', val(L.type[a.type])) + row('Company or wallet brand', val(a.provider)) + row('In whose name', val(a.holder)) +
      (self || a.device.trim() ? row('Where the device is kept', val(a.device)) : '') + (self || a.backup.trim() ? row('Where the backup is kept', val(a.backup)) : '') + row('Who else knows where', val(a.knows)) + (a.notes.trim() ? row('Notes', esc(a.notes.trim())) : '') + '</dl></div>';
  }
  function sectionInventory(s) {
    var people = s.people;
    var contacts = people.contacts.filter(function (c) { return c.name.trim() || c.reach.trim(); });
    return '<section class="b-section" id="b-inventory">' + sectionHead(3, 'Wallet & account inventory', 'Where things are, never how to open them.') +
      '<p class="b-stamp">No passwords, PINs, recovery words, passphrases or private keys are written here, on purpose. Backups are described by place only.</p>' +
      (s.accounts.filter(used).length ? s.accounts.filter(used).map(accountCard).join('') : '<p class="b-muted">No accounts or wallets listed yet.</p>') +
      '<div class="b-card"><h3>Trusted people</h3><dl>' + row('Executor or person in charge', val(people.executor) + (people.executorRelation.trim() ? ' · ' + esc(people.executorRelation.trim()) : '') + (people.executorContact.trim() ? '<br>' + esc(people.executorContact.trim()) : '')) +
      contacts.map(function (c) { return row(L.role[c.role] || 'Contact', val(c.name) + (c.reach.trim() ? '<br>' + esc(c.reach.trim()) : '')); }).join('') +
      row('Will and estate documents are kept', val(people.willLocation)) + row('Estate attorney', val(L.attorneySeen[people.attorneySeen])) + '</dl></div></section>';
  }

  function letterTo(s) { return (s.letter.to.trim() || s.people.executor.trim()); }
  function sectionLetter(s) {
    var to = letterTo(s), me = s.owner.name.trim(), helpers = [];
    if (s.people.executor.trim()) helpers.push(esc(s.people.executor.trim()));
    s.people.contacts.forEach(function (c) { if (c.name.trim() && (c.role === 'attorney' || c.role === 'tech' || c.role === 'cpa')) helpers.push(esc(c.name.trim()) + ' (' + esc(L.role[c.role].toLowerCase()) + ')'); });
    var places = s.accounts.filter(used).map(function (a) { return '<li><strong>' + val(a.nickname || a.provider, 'Unnamed') + '</strong>: ' + esc((L.type[a.type] || 'Account').split(' (')[0]) + (a.provider.trim() && a.nickname.trim() ? ', ' + esc(a.provider.trim()) : '') + '</li>'; });
    return '<section class="b-section b-letter" id="b-letter">' + sectionHead(2, 'Letter to my executor & family', 'Plain words for the people who may one day need them.') +
      '<div class="b-paper"><p>' + (to ? 'Dear ' + esc(to) + ',' : 'To my family and the person handling my affairs,') + '</p>' +
      '<p>If you’re reading this, you may be helping our family after something has happened to me. Thank you. This letter explains, in plain language, the Bitcoin I own, where the records are, and the first safe steps to take. It’s here so you can understand what exists and who to contact. It does not contain passwords, recovery words or private keys.</p>' +
      (s.letter.note.trim() ? '<div class="b-note b-personal">' + para(s.letter.note) + '</div>' : '') +
      '<h3>What Bitcoin is</h3><p>Bitcoin is a form of digital money. Some of mine may be held by a company, like a bank account in my name. Some may be in a wallet I controlled myself. For that kind, the ability to move it depends on a device and a backup kept somewhere safe, and no company or court can reset it if the backup is lost. That’s why the steps below are slow and careful on purpose.</p>' +
      '<h3>Where it is</h3>' + (places.length ? '<ul class="b-list">' + places.join('') + '</ul><p>Section 3 of this binder describes each one, including where devices and backups are kept.</p>' : '<p>Section 3 of this binder lists my accounts and wallets.</p>') +
      '<h3>First safe steps</h3><ol class="b-steps">' +
      '<li><strong>Don’t rush.</strong> Bitcoin doesn’t need to be moved or sold right away. Anyone who insists on urgency is a warning sign.</li>' +
      '<li><strong>Leave devices and backups where they are.</strong> Don’t reset, update, throw away or give away any device. Don’t photograph, type or copy any backup.</li>' +
      '<li><strong>Never share recovery words, keys, passwords or codes</strong> with anyone who contacts you, including people who say they’re from an exchange, a wallet company, the government or a “recovery service.” Real support never asks for them.</li>' +
      '<li><strong>Talk to ' + (helpers.length ? helpers.join(', ') : 'my executor and an estate attorney') + '</strong> before doing anything with the bitcoin.</li>' +
      '<li><strong>For accounts at a company,</strong> contact its official support by typing its website address yourself, not by clicking a link in a message. Ask about its process for a deceased account holder. Expect to need a death certificate and proof of your legal authority.</li>' +
      '<li><strong>For wallets I controlled,</strong> get help from someone I named in this binder, working with the estate attorney. Don’t hand devices or backups to anyone to “take care of it.”</li>' +
      '<li><strong>Keep the records together.</strong> Section 5 says where my tax and transaction records are kept. They’ll matter for the estate and for taxes.</li></ol>' +
      '<p>My will and other legal documents decide who inherits. This letter only helps you find things.</p>' +
      '<p class="b-sign">' + (me ? 'With love,<br>' + esc(me) : 'With love,') + '</p></div></section>';
  }

  function sectionReview(s, today) {
    var next = nextReview(s.review, today);
    return '<section class="b-section" id="b-review">' + sectionHead(4, 'Yearly review checklist', 'Once a year, about 30 minutes. Then print a fresh copy.') +
      '<dl class="b-card">' + row('My review date', s.review.month ? esc(MONTHS[parseInt(s.review.month, 10) - 1] + ' ' + (parseInt(s.review.day, 10) || 1)) + ', every year' : blankLine()) + row('Next review', next ? esc(longDate(next)) : blankLine()) + '</dl>' +
      CHECKLIST.map(function (g) { return '<div class="b-card b-check"><h3>' + esc(g[0]) + '</h3><ul>' + g[1].map(function (i) { return '<li><span class="b-box" aria-hidden="true"></span>' + esc(i) + '</li>'; }).join('') + '</ul></div>'; }).join('') +
      '<p class="b-muted">Reviewed on ______________ by ______________</p></section>';
  }

  function sectionRecords(s) {
    var r = s.records;
    return '<section class="b-section" id="b-records">' + sectionHead(5, 'Records & cost basis', 'What I paid matters when anything is sold, given or inherited.') +
      '<div class="b-card"><dl>' + row('Transaction exports and tax records are kept', val(r.exports)) + row('Tax software or method', val(r.software)) + row('Tax preparer', val(r.preparer)) + row('Cost-basis records', val(L.basis[r.basis])) + (r.notes.trim() ? row('Notes', esc(r.notes.trim())) : '') + '</dl></div>' +
      '<div class="b-card"><h3>Why this matters</h3><p>The IRS treats digital assets like Bitcoin as property. Your “basis” is generally what you paid, including fees. Keep records of purchases, sales, transfers and fair market values. Generally, keep records for property until the period of limitations expires for the year you dispose of it. Starting with 2025 sales, U.S. brokers report digital-asset sales on Form 1099-DA.</p>' +
      '<p>To organize exports from several accounts, use the free <a href="https://pymtw.com/tools/bitcoin-tax-lot-cleanup/">Bitcoin Tax-Lot Cleanup</a> tool: pymtw.com/tools/bitcoin-tax-lot-cleanup/</p></div></section>';
  }

  function sources() {
    return '<section class="b-section b-sources" id="b-sources"><header class="b-head"><p class="b-num">Sources & notes</p><h2>Where this comes from</h2></header><ul class="b-src">' +
      SOURCES.map(function (x) { return '<li>' + esc(x[0]) + '<br><a href="' + esc(x[1]) + '">' + esc(x[1]) + '</a></li>'; }).join('') + '</ul>' +
      '<p class="b-muted">Made with the Bitcoin Household Plan from Put Your Money to Work (pymtw.com/tools/bitcoin-household-plan/). Educational only, not financial, tax or legal advice. It does not replace a will, trust or advice from an estate attorney or tax professional. It offers no opinion on whether to buy or sell Bitcoin.</p></section>';
  }

  function renderBinder(state, today) {
    var s = sanitize(state); today = today || new Date();
    var prepared = parseDate(s.owner.prepared) || today, next = nextReview(s.review, today);
    var who = s.owner.household.trim() || s.owner.name.trim();
    var cover = '<section class="b-cover" id="b-cover"><p class="b-brand">PYMTW · Put Your Money to Work</p><div class="b-cover-main"><p class="b-kicker">Household Bitcoin Plan</p><h1>' + (who ? esc(who) : 'Our household') + '</h1><p class="b-cover-sub">Our Bitcoin, written down calmly: why we hold it, where it is, and what to do.</p></div>' +
      '<dl class="b-cover-meta">' + row('Prepared', esc(longDate(prepared))) + row('Next review', next ? esc(longDate(next)) : 'Not set') + '</dl>' +
      '<p class="b-cover-safe"><strong>This binder contains no passwords, PINs, recovery words or private keys.</strong> Keep it that way. Store it somewhere private, like your will.</p>' +
      '<ol class="b-toc"><li><span>1</span>My Bitcoin policy</li><li><span>2</span>Letter to my executor &amp; family</li><li><span>3</span>Wallet &amp; account inventory</li><li><span>4</span>Yearly review checklist</li><li><span>5</span>Records &amp; cost basis</li></ol></section>';
    return '<article class="binder-doc" aria-label="Your Household Bitcoin Plan binder">' + cover + sectionPolicy(s) + sectionLetter(s) + sectionInventory(s) + sectionReview(s, today) + sectionRecords(s) + sources() + '</article>';
  }

  function renderLetter(state) { return sectionLetter(sanitize(state)); }
  function used(o) { return Object.keys(o).some(function (k) { return String(o[k] || '').trim(); }); }

  var api = { renderLetter: renderLetter, used: used, APP: APP, VERSION: VERSION, L: L, SELF: SELF, MONTHS: MONTHS, CHECKLIST: CHECKLIST, SOURCES: SOURCES, blank: blank, account: account, contact: contact, sanitize: sanitize, strings: strings, exportFile: exportFile, parseFile: parseFile, nextReview: nextReview, longDate: longDate, buildIcs: buildIcs, renderBinder: renderBinder, esc: esc, ymd: ymd };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HHPBinder = api;
})(this);
