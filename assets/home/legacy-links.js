/* Existing Bitcoin fragment links now belong to /bitcoin/. */
(() => {
  const bitcoinIds = new Set(["btc-price-bar", "btc-price-value", "btc-price-change", "btc-change-arrow", "btc-change-value", "btc-market-cap", "btc-volume", "btc-price-updated", "particle-canvas", "navbar", "nav-links", "nav-toggle", "hero", "assessment-band", "pathways", "why-bitcoin", "getting-started", "edu-books", "edu-podcasts", "edu-articles", "edu-mobile-wallets", "edu-hardware-wallets", "edu-multisig", "edu-exchanges", "edu-dca-tools", "edu-buying-guides", "edu-self-custody", "edu-seed-phrase", "edu-cold-storage", "resources", "resources-grid", "learn", "quiz-container", "quiz-progress-bar", "quiz-difficulty-badge", "quiz-counter", "quiz-question", "quiz-options", "quiz-feedback", "quiz-next", "quiz-score", "featured-programs", "testimonials", "faq", "newsletter-form", "newsletter-form-status", "subscribe-modal", "subscribe-modal-close", "modal-newsletter-form", "modal-email-input", "modal-newsletter-status"]);
  function routeLegacyFragment() {
    let id;
    try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
    if (bitcoinIds.has(id)) location.replace('/bitcoin/' + location.search + location.hash);
  }
  routeLegacyFragment();
  window.addEventListener('hashchange', routeLegacyFragment);
})();
