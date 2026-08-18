/* ============================================================
   PYMTW — Site config + privacy-safe analytics + integration hooks
   Loaded on EVERY page (in <head>). Everything is OFF by default;
   fill in the CONFIG values below to activate integrations.
   No third-party scripts load and no events are sent until you do.
   ============================================================ */
(function () {
  "use strict";

  /* ---------------- CONFIG: fill these in to go live ---------------- */
  var CONFIG = window.PYMTW_CONFIG || {
    analytics: {
      // Google Analytics 4 Measurement ID, e.g. "G-XXXXXXXXXX".
      // Leave empty to keep analytics OFF (nothing loads, nothing is sent).
      ga4Id: "",
      // Set true temporarily to log events to the console for debugging.
      debug: false
    },
    // Direct-checkout URLs (Stripe Payment Link, Lemon Squeezy, Gumroad, etc.).
    // Any <a data-checkout="KEY"> is upgraded to this URL when set; until then
    // the link keeps its existing href (e.g. the waitlist form).
    // Recommended post-purchase redirect: https://www.pymtw.com/thank-you.html?source=KEY
    checkout: {
      "starter-kit": "",            // $29 Bitcoin Professional Starter Kit
      "workshop-professionals": "", // $79
      "workshop-self-custody": "",  // $129
      "workshop-family": "",        // $199
      "clarity": "",                // $149 private
      "intensive": "",              // $399 private
      "self-custody-readiness": "", // $499 private
      "membership-monthly": "",     // $29/mo
      "membership-annual": ""       // $290/yr
    },
    // Scheduling (Calendly / SavvyCal) link, used after purchase/intake.
    scheduling: {
      calendlyUrl: ""
    }
  };
  window.PYMTW_CONFIG = CONFIG;

  /* ---------------- Privacy-safe analytics ---------------- */
  // Guard: never forward obviously sensitive/financial fields, even by mistake.
  var SENSITIVE = /(amount|value|balance|networth|net_worth|worth|salary|income|price|holdings|btc_qty|quantity|account|ssn|card|password|seed|key)/i;

  function clean(props) {
    var out = {};
    Object.keys(props || {}).forEach(function (k) {
      if (SENSITIVE.test(k)) return;
      var v = props[k];
      if (typeof v === "number" || typeof v === "boolean" || typeof v === "string") out[k] = v;
    });
    return out;
  }

  // Public event API used across the site: pymtwTrack('event_name', { ...props })
  window.pymtwTrack = function (event, props) {
    var payload = clean(props);
    payload.event = event;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (window.gtag && CONFIG.analytics.ga4Id) {
      window.gtag("event", event, clean(props));
    }
    if (CONFIG.analytics.debug || window.PYMTW_DEBUG) console.debug("[pymtwTrack]", payload);
  };

  // Load GA4 only if a Measurement ID is configured.
  function loadGA() {
    var id = CONFIG.analytics.ga4Id;
    if (!id) return;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(id);
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    // anonymize_ip + no ad personalization by default; calculators never send values.
    window.gtag("config", id, { anonymize_ip: true, allow_google_signals: false });
  }

  /* ---------------- Checkout link upgrader ---------------- */
  // <a data-checkout="starter-kit"> becomes the configured checkout URL when set.
  function upgradeCheckoutLinks() {
    document.querySelectorAll("a[data-checkout]").forEach(function (a) {
      var key = a.getAttribute("data-checkout");
      var url = CONFIG.checkout && CONFIG.checkout[key];
      if (url) {
        a.setAttribute("href", url);
        a.setAttribute("data-checkout-live", "1");
      }
    });
  }

  /* ---------------- Global click tracking (no PII) ---------------- */
  function wireClickTracking() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href], button");
      if (!a) return;
      if (a.hasAttribute("data-track")) {
        window.pymtwTrack(a.getAttribute("data-track"), {
          label: a.getAttribute("data-track-label") || (a.textContent || "").trim().slice(0, 60)
        });
      }
      if (a.hasAttribute("data-checkout") && a.getAttribute("data-checkout-live")) {
        window.pymtwTrack("checkout_started", { product: a.getAttribute("data-checkout") });
      }
    });
  }

  function init() {
    loadGA();
    upgradeCheckoutLinks();
    wireClickTracking();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
