# Parent homepage review

Version 4 becomes the parent homepage. Visitors choose Bitcoin education or Money Tools, with the original book cover and Amazon promotion below. The old Bitcoin homepage now lives at `/bitcoin/`; `/tools/` is unchanged.

## Scope and routes

| URL | Result |
| --- | --- |
| `/` and `/index.html` | Approved Version 4 parent homepage |
| `/bitcoin/` | Existing Bitcoin homepage, original content and executable scripts |
| `/tools/` and descendants | Existing V7 tools, guides and latest newsletter fix |
| `/#learn`, `/#faq`, other existing Bitcoin IDs | Client-side navigation to the same fragment under `/bitcoin/`, preserving query parameters |
| Existing education `.html` pages | Keep their URLs; menus distinguish PYMTW Home and Bitcoin |

The prototype controls and example future section are removed. Real future sections can be added as linked cards; the directory wraps onto additional rows. Canonical URLs, page schema, social metadata and sitemap entries distinguish the new parent from the Bitcoin section. The original Bitcoin title and description remain intact. All local Bitcoin resource paths are rooted so the deeper route loads the original scripts and styles.

The root remains a real homepage, so it is **not** redirected to Bitcoin. Legacy fragment forwarding requires JavaScript; it is not an HTTP 301 redirect. Existing unfragmented links to the domain now intentionally reach the parent directory. Search engines will need to recrawl the changed homepage and new section URL.

## Verification

Base: `95a2e842cd69f2fdd885be011fd87e49e9601f77` on main (includes the newsletter fix).

- `python3 tests/homepage-migration.py`: 104 protected files unchanged, including the entire tools tree, original calculator scripts, legal page and domain configuration; Bitcoin content/IDs/executable scripts preserved; 73 local homepage/Bitcoin references and sitemap routes valid.
- `python3 tests/v7-preservation.py`: original calculation scripts and tool/guide content/SEO remain preserved. Exemptions now cover the intentionally changed parent homepage, robots and shared navigation; calculator checks are retained.
- `python3 tests/v7-links.py`: 278 local tool links/assets checked, no broken references.
- `node tests/v7-calculations.cjs`: all 17 calculation assertions passed.
- `node tests/homepage-fragments.cjs`: existing section fragments, unknown/malformed fragments, new parent fragments, query parameters and hash-change behavior passed.
- Browser checks: parent and Bitcoin pages at 320, 390, 768 and 1280 px; tablet navigation at 769, 900 and 1024 px; mobile menu; both section cards; legacy `/#learn` navigation; shared interior navigation; tools search for job loss; original book image loading. No page errors observed in these checks.
- Corrected mobile decorative overflow on the Bitcoin page and adjusted the longer navigation for tablets and short mobile screens.

Newsletter submissions, delivery, purchases and live third-party services were not retested for this homepage migration. The existing newsletter fix is retained byte-for-byte within `/tools/`.

## Local review

Serve this repository root with `python3 -m http.server 8765 --bind 127.0.0.1`, then open `http://localhost:8765/`. Check `/bitcoin/` and `/tools/` from the homepage cards. A fresh browser tab/origin or hard refresh avoids cached styles from an earlier preview.

This branch is for review. GitHub Pages is configured to publish `main`; do not merge until the homepage and route move are approved. No deployment settings are changed by this PR.
