# PYMTW — Site Architecture (Stage 2)

## Positioning (site-wide theme)

> **Practical Bitcoin education for working professionals who want long-term exposure without trading, hype, or unnecessary complexity.**
> Secondary: _Build a responsible Bitcoin strategy without becoming a trader._

## Monetization funnel

`Visitor → Free assessment / lead magnet → Email subscriber → Low-cost digital product ($29) → Live workshop ($79–199) → Premium private education ($149–499) → Membership ($29/mo) → Corporate education & speaking`

Journey verbs: **Learn → Assess → Subscribe → Purchase → Attend → Implement → Continue learning.** Every page drives to **one** primary next step.

## Primary navigation

`Home · Start Here · Tools ▾ · Programs ▾ · Book · Newsletter · About` + persistent **Assess** button.

- **Tools ▾:** Bitcoin Readiness Assessment · DCA Calculator · Net-Worth Calculator · Performance Comparison · Resource Library
- **Programs ▾:** Overview · Live Workshops · Private Education · Self-Custody Education · Membership · Corporate Education

Global elements: **trust bar** (never asks for keys / never takes custody / never trades / education-not-advice) under the nav; standardized **footer** with Learn / Programs / Trust columns + educational disclaimer. Implemented once in `pymtw.js` (single source of truth) + `pymtw.css`.

## Sitemap & page specs

| Page | File | Funnel stage | Audience | Primary CTA | Secondary CTA |
|---|---|---|---|---|---|
| Home | `index.html` | Awareness | All professionals | Take the Readiness Assessment | Explore Programs |
| Start Here | `start-here.html` | Awareness→Segment | Beginners/unsure | Take the Assessment | Free Playbook |
| Readiness Assessment | `assessment.html` | **Lead capture** | All | Email → see result | Explore Programs |
| DCA Calculator | `dca.html` | Consideration | Accumulators | Get DCA worksheet (Starter Kit) | Busy Professionals workshop |
| Net-Worth Calculator | `calculator.html` | Consideration | Curious owners | Learn basics / DCA / Security | — |
| Performance | `performance.html` | Consideration | Skeptics | Assessment | Newsletter |
| Resource Library | `index.html#resources`¹ | Consideration | Researchers | Newsletter | Assessment |
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
