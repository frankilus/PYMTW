/* Bitcoin 200-Week Moving Average Tracker: all math. No network access here (app.js loads the data).
   Weekly price = Sunday (00:00 UTC) daily average USD price. 200WMA = plain average of the latest 200 weekly prices,
   where the still-forming current week counts as the newest one. Multiple = price / 200WMA. */
(function (root) {
var WEEKS = 200, DAY = 86400000;
/* Zone edges are rounded plain-English cut-offs, not a trading signal. */
var ZONES = [
  { id: 'deep', name: 'Near or below average', lo: 0, hi: 1.1, color: '#0a7c55', fill: 'rgba(10,124,85,.20)', text: 'Below 1.1 times the 200-week average. This describes relative price, not fundamental value.' },
  { id: 'fair', name: 'Above average', lo: 1.1, hi: 2, color: '#1769a8', fill: 'rgba(23,105,168,.10)', text: 'From 1.1 to less than 2 times the 200-week average.' },
  { id: 'stretched', name: 'Elevated', lo: 2, hi: 3.5, color: '#d9730d', fill: 'rgba(217,115,13,.13)', text: 'From 2 to less than 3.5 times the 200-week average.' },
  { id: 'hot', name: 'Far above average', lo: 3.5, hi: Infinity, color: '#b42727', fill: 'rgba(180,39,39,.14)', text: 'At least 3.5 times the 200-week average. A high multiple alone cannot predict a reversal.' }
];
function zoneOf(m) { for (var i = 0; i < ZONES.length; i++) if (m < ZONES[i].hi) return ZONES[i]; return ZONES[ZONES.length - 1]; }
function parseDay(s) { var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
function isoDay(ms) { return new Date(ms).toISOString().slice(0, 10); }
/* data: parsed weekly.json. live: optional {price, date:'YYYY-MM-DD'}. Returns series with price/ma/mult per week. */
function build(data, live) {
  var t0 = parseDay(data.firstWeek), dates = [], price = data.weekly.slice();
  for (var i = 0; i < price.length; i++) dates.push(t0 + i * 7 * DAY);
  var cur = live && live.price > 0 ? live : data.latest, curMs = parseDay(cur.date), lastMs = dates[dates.length - 1];
  if (curMs > lastMs) { dates.push(curMs); price.push(cur.price); }
  else if (curMs === lastMs) { price[price.length - 1] = cur.price; }
  var ma = [], mult = [], sum = 0;
  for (var j = 0; j < price.length; j++) {
    sum += price[j]; if (j >= WEEKS) sum -= price[j - WEEKS];
    if (j >= WEEKS - 1) { ma.push(sum / WEEKS); mult.push(price[j] / ma[j]); } else { ma.push(null); mult.push(null); }
  }
  var n = price.length - 1;
  return { dates: dates, price: price, ma: ma, mult: mult, n: n, current: { date: isoDay(dates[n]), price: price[n], ma: ma[n], mult: mult[n], pct: price[n] / ma[n] - 1, zone: zoneOf(mult[n]) }, firstMa: WEEKS - 1 };
}
/* Share of weeks (that have a 200WMA) with a multiple at or below m. */
function shareAtOrBelow(s, m) {
  var c = 0, t = 0; for (var i = s.firstMa; i <= s.n; i++) { t++; if (s.mult[i] <= m) c++; } return t ? c / t : 0;
}
/* Per zone: weeks in it, share of all weeks, and the price change over the next 52 weeks (only weeks with a full year after). */
function zoneStats(s) {
  var total = s.n - s.firstMa + 1;
  return ZONES.map(function (z) {
    var weeks = 0, fwd = [];
    for (var i = s.firstMa; i <= s.n; i++) if (s.mult[i] >= z.lo && s.mult[i] < z.hi) { weeks++; if (i + 52 <= s.n) fwd.push(s.price[i + 52] / s.price[i] - 1); }
    fwd.sort(function (a, b) { return a - b; });
    var med = fwd.length ? (fwd.length % 2 ? fwd[(fwd.length - 1) / 2] : (fwd[fwd.length / 2 - 1] + fwd[fwd.length / 2]) / 2) : null;
    var up = fwd.filter(function (x) { return x > 0; }).length;
    return { zone: z, weeks: weeks, share: weeks / total, n: fwd.length, median: med, min: fwd.length ? fwd[0] : null, max: fwd.length ? fwd[fwd.length - 1] : null, upShare: fwd.length ? up / fwd.length : null };
  });
}
/* Longest spells below 1.0x: list of {start,end,weeks,low} so the page can say how rare and how long. */
function belowOne(s) {
  var out = [], cur = null;
  for (var i = s.firstMa; i <= s.n; i++) {
    if (s.mult[i] < 1) { if (!cur) cur = { start: s.dates[i], end: s.dates[i], weeks: 0, low: s.mult[i] }; cur.end = s.dates[i]; cur.weeks++; cur.low = Math.min(cur.low, s.mult[i]); }
    else if (cur) { out.push(cur); cur = null; }
  }
  if (cur) { cur.ongoing = true; out.push(cur); }
  return out;
}
var api = { WEEKS: WEEKS, ZONES: ZONES, zoneOf: zoneOf, build: build, shareAtOrBelow: shareAtOrBelow, zoneStats: zoneStats, belowOne: belowOne, parseDay: parseDay, isoDay: isoDay };
if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.WMA = api;
})(typeof window !== 'undefined' ? window : globalThis);
