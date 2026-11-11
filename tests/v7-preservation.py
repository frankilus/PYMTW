"""Preserve current live calculator behavior and content during the approved audit fixes."""
from pathlib import Path
import subprocess,re,json,hashlib
root=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed,either,FOOTER_PRIVACY_EDITS,SHIPPED
# Re-baselined to shipped main (2026-11-11, 9430efd) so the guard still
# flags later accidental changes after accepting already-live pages.
base=SHIPPED
def original(path):return subprocess.check_output(['git','show',base+':'+path],cwd=root)
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
count=0
# Frank explicitly replaced the book artwork with his supplied second-edition cover.
cover_manifest=json.loads((root/'assets/home/book-cover-provenance.json').read_text())
approved_covers={'assets/home/book-cover.webp','assets/home/book-cover-480.webp','assets/home/book-cover-960.webp','tools/v7/image-4.webp','tools/preview/v6/img/book-cover-336.webp','tools/preview/v6/img/book-cover-504.webp'}
assert set(cover_manifest['assets'])==approved_covers
for name,digest in cover_manifest['assets'].items():
 assert hashlib.sha256((root/name).read_bytes()).hexdigest()==digest,name+' approved cover changed'
for name in paths:
 p=root/name
 if name.endswith('.js') and not name.startswith('tests/'):
  assert matches(name,original(name)),name+' behavior changed';count+=1
 if name in ['CNAME','tools/robots.txt','googlea70c61482c1a9eed.html','bitcoin-playbook.pdf'] or name.endswith(('.csv','.webp','.woff2')):
  if name not in approved_covers:assert matches(name,original(name)),name+' original asset changed'
 if name.startswith('tools/') and name.endswith('index.html') and '/preview/' not in name and name not in ['tools/paycheck-decoder/index.html','tools/explain-my-401k/index.html','tools/bitcoin-tax-lot-cleanup/index.html']:
  assert matches(name,original(name)),name+' tool page changed'
assert matches('legal.html',original('legal.html')),'Privacy policy content changed'
print(f'Preserved {count} current JavaScript files, original photos/data/PDF/verification, tool pages and privacy disclosures; verified user-approved replacement book assets.')
