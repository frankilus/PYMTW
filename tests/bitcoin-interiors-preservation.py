"""Protect substantive content and integrations during interior simplification."""
from pathlib import Path
import subprocess,re
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
base='56cc9e630075c1df3781c4a53feec3ce8eedd0ce'
def old(name):return subprocess.check_output(['git','show',base+':'+name],cwd=root,text=True)
def read(name):return (root/name).read_text()
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
for name in files:
 if name.startswith(('tools/','assets/home/','assets/bitcoin-home/')) or name in ['index.html','bitcoin/index.html','bitcoin/explore/index.html','pymtw-config.js','inquiry-forms.js','bitcoin-playbook.pdf','assets/dca-prices.csv'] or (name.endswith('.js') and name!='pymtw.js'):
  assert (root/name).read_bytes()==subprocess.check_output(['git','show',base+':'+name],cwd=root),name
pages=[n for n in files if n.endswith('.html') and ('/' not in n or n=='book/index.html')]
for name in pages:
 before,after=old(name),read(name)
 preserved_forms = re.sub(r'<form class="search" hidden.*?</form>', '', after, flags=re.S) if name == 'resources.html' else after
 assert re.findall(r'<form\b.*?</form>',before,re.S)==re.findall(r'<form\b.*?</form>',preserved_forms,re.S),name+' forms'
 assert re.findall(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>',before,re.S)==re.findall(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>',after,re.S),name+' inline logic/schema'
 for pattern in [r'<title>.*?</title>',r'<link[^>]*rel="canonical"[^>]*>',r'<meta[^>]*property="og:[^"]*"[^>]*>']:
  assert re.findall(pattern,before,re.S)==re.findall(pattern,after,re.S),name+' metadata'
 old_ids=set(re.findall(r'\bid="([^"]+)"',before));new_ids=set(re.findall(r'\bid="([^"]+)"',after))
 assert old_ids-new_ids <= {'navbar','nav-links','nav-toggle'},(name,old_ids-new_ids)
 for pattern in [r'<table\b.*?</table>',r'<div class="callout-security".*?</div>',r'<p class="dca-disclaimer".*?</p>']:
  for original in re.findall(pattern,before,re.S):assert original in after,name+' table/security/assumptions'
# Every resource remains, with original metadata inside an optional disclosure.
for metadata in re.findall(r'<ul class="res-meta">.*?</ul>',old('resources.html'),re.S):assert metadata in read('resources.html')
# Original resource headings/descriptions and link destinations survive regrouping.
import html
def plain(markup):return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', markup)).split())
library=read('resources.html')
for card in re.findall(r'<div class="(?:p-card|res-card)">(.*?)</div>',old('resources.html'),re.S):
 for content in re.findall(r'<(?:h3|p)\b[^>]*>(.*?)</(?:h3|p)>',card,re.S):
  assert plain(content) in plain(library), 'Resource text removed: '+plain(content)
 for href in re.findall(r'href="([^"]+)"',card):
  assert 'href="'+href+'"' in library, 'Resource destination removed: '+href
# The legal page's main content is unchanged except the breadcrumb destination.
legal=re.search(r'<main\b.*?</main>',old('legal.html'),re.S)[0].replace('href="index.html">Home</a>','href="/bitcoin/">Bitcoin</a>')
assert legal in read('legal.html')
print('Preserved all calculator/provider code, parent/Tools/homepage assets, forms, inline scripts, canonical/social metadata, old content IDs, comparison tables, security notices, DCA assumptions, resource metadata and legal content.')
