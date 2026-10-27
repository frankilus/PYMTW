/* ============================================================
   PYMTW — Shared components & behaviors for interior/marketing
   pages. Injects a standardized nav, trust bar, and footer so
   the funnel stays consistent without hand-editing every page.
   Also provides a privacy-safe analytics helper.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Navigation model (single source of truth) ---------- */
  var NAV = [
  {
    "label": "Understand",
    "children": [
      {
        "label": "Start here",
        "href": "/start-here.html"
      },
      {
        "label": "Free playbook",
        "href": "/playbook.html"
      },
      {
        "label": "Video library",
        "href": "/videos.html"
      },
      {
        "label": "Whitepaper guide",
        "href": "/whitepaper.html"
      }
    ]
  },
  {
    "label": "Evaluate",
    "children": [
      {
        "label": "Readiness assessment",
        "href": "/assessment.html"
      },
      {
        "label": "DCA calculator",
        "href": "/dca.html"
      },
      {
        "label": "Net-worth calculator",
        "href": "/calculator.html"
      },
      {
        "label": "Performance comparison",
        "href": "/performance.html"
      }
    ]
  },
  {
    "label": "Protect",
    "children": [
      {
        "label": "Exchange or self-custody?",
        "href": "/bitcoin-on-exchange.html"
      },
      {
        "label": "Compare hardware wallets",
        "href": "/compare-hardware-wallets.html"
      },
      {
        "label": "Custody approaches",
        "href": "/compare-collaborative-vs-multisig.html"
      },
      {
        "label": "Bitcoin Household Plan",
        "href": "/tools/bitcoin-household-plan/"
      },
      {
        "label": "Our security promise",
        "href": "/security-promise.html"
      }
    ]
  },
  {
    "label": "Library",
    "href": "/resources.html"
  },
  {
    "label": "More",
    "children": [
      {
        "label": "Books",
        "href": "/compare-bitcoin-books.html"
      },
      {
        "label": "Newsletter",
        "href": "/newsletter.html"
      },
      {
        "label": "Programs & workshops",
        "href": "/programs.html"
      },
      {
        "label": "About & contact",
        "href": "/about.html"
      },
      {
        "label": "Money Tools",
        "href": "/tools/"
      },
      {
        "label": "PYMTW home",
        "href": "/"
      }
    ]
  }
];

  function shieldIcon() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  }

  function caret() {
    return '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 4l3 3 3-3"/></svg>';
  }

  var activePage = (document.body.getAttribute("data-page") || location.pathname.replace(/^\//, "").replace(/\.html$/, "").replace(/\/$/, "")).toLowerCase();

  function isActive(item) {
    if (!item.href) return false;
    var key = item.href.replace(/\.html.*$/, "").replace(/^\//, "").replace(/\/$/, "");
    return key === activePage;
  }

  function buildNav() {
    var items = NAV.map(function (item) {
      if (item.children) {
        var childActive = item.children.some(isActive);
        var menu = item.children.map(function (c) {
          return '<li><a href="' + c.href + '"' + (isActive(c) ? ' aria-current="page"' : '') + '>' + c.label + "</a></li>";
        }).join("");
        return (
          '<li class="nav-dropdown">' +
          '<a class="nav-dropdown-trigger' + (childActive ? " nav-active" : "") + '" href="#">' +
          item.label + " " + caret() + "</a>" +
          '<ul class="nav-dropdown-menu">' + menu + "</ul></li>"
        );
      }
      var attrs = item.external ? ' target="_blank" rel="noopener"' : "";
      var cls = isActive(item) ? ' class="nav-active"' : "";
      return "<li><a href=\"" + item.href + "\"" + attrs + cls + ">" + item.label + "</a></li>";
    }).join("");

    return (
      '<nav class="navbar" id="navbar"><div class="nav-container">' +
      '<a href="/" class="nav-logo" aria-label="PYMTW home — Put Your Money to Work"><span class="logo-icon">₿</span>' +
      '<span class="logo-text">PYMTW</span></a>' +
      '<ul class="nav-links" id="nav-links">' + items +
      "</ul>" +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">' +
      "<span></span><span></span><span></span></button>" +
      "</div></nav>"
    );
  }

  function buildTrustBar() {
    return '<div class="trust-bar"><div class="trust-bar-inner">' + shieldIcon() +
      '<span>Education only. Never share your seed phrase or private keys.</span> ' +
      '<a href="/security-promise.html">Our security promise</a></div></div>';
  }

  function buildFooter() {
    return "<footer class=\"footer\"><div class=\"container\"><div class=\"simple-footer-links\"><a href=\"/bitcoin/\">Bitcoin home</a><a href=\"/resources.html\">All resources</a><a href=\"/programs.html\">Programs &amp; workshops</a><a href=\"/newsletter.html\">Newsletter</a><a href=\"/about.html\">About &amp; contact</a><a href=\"/legal.html#privacy\">Privacy</a><a href=\"/legal.html#affiliate\">Affiliate disclosure</a><a href=\"/legal.html#terms\">Terms &amp; policies</a><a href=\"/\">PYMTW home</a></div><div class=\"footer-bottom\"><p><strong>Educational disclaimer:</strong> PYMTW provides general educational information about Bitcoin, technology, custody, and financial concepts. Nothing on this website constitutes individualized investment, tax, legal, accounting, or financial advice. Bitcoin is volatile and can decline substantially in value. Past performance does not predict future results.</p><p class=\"footer-copy\">Put Your Money to Work \u00b7 Frank W. Jerome</p></div></div></footer>";
  }

  /* ---------- Behaviors: scroll state, mobile toggle, dropdowns ---------- */
  // Analytics + click tracking are provided by pymtw-config.js (loaded site-wide).
  // Fallback no-op so this file is safe even if the config isn't present.
  window.pymtwTrack = window.pymtwTrack || function () {};

  /* ---------- Mount ---------- */
  function mount() {
    var header = document.getElementById("site-header");
    if (header) header.innerHTML = buildNav() + buildTrustBar();
    var footer = document.getElementById("site-footer");
    if (footer) footer.innerHTML = buildFooter();
    if (window.pymtwInitNav) window.pymtwInitNav();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
