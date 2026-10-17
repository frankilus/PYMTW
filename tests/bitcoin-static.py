"""Source integrity, local references and JavaScript syntax for the reliability release."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import subprocess, os, re
root=Path(__file__).resolve().parents[1]
base='48f4f8227785bd41085d1c9ea09cf8ac86322c44'
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
for name in paths:
 if name.startswith('tools/') or name in ['index.html','CNAME','sitemap.xml','robots.txt','bitcoin-playbook.pdf']:
  assert (root/name).read_bytes()==subprocess.check_output(['git','show',base+':'+name],cwd=root), name+' unexpectedly changed'
class Page(HTMLParser):
 def __init__(self,s):super().__init__();self.refs=[];self.ids=set();self.feed(s)
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  for key in ['href','src','action']:
   if a.get(key):self.refs.append(a[key])
files=list(root.glob('*.html'))+[root/'bitcoin/index.html',root/'book/index.html']
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
  if u.fragment and target.suffix=='.html':assert unquote(u.fragment) in Page(target.read_text()).ids,(page.name,ref,'anchor')
  count+=1
 for attrs,code in re.findall(r'<script([^>]*)>(.*?)</script>',s,re.S):
  if 'src=' in attrs or 'application/ld+json' in attrs:continue
  subprocess.run([node,'--check'],input=code,text=True,check=True,capture_output=True)
for p in root.glob('*.js'):subprocess.run([node,'--check',str(p)],check=True,capture_output=True)
print(f'Passed {count} local references across {len(files)} pages, inline/root JavaScript syntax, no unsupported Beehiiv POSTs, and preservation of all Tools files, parent homepage, routes and PDF.')

print('Pre-existing missing assets outside this fix:', known_missing)
