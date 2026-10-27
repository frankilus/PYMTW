"""Protect substantive content and integrations during interior simplification."""
from pathlib import Path
import subprocess,re
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed,either
base='56cc9e630075c1df3781c4a53feec3ce8eedd0ce'
def old(name):return subprocess.check_output(['git','show',base+':'+name],cwd=root,text=True)
def read(name):return (root/name).read_text()
files=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
for name in files:
 if name.startswith(('tools/','assets/home/','assets/bitcoin-home/')) or name in ['index.html','bitcoin/index.html','bitcoin/explore/index.html','pymtw-config.js','inquiry-forms.js','bitcoin-playbook.pdf','assets/dca-prices.csv'] or (name.endswith('.js') and name!='pymtw.js'):
  assert matches(name,subprocess.check_output(['git','show',base+':'+name],cwd=root)),name
pages=[n for n in files if n.endswith('.html') and ('/' not in n or n=='book/index.html')]
def check_page(name,before):
 after=read(name)
 preserved_forms = re.sub(r'<form class="search" hidden.*?</form>', '', after, flags=re.S) if name == 'resources.html' else after
 if name == 'resources.html':before = re.sub(r'<form class="search" hidden.*?</form>', '', before, flags=re.S)
 assert re.findall(r'<form\b.*?</form>',before,re.S)==re.findall(r'<form\b.*?</form>',preserved_forms,re.S),name+' forms'
 assert re.findall(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>',before,re.S)==re.findall(r'<script(?![^>]*\bsrc=)[^>]*>.*?</script>',after,re.S),name+' inline logic/schema'
 for pattern in [r'<title>.*?</title>',r'<link[^>]*rel="canonical"[^>]*>',r'<meta[^>]*property="og:[^"]*"[^>]*>']:
  assert re.findall(pattern,before,re.S)==re.findall(pattern,after,re.S),name+' metadata'
 old_ids=set(re.findall(r'\bid="([^"]+)"',before));new_ids=set(re.findall(r'\bid="([^"]+)"',after))
 assert old_ids-new_ids <= {'navbar','nav-links','nav-toggle'},(name,old_ids-new_ids)
 for pattern in [r'<table\b.*?</table>',r'<div class="callout-security".*?</div>',r'<p class="dca-disclaimer".*?</p>']:
  for original in re.findall(pattern,before,re.S):assert original in after,name+' table/security/assumptions'
for name in pages:
 # Later reviewed PRs (canonical apex, og:image, favicon) are accepted only via the reviewed baseline.
 either(lambda before:check_page(name,before),name,old(name))
# Every resource remains, with original metadata inside an optional disclosure.
# Owner-approved (PRs #43/#46/#51: Starter Kit retired, Household Plan live): exactly these three "paid kit" metadata lists were rewritten; each must now appear in its approved replacement form.
def _meta(who,benefit,limit,cost):return '<ul class="res-meta"><li><strong>Who it\'s for</strong><span>'+who+'</span></li><li><strong>Benefits</strong><span>'+benefit+'</span></li><li><strong>Limitations</strong><span>'+limit+'</span></li><li><strong>Typical cost</strong><span>'+cost+'</span></li><li><strong>Affiliate</strong><span>N/A (our own)</span></li><li><strong>Reviewed</strong><span>Jul 2026</span></li></ul>'
_kit='See <a href="starter-kit.html">Starter Kit</a>'
_plan='Free to build, $29 to print the binder; <a href="/tools/bitcoin-household-plan/">start your plan</a>'
SUPERSEDED_META={
 _meta('Existing holders','Structured yearly check','Part of paid kit',_kit):_meta('Existing holders','Structured yearly check','Self-guided; you run the review yourself',_plan),
 _meta('DIY accumulators','Lightweight; no data sharing','Manual; part of paid kit',_kit):_meta('DIY accumulators','Lightweight; no data sharing','Manual entry; not tax advice',_plan),
 _meta('Families &amp; couples','Practical starting framework','Not legal advice; part of paid kit',_kit):_meta('Families &amp; couples','Practical starting framework','Not legal advice',_plan),
}
for metadata in re.findall(r'<ul class="res-meta">.*?</ul>',old('resources.html'),re.S):assert metadata in read('resources.html') or (metadata in SUPERSEDED_META and SUPERSEDED_META[metadata] in read('resources.html')),metadata
# Original resource headings/descriptions and link destinations survive regrouping.
# Owner-approved (Starter Kit retired, Household Plan live): these three descriptions, and their starter-kit.html links, were replaced by Household Plan copy.
SUPERSEDED_TEXT={'Our checklist (in the Starter Kit) to keep your setup healthy as holdings grow.','A simple purchase & cost-basis log (in the Starter Kit).','The conversation and documents your family needs (in the Starter Kit).'}
import html
def plain(markup):return ' '.join(html.unescape(re.sub(r'<[^>]+>', ' ', markup)).split())
library=read('resources.html')
for card in re.findall(r'<div class="(?:p-card|res-card)">(.*?)</div>',old('resources.html'),re.S):
 for content in re.findall(r'<(?:h3|p)\b[^>]*>(.*?)</(?:h3|p)>',card,re.S):
  assert plain(content) in plain(library) or plain(content) in SUPERSEDED_TEXT, 'Resource text removed: '+plain(content)
 retired_card=any(plain(content) in SUPERSEDED_TEXT for content in re.findall(r'<(?:h3|p)\b[^>]*>(.*?)</(?:h3|p)>',card,re.S))
 for href in re.findall(r'href="([^"]+)"',card):
  assert 'href="'+href+'"' in library or (retired_card and href=='starter-kit.html'), 'Resource destination removed: '+href
# The legal page's main content is unchanged except the breadcrumb destination.
legal=re.search(r'<main\b.*?</main>',old('legal.html'),re.S)[0].replace('href="index.html">Home</a>','href="/bitcoin/">Bitcoin</a>')
assert legal in read('legal.html') or read('legal.html').encode()==reviewed('legal.html')
print('Preserved all calculator/provider code, parent/Tools/homepage assets, forms, inline scripts, canonical/social metadata, old content IDs, comparison tables, security notices, DCA assumptions, resource metadata and legal content.')
