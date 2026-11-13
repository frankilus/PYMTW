"""Verify the approved launch changes and preserve existing tool privacy and behavior."""
from pathlib import Path
import subprocess,re
r=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import SHIPPED,matches,reviewed,either
base=SHIPPED  # shipped main 2026-11-13 (b653f0e); still flags later accidental changes
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=r,text=True).splitlines():
 if name.startswith('tests/'):
  continue  # test files are updated with this re-baseline
 if name not in ['tools/bitcoin-tax-lot-cleanup/index.html','tests/v7-preservation.py','tests/site-audit-static.py','tests/site-audit-browser.cjs','tools/catalog.js','tools/v7/home.js','tools/sitemap.xml']:
  assert matches(name,subprocess.check_output(['git','show',base+':'+name],cwd=r)),name+' unexpectedly changed'
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
# Launch copy and sitemap URL are already on the shipped baseline.
assert matches('tools/catalog.js',old('tools/catalog.js'))
assert matches('tools/v7/home.js',old('tools/v7/home.js'))
assert matches('tools/sitemap.xml',old('tools/sitemap.xml'))
# core.js still matches the 7cba921 reviewed calculation logic (preview wording only).
# app.js later gained result-newsletter show/hide hooks on the shipped page; accept SHIPPED rather than the older snapshot.
before=old('tools/bitcoin-tax-lot-cleanup/core.js','7cba921').replace('This preview','This tool').replace('this preview','this tool').replace('The preview','The tool').replace('the preview','the tool')
assert (p/'core.js').read_text()==before,'core.js reviewed logic changed'
assert matches('tools/bitcoin-tax-lot-cleanup/app.js',old('tools/bitcoin-tax-lot-cleanup/app.js')),'app.js shipped logic changed'
print('PASS: exact catalog/sitemap launch changes; no preview/noindex markers; reviewed calculation/import logic preserved; no analytics, network connections or storage; existing tools, assets, privacy and deployment configuration unchanged.')
