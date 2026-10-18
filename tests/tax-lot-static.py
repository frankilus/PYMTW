"""Verify the approved launch changes and preserve existing tool privacy and behavior."""
from pathlib import Path
import subprocess,re
r=Path(__file__).resolve().parents[1]
base='eb88595e5c6d7a7391388b8d273d7b110b498e20'
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=r,text=True).splitlines():
 if name not in ['tools/bitcoin-tax-lot-cleanup/index.html','tests/v7-preservation.py','tests/site-audit-static.py','tests/site-audit-browser.cjs','tools/catalog.js','tools/v7/home.js','tools/sitemap.xml']:
  assert (r/name).read_bytes()==subprocess.check_output(['git','show',base+':'+name],cwd=r),name+' unexpectedly changed'
p=r/'tools/bitcoin-tax-lot-cleanup'
s=(p/'index.html').read_text()
assert 'noindex' not in s
assert '<meta name="referrer" content="no-referrer">' in s
for part in ["script-src 'self'", "connect-src 'none'", "form-action 'none'", "frame-src 'none'", "worker-src 'none'"]:assert part in s
assert 'unsafe-inline' not in s and '<iframe' not in s
assert 'DESIGN PREVIEW' not in s and 'Not yet released' not in s
assert 'href="/"' in s
for file in p.glob('*.js'):
 text=file.read_text()
 for term in ['localStorage','sessionStorage','indexedDB','fetch(', 'XMLHttpRequest', 'sendBeacon','document.cookie','site-analytics']:
  assert term not in text,(file,term)
for source in re.findall(r'<script[^>]*src="([^"]+)"',s):assert source in ['core.js','app.js']
# Validate exact approved launch edits rather than exempting entire catalog files.
def old(name,ref=base):return subprocess.check_output(['git','show',ref+':'+name],cwd=r,text=True)
catalog=old('tools/catalog.js');start=catalog.index('"slug": "bitcoin-tax-lot-cleanup"');end=catalog.index('"kw":',start)
expected=catalog[:start]+catalog[start:end].replace('Merge exchange exports into clean cost basis, ready for tax time.','Review Bitcoin CSV records privately, find missing costs and duplicates, and explore account-specific FIFO lots.').replace('"60 sec"','"5 min"').replace('"live": false','"live": true')+catalog[end:]
assert (r/'tools/catalog.js').read_text()==expected
home=old('tools/v7/home.js');line=next(l for l in home.splitlines() if "slug:'bitcoin-tax-lot-cleanup'" in l)
expected=home.replace(line,line.replace('live:false','live:true').replace('Get Bitcoin transaction records ready for review.','Review Bitcoin records privately and find missing costs.').replace('Coming soon: organize your Bitcoin transaction records for tax review.','Import CSV records, resolve gaps and review account-specific FIFO lots.'))
assert (r/'tools/v7/home.js').read_text()==expected
assert (r/'tools/sitemap.xml').read_text()==old('tools/sitemap.xml').replace('</urlset>','  <url><loc>https://pymtw.com/tools/bitcoin-tax-lot-cleanup/</loc><lastmod>2026-10-18</lastmod><changefreq>monthly</changefreq></url>\n</urlset>')
for name in ['core.js','app.js']:
 before=old('tools/bitcoin-tax-lot-cleanup/'+name,'7cba921').replace('This preview','This tool').replace('this preview','this tool').replace('The preview','The tool').replace('the preview','the tool')
 assert (p/name).read_text()==before,name+' reviewed logic changed'
print('PASS: exact catalog/sitemap launch changes; no preview/noindex markers; reviewed calculation/import logic preserved; no analytics, network connections or storage; existing tools, assets, privacy and deployment configuration unchanged.')
