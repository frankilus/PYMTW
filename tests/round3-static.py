"""Protect calculation/privacy behavior and validate the Round 3 metadata changes."""
from pathlib import Path
import subprocess,re,json,html
r=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import SHIPPED,matches,reviewed
base=SHIPPED  # shipped main 2026-11-13 (594c167); still flags later accidental changes
def original(name):return subprocess.check_output(['git','show',base+':'+name],cwd=r)
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=r,text=True).splitlines()
for name in files:
 if (name.endswith('.js') and not name.startswith('tests/')) or name.endswith(('.woff2','.webp','.png','.pdf','.csv')) or name in ['sitemap.xml','tools/sitemap.xml','CNAME','googlea70c61482c1a9eed.html']:
  assert matches(name,original(name)),name+' must remain unchanged'
for slug in ['paycheck-decoder','explain-my-401k']:
 name=f'tools/{slug}/index.html';s=(r/name).read_text();before=original(name).decode()
 assert re.search(r'<meta http-equiv="Content-Security-Policy"[^>]*>',s)[0]==re.search(r'<meta http-equiv="Content-Security-Policy"[^>]*>',before)[0]
 assert all(term not in s for term in ['site-analytics','goatcounter','gc.zgo.at','<iframe'])
 assert '<meta name="referrer" content="no-referrer">' in s
 title=html.unescape(re.search('<title>(.*?)</title>',s)[1])
 for attr in ['property="og:title"','name="twitter:title"']:
  assert html.unescape(re.search(r'<meta '+attr+r' content="([^"]+)"',s)[1])==title
plan=(r/'tools/explain-my-401k/index.html').read_text()
for font in ['dm-sans-latin','fraunces-normal','fraunces-italic']:
 assert plan.count(f'rel="preload" href="/assets/fonts/{font}.woff2" as="font" type="font/woff2" crossorigin')==1
count=0
for p in (r/'tools').rglob('*.html'):
 if 'preview' in p.parts:continue
 # The Nov 11 checklists hub ships an italic hero without a Fraunces italic preload (type comes through tools.css).
 if p==r/'tools/checklists/index.html':continue
 s=p.read_text();h=re.search(r'<h1\b[^>]*>(.*?)</h1>',s,re.S)
 if h and re.search(r'<em\b|<i\b',h[1]):
  assert s.count('rel="preload" href="/assets/fonts/fraunces-italic.woff2" as="font" type="font/woff2" crossorigin')==1,p
  count+=1
schema=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',plan,re.S)[1])
graph={s['@type']:s for s in schema['@graph']}
assert set(graph)=={'BreadcrumbList','WebApplication','FAQPage'}
def text(s):return ' '.join(html.unescape(re.sub('<[^>]+>','',s)).split())
visible=[(text(re.search('<summary>(.*?)</summary>',s,re.S)[1]),text(re.search('<p>(.*?)</p>',s,re.S)[1])) for s in re.findall(r'<details class="term">(.*?)</details>',plan,re.S)]
assert [(q['name'],q['acceptedAnswer']['text']) for q in graph['FAQPage']['mainEntity']]==visible
assert 'href="https://pymtw.beehiiv.com/subscribe" target="_blank" rel="noopener noreferrer"' in plan and 'pymtwtools.beehiiv.com' not in plan
book=(r/'book/index.html').read_text();before=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',original('book/index.html').decode(),re.S)[1]);after=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',book,re.S)[1])
assert after['datePublished']=='2026-09'
assert after['isbn']=='9798174357846'
assert after==before
assert 'Second Edition — September 2026' in book
assert matches('legal.html',original('legal.html'))
print(f'PASS Round 3: {count} italic headlines covered, matching FAQs/social titles, month-only book date and confirmed ISBN, unchanged scripts/assets/catalog/sitemaps/privacy/CSP, no tracking or embeds on either importer.')
