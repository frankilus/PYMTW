/* Bitcoin Household Plan: license key check (used only when the paywall flag is on).
   This is the ONLY file on the page that makes a network request. It sends exactly two fields,
   the license key the person typed and a fixed instance label, to Lemon Squeezy's public License
   API (cfg.licenseApi). It never sees the plan's answers. The page CSP allows only that host. */
(function (root) {
  'use strict';
  var STORE_KEY = 'pymtw-hhp-license-v1';
  var TIMEOUT = 12000;

  function normalize(key) { return String(key == null ? '' : key).replace(/\s+/g, ''); }
  /* Lemon Squeezy keys look like a UUID; accept letters, digits and dashes so a format change still works. */
  function looksLikeKey(key) { return /^[A-Za-z0-9][A-Za-z0-9-]{7,99}$/.test(key); }
  function mask(key) { var k = normalize(key); return k.length > 4 ? '••••' + k.slice(-4) : '••••'; }

  function fail(reason, message) { return { ok: false, reason: reason, message: message }; }
  var MSG = {
    format: 'That doesn’t look like a license key. It’s a long code with dashes, in your receipt email from Lemon Squeezy. Copy and paste it in full.',
    invalid: 'We couldn’t find that key. Check that you pasted the whole key from your receipt email, then try again.',
    product: 'That key is for a different product. Use the key from your Bitcoin Household Plan receipt.',
    expired: 'That key has expired. Reply to your receipt email and we’ll sort it out.',
    disabled: 'That key has been turned off, for example after a refund. If you think that’s a mistake, reply to your receipt email.',
    limit: 'That key has been used on too many devices. Reply to your receipt email and we’ll help.',
    busy: 'Too many tries in a short time. Wait a minute, then try again.',
    service: 'The license service didn’t answer as expected. Your key wasn’t saved. Please try again in a few minutes.',
    network: 'We couldn’t reach the license service. Check your internet connection and try again. Your answers are safe on this device.'
  };

  /* Turn a License API response into { ok, reason, message, record }. Pure, so it can be unit tested. */
  function interpret(status, data, cfg, key) {
    if (!data || typeof data !== 'object') return fail('service', MSG.service);
    var lk = data.license_key && typeof data.license_key === 'object' ? data.license_key : {};
    var meta = data.meta && typeof data.meta === 'object' ? data.meta : null;
    var err = String(data.error || '');
    if (status === 429) return fail('busy', MSG.busy);
    if (lk.status === 'expired' || /expired/i.test(err)) return fail('expired', MSG.expired);
    if (lk.status === 'disabled' || /disabled/i.test(err)) return fail('disabled', MSG.disabled);
    if (meta && (Number(meta.product_id) !== cfg.productId || Number(meta.store_id) !== cfg.storeId)) return fail('product', MSG.product);
    if (/activation limit/i.test(err)) return fail('limit', MSG.limit);
    if (status === 200 && data.activated === true && !err && meta && (lk.status === 'active' || lk.status === 'inactive')) {
      return { ok: true, reason: 'ok', message: 'Unlocked. Your binder is ready to print or save as a PDF.',
        record: { v: 1, key: key, instance: data.instance && data.instance.id ? String(data.instance.id) : '', productId: cfg.productId, storeId: cfg.storeId, at: new Date().toISOString() } };
    }
    if (status >= 500) return fail('service', MSG.service);
    return fail('invalid', MSG.invalid);
  }

  /* POST the key (and nothing else) to the License API. Resolves; never rejects. */
  function activate(rawKey, cfg, fetchImpl) {
    var key = normalize(rawKey), f = fetchImpl || (root.fetch && root.fetch.bind(root));
    if (!looksLikeKey(key)) return Promise.resolve(fail('format', MSG.format));
    if (!f || !cfg || !cfg.licenseApi) return Promise.resolve(fail('network', MSG.network));
    var ctl = typeof AbortController === 'function' ? new AbortController() : null;
    var timer = ctl ? setTimeout(function () { ctl.abort(); }, TIMEOUT) : null;
    var body = new URLSearchParams();
    body.set('license_key', key);
    body.set('instance_name', cfg.instanceName || 'browser');
    return f(cfg.licenseApi, { method: 'POST', mode: 'cors', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', headers: { Accept: 'application/json' }, body: body, signal: ctl ? ctl.signal : undefined })
      .then(function (res) { return res.json().catch(function () { return null; }).then(function (data) { return interpret(res.status, data, cfg, key); }); },
            function () { return fail('network', MSG.network); })
      .then(function (r) { if (timer) clearTimeout(timer); return r; });
  }

  /* ---------- the unlocked state, kept in this browser only ---------- */
  function storage() { try { return root.localStorage; } catch (e) { return null; } }
  function load(cfg) {
    var st = storage(), rec = null;
    try { rec = st && JSON.parse(st.getItem(STORE_KEY) || 'null'); } catch (e) { rec = null; }
    if (!rec || typeof rec !== 'object' || !looksLikeKey(normalize(rec.key))) return null;
    if (rec.productId !== cfg.productId || rec.storeId !== cfg.storeId) return null;
    return rec;
  }
  function save(rec) { var st = storage(); if (!st) return false; try { st.setItem(STORE_KEY, JSON.stringify(rec)); return true; } catch (e) { return false; } }
  function clear() { var st = storage(); if (st) { try { st.removeItem(STORE_KEY); } catch (e) { /* nothing stored */ } } }

  var api = { STORE_KEY: STORE_KEY, MSG: MSG, normalize: normalize, looksLikeKey: looksLikeKey, mask: mask, interpret: interpret, activate: activate, load: load, save: save, clear: clear };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.HHPLicense = api;
})(this);
