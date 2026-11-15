"""Bitcoin 200-week moving average tracker (/tools/bitcoin-200-week-moving-average/): SEO head (title <= 60, description, canonical, og/twitter), WebApplication + FAQPage schema matching the visible FAQ, sources, disclaimer, CTAs (DCA backtester, Household Plan, The Long Game only), keyless free data refreshed by a free GitHub Actions workflow, no analytics beyond existing patterns, and wiring (catalog Bitcoin topic, router, noscript, sitemap, llms.txt, DCA backtester related link)."""
from pathlib import Path
import re,json,html,hashlib
R=Path(__file__).resolve().parents[1]
S='bitcoin-200-week-moving-average'
d=R/'tools'/S;p=d/'index.html';s=p.read_text()
URL=f'https://pymtw.com/tools/{S}/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);desc=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=60,t;assert 50<len(desc)<=160,desc
assert f'<link rel="canonical" href="{URL}">' in s and f'<meta property="og:url" content="{URL}">' in s
for k in ['og:title','og:description','og:image','og:site_name','og:type']:assert f'<meta property="{k}"' in s,k
for k in ['twitter:card','twitter:title','twitter:description','twitter:image']:assert f'<meta name="{k}"' in s,k
assert html.unescape(re.search(r'<meta property="og:title" content="([^"]+)"',s)[1])==t
assert s.count('<h1')==1 and 'noindex' not in s
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert set(g)=={'BreadcrumbList','WebApplication','FAQPage'} and g['WebApplication']['url']==URL and g['WebApplication']['offers']['price']=='0'
qs=[(q['name'],q['acceptedAnswer']['text']) for q in g['FAQPage']['mainEntity']];assert len(qs)>=6
vis=[(html.unescape(a),html.unescape(b)) for a,b in re.findall(r'<div class="qa"><h3>(.*?)</h3><p>(.*?)</p></div>',s)];assert vis==qs,'FAQ schema must match the visible FAQ'
# sourced methodology
for src in ['https://www.blockchain.com/explorer/charts/market-price','https://www.blockchain.com/explorer/api/charts_api','https://www.investopedia.com/terms/m/movingaverage.asp','https://docs.cdp.coinbase.com/exchange/reference/exchangerestapi_getproductticker']:assert f'href="{src}"' in s,src
for txt in ['Educational only, not financial advice.','log scale','2010-08-22','current, still-forming week','Sources and method']:assert txt in s,txt
# CTAs: DCA backtester + Household Plan (low-key links), The Long Game only
assert 'href="../bitcoin-dca-backtester/"' in s and 'href="../bitcoin-household-plan/"' in s
assert s.count('href="https://pymtw.beehiiv.com/subscribe"')==1 and 'pymtwtools' not in s and 'Next Dollar' not in s
assert s.index('href="../bitcoin-dca-backtester/"')<s.index('href="https://pymtw.beehiiv.com/subscribe"')
for f in [s,(d/'app.js').read_text(),(d/'core.js').read_text()]:
  for bad in ['XMLHttpRequest','sendBeacon','document.cookie','localStorage','<iframe','embed.beehiiv','utm_','?ref=','&ref=','api_key','apikey','Authorization']:assert bad not in f,bad
app=(d/'app.js').read_text();core=(d/'core.js').read_text()
assert re.findall(r"fetch\('([^']+)'",app)==['data/weekly.json','https://api.exchange.coinbase.com/products/BTC-USD/ticker'],'only the saved data and one keyless public ticker'
assert 'goatcounter' not in app and re.findall(r"PT\.track\('([^']+)'",app)==['results-shown']
# saved data is committed, keyless, and refreshed by a free scheduled workflow
data=json.loads((d/'data/weekly.json').read_text());assert data['firstWeek']=='2010-08-22' and len(data['weekly'])>=848
sc=(R/'.github/scripts/update-btc-weekly.py').read_text()
assert 'api.blockchain.info/charts/market-price' in sc and not re.search(r'api[_-]?key|token|secret',sc,re.I)
assert '"updated": last.isoformat()' in sc
assert 'Coinbase snapshot fetched' in app and 'history as of' in app and 'Live quote unavailable' in app and 'id="wm-asof"' in app
assert 'data/weekly.json' in app and 'research.js?v=' in s and 'wm-view' in s and 'wm-bands' in s
assert 'checks for new data daily' in s and 'not weekly closing prices' in s
assert 'wm-history' in s and 'observations, not odds' in s and 'Worst drop along the way' in app
assert 'historicalSeries' in app and 'WMAResearch.outcomes(history)' in app
wfp=R/'.github/workflows/update-btc-weekly.yml'
if wfp.exists():  # the schedule is added by the repo owner (pushing workflow files needs the workflow scope)
  wf=wfp.read_text();assert 'schedule:' in wf and 'cron:' in wf and 'workflow_dispatch' in wf and 'contents: write' in wf and 'secrets.' not in wf
# wiring
cat=(R/'tools/catalog.js').read_text();assert f'"slug": "{S}"' in cat and re.search(r'"id": "bitcoin".*?"slugs": \["bitcoin-household-plan", "'+S+'"',cat)
assert '"live": true' in re.search(r'"slug": "'+S+r'".*?\n   \},',cat,re.S)[0]
idx=(R/'tools/index.html').read_text();assert f'<li><a href="/tools/{S}/">Bitcoin 200-week moving average tracker</a></li>' in idx
assert 'catalog.js?v='+hashlib.sha256((R/'tools/catalog.js').read_bytes()).hexdigest()[:12] in idx,'catalog cache-bust matches file'
r=(R/'tools/router.js').read_text();assert f"'{S}':'<path" in r and f"'{S}':['" in r
assert f'<loc>{URL}</loc>' in (R/'tools/sitemap.xml').read_text() and f'({URL})' in (R/'tools/llms.txt').read_text()
assert f'href="../{S}/"' in (R/'tools/bitcoin-dca-backtester/index.html').read_text()
for a in re.findall(r'href="\.\./([^"#]+)',s):assert (R/'tools'/a/'index.html').exists() or (R/'tools'/a).exists(),a
print('ok')
