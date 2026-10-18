from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import subprocess
root=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
 def __init__(self):super().__init__();self.links=[]
 def handle_starttag(self,tag,attrs):
  for key,value in attrs:
   if key in ('href','src') and value:self.links.append(value)
new_bad=[];existing_bad=[];checked=0
pages=[root/'tools/index.html']+[p for p in (root/'tools').rglob('index.html') if '/preview/' not in str(p) and p!=root/'tools/index.html']
for page in pages:
 parser=Links();parser.feed(page.read_text());old=Links();old.feed(subprocess.check_output(['git','show','a5afedc49c21fcbb83393fb6e5a7c25af504c790:'+str(page.relative_to(root))],cwd=root,text=True))
 for link in parser.links:
  u=urlsplit(link)
  if u.scheme or u.netloc or not u.path:continue
  target=(root/u.path.lstrip('/') if u.path.startswith('/') else page.parent/unquote(u.path)).resolve();checked+=1
  if target.is_dir():target=target/'index.html'
  if not target.exists():(existing_bad if link in old.links else new_bad).append((str(page.relative_to(root)),link))
print(f'Checked {checked} local link/asset references. New broken links: {new_bad}. Existing broken links: {existing_bad}')
assert not new_bad
