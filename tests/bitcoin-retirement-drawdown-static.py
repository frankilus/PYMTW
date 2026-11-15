"""Bitcoin retirement drawdown planner (/tools/bitcoin-retirement-drawdown/): SEO head (title <= 60, description, canonical, og/twitter), WebApplication + FAQPage schema matching the visible FAQ, IRS sources, disclaimer, CTAs in order (written plan, The Long Game, BTC Loan Rates with no tracking), no network calls, and wiring (catalog Bitcoin topic, router, noscript, sitemap, llms.txt, DCA backtester related link)."""
from pathlib import Path
import re,json,html,hashlib
R=Path(__file__).resolve().parents[1]
p=R/'tools/bitcoin-retirement-drawdown/index.html';s=p.read_text()
URL='https://pymtw.com/tools/bitcoin-retirement-drawdown/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);d=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=60,t;assert 50<len(d)<=160,d
assert f'<link rel="canonical" href="{URL}">' in s and f'<meta property="og:url" content="{URL}">' in s
for k in ['og:title','og:description','og:image','og:site_name','og:type']:assert f'<meta property="{k}"' in s,k
for k in ['twitter:card','twitter:title','twitter:description','twitter:image']:assert f'<meta name="{k}"' in s,k
assert html.unescape(re.search(r'<meta property="og:title" content="([^"]+)"',s)[1])==t and html.unescape(re.search(r'<meta name="twitter:description" content="([^"]+)"',s)[1])==d
assert s.count('<h1>')==1 and 'class="direct-answer"' in s
assert s.count('<script src="/assets/site-analytics.js" defer></script>')==1 and 'goatcounter.com/count' not in s
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert set(g)=={'BreadcrumbList','WebApplication','FAQPage'} and g['BreadcrumbList']['itemListElement'][-1]['item']==URL
assert g['WebApplication']['url']==URL and g['WebApplication']['applicationCategory']=='FinanceApplication' and g['WebApplication']['offers']['price']=='0'
qs=[(q['name'],q['acceptedAnswer']['text']) for q in g['FAQPage']['mainEntity']];assert 5<=len(qs)<=6
vis=[(html.unescape(a),html.unescape(b)) for a,b in re.findall(r'<div class="qa"><h3>(.*?)</h3><p>(.*?)</p></div>',s)];assert vis==qs,'FAQ schema must match the visible FAQ'
# 2026 IRS figures shown on the page and cited to irs.gov
for fig in ['$98,900','$66,200','$49,450','$250,000','$200,000','age 73','75']:assert fig in s,fig
for src in ['https://www.irs.gov/pub/irs-drop/rp-25-32.pdf','https://www.irs.gov/individuals/net-investment-income-tax','https://www.irs.gov/retirement-plans/retirement-plan-and-ira-required-minimum-distributions-faqs','https://www.irs.gov/publications/p590b','https://www.federalregister.gov/documents/2024/07/19/2024-14542/required-minimum-distributions']:assert f'href="{src}"' in s,src
core=(R/'tools/bitcoin-retirement-drawdown/core.js').read_text()
for fig in ['[24800, 0.10]','[768700, 0.35]','[640600, 0.35]','mfj: 32200','single: 16100','hoh: 24150','[98900, 613700]','[66200, 579600]','[49450, 545500]','73: 26.5','birthYear >= 1960 ? 75 : 73']:assert fig in core,fig
assert 'Educational only, not financial advice.' in s and 'federal income tax only' in s and 'state and local' in s
# CTAs: written plan, then The Long Game, then BTC Loan Rates (no tracking params, no affiliate tags)
app=(R/'tools/bitcoin-retirement-drawdown/app.js').read_text()
assert "'../bitcoin-household-plan/'" in app and 'Turn this into your written plan' in app
i_nl=s.index('href="https://pymtw.beehiiv.com/subscribe"');i_loan=s.index('href="https://btc-loan-rates.vercel.app" target="_blank" rel="noopener"><b>Borrow instead of sell?')
assert s.index('<div class="narrow" id="out">')<i_nl<i_loan
assert s.count('href="https://pymtw.beehiiv.com/subscribe"')==1 and 'pymtwtools' not in s and 'Next Dollar' not in s
assert all('?' not in u for u in re.findall(r'href="(https://btc-loan-rates\.vercel\.app[^"]*)"',s))
for f in [s,app,core]:
  for bad in ['fetch(','XMLHttpRequest','sendBeacon','document.cookie','localStorage','<iframe','embed.beehiiv','utm_','?ref=','&ref=']:assert bad not in f,bad
# wiring
cat=(R/'tools/catalog.js').read_text();assert '"slug": "bitcoin-retirement-drawdown"' in cat and re.search(r'"id": "bitcoin".*?"slugs": \["bitcoin-household-plan", (?:"bitcoin-200-week-moving-average", )?"bitcoin-retirement-drawdown"',cat)
idx=(R/'tools/index.html').read_text();assert '<li><a href="/tools/bitcoin-retirement-drawdown/">Bitcoin retirement drawdown planner</a></li>' in idx
assert 'catalog.js?v='+hashlib.sha256((R/'tools/catalog.js').read_bytes()).hexdigest()[:12] in idx,'catalog cache-bust matches file'
r=(R/'tools/router.js').read_text();assert "'bitcoin-retirement-drawdown':'<path" in r and "'bitcoin-retirement-drawdown':['" in r
assert f'<loc>{URL}</loc>' in (R/'tools/sitemap.xml').read_text() and f'({URL})' in (R/'tools/llms.txt').read_text()
assert 'href="../bitcoin-retirement-drawdown/"' in (R/'tools/bitcoin-dca-backtester/index.html').read_text()
for a in re.findall(r'href="\.\./([^"#]+)',s):assert (R/'tools'/a/'index.html').exists() or (R/'tools'/a).exists(),a
print('ok')
