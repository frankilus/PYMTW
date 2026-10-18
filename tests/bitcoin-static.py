"""Source integrity, local references and JavaScript syntax for the current Bitcoin section."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import subprocess, os, re
root=Path(__file__).resolve().parents[1]
base='cfe4a189337bba5fa17a9d99279e32f6a5731113'
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
for name in paths:
 if name.startswith('tools/') or name in ['index.html','CNAME','robots.txt','bitcoin-playbook.pdf']:
  assert (root/name).read_bytes()==subprocess.check_output(['git','show',base+':'+name],cwd=root), name+' unexpectedly changed'
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.refs=[];self.ids=set();self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  for key in ['href','src','action']:
   if a.get(key):self.refs.append(a[key])
files=list(root.glob('*.html'))+[root/'bitcoin/index.html',root/'bitcoin/explore/index.html',root/'book/index.html']
count=0
known_missing=[]
node=os.environ.get('NODE','node')
for page in files:
 s=page.read_text();parsed=Page(s)
 assert 'subscribe-forms.beehiiv.com/api/submit' not in s, str(page)
 for ref in parsed.refs:
  u=urlsplit(ref)
  if u.scheme or u.netloc or ref=='#':continue
  target=(root/unquote(u.path.lstrip('/')) if u.path.startswith('/') else page.parent/unquote(u.path)) if u.path else page
  if target.is_dir():target=target/'index.html'
  if not target.exists():
   old=subprocess.check_output(['git','show',base+':'+str(page.relative_to(root))],cwd=root,text=True)
   assert ref in Page(old).refs,(page.name,ref,'new missing reference')
   known_missing.append((page.name,ref));continue
  if u.fragment and target.suffix=='.html':
   fragment=unquote(u.fragment)
   if target==root/'bitcoin/index.html' and fragment not in Page(target.read_text()).ids:
    legacy_source=(root/'assets/bitcoin-home/home.js').read_text()
    assert '"'+fragment+'"' in legacy_source and fragment in Page((root/'bitcoin/explore/index.html').read_text()).ids,(page.name,ref,'missing legacy target')
   else:assert fragment in Page(target.read_text()).ids,(page.name,ref,'anchor')
  count+=1
 for attrs,code in re.findall(r'<script([^>]*)>(.*?)</script>',s,re.S):
  if 'src=' in attrs or 'application/ld+json' in attrs:continue
  subprocess.run([node,'--check'],input=code,text=True,check=True,capture_output=True)
for p in list(root.glob('*.js'))+list((root/'assets/bitcoin-home').glob('*.js'))+list((root/'assets').glob('bitcoin-interiors.js')):subprocess.run([node,'--check',str(p)],check=True,capture_output=True)
print(f'Passed {count} local references across {len(files)} pages, inline/root JavaScript syntax, no unsupported Beehiiv POSTs, and preservation of all Tools files, parent homepage, routes and PDF.')

print('Pre-existing missing assets outside this fix:', known_missing)
