"""The new preview must not alter live tools, privacy, catalogs or deployment."""
from pathlib import Path
import subprocess,re
r=Path(__file__).resolve().parents[1]
base='eb88595e5c6d7a7391388b8d273d7b110b498e20'
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=r,text=True).splitlines():
 if name not in ['tools/bitcoin-tax-lot-cleanup/index.html','tests/v7-preservation.py']:
  assert (r/name).read_bytes()==subprocess.check_output(['git','show',base+':'+name],cwd=r),name+' unexpectedly changed'
p=r/'tools/bitcoin-tax-lot-cleanup'
s=(p/'index.html').read_text()
assert '<meta name="robots" content="noindex">' in s
assert '<meta name="referrer" content="no-referrer">' in s
for part in ["script-src 'self'", "connect-src 'none'", "form-action 'none'", "frame-src 'none'", "worker-src 'none'"]:assert part in s
assert 'unsafe-inline' not in s and '<iframe' not in s
assert 'DESIGN PREVIEW' in s
assert 'href="/"' in s
for file in p.glob('*.js'):
 text=file.read_text()
 for term in ['localStorage','sessionStorage','indexedDB','fetch(', 'XMLHttpRequest', 'sendBeacon','document.cookie','site-analytics']:
  assert term not in text,(file,term)
for source in re.findall(r'<script[^>]*src="([^"]+)"',s):assert source in ['core.js','app.js']
print('PASS: only planned tool HTML and scoped preservation exception replace existing files; all live tools, catalogs, sitemaps, assets, privacy and deployment configuration unchanged; preview noindex and strict no-network/no-storage boundaries.')
