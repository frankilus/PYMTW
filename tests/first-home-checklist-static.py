"""First-time home buyer checklist: page structure, numbered sources, print stylesheet, localStorage-only storage, and wiring (guide links, catalog/search, noscript, sitemap, llms.txt)."""
from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parents[1]
p=R/'tools/guides/first-home/checklist/index.html';assert p.exists(),'page missing';s=p.read_text()
URL='https://pymtw.com/tools/guides/first-home/checklist/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);d=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=70,t;assert 0<len(d)<=160,d
assert f'<link rel="canonical" href="{URL}">' in s and f'<meta property="og:url" content="{URL}">' in s
for a in ['property="og:title"','name="twitter:title"','property="og:description"','name="twitter:description"','name="twitter:card"','property="og:image"']:assert re.search(r'<meta '+a+r' content="[^"]+"',s),a
assert s.count('<script src="/assets/site-analytics.js" defer></script>')==1 and 'goatcounter.com/count' not in s and 'gc.zgo.at' not in s
assert '../../../tools.js' in s and 'PT.track(name, title)' in s and "track('print-click'" in s and "track('item-checked'" in s
# schema: breadcrumb + HowTo, no ratings
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert set(g)=={'BreadcrumbList','HowTo'},set(g)
assert g['BreadcrumbList']['itemListElement'][-1]['item']==URL and g['HowTo']['url']==URL and g['HowTo']['dateModified']=='2026-10-27'
assert 'aggregateRating' not in s and 'ratingValue' not in s and 'reviewCount' not in s
# six phases, one printable page each
phases=re.findall(r'<section class="phase" id="phase-(\d)" data-phase',s);assert phases==[str(i) for i in range(1,7)],phases
assert len(g['HowTo']['step'])==6
items=re.findall(r'<input type="checkbox" id="p\d-\d+" data-item="(p\d-\d+)"',s);assert len(items)>=30 and len(set(items))==len(items)
for need in ['Closing Disclosure','3 business days','wire','walk-through','Loan Estimate','three lenders','rate lock','appraisal','contingent on a satisfactory inspection','escrow','homestead','debt-to-income','closing costs','first-time buyer programs','Educational','Updated Oct 27, 2026']:assert need.lower() in s.lower(),need
# sources: numbered list, every ref points to an existing source, every source is primary
src=re.search(r'<section class="sources"[^>]*>.*?<ol>(.*?)</ol>',s,re.S);assert src,'numbered sources list'
ids=re.findall(r'<li id="src-(\d+)"',src[1]);assert ids==[str(i) for i in range(1,len(ids)+1)] and len(ids)>=20
refs=set(re.findall(r'href="#src-(\d+)"',s));assert refs and refs<=set(ids) and set(ids)<=refs,'unused or missing sources'
hosts=set(re.findall(r'href="https://([^/"]+)',src[1]))
assert hosts<={'www.consumerfinance.gov','files.consumerfinance.gov','yourhome.fanniemae.com','myhome.freddiemac.com','www.hud.gov','answers.hud.gov','consumer.ftc.gov','www.irs.gov'},hosts
# print stylesheet: US Letter, page break per phase, footer URL, hidden chrome
pr=re.search(r'@media print\s*\{(.*)',s,re.S)[1]
assert re.search(r'@page\s*\{[^}]*size:\s*letter',s,re.I)
assert re.search(r'\.phase\{[^}]*break-before:\s*page',pr.replace(' ','').replace('\n','')) or 'break-before:page' in pr.replace(' ','')
for hid in ['nav','footer','.actions','.nl-line','.v7-next']:assert hid in pr,hid
assert '<div class="print-foot"' in s and 'pymtw.com/tools/guides/first-home/checklist/' in s
assert 'window.print()' in s
# storage: localStorage only, nothing sent anywhere
js=' '.join(re.findall(r'<script>(.*?)</script>',s,re.S))
assert 'localStorage' in js
for bad in ['fetch(','XMLHttpRequest','sendBeacon','sessionStorage','indexedDB','document.cookie','<form','<iframe','embed.beehiiv','subscribe-forms.beehiiv','pymtwtools.beehiiv.com']:assert bad not in s,bad
assert s.count('href="https://pymtw.beehiiv.com/subscribe"')==1 and 'Personal finance Tuesdays. Bitcoin Fridays.' in s
# linked from the first-home guide (near the top and in the next-steps area)
gd=(R/'tools/guides/first-home/index.html').read_text()
assert gd.count('href="checklist/"')>=2 and 'Get the printable checklist' in gd
top=gd.index('class="direct-answer"');assert gd.index('href="checklist/"',top)-top<1500,'checklist link near the top answer'
# findable: catalog (Find the right tool.), topics, noscript, router, sitemap, llms.txt
cat=(R/'tools/catalog.js').read_text();assert '"slug": "guides/first-home/checklist"' in cat and cat.count('"guides/first-home/checklist"')>=3
assert '<a href="/tools/guides/first-home/checklist/">' in (R/'tools/index.html').read_text()
assert "slug: 'guides/first-home/checklist'" in (R/'tools/router.js').read_text()
assert f'<loc>{URL}</loc>' in (R/'tools/sitemap.xml').read_text() and f'({URL})' in (R/'tools/llms.txt').read_text()
print('PASS first-home checklist static: page, meta, HowTo/Breadcrumb schema, 6 phases, %d items, %d numbered primary sources, print CSS, localStorage only, guide links, catalog/noscript/router/sitemap/llms.'%(len(items),len(ids)))
