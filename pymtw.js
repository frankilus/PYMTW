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
    { label: "Home", href: "index.html" },
    { label: "Start Here", href: "start-here.html" },
    {
      label: "Tools",
      children: [
        { label: "Bitcoin Readiness Assessment", href: "assessment.html" },
        { label: "DCA Calculator", href: "dca.html" },
        { label: "Net-Worth Calculator", href: "calculator.html" },
        { label: "Performance Comparison", href: "performance.html" },
        { label: "Resource Library", href: "resources.html" }
      ]
    },
    {
      label: "Programs",
      children: [
        { label: "Programs Overview", href: "programs.html" },
        { label: "Live Workshops", href: "programs.html#workshops" },
        { label: "Private Education", href: "programs.html#private" },
        { label: "Self-Custody Workshop", href: "workshop-self-custody.html" },
        { label: "Membership", href: "membership.html" },
        { label: "Corporate Education", href: "corporate.html" }
      ]
    },
    { label: "Book", href: "/book" },
    { label: "Newsletter", href: "newsletter.html" },
    { label: "About", href: "about.html" }
  ];

  var TRUST_ITEMS = [
    "Never asks for your seed phrase or private keys",
    "Never takes custody of your funds",
    "Never executes trades on your behalf",
    "Education — not individualized investment advice"
  ];

  function shieldIcon() {
    return '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>';
  }

  function caret() {
    return '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M2 4l3 3 3-3"/></svg>';
  }

  var activePage = (document.body.getAttribute("data-page") || "").toLowerCase();

  function isActive(item) {
    if (!item.href) return false;
    var key = item.href.replace(/\.html.*$/, "").replace(/^\//, "");
    return key === activePage;
  }

  function buildNav() {
    var items = NAV.map(function (item) {
      if (item.children) {
        var childActive = item.children.some(isActive);
        var menu = item.children.map(function (c) {
          return '<li><a href="' + c.href + '">' + c.label + "</a></li>";
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
      '<a href="index.html" class="nav-logo"><span class="logo-icon">₿</span>' +
      '<span class="logo-text">PYMTW</span></a>' +
      '<ul class="nav-links" id="nav-links">' + items +
      '<li><a href="assessment.html" class="btn btn-primary btn-sm nav-cta">Assess</a></li>' +
      "</ul>" +
      '<button class="nav-toggle" id="nav-toggle" aria-label="Toggle menu" aria-expanded="false">' +
      "<span></span><span></span><span></span></button>" +
      "</div></nav>"
    );
  }

  function buildTrustBar() {
    var items = TRUST_ITEMS.map(function (t) {
      return '<span class="trust-bar-item">' + shieldIcon() + "<span>" + t + "</span></span>";
    }).join("");
    return '<div class="trust-bar"><div class="trust-bar-inner">' + items + "</div></div>";
  }

  function buildFooter() {
    var year = new Date().getFullYear();
    return (
      '<footer class="footer"><div class="container">' +
      '<div class="footer-grid">' +
      '<div class="footer-brand">' +
      '<a href="index.html" class="nav-logo"><span class="logo-icon">₿</span><span class="logo-text">PYMTW</span></a>' +
      "<p>Practical Bitcoin education for working professionals who want long-term exposure without trading, hype, or unnecessary complexity.</p>" +
      '<a href="newsletter.html" class="footer-newsletter-link">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 4L12 13 2 4"/></svg>' +
      " Get the free newsletter</a></div>" +
      '<div class="footer-links"><h4>Learn</h4><ul>' +
      '<li><a href="start-here.html">Start Here</a></li>' +
      '<li><a href="assessment.html">Readiness Assessment</a></li>' +
      '<li><a href="resources.html">Resource Library</a></li>' +
      '<li><a href="whitepaper.html">The Whitepaper</a></li>' +
      '<li><a href="videos.html">Video Library</a></li>' +
      '<li><a href="/book">The Book</a></li>' +
      "</ul></div>" +
      '<div class="footer-links"><h4>Programs</h4><ul>' +
      '<li><a href="programs.html#workshops">Live Workshops</a></li>' +
      '<li><a href="programs.html#private">Private Education</a></li>' +
      '<li><a href="membership.html">Membership</a></li>' +
      '<li><a href="corporate.html">Corporate & Speaking</a></li>' +
      '<li><a href="starter-kit.html">Starter Kit</a></li>' +
      '<li><a href="services.html">All Services</a></li>' +
      "</ul></div>" +
      '<div class="footer-links"><h4>Trust</h4><ul>' +
      '<li><a href="security-promise.html">Security Promise</a></li>' +
      '<li><a href="legal.html#disclaimer">Educational Disclaimer</a></li>' +
      '<li><a href="legal.html#privacy">Privacy Policy</a></li>' +
      '<li><a href="legal.html#affiliate">Affiliate Disclosure</a></li>' +
      '<li><a href="legal.html#terms">Terms & Policies</a></li>' +
      '<li><a href="about.html">About</a></li>' +
      "</ul></div>" +
      "</div>" +
      '<div class="footer-bottom">' +
      "<p><strong>Educational disclaimer:</strong> PYMTW provides general educational information about Bitcoin, technology, custody, and financial concepts. " +
      "Nothing on this website constitutes individualized investment, tax, legal, accounting, or financial advice. " +
      "Bitcoin is volatile and can decline substantially in value. Past performance does not predict future results.</p>" +
      '<p class="footer-copy">&copy; ' + year + " Put Your Money to Work in Bitcoin (PYMTW). All rights reserved. " +
      "Founder &amp; educator: Frank W. Jerome.</p>" +
      "</div></div></footer>"
    );
  }

  /* ---------- Behaviors: scroll state, mobile toggle, dropdowns ---------- */
  function wireNav() {
    var navbar = document.getElementById("navbar");
    var toggle = document.getElementById("nav-toggle");
    var links = document.getElementById("nav-links");

    window.addEventListener("scroll", function () {
      if (!navbar) return;
      if (window.scrollY > 20) navbar.classList.add("scrolled");
      else navbar.classList.remove("scrolled");
    });
    if (window.scrollY > 20 && navbar) navbar.classList.add("scrolled");

    if (toggle && links) {
      toggle.addEventListener("click", function () {
        var open = links.classList.toggle("active");
        toggle.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });
      links.addEventListener("click", function (e) {
        if (e.target.closest("a") && !e.target.closest(".nav-dropdown-trigger")) {
          toggle.classList.remove("active");
          links.classList.remove("active");
          toggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
          document.querySelectorAll(".nav-dropdown").forEach(function (dd) { dd.classList.remove("open"); });
        }
      });
    }
    document.querySelectorAll(".nav-dropdown-trigger").forEach(function (trigger) {
      trigger.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          trigger.parentElement.classList.toggle("open");
        }
      });
    });
  }

  // Analytics + click tracking are provided by pymtw-config.js (loaded site-wide).
  // Fallback no-op so this file is safe even if the config isn't present.
  window.pymtwTrack = window.pymtwTrack || function () {};

  /* ---------- Mount ---------- */
  function mount() {
    var header = document.getElementById("site-header");
    if (header) header.innerHTML = buildNav() + buildTrustBar();
    var footer = document.getElementById("site-footer");
    if (footer) footer.innerHTML = buildFooter();
    wireNav();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
