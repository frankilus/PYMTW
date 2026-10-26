"""Old 401(k) guide: page structure, schema, sources, wiring (sitemap, llms.txt, router, home grid, cross-links)."""
from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parents[1]
p=R/'tools/guides/old-401k/index.html';s=p.read_text()
URL='https://pymtw.com/tools/guides/old-401k/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);d=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=60,t;assert 0<len(d)<=155,d
assert f'<link rel="canonical" href="{URL}">' in s
for a in ['property="og:title"','name="twitter:title"']:assert html.unescape(re.search(r'<meta '+a+r' content="([^"]+)"',s)[1])==t
assert s.count('https://pymtw.com/tools/og/guides.png')>=2 and f'<meta property="og:url" content="{URL}">' in s
for font in ['dm-sans-latin','fraunces-normal','fraunces-italic']:assert s.count(f'rel="preload" href="/assets/fonts/{font}.woff2" as="font" type="font/woff2" crossorigin')==1
assert s.count('<script src="/assets/site-analytics.js" defer></script>')==1 and 'goatcounter.com/count' not in s and 'gc.zgo.at' not in s
# schema
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert set(g)=={'BreadcrumbList','Article','FAQPage'}
assert g['BreadcrumbList']['itemListElement'][-1]['item']==URL and g['Article']['url']==URL and g['Article']['dateModified']=='2026-10-26'
def text(x):return ' '.join(html.unescape(re.sub('<[^>]+>','',x)).split())
vis=[(text(q),text(a)) for q,a in re.findall(r'<div class="qa"><h3>(.*?)</h3><p>(.*?)</p></div>',s,re.S)]
assert 6<=len(vis)<=8 and [(q['name'],q['acceptedAnswer']['text']) for q in g['FAQPage']['mainEntity']]==vis
# direct answer 40–60 words
da=text(re.sub(r'<sup.*?</sup>','',re.search(r'<p class="direct-answer">(.*?)</p>',s,re.S)[1]));assert 40<=len(da.split())<=60,len(da.split())
# every in-text reference resolves, every source is cited and official
refs=set(re.findall(r'href="#(src-\d+)"',s));ids=re.findall(r'<li id="(src-\d+)"><a href="([^"]+)"',s)
assert refs==set(i for i,_ in ids),(refs^set(i for i,_ in ids))
assert ids and all(re.match(r'https://(www\.irs\.gov|www\.dol\.gov|lostandfound\.dol\.gov|www\.finra\.org|www\.investor\.gov)/',u) for _,u in ids)
assert set(g['Article']['citation'])==set(u for _,u in ids)
# key content and the worked example
for need in ['Rule of 55','direct rollover','60 days','20%','$7,000','$1,000 or less','qualified plan loan offset','net unrealized appreciation','Notice 2014-54','$227,000','$163,000','28%','Lost and Found','$31,500','$5,000','$11,000','$2,500','Educational only','../../fee-x-ray/','../../explain-my-401k/','../lost-my-job/','Get one clear money idea a week','https://pymtwtools.beehiiv.com/subscribe','e52526c9-fd98-4fde-bda0-ee1a61507c09']:assert need in s,need
# no affiliate links / partner recommendations
for bad in ['capitalize','amzn.to','?ref=','utm_','affiliate']:assert bad not in s.lower(),bad
# local links exist
for h in re.findall(r'href="(\.\./[^"#]*)"',s):assert (p.parent/h).resolve().joinpath('index.html').exists() or (p.parent/h).resolve().exists(),h
# wiring
assert f'<url><loc>{URL}</loc><lastmod>2026-10-26</lastmod><changefreq>monthly</changefreq></url>' in (R/'tools/sitemap.xml').read_text()
llms=(R/'tools/llms.txt').read_text();sec=llms.split('## Guides')[1].split('\n## ')[0];assert f'({URL})' in sec
assert "slug: 'guides/old-401k'" in (R/'tools/router.js').read_text() and "slug:'guides/old-401k'" in (R/'tools/v7/home.js').read_text()
home=(R/'tools/index.html').read_text();grid=re.search(r'<div class="life-guides-grid">(.*?)</section>',home,re.S)[1]
assert grid.count('class="life-guide-choice')==6 and 'href="/tools/guides/old-401k/"' in grid and 'href="/tools/guides/lost-my-job/"' in grid
assert 'href="../old-401k/"' in (R/'tools/guides/lost-my-job/index.html').read_text()
assert 'href="../guides/old-401k/"' in (R/'tools/explain-my-401k/index.html').read_text()
print(f'PASS old-401k static: title {len(t)} chars, description {len(d)}, {len(vis)} FAQs match schema, {len(ids)} official sources all cited, sitemap/llms/router/home/grid/cross-links wired.')
