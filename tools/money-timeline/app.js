(function () {
var T = window.PT_TIMELINE, form = PT.$('#wiz'), KEY = 'pt-money-timeline', NOW = new Date();
var COLORS = { green: '#0a7c55', amber: '#d98a00', red: '#d23b3b' };
PT.$$('.goal').forEach(function (g) { var c = g.querySelector('input[type=checkbox]'); var s = function () { g.classList.toggle('on', c.checked); }; c.addEventListener('change', s); s(); });
form._v_goals = function () { if (!PT.$$('.goal input[type=checkbox]').some(function (c) { return c.checked; })) return 'Pick at least one goal.'; };
try { var saved = JSON.parse(localStorage.getItem(KEY) || 'null'); if (saved) { Object.keys(saved).forEach(function (k) { var el = form.querySelector('[name="' + k + '"]'); if (!el) return; if (el.type === 'checkbox') { el.checked = !!saved[k]; el.dispatchEvent(new Event('change')); } else el.value = saved[k]; }); } } catch (e) {}
function toPlan(v) {
  var G = {};
  if (v.g_emergency) G.emergency = { months: v.em_months || 6, year: v.em_year || null };
  if (v.g_debt && v.debt > 0) G.debt = { year: v.debt_year || null };
  if (v.g_home) G.home = { amount: v.home_amount, year: v.home_year || null };
  if (v.g_college) G.college = { amount: v.col_amount, year: v.col_year || null };
  var ra = parseFloat(String(v.ret_amount || '').replace(/[,$\s]/g, ''));
  if (v.g_retire) G.retire = { age: v.ret_age || 67, amount: ra > 0 ? ra : 10 * (v.income || 0), rule: !(ra > 0) };
  return { age: v.age, startYear: NOW.getFullYear(), startMonth: NOW.getMonth(), income: v.income, cash: v.cash, retirement: v.retirement, expenses: v.expenses, debt: v.debt, debtApr: v.debtApr, debtPayment: v.debtPayment, monthlySave: v.monthlySave, retireContrib: v.retireContrib, goals: G };
}
var W = 1000, H = 350, AX = 170, L = 40, R = 40, LANES = [[1, 40], [0, 40], [1, 88], [0, 88], [1, 136], [0, 126]];
function draw(svg, p, ms) {
  var y0 = p.startYear + p.startMonth / 12, last = y0 + 10;
  ms.forEach(function (m) { if (m.when) last = Math.max(last, m.when); if (m.targetYear) last = Math.max(last, m.targetYear); });
  last = Math.min(Math.ceil(last + 1), p.startYear + (100 - p.age));
  var span = last - y0, X = function (yr) { return L + Math.pow(Math.max(0, Math.min(1, (yr - y0) / span)), 0.62) * (W - L - R); }; // compressed scale: more room for the near term
  var nowYr = y0;
  if (!svg._built || svg._span !== span) {
    var step = span > 14 ? 5 : 2, s = '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + AX + '" y2="' + AX + '" stroke="#e3e3e8" stroke-width="4" stroke-linecap="round"/>';
    for (var yr = Math.ceil((y0 + 1) / step) * step, prevX = -99; yr <= last; yr += step) if (X(yr) - prevX > 48 && X(yr) < W - 30 && (prevX = X(yr))) s += '<g><line x1="' + X(yr) + '" x2="' + X(yr) + '" y1="' + (AX - 6) + '" y2="' + (AX + 6) + '" stroke="#c9c9cf"/><text x="' + X(yr) + '" y="' + (H - 22) + '" text-anchor="middle" font-size="13" fill="#6e6e73" font-weight="600">' + yr + '</text><text x="' + X(yr) + '" y="' + (H - 6) + '" text-anchor="middle" font-size="11" fill="#a1a1a6">age ' + Math.floor(p.age + yr - y0) + '</text></g>';
    s += '<g transform="translate(' + X(nowYr) + ',0)"><circle cy="' + AX + '" r="7" fill="#1d1d1f"/><text y="' + (AX + 30) + '" text-anchor="middle" font-size="12" font-weight="700" fill="#1d1d1f">Today</text></g><g class="targets"></g><g class="mss"></g>';
    svg.innerHTML = s; svg._built = true; svg._span = span; svg._g = {};
  }
  var tg = svg.querySelector('.targets'); tg.innerHTML = ms.filter(function (m) { return m.targetYear; }).map(function (m) { return '<g transform="translate(' + X(m.targetYear + 0.5) + ',0)"><circle cy="' + AX + '" r="6" fill="#fff" stroke="' + COLORS[m.status] + '" stroke-width="2" stroke-dasharray="2 2"/></g>'; }).join('');
  var mg = svg.querySelector('.mss'), laneEnd = LANES.map(function () { return -1e9; });
  ms.forEach(function (m, i) {
    var xx = m.when ? X(m.when) : W - R, li = 0, best = 0;
    for (li = 0; li < LANES.length; li++) { if (xx - laneEnd[li] > 150) break; if (laneEnd[li] < laneEnd[best]) best = li; }
    if (li === LANES.length) li = best; laneEnd[li] = xx;
    var g = svg._g[m.id], up = !!LANES[li][0], len = LANES[li][1], ty = up ? AX - len : AX + len;
    if (!g) {
      g = document.createElementNS('http://www.w3.org/2000/svg', 'g'); g.setAttribute('class', 'ms');
      g.innerHTML = '<line class="stem" y1="' + AX + '" stroke-width="1.5"/><circle class="dot" cy="' + AX + '" r="11" stroke="#fff" stroke-width="3"/><text class="t1" text-anchor="middle" font-size="13" font-weight="700" fill="#1d1d1f"></text><text class="t2" text-anchor="middle" font-size="12" fill="#6e6e73"></text>';
      mg.appendChild(g); svg._g[m.id] = g; g.style.transform = 'translateX(' + X(nowYr) + 'px)';
    }
    var x = m.when ? X(m.when) : W - R, c = COLORS[m.status];
    g.querySelector('.stem').setAttribute('y2', ty + (up ? 6 : -16)); g.querySelector('.stem').setAttribute('stroke', c);
    g.querySelector('.dot').setAttribute('fill', c);
    var t1 = g.querySelector('.t1'), t2 = g.querySelector('.t2'), anchor = x < 110 ? 'start' : x > W - 110 ? 'end' : 'middle';
    t1.setAttribute('y', up ? ty - 12 : ty + 2); t2.setAttribute('y', up ? ty + 4 : ty + 18); t1.setAttribute('text-anchor', anchor); t2.setAttribute('text-anchor', anchor);
    t1.textContent = m.label; t2.textContent = m.when ? (m.months === 0 ? 'Done' : m.year + ' · age ' + m.age) : 'Not reached';
    requestAnimationFrame(function () { g.style.transform = 'translateX(' + x + 'px)'; });
  });
  Object.keys(svg._g).forEach(function (k) { if (!ms.some(function (m) { return m.id === k; })) { svg._g[k].remove(); delete svg._g[k]; } });
}
PT.wizard(form, function (v) {
  if (v.remember) { var keep = {}; PT.$$('input[name]', form).forEach(function (el) { keep[el.name] = el.type === 'checkbox' ? el.checked : el.value; }); try { localStorage.setItem(KEY, JSON.stringify(keep)); } catch (e) {} } else { try { localStorage.removeItem(KEY); } catch (e) {} }
  var p = toPlan(v), out = PT.$('#out'), w = { extraSave: 0, extraDebt: 0, ret: 0.05 }, shareT;
  var hasDebt = !!p.goals.debt;
  out.innerHTML = '<div class="big-label">Your next milestone</div><div class="big" id="tl-big"></div><p class="sentence" id="tl-say"></p>' +
    '<div class="chart"><div class="legend"><b>Your money timeline</b><span><i style="background:#0a7c55"></i>On track</span><span><i style="background:#d98a00"></i>Up to 2 years late</span><span><i style="background:#d23b3b"></i>Later, or not reached</span><span>◌ target year</span></div><div class="tl-wrap" tabindex="0" aria-label="Timeline, scroll sideways on small screens"><svg class="tl" id="tl" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Timeline of your money milestones" font-family="inherit"></svg></div>' +
    '<p class="swipe">Swipe the timeline to see more →</p><div class="sliders"><div class="sl"><label>Extra savings <b id="v-es">$0/mo</b></label><input type="range" id="s-es" min="0" max="2000" step="25" value="0"><small>What if you saved more each month?</small></div>' +
    '<div class="sl"' + (hasDebt ? '' : ' style="opacity:.45"') + '><label>Extra debt payment <b id="v-ed">$0/mo</b></label><input type="range" id="s-ed" min="0" max="1500" step="25" value="0"' + (hasDebt ? '' : ' disabled') + '><small>' + (hasDebt ? 'Paid on top of your current payments.' : 'No debt goal selected.') + '</small></div>' +
    '<div class="sl"><label>Return assumption <b id="v-r">5%</b></label><input type="range" id="s-r" min="0" max="10" step="0.5" value="5"><small>An assumption, after inflation, not a prediction.</small></div></div></div>' +
    '<div class="mlist" id="mlist"></div><div class="share-host" id="tlshare"></div>' +
    '<div class="next"><div><div class="k">Your next step</div><p id="tl-next"></p></div></div>' +
    '<p class="again"><button class="linkbtn" type="button" onclick="window.scrollTo({top:0,behavior:\'smooth\'})">↺ Change my answers</button>' + (v.remember ? ' · <button class="linkbtn" type="button" id="forget">Forget my answers</button>' : '') + '</p>';
  var svg = PT.$('#tl');
  function upd() {
    var s = T.summary(p, w), ms = s.milestones, nextM = ms.filter(function (m) { return m.months > 0; })[0] || ms[0];
    PT.$('#tl-big').textContent = nextM && nextM.when ? nextM.label + ' by ' + nextM.year : 'Let’s adjust the plan';
    PT.$('#tl-say').textContent = s.sentence; PT.$('#tl-next').textContent = s.next.text;
    PT.$('#mlist').innerHTML = ms.map(function (m) { return '<div class="mi ' + m.status + '"><small>' + m.label + '</small><b>' + (m.when ? (m.months === 0 ? 'Done' : m.year) : 'Not reached') + '</b><span>' + (m.when && m.months ? 'age ' + m.age + ' · ' : '') + (m.targetYear ? 'target ' + m.targetYear : 'no target year') + (m.id === 'retire' && p.goals.retire.rule ? ' · 10× income rule of thumb' : '') + '</span></div>'; }).join('');
    draw(svg, p, ms);
    clearTimeout(shareT); shareT = setTimeout(function () { PT.shareButton(PT.$('#tlshare'), 'money-timeline', nextM && nextM.when ? { first: nextM.label.toLowerCase().replace('debt-free', 'debt-free'), year: nextM.year } : {}); }, 250);
  }
  [['s-es', 'extraSave', 'v-es', function (x) { return PT.money(x) + '/mo'; }, 1], ['s-ed', 'extraDebt', 'v-ed', function (x) { return PT.money(x) + '/mo'; }, 1], ['s-r', 'ret', 'v-r', function (x) { return (x * 100).toFixed(1).replace(/\.0$/, '') + '%'; }, 0.01]].forEach(function (d) {
    PT.$('#' + d[0]).addEventListener('input', function (e) { w[d[1]] = parseFloat(e.target.value) * d[4]; PT.$('#' + d[2]).textContent = d[3](w[d[1]]); upd(); });
  });
  var fb = PT.$('#forget'); if (fb) fb.onclick = function () { try { localStorage.removeItem(KEY); } catch (e) {} fb.textContent = '✓ Forgotten on this device'; fb.disabled = true; };
  upd();
  PT._tl = { p: p, w: w, upd: upd };
});
if (PT.isDemo) { for (var i = 0; i < 5; i++) PT.$('[data-next]').click(); }
})();
