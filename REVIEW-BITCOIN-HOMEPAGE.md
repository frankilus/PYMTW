# Bitcoin homepage and simpler interior pages

Review only. Do not merge or deploy until approved.

## Visitor experience

The approved warm-white/orange design replaces `/bitcoin/` with three starting paths: **Understand, Evaluate, Protect**. Each reveals three existing resources and supports direct links, browser history, keyboard activation and a no-JavaScript fallback. The authentic second-edition book cover and existing newsletter handoff remain on the homepage.

The parent homepage keeps its distinct directory design. Money Tools remains green and its source is unchanged. A shared warm-white/orange theme covers 35 Bitcoin interiors; 32 active reading, tool and product pages also receive the simplification described below.

## Review findings and changes

| Finding | Result |
| --- | --- |
| Interior headers competed with nine top-level destinations and duplicated calls to action. | Five navigation groups: Understand, Evaluate, Protect, Library, More. The same shared header/footer now serves calculators and legacy standalone educational pages as well as guides. The security promise remains linked beside a concise reminder. |
| Start Here repeated the homepage's path picker. | A short introduction, one primary free-playbook action and a three-step learning sequence. |
| The resource library presented all metadata for every entry at once. | Five goal-based categories show matching resources directly: Understand Bitcoin; Buy & plan purchases; Store & protect Bitcoin; Handle taxes & inheritance; Explore data & research. Global search covers 49 entries (all 45 original resources plus links to four existing site pages). Costs, limitations and review notes open on demand. Full affiliate disclosure and security notices remain available. Filtering happens entirely in the browser. |
| Comparison guides mixed reading, large card grids and repeated sales offers. | On-page contents links, a narrower reading column, quieter criteria lists and one related-library link. Tables, limitations and security notices are preserved. |
| Calculator results led into multiple promotions. | One relevant next step after the tool. Every input, result, calculation, dataset, assumption and privacy note remains unchanged. |
| The whitepaper exposed long explanations all at once. | Existing key insights remain visible; each excerpt/explanation opens independently. Expand/collapse-all controls and chapter bookmarks reveal the requested explanation. |
| Programs repeated full syllabuses and package feature lists. | Optional syllabus/package details with visible pricing and inquiry actions. Workshop agendas, eligibility, policies and forms remain available. The family workshop's sole outline is open initially. |
| The playbook and book pages repeated promotional sections. | A calmer playbook introduction, fewer repeated calls to action, optional book chapter list and a clear route back to Bitcoin. Download, purchase and reader-toolkit request flows remain intact. |

Already concise pages (newsletter, security promise, about/contact and confirmation) receive the common navigation and spacing without unnecessary content rewrites. Legal content is preserved. The original learning archive and unfinished account pages are retained separately.

## Content, routes and integrations

- The previous Bitcoin homepage remains at `/bitcoin/explore/`; its body is byte-for-byte preserved from production. Its title/canonical/social/page-schema metadata reflect the library route, and it loads the Bitcoin theme.
- All 46 old homepage fragments, including earlier parent-homepage redirects, retain their destinations and query strings. All sitemap entries remain; the library route is added.
- Existing content IDs survive the simplification. Shared navigation IDs are now created by the common header on six standalone pages.
- All existing form markup and inline scripts are unchanged. The library adds a browser-only search form that makes no submissions. Inquiry payloads, checkout configuration, newsletter destinations, privacy settings and calculator code/data are unchanged.
- Comparison tables, security callouts, legal main content, resource metadata and DCA assumptions are checked against the prior review commit (`56cc9e6`). This is source preservation, not fresh verification of the underlying claims or provider details.
- Core calculator/provider scripts, parent homepage and Money Tools remain byte-for-byte unchanged. The shared navigation renderer is intentionally updated.
- Without JavaScript, native resource disclosures and guide links still work, all library entries remain visible, and a simple Bitcoin navigation fallback is available. Dynamic calculators continue to require JavaScript.

## Verification

Serve the repository locally with `python3 -m http.server 8771 --bind 127.0.0.1` and run:

```sh
node tests/bitcoin-homepage.cjs
python3 tests/bitcoin-interiors-preservation.py
python3 tests/bitcoin-static.py
node tests/bitcoin-homepage-browser.cjs
node tests/bitcoin-theme-browser.cjs
node tests/bitcoin-interiors-browser.cjs
node tests/bitcoin-resources-browser.cjs
PREVIEW_URL=http://127.0.0.1:8771 node tests/bitcoin-browser.cjs
node tests/bitcoin-reliability.cjs
node tests/v7-calculations.cjs
node tests/homepage-fragments.cjs
```

Set `PLAYWRIGHT_PATH` to the installed Playwright module if needed, and `NODE` for the Python syntax checker. Browser checks use Chrome; `PREVIEW_URL` selects the local server and `SCREENSHOT_DIR` saves review screenshots.

Coverage includes all 32 simplified pages at 320, 390, 768 and 1280 px; navigation/header clearance; resource category selection, global search, no-results/reset, history/reload and old category bookmarks; keyboard/native disclosures; guide and whitepaper chapter links; workshop/book bookmarks; and no-JavaScript navigation/library access. The library additionally passes checks at 1440 px, all 49 entries and every local resource destination. Existing tests cover homepage paths/history, all 46 legacy fragments, mobile menus, calculator/assessment behavior, nine inquiry forms with mocked provider acceptance/failures, and source preservation. No real forms, subscriptions, payments or settings are submitted or changed by these tests.

## Limits

This is a presentation and navigation review. Existing financial claims, product pricing, provider availability and source data have not been newly certified. DCA data remains explicitly illustrative. Real newsletter/inquiry delivery and paid fulfillment are not newly verified. The pre-existing missing `dashboard.css`, `dashboard.js`, `members.css` and `members.js` remain outside this change and are reported by the static scan. The old learning archive retains its original content and interactions.
