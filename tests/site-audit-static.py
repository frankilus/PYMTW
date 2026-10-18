"""Verify audited metadata, indexing, local assets, and privacy boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import re,json,subprocess,os,xml.etree.ElementTree as ET
r=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.refs=[];self.canonical=[];self.description=[];self.noindex=False;self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if t=='link' and a.get('rel')=='canonical':self.canonical.append(a['href'])
  if t=='meta' and a.get('name')=='description':self.description.append(a['content'])
  if t=='meta' and a.get('name')=='robots' and 'noindex' in a.get('content',''):self.noindex=True
  for key in ['href','src','action']:
   if a.get(key):self.refs.append(a[key])
files=[p for p in r.rglob('*.html') if not any(x in p.parts for x in ['.git','preview']) and p.name!='googlea70c61482c1a9eed.html']
count=0
for p in files:
 text=p.read_text();page=Page(text)
 assert len(page.description)==1,(p,'description')
 if p.name!='404.html':
  assert len(page.canonical)==1,(p,'canonical')
  assert page.canonical[0].startswith('https://pymtw.com/'),p
 assert 'https://www.pymtw.com' not in text,p
 for raw in re.findall(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>',text,re.S):json.loads(raw)
 for ref in page.refs:
  u=urlsplit(ref)
  if u.netloc or u.scheme or not u.path:continue
  target=(r/u.path.lstrip('/') if u.path.startswith('/') else p.parent/unquote(u.path)).resolve()
  if target.is_dir():target=target/'index.html'
  assert target.exists(),(p,ref);count+=1
 if p.name in ['dashboard.html','members.html']:assert page.noindex,p
for name in ['sitemap.xml','tools/sitemap.xml']:
 tree=ET.parse(r/name)
 for url in tree.getroot():
  loc=url.find('{*}loc').text;assert url.find('{*}lastmod') is not None,loc
  path=urlsplit(loc).path;target=r/path.lstrip('/');target=target/'index.html' if target.is_dir() else target
  assert not Page(target.read_text()).noindex,loc+' noindex in sitemap'
assert 'Disallow: /tools/preview/' in (r/'robots.txt').read_text()
assert (r/'googlea70c61482c1a9eed.html').read_bytes()==subprocess.check_output(['git','show','876fcc6:googlea70c61482c1a9eed.html'],cwd=r)
for p in [r/'assets/site-analytics.js',r/'assets/not-found.js',r/'tools/v7/home.js',r/'tools/debt-payoff-planner/app.js']:
 subprocess.run([os.environ.get('NODE','node'),'--check',str(p)],check=True,capture_output=True)
print(f'Audit static checks passed: {len(files)} pages, {count} local references, canonical/description/JSON-LD, sitemaps/noindex, verification file, and changed script syntax.')
