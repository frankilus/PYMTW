from pathlib import Path
import subprocess,re,hashlib,base64
root=Path(__file__).resolve().parents[1]
base='484efc4d2b63821b09cbeaf44ac6116d4aa31348'
def original(path):return subprocess.check_output(['git','show',base+':'+path],cwd=root)
paths=subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines()
count=0
for name in paths:
 p=root/name
 if name.endswith('.js') or name in ['legal.html','tools/sitemap.xml','tools/robots.txt','robots.txt','CNAME','index.html']:
  assert p.read_bytes()==original(name),name+' changed';count+=1
 if name.startswith('tools/') and name.endswith('index.html') and '/preview/' not in name:
  old=original(name).decode();new=p.read_text()
  seo=re.search(r'<!-- seo:head -->(.*?)<!-- /seo:head -->',old,re.S)
  if seo:assert seo[1] in new,name+' SEO changed'
  for schema in re.findall(r'<script type="application/ld\+json">.*?</script>',old,re.S):assert schema in new,name+' schema changed'
  if name=='tools/index.html':
   assert re.search(r'<!-- seo:body -->.*?<!-- /seo:body -->',old,re.S).group() in new
  if name!='tools/index.html':
   new=re.sub(r'<link rel="stylesheet" href="(?:../)+v7/pages.css">\n','',new)
   new=re.sub(r'<div class="v7-next">.*?</div>\n','',new)
   new=new.replace('<meta name="theme-color" content="#fffbf6">','<meta name="theme-color" content="#0a7c55">')
   new=new.replace('No cookies, except any set by the beehiiv newsletter signup form on this page.','No cookies.')  # accurate cookie wording (guides lazy-load beehiiv)
   assert old==new,name+' original content changed'
print(f'Preserved {count} existing JS/config/privacy files, all tool/guide page content and all SEO blocks/schema.')
