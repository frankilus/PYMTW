"""Scope guards for the verified Round 2 audit changes."""
from pathlib import Path
import subprocess,re,json
from html.parser import HTMLParser
r=Path(__file__).resolve().parents[1];base='639202524de45d7b8e43f49c19de08c1aea4eef6'
def old(n):return subprocess.check_output(['git','show',base+':'+n],cwd=r)
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=r,text=True).splitlines()
for n in files:
 if n.endswith('.js') and not n.startswith('tests/'):
  before=old(n)
  if n=='assets/bitcoin-home/home.js':before=before.decode().replace('with<br>','with <br>').replace('for<br>','for <br>').replace('security<br>','security <br>').encode()
  assert (r/n).read_bytes()==before,n+' calculator/provider behavior changed'
 if n.endswith(('.webp','.woff2','.csv','.pdf')) or n in ['googlea70c61482c1a9eed.html','CNAME','sitemap.xml','tools/sitemap.xml']:
  assert (r/n).read_bytes()==old(n),n
assert (r/'tools/catalog.js').read_bytes()==old('tools/catalog.js')
assert 'Coming soon' in (r/'tools/explain-my-401k/index.html').read_text()
assert not (r/'tools/explain-my-401k/import.js').exists(),'Do not ship the separate 401(k) preview'
for slug in ['first-home','lost-my-job','true-cost-of-a-car']:
 s=(r/f'tools/guides/{slug}/index.html').read_text();assert '/archive' not in s;assert 'Subscribe to the newsletter' in s
pay=(r/'tools/paycheck-decoder/index.html').read_text()
assert 'site-analytics' not in pay and 'gc.zgo.at' not in pay and 'goatcounter.com' not in pay and '<iframe' not in pay
assert re.search(r'<meta http-equiv="Content-Security-Policy"[^>]*>',pay)[0]==re.search(r'<meta http-equiv="Content-Security-Policy"[^>]*>',old('tools/paycheck-decoder/index.html').decode())[0]
assert 'rel="noopener noreferrer">Subscribe to the newsletter' in pay
schema=[json.loads(s) for s in re.findall(r'<script type="application/ld\+json">(.*?)</script>',pay,re.S)]
faq=schema[1]['@graph'][1]
for q in faq['mainEntity']:assert q['name'] in pay and q['acceptedAnswer']['text'] in pay
book=(r/'book/index.html').read_text();assert 'numberOfPages' not in book and 'fonts.googleapis.com' not in book and 'September 2026' in book
assert 'assets/home/book-cover-960.webp' in book
checkout=re.search(r'"starter-kit":\s*"([^"]+)"',(r/'pymtw-config.js').read_text())[1]
assert f'href="{checkout}"' in (r/'starter-kit.html').read_text()
assert 'Direct Amazon link · not an affiliate link' in (r/'bitcoin/explore/index.html').read_text()
assert (r/'favicon.ico').read_bytes()[:4]==b'\x00\x00\x01\x00'
assert (r/'assets/og/pymtw.png').read_bytes()[16:24]==(1200).to_bytes(4,'big')+(630).to_bytes(4,'big')
for n in files:
 if not n.endswith('.html') or '/preview/' in n or n=='googlea70c61482c1a9eed.html':continue
 s=(r/n).read_text();o=old(n).decode()
 assert re.findall(r'<link[^>]+rel="canonical"[^>]*>',s)==re.findall(r'<link[^>]+rel="canonical"[^>]*>',o),n
 assert re.findall(r'<meta name="robots"[^>]*>',s)==re.findall(r'<meta name="robots"[^>]*>',o),n
 assert 'favicon.ico?v=pymtw-20261018' in s,n
 if 'content="noindex"' not in s:assert 'property="og:image"' in s,n
# Privacy-policy prose stays unchanged despite new favicon/share tags in its head.
assert (r/'legal.html').read_text().split('<body')[1]==old('legal.html').decode().split('<body')[1]
print('Round 2 scope checks passed: all production JavaScript preserved except heading spaces; calculators, data, privacy, canonicals, noindex, live catalog and 401(k) launch boundary intact; metadata and link fixes verified.')
