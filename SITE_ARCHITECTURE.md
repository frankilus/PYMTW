# PYMTW — Site Architecture

## Parent homepage and sections

- `/`: approved Version 4 directory with distinct Bitcoin and Money Tools cards, prominent brand heading, and original book promotion.
- `/bitcoin/`: former Bitcoin homepage, retaining its content and behavior.
- `/tools/`: existing personal finance website, with the approved deep green and sage palette across the homepage, calculators, checkup and guides. Routes, content and calculation logic are retained.
- Existing education pages keep their `.html` routes; navigation links back to both the parent and Bitcoin section.
- Existing root Bitcoin fragments are forwarded by `assets/home/legacy-links.js`; new homepage fragments stay on the parent.
- Add a new section by adding a real linked card to the homepage directory; the grid wraps to additional rows.
- `/tools/` "Find the right tool." directory and its search read one data source, `tools/catalog.js`: calculators in `PT_CATS`, guides and the checkup in `PT_GUIDES`, topics in `PT_TOPICS`. When the daily build adds a tool or guide, add it there (with plain-English `kw` keywords and at least one topic), add the same link to the `<noscript>` list in `tools/index.html`, add it to `tools/sitemap.xml` and `tools/llms.txt`, then bump the `?v=` tokens on `catalog.js` and `v7/home.js`. `tests/find-right-tool.cjs` fails if any sitemap page is missing from the data, the directory, its search or the no-JavaScript list.

The remaining education funnel below applies to the Bitcoin section.

## Bitcoin positioning

> **Practical Bitcoin education for working professionals who want long-term exposure without trading, hype, or unnecessary complexity.**
> Secondary: _Build a responsible Bitcoin strategy without becoming a trader._

## Monetization funnel

`Visitor → Free assessment / lead magnet → Email subscriber → Low-cost digital product ($29) → Live workshop ($79–199) → Premium private education ($149–499) → Membership ($29/mo) → Corporate education & speaking`

Journey verbs: **Learn → Assess → Subscribe → Purchase → Attend → Implement → Continue learning.** Every page drives to **one** primary next step.

## Primary navigation

`PYMTW Home · Bitcoin · Start Here · Tools ▾ · Programs ▾ · Book · Newsletter · About` + persistent **Assess** button.

- **Tools ▾:** Bitcoin Readiness Assessment · DCA Calculator · Net-Worth Calculator · Performance Comparison · Resource Library
- **Programs ▾:** Overview · Live Workshops · Private Education · Self-Custody Education · Membership · Corporate Education

Global elements: **trust bar** (never asks for keys / never takes custody / never trades / education-not-advice) under the nav; standardized **footer** with Learn / Programs / Trust columns + educational disclaimer. Implemented once in `pymtw.js` (single source of truth) + `pymtw.css`.

## Sitemap & page specs

| Page | File | Funnel stage | Audience | Primary CTA | Secondary CTA |
|---|---|---|---|---|---|
| Bitcoin | `bitcoin/index.html` | Awareness | All professionals | Take the Readiness Assessment | Explore Programs |
| Start Here | `start-here.html` | Awareness→Segment | Beginners/unsure | Take the Assessment | Free Playbook |
| Readiness Assessment | `assessment.html` | **Lead capture** | All | Email → see result | Explore Programs |
| DCA Calculator | `dca.html` | Consideration | Accumulators | Get DCA worksheet (Starter Kit) | Busy Professionals workshop |
| Net-Worth Calculator | `calculator.html` | Consideration | Curious owners | Learn basics / DCA / Security | — |
| Performance | `performance.html` | Consideration | Skeptics | Assessment | Newsletter |
| Resource Library | `/bitcoin/#resources`¹ | Consideration | Researchers | Newsletter | Assessment |
| Programs (hub) | `programs.html` | Purchase | Warm leads | Request a seat/session | Assessment |
| Starter Kit | `starter-kit.html` | **First purchase ($29)** | DIY owners | Get the Kit / notify at launch | Programs |
| Corporate & Speaking | `corporate.html` | B2B | Orgs | Request a proposal | See formats |
| Book | `/book` | Cross-sell | Readers | Get the book | Programs/Corporate |
| About | `about.html` | Trust | All | Contact/Speaking | Security Promise |
| Security Promise | `security-promise.html` | Trust | Security-minded | Self-custody workshop | — |
| Disclosures & Policies | `legal.html` | Trust/compliance | All | — | — |
| Services | `services.html` | Purchase (legacy) | Warm leads | View Program Details | Inquiry |
| Whitepaper / Videos | `whitepaper.html`, `videos.html` | Education | Learners | Assessment/Newsletter | — |

¹ Dedicated `resources.html` library with per-item review metadata is a Priority-2 follow-up; nav currently points to the existing homepage `#resources` section.

## Three visitor pathways (segmentation)

1. **Bitcoin Beginner** → _Start Learning_ → `start-here.html` / Playbook / Beginner workshop.
2. **Bitcoin Accumulator** → _Build Your Bitcoin Plan_ → `dca.html` / Starter Kit / Implementation Intensive.
3. **Bitcoin Security Builder** → _Improve Your Security_ → `security-promise.html` / Self-Custody workshop / Self-Custody Readiness.

The assessment scores answers into these three profiles and routes each to a free resource + a paid offer.

## Product ladder

| Tier | Offer | Price | Page |
|---|---|---|---|
| Free | Assessment, Playbook, Newsletter, calculators | $0 | multiple |
| Low-cost | Bitcoin Professional Starter Kit (9 templates) | $29 | `starter-kit.html` |
| Workshop | Bitcoin for Busy Professionals | $79 | `programs.html#workshops` |
| Workshop | Self-Custody Without the Fear | $129 | `programs.html#self-custody` |
| Workshop | Bitcoin for Couples & Families | $199/household | `programs.html#workshops` |
| Private | Clarity Session | $149 | `programs.html#private` |
| Private | Implementation Intensive | $399 | `programs.html#private` |
| Private | Self-Custody Readiness | $499 | `programs.html#private` |
| Membership | PYMTW Professional | $29/mo · $290/yr | `programs.html#membership` |
| Membership | PYMTW Family (coming soon) | $59/mo | `programs.html#membership` |
| B2B | Corporate education & speaking | scoped | `corporate.html` |

## Homepage section order (implemented)

1. Hero (positioning + single primary CTA) 2. Trust strip 3. Readiness Assessment band 4. Three pathways 5. Why Bitcoin 6. Getting-started / resources 7. Resource grid 8. Learn quiz 9. Featured programs & products + book 10. FAQ 11. Newsletter CTA 12. Footer (trust/legal).

## Internal linking rules

- Every calculator → assessment + one program.
- Every program → Security Promise + Educational Disclaimer.
- Assessment result → free resource + paid offer matched to profile.
- Footer links all trust/legal pages site-wide.

## Bitcoin Household Plan: binder paywall (ships OFF)

`/tools/bitcoin-household-plan/` is free to fill out. An optional $29 Lemon Squeezy license key unlocks "Print or save as PDF". The answers file and the calendar reminder stay free. The flag lives in `tools/bitcoin-household-plan/config.js` (`HHP_CONFIG.paywall`), with the checkout URL, store id (508088) and product id (1475812). `license.js` is the only file that makes a request.

- **CSP:** the page meta CSP is `connect-src https://api.lemonsqueezy.com` and was `'none'`. Nothing else changed: `script-src 'self'`, `frame-src 'none'` and `form-action 'none'` remain. Checkout is a plain link that opens a new tab, so lemon.js and its iframe are not needed. The only request is a POST to `/v1/licenses/activate` with `license_key` and `instance_name`, sent with no cookies and no referrer. Plan answers are never sent. The response must have `meta.product_id` 1475812 and `meta.store_id` 508088, or the key is refused. With the flag OFF, no request is made. If `licenseApi` moves to another host, change `connect-src` with it. `tests/bitcoin-household-plan-paywall.cjs` fails if any other host is added.
- **Unlocked state:** stored in `localStorage["pymtw-hhp-license-v1"]` (key, instance id, product and store ids) on that device only. It is not re-checked on load. "Remove the key from this device" clears it. "Erase everything" keeps a paid key.
- **To turn it on:**
  1. In Lemon Squeezy, confirm the product is published in **live** mode. If the live store or product ids differ from test mode, update `storeId`, `productId` and `checkoutUrl`.
  2. Set the product's confirmation redirect to `https://pymtw.com/tools/bitcoin-household-plan/?unlock=1`. Keep license keys on, with unlimited activations.
  3. In `config.js`, change the one line `enabled: false,` to `enabled: true,`.
  4. Run `tests/bitcoin-household-plan-paywall.cjs` and `tests/bitcoin-household-plan-browser.cjs`. Both assert the flag ships OFF, so update that assertion in the same PR. Then update the page copy that says the plan is free: the JSON-LD `isAccessibleForFree` and price `0`, and the "nothing is sent anywhere" lines.
