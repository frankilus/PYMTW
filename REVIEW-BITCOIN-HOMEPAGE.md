# Bitcoin homepage and consistent interior theme

Review only. Do not merge or deploy until approved.

## Visitor experience

The approved warm-white/orange concept replaces `/bitcoin/` with three clear starting paths. Choosing a path updates a short set of existing resources; links stay on the current site. Each path has a bookmarkable URL (`#understand`, `#evaluate`, `#protect`), works with browser history and restores its selection after reload. Keyboard activation moves focus to the corresponding resource panel. Without JavaScript, the cards link directly to their starting guides and the introductory resource list remains visible.

The homepage keeps the authentic second-edition book cover, existing Amazon link, optional Bitcoin Beehiiv newsletter handoff, resource library and Money Tools link. It removes the preview banner and development labels, and includes canonical/social metadata and page schema. No newsletter submission, provider setting, analytics configuration or calculator logic is changed.

## Existing content and links

- The previous Bitcoin homepage is retained at `/bitcoin/explore/`. Its entire body, including the FAQ, knowledge quiz, educational tabs and resources, is byte-for-byte preserved. Its metadata changes for the new URL, and it loads the shared interior theme.
- Existing `/bitcoin/#faq`, `#learn`, `#why-bitcoin`, `#getting-started`, and other section fragments route to the corresponding library sections. Query strings survive. Earlier parent-homepage fragment redirects continue through this route.
- The 35 Bitcoin interior pages add one stylesheet link each. Their content, metadata and scripts remain intact. The parent homepage, approved Bitcoin homepage design, green Money Tools files, calculator code/data and existing shared styles/scripts are preserved.
- The sitemap gains the learning-library route and retains all existing entries.
- Legacy fragment routing is browser-side because fragments are not sent to the server. Without JavaScript, the homepage provides a visible link to the retained library.

## Bitcoin interior theme

`assets/bitcoin-theme.css` applies the approved warm-white/orange palette to 35 interior pages, including the retained library, guides, assessment, calculators, workshops, newsletter, book and playbook. It uses serif editorial headings, white cards, warm borders, readable orange buttons and visible keyboard focus. Success/error colors remain meaningful on light backgrounds. The original charts retain their dataset colors on dark plotting panels. Existing book artwork remains intact. Decorative particles and overflowing playbook glows are omitted. The playbook download/footer wrap on small phones, and the whitepaper chapter list scrolls within its grid without widening the page.

The theme loads only on Bitcoin interiors. The parent homepage keeps its distinct directory layout, the approved Bitcoin homepage keeps its three-path design, and Money Tools remains green. No page content or calculator JavaScript is changed by this theme.

## Verification

From the repository root, serve locally with `python3 -m http.server 8771 --bind 127.0.0.1` and run:

```sh
node tests/bitcoin-homepage.cjs
node tests/bitcoin-theme-browser.cjs
node tests/bitcoin-homepage-browser.cjs
PREVIEW_URL=http://127.0.0.1:8771 node tests/bitcoin-browser.cjs
python3 tests/bitcoin-static.py
node tests/homepage-fragments.cjs
node tests/v7-calculations.cjs
```

Set `PLAYWRIGHT_PATH` to the installed Playwright module if necessary. Browser tests use Chrome, default to `http://127.0.0.1:8771`, and accept `PREVIEW_URL` and `SCREENSHOT_DIR`. Set `NODE` for the Python syntax checker if Node is not on PATH.

Coverage:
- All 35 interiors at 390 and 1280 px, plus representative pages at 320/768 px; theme text/button contrast, menu/skip-link colors, and isolation from the parent and Money Tools styles.
- Five screen widths: 320, 390, 768, 1280 and 1440 px; no horizontal overflow.
- All three paths and nine resource destinations, keyboard activation/focus, history, refresh and direct path URLs.
- Representative old Bitcoin and parent-homepage bookmarks, query preservation and malformed fragments.
- Real card links and readable content with JavaScript disabled; original book asset loading.
- Source preservation except the intended homepage/sitemap changes and single interior stylesheet links; exact retention of the previous homepage body; all 46 old fragments mapped.
- 915 local references across 38 pages, JavaScript syntax and unchanged existing tool calculations.

`tests/bitcoin-browser.cjs` now checks the retained library's legacy mobile menu instead of expecting that menu on the new homepage. Its other reliability checks are unchanged. `tests/bitcoin-static.py` resolves the intentional fragment redirects and includes the new library.

## Limits

This updates the homepage, navigation and Bitcoin interior presentation; it does not rewrite the retained learning content. Earlier limitations still apply: DCA prices remain illustrative; actual inquiry/newsletter delivery and paid fulfillment are not newly verified. No forms, subscriptions or payments were submitted during this work. The existing missing dashboard/member CSS/JS files remain outside scope and are reported by the static scan.
