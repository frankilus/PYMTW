"""Preserve current live calculator behavior and content during the approved audit fixes."""
from pathlib import Path
import subprocess,re,json,hashlib
root=Path(__file__).resolve().parents[1]
# PRs 10–12 intentionally superseded the original V7 snapshot. Protect current main.
base='876fcc6827857ceca9d5b5d6798bbb62fb9b08c9'
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
  before=original(name).decode();after=p.read_text()
  if name=='pymtw-config.js':before=before.replace('https://www.pymtw.com','https://pymtw.com')
  elif name=='tools/debt-payoff-planner/app.js':
   for label,key in [('Debt name','name'),('Balance','balance'),('Annual percentage rate','apr'),('Minimum monthly payment','min')]:
    before=before.replace('data-k="'+key+'"','aria-label="'+label+'" data-k="'+key+'"')
  elif name=='tools/v7/home.js':continue # Approved benefit copy and 404-search handoff; tested in browser.
  assert before==after,name+' behavior changed';count+=1
 if name in ['CNAME','tools/robots.txt','googlea70c61482c1a9eed.html','bitcoin-playbook.pdf'] or name.endswith(('.csv','.webp','.woff2')):
  if name not in approved_covers:assert p.read_bytes()==original(name),name+' original asset changed'
 if name.startswith('tools/') and name.endswith('index.html') and '/preview/' not in name:
  before=original(name).decode();after=p.read_text()
  for pattern in [r'<!-- seo:head -->.*?<!-- /seo:head -->',r'<script type="application/ld\+json">.*?</script>',r'<form\b.*?</form>',r'<fieldset\b.*?</fieldset>']:
   for block in re.findall(pattern,before,re.S):assert block in after,name+' original SEO/form/schema changed'
  # Existing visible copy survives outside the explicitly revised homepage copy.
  if name!='tools/index.html':
   for block in re.findall(r'<p\b[^>]*>.*?</p>',before,re.S):
    block=block.replace('href="https://pymtwtools.beehiiv.com"','href="https://pymtwtools.beehiiv.com/archive"')
    assert block in after,name+' original paragraph changed'
# Preserve privacy disclosures verbatim; only hostname and analytics loader additions are allowed.
old=original('legal.html').decode().replace('https://www.pymtw.com','https://pymtw.com')
new=(root/'legal.html').read_text().replace('<meta name="referrer" content="strict-origin-when-cross-origin">\n','').replace('<script src="/assets/site-analytics.js" defer></script>\n','')
assert old==new,'Privacy policy content changed'
print(f'Preserved {count} current JavaScript files (debt labels excepted), original photos/data/PDF/verification, tool SEO/schema/forms/paragraphs and privacy disclosures; verified user-approved replacement book assets.')
