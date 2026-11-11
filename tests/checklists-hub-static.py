"""Printable checklists hub (/tools/checklists/): SEO head, CollectionPage+ItemList schema, one card per printable with counts that match each page, read-only localStorage progress, one Long Game link, nl-click tracking in tools.js, and wiring (catalog, router, noscript, sitemap, llms.txt, links back from every printable)."""
from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parents[1]
p=R/'tools/checklists/index.html';assert p.exists(),'page missing';s=p.read_text()
URL='https://pymtw.com/tools/checklists/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);d=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=70,t;assert 0<len(d)<=160,d
assert f'<link rel="canonical" href="{URL}">' in s and f'<meta property="og:url" content="{URL}">' in s
assert s.count('<script src="/assets/site-analytics.js" defer></script>')==1 and 'goatcounter.com/count' not in s
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert set(g)=={'BreadcrumbList','CollectionPage'} and g['BreadcrumbList']['itemListElement'][-1]['item']==URL
il=g['CollectionPage']['mainEntity'];assert il['@type']=='ItemList' and il['numberOfItems']==5==len(il['itemListElement'])
PAGES={'guides/lost-my-job/checklist':'pymtw-lost-my-job-checklist-v1','guides/lost-my-job/severance-review':'pymtw-severance-review-v1','guides/old-401k/checklist':'pymtw-old-401k-checklist-v1','guides/first-home/checklist':'pymtw-first-home-checklist-v1','guides/true-cost-of-a-car/checklist':'pymtw-car-checklist-v1'}
assert [x['url'] for x in il['itemListElement']]==['https://pymtw.com/tools/'+k+'/' for k in PAGES]
cards=re.findall(r'<article class="cl" data-key="([^"]+)" data-items="(\d+)">(.*?)</article>',s,re.S);assert len(cards)==5
total=0
for (slug,key),(ck,ci,body) in zip(PAGES.items(),cards):
    ps=(R/'tools'/slug/'index.html').read_text()
    assert ck==key and f"'{key}'" in ps,(slug,key)
    n=len(re.findall(r'data-item="p\d-\d+"',ps));assert int(ci)==n,(slug,ci,n);total+=n
    phases=len(re.findall(r'<section class="phase" id="phase-\d"',ps));srcs=len(set(re.findall(r'<li id="src-(\d+)"',ps)))
    assert f'{phases} phases · {n} items · {srcs} official sources' in body or f'{phases} sections · {n} items · {srcs} official sources' in body,(slug,phases,n,srcs)
    assert body.count('<li>')==phases and f'href="../{slug}/"' in body
    assert 'href="../../checklists/"' in ps or 'href="../../../checklists/"' in ps,('no link back to hub',slug)
assert f'hold {total} items' in s
for a in re.findall(r'href="\.\./([^"#]+)',s):assert (R/'tools'/a/'index.html').exists() or (R/'tools'/a).exists(),a
js=' '.join(re.findall(r'<script>(.*?)</script>',s,re.S))
assert 'localStorage.getItem' in js and 'localStorage.setItem' not in js and 'removeItem' not in js
for bad in ['fetch(','XMLHttpRequest','sendBeacon','document.cookie','<form','<iframe','embed.beehiiv','pymtwtools.beehiiv.com']:assert bad not in s,bad
assert s.count('href="https://pymtw.beehiiv.com/subscribe"')==1 and 'No email or sign-up needed' in s
tj=(R/'tools/tools.js').read_text();assert "PT.track('nl-click'" in tj and 'a[href*="beehiiv.com"]' in tj
cat=(R/'tools/catalog.js').read_text();assert '"slug": "checklists"' in cat and re.search(r'"id": "guides".*?"slugs": \["checkup", "checklists"',cat)
assert "slug: 'checklists'" in (R/'tools/router.js').read_text()
assert '<li><a href="/tools/checklists/">All printable checklists</a></li>' in (R/'tools/index.html').read_text()
assert f'<loc>{URL}</loc>' in (R/'tools/sitemap.xml').read_text() and f'({URL})' in (R/'tools/llms.txt').read_text()
print('ok')
