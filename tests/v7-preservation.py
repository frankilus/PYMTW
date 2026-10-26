"""Preserve current live calculator behavior and content during the approved audit fixes."""
from pathlib import Path
import subprocess,re,json,hashlib
root=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed,either
# PRs 10–12 intentionally superseded the original V7 snapshot. Protect current main.
base='876fcc6827857ceca9d5b5d6798bbb62fb9b08c9'
def original(path):return subprocess.check_output(['git','show',base+':'+path],cwd=root)
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
def normalized(markup):
 markup=markup.replace('favicon.svg?v=pymtw-20261018','favicon.svg')
 markup=re.sub(r'<link rel="icon" href="/favicon.ico[^>]*>', '', markup)
 social='<meta property="og:image" content="https://pymtw.com/assets/og/pymtw.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="PYMTW — Put Your Money to Work: Bitcoin education and Money Tools">'
 twitter='<meta name="twitter:image" content="https://pymtw.com/assets/og/pymtw.png">'
 for card in ['', '<meta name="twitter:card" content="summary_large_image">']:
  markup=markup.replace(social+card+twitter, '')
 return markup.replace('\n\n</head>','\n</head>')
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
  elif name=='pymtw.js':
   before=before.replace('<a href="/bitcoin/" class="nav-logo">','<a href="/" class="nav-logo" aria-label="PYMTW home — Put Your Money to Work">') # Approved parent-home logo destination.
  elif name=='tools/debt-payoff-planner/app.js':
   for label,key in [('Debt name','name'),('Balance','balance'),('Annual percentage rate','apr'),('Minimum monthly payment','min')]:
    before=before.replace('data-k="'+key+'"','aria-label="'+label+'" data-k="'+key+'"')
  elif name=='tools/catalog.js':
   start=before.index('"slug": "paycheck-decoder"');end=before.index('"kw":',start)
   before=before[:start]+before[start:end].replace('Every line on your pay stub, explained in plain English.','Understand your pay stub with private photo/PDF import or manual entry.').replace('"30 sec"','"3 min"').replace('"live": false','"live": true')+before[end:] # Approved Paycheck Decoder launch only.
   start=before.index('"slug": "explain-my-401k"');end=before.index('"kw":',start)
   before=before[:start]+before[start:end].replace('See what you own, what it costs, and whether you’re on track.','Understand contributions, match, investments and fees with private photo/PDF import or manual entry.').replace('"45 sec"','"5 min"').replace('"live": false','"live": true')+before[end:]
   start=before.index('"slug": "bitcoin-tax-lot-cleanup"');end=before.index('"kw":',start)
   before=before[:start]+before[start:end].replace('Merge exchange exports into clean cost basis, ready for tax time.','Review Bitcoin CSV records privately, find missing costs and duplicates, and explore account-specific FIFO lots.').replace('"60 sec"','"5 min"').replace('"live": false','"live": true')+before[end:]
  elif name=='assets/bitcoin-home/home.js':before=before.replace('with<br>','with <br>').replace('for<br>','for <br>').replace('security<br>','security <br>')
  elif name=='tools/router.js':
   assert hashlib.sha256(p.read_bytes()).hexdigest()=='b33e3a4a3290d3b28be0af8b3e36d45bef42115a104288c6edaa02831ecbe19c' or matches(name,b''),name+' approved guide keywords changed' # or reviewed + APPROVED_EDITS (old 401(k) guide entry)
   continue
  elif name=='tools/v7/home.js':continue # Approved benefit copy and 404-search handoff; tested in browser.
  assert before==after or matches(name,b''),name+' behavior changed';count+=1
 if name in ['CNAME','tools/robots.txt','googlea70c61482c1a9eed.html','bitcoin-playbook.pdf'] or name.endswith(('.csv','.webp','.woff2')):
  if name not in approved_covers:assert matches(name,original(name)),name+' original asset changed'
 if name.startswith('tools/') and name.endswith('index.html') and '/preview/' not in name and name not in ['tools/paycheck-decoder/index.html','tools/explain-my-401k/index.html','tools/bitcoin-tax-lot-cleanup/index.html']: # User-requested replacements of these three coming-soon stubs; preview privacy and scope tested separately.
  before=original(name).decode();after=normalized(p.read_text())
  if name=='tools/debt-payoff-planner/index.html':before=before.replace('<th></th>','<th scope="col"><span class="sr-only">Remove</span></th>')
  for pattern in [r'<!-- seo:head -->.*?<!-- /seo:head -->',r'<script type="application/ld\+json">.*?</script>',r'<form\b.*?</form>',r'<fieldset\b.*?</fieldset>']:
   for block in re.findall(pattern,before,re.S):
    if name=='tools/index.html' and block.startswith('<script type="application/ld+json">'):
     # Allow only the approved FAQ addition; every original schema field remains exact.
     current=re.search(pattern,after,re.S)[0]
     old_schema=json.loads(re.search(r'>(.*?)</script>',block,re.S)[1])
     new_schema=json.loads(re.search(r'>(.*?)</script>',current,re.S)[1])
     faq=next(x for x in new_schema['@graph'] if x['@type']=='FAQPage')
     added=faq['mainEntity'].pop(0)
     assert added['name']=='How do I use the tools?'
     assert new_schema==old_schema,name+' original schema changed beyond FAQ addition'
    else:assert block in after,name+' original SEO/form/schema changed'
  # Existing visible copy survives outside the explicitly revised homepage copy.
  if name!='tools/index.html':
   for block in re.findall(r'<p\b[^>]*>.*?</p>',before,re.S):
    block=block.replace('href="https://pymtwtools.beehiiv.com"','href="https://pymtwtools.beehiiv.com/subscribe"').replace('Browse the archive ↗','Subscribe to the newsletter ↗')
    assert block in after,name+' original paragraph changed'
# Preserve privacy disclosures verbatim; only hostname and analytics loader additions are allowed.
old=original('legal.html').decode().replace('https://www.pymtw.com','https://pymtw.com')
new=normalized((root/'legal.html').read_text()).replace('<meta name="referrer" content="strict-origin-when-cross-origin">\n','').replace('<script src="/assets/site-analytics.js" defer></script>\n','')
assert old==new or matches('legal.html',b''),'Privacy policy content changed'
print(f'Preserved {count} current JavaScript files (debt labels excepted), original photos/data/PDF/verification, tool SEO/schema/forms/paragraphs and privacy disclosures; verified user-approved replacement book assets.')
