# PYMTW Tools V7 review

V7 integrates the approved orange-and-white homepage at `/tools/`, retaining the existing parent PYMTW site. It uses the supplied `preview-standalone (2).html` (title: V7 preview, with newsletter signup), recovered from the user's Downloads folder. The four embedded photographic/book assets were decoded without recompression into `tools/v7/`. No generated substitute images are used.

The 14 catalog entries retain their source availability: 11 live and three planned. All 18 existing tool, guide and checkup pages retain their original content and receive a separate V7 style layer. All original JavaScript files, guide text, SEO metadata, structured data, homepage FAQ, privacy disclosures, routes and sitemap are preserved. The homepage's savings example calls the existing `PT.calc.emergency` function. Prototype modal calculators have been removed in favor of links to the real tools. Search includes all live tools, the checkup and all three guides.

## Preview locally

From the repository root, run `python3 -m http.server 8765`, then open http://localhost:8765/tools/. Serve the repository root, not just the tools folder, so legal/privacy and parent-site links work.

## Verification

- `node tests/v7-calculations.cjs`: 17 assertions against the original calculation engine (emergency fund, amortization, job-loss runway, debt, Roth, fees and DCA). Includes zero interest, no savings contribution, non-amortizing debt and no monthly deficit.
- `python3 tests/v7-preservation.py`: exact comparison against source commit `484efc4d2b63821b09cbeaf44ac6116d4aa31348`; 42 existing JavaScript/config/privacy files unchanged, all original tool/guide content and SEO/schema preserved.
- `python3 tests/v7-links.py`: local link and asset checks.
- `node tests/v7-browser.cjs`: requires Playwright and Google Chrome, plus the preview server. Set `PLAYWRIGHT_PATH` if Playwright is not locally installed. Tests natural-language search, no-match search, all four life moments, mobile menu, the savings slider, homepage widths 320/390/768/1280, and 18 routes at 390/1280. The 11 working tools render results using their existing demo fixtures. No page JavaScript exceptions.
- Original Beehiiv form `e52526c9-fd98-4fde-bda0-ee1a61507c09` loads from the real provider. The hosted subscription fallback remains available. The real email field rejects invalid addresses. An authorized test address was submitted, but the embedded form showed no explicit success/error response. Subscription acceptance and email delivery remain **unverified**, pending mailbox confirmation. No test address is stored in this repository.

These are regression and integration checks, not an independent financial/tax audit or exhaustive testing of every combination of inputs. Original guide data and calculator assumptions have not been updated. The primary chart series receives a CSS-only orange treatment; comparison series and semantic status colors remain distinct. Original calculation scripts are unchanged. Browser theme colors and footers also match V7. Third-party services still depend on network access and browser privacy settings.

## Release boundary

GitHub Pages is configured to publish the root of `main`. This change belongs on `feat/pymtw-tools-v7` for review. Do not merge or deploy until the owner approves. No hosting settings, CNAME, deployment configuration or parent homepage were changed.
