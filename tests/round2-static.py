"""Scope guards for the verified Round 2 audit changes."""
from pathlib import Path
import subprocess,re,json,hashlib
from html.parser import HTMLParser
r=Path(__file__).resolve().parents[1];base='639202524de45d7b8e43f49c19de08c1aea4eef6'
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed,either
def old(n):return subprocess.check_output(['git','show',base+':'+n],cwd=r)
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=r,text=True).splitlines()
for n in files:
 if n.endswith('.js') and not n.startswith('tests/'):
  before=old(n)
  if n=='assets/bitcoin-home/home.js':before=before.decode().replace('with<br>','with <br>').replace('for<br>','for <br>').replace('security<br>','security <br>').encode()
  if n=='tools/catalog.js':
   before=before.decode()
   start=before.index('"slug": "explain-my-401k"');end=before.index('"kw":',start)
   before=before[:start]+before[start:end].replace('See what you own, what it costs, and whether you’re on track.','Understand contributions, match, investments and fees with private photo/PDF import or manual entry.').replace('"45 sec"','"5 min"').replace('"live": false','"live": true')+before[end:]
   before=before.encode()
  if n=='tools/v7/home.js':before=before.decode().replace("desc:'Make sense of your workplace retirement account.',moment:'ahead',live:false", "desc:'Understand your plan with private photo/PDF import or manual entry.',moment:'ahead',live:true").replace("detail:'Coming soon: understand the investments and fees in your workplace plan.'", "detail:'Review contributions, employer matching, investment balances and estimated fees.'").encode()
  assert matches(n,before),n+' calculator/provider behavior changed'
 if n.endswith(('.webp','.woff2','.csv','.pdf')) or n in ['googlea70c61482c1a9eed.html','CNAME','sitemap.xml']:
  assert matches(n,old(n)),n
# The user authorized launching the previously reviewed 401(k) tool with PR #19.
# Hashes captured from the reviewed local preview; no unpublished Git object is required.
reviewed_scripts={'core.js': 'bb29eb685d9f21ee78608b939aea77dd4d76fb5a2fd4a9ac2ea239451fe2c7ab', 'app.js': 'd1ab5cf24f4227453e7bf0ac503978da4f2a37760ac5b0b73c35f88038b6216f', 'import.js': 'a80fba9136b745e6d7f466c18026c2878d7c6df9212bcc34a82afb97dc27319b', 'import-parser.js': 'd3be14ca98c5a2830fdbca24641aa2282317d1b358301c067a3ab9147c5f9f1a'}
for name,digest in reviewed_scripts.items():
 assert hashlib.sha256((r/"tools/explain-my-401k"/name).read_bytes()).hexdigest()==digest,name
expected_sitemap=old('tools/sitemap.xml').decode().replace('</urlset>','  <url><loc>https://pymtw.com/tools/explain-my-401k/</loc><lastmod>2026-10-18</lastmod><changefreq>monthly</changefreq></url>\n</urlset>')
assert matches('tools/sitemap.xml',expected_sitemap)
plan=(r/'tools/explain-my-401k/index.html').read_text()
assert 'noindex' not in plan and 'DESIGN PREVIEW' not in plan
assert all(term not in plan for term in ['site-analytics','gc.zgo.at','goatcounter.com','<iframe'])
assert re.search(r'<meta http-equiv="Content-Security-Policy"[^>]*>',plan)[0]=='<meta http-equiv="Content-Security-Policy" content="default-src \'self\'; script-src \'self\' \'wasm-unsafe-eval\'; worker-src \'self\' blob:; connect-src \'self\'; img-src \'self\' data: blob:; font-src \'self\' data: blob:; style-src \'self\' \'unsafe-inline\'; object-src \'none\'; frame-src \'none\'; base-uri \'none\'; form-action \'none\'">'
for slug in ['first-home','lost-my-job','true-cost-of-a-car','true-cost-of-a-baby','true-cost-of-owning-a-home','true-cost-of-a-wedding']:
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
# 2026-10-26: Frank took the Starter Kit off sale. Its checkout stays blank and no page may link to Stripe.
assert re.search(r'"starter-kit":\s*"([^"]*)"',(r/'pymtw-config.js').read_text())[1]==''
kit=(r/'starter-kit.html').read_text();assert 'buy.stripe.com' not in kit and 'data-checkout' not in kit and '$29' not in kit
assert 'Direct Amazon link · not an affiliate link' in (r/'bitcoin/explore/index.html').read_text()
assert (r/'favicon.ico').read_bytes()[:4]==b'\x00\x00\x01\x00'
assert (r/'assets/og/pymtw.png').read_bytes()[16:24]==(1200).to_bytes(4,'big')+(630).to_bytes(4,'big')
for n in files:
 if not n.endswith('.html') or '/preview/' in n or n=='googlea70c61482c1a9eed.html':continue
 s=(r/n).read_text()
 def seo(o):
  assert re.findall(r'<link[^>]+rel="canonical"[^>]*>',s)==re.findall(r'<link[^>]+rel="canonical"[^>]*>',o),n
  if n!='tools/explain-my-401k/index.html':assert re.findall(r'<meta name="robots"[^>]*>',s)==re.findall(r'<meta name="robots"[^>]*>',o),n
 either(seo,n,old(n).decode()) # e.g. the reviewed tax-lot launch removed its preview noindex
 # PR #37 replaced the 2026-10-18 favicon with the reviewed /assets/brand icon set.
 assert 'favicon.ico?v=pymtw-20261018' in s or '/assets/brand/pymtw-icon.ico?v=20261021' in s,n
 if 'content="noindex"' not in s:assert 'property="og:image"' in s,n
# Privacy-policy prose stays unchanged despite new favicon/share tags in its head.
assert (r/'legal.html').read_text().split('<body')[1]==old('legal.html').decode().split('<body')[1] or matches('legal.html',b'')
print('Round 2 scope checks passed: existing calculator JavaScript and data preserved; reviewed 401(k) scripts unchanged; privacy/CSP, canonicals and exact catalog/sitemap launch changes verified; metadata and link fixes verified.')
