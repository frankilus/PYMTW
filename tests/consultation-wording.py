"""Protect legacy routes, inquiry intake and privacy during consultation copy updates."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import subprocess, json, re, html
ROOT=Path(__file__).resolve().parents[1]
BASE='5a6e4b5984bb4190afb4b1753889b4fd20d375ac'
class Page(HTMLParser):
    def __init__(self,text):
        super().__init__(); self.nodes=[]; self.text=[]; self.skip=0; self.feed(text)
    def handle_starttag(self,t,attrs):
        self.nodes.append((t,dict(attrs)))
        if t in ('script','style','head'): self.skip+=1
    def handle_endtag(self,t):
        if t in ('script','style','head'): self.skip-=1
    def handle_data(self,data):
        if not self.skip: self.text.append(data)
def before(name): return subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT,text=True)
changed=subprocess.check_output(['git','diff','--name-only',BASE],cwd=ROOT,text=True).splitlines()
checked=0
for name in changed:
    assert not name.startswith('tools/'), 'Private tool changed: '+name
    if not name.endswith('.html'): continue
    a,b=Page(before(name)),Page((ROOT/name).read_text())
    assert [v for t,v in a.nodes if t=='form']==[v for t,v in b.nodes if t=='form'], name
    assert [v for t,v in a.nodes if t=='input' and v.get('type')=='hidden']==[v for t,v in b.nodes if t=='input' and v.get('type')=='hidden'], name
    assert [v.get('id') for t,v in a.nodes if 'id' in v]==[v.get('id') for t,v in b.nodes if 'id' in v], name
    assert [v for t,v in a.nodes if t=='link' and v.get('rel')=='canonical']==[v for t,v in b.nodes if t=='link' and v.get('rel')=='canonical'], name
    for t,attrs in b.nodes:
        if t not in ('a','script','link'): continue
        href=attrs.get('href',attrs.get('src','')); u=urlsplit(href)
        if u.netloc or u.scheme or not href: continue
        path=ROOT/unquote(u.path.lstrip('/')) if u.path.startswith('/') else (ROOT/name).parent/unquote(u.path) if u.path else ROOT/name
        if path.is_dir(): path/='index.html'
        if not path.exists() and not path.suffix: path=path.with_suffix('.html')
        # Only regress newly introduced destinations; pre-existing unrelated links stay out of scope.
        original_links={v.get('href',v.get('src','')) for _,v in a.nodes}
        if href not in original_links:
            assert path.exists(), (name,href)
            if u.fragment and path.suffix=='.html': assert any(v.get('id')==unquote(u.fragment) for _,v in Page(path.read_text()).nodes),(name,href)
        checked+=1
for file,price,duration,unit in [('workshop-professionals.html','79','75','one client'),('workshop-self-custody.html','129','90','one client'),('workshop-family.html','199','90','one household')]:
    text=(ROOT/file).read_text(); p=Page(text); visible=' '.join(p.text).lower()
    assert 'workshop' not in visible and 'recording included' not in visible and 'no seat' not in visible, file
    assert duration+' minutes' in visible and unit in visible and '$'+price in visible,file
    assert 'mutual agreement' in visible and 'before payment' in visible,file
    assert 'data-checkout' not in text and 'buy.stripe.com' not in text,file
    scripts=[json.loads(x) for x in re.findall(r'<script type="application/ld\+json">\s*(.*?)\s*</script>',text,re.S)]
    service=next(x for x in scripts if x['@type']=='Service')
    assert service['offers']['price']==price and service['offers']['priceCurrency']=='USD'
    assert service['url']=='https://pymtw.com/'+file
    faq=next(x for x in scripts if x['@type']=='FAQPage')
    visible_faq=re.findall(r'<details class="faq-item"><summary>(.*?)</summary><div class="faq-body">(.*?)</div></details>',text,re.S)
    clean=lambda x:html.unescape(re.sub('<[^>]+>','',x))
    assert [(x['name'],x['acceptedAnswer']['text']) for x in faq['mainEntity']]==[(clean(q),clean(a)) for q,a in visible_faq]
# Remaining visible workshop references are specifically group/corporate offers and policies.
allowed={'legal.html','membership.html','about.html','book/index.html','corporate.html','programs.html'}
for p in list(ROOT.glob('*.html'))+list((ROOT/'bitcoin').rglob('*.html')):
    if 'workshop' in ' '.join(Page(p.read_text()).text).lower(): assert str(p.relative_to(ROOT)) in allowed,p
for slug in ('paycheck-decoder','explain-my-401k','bitcoin-tax-lot-cleanup','bitcoin-household-plan'):
    name=f'tools/{slug}/index.html'; text=(ROOT/name).read_text()
    assert text==before(name),name
    assert not re.search(r'<script[^>]*src=["\x27][^"\x27]*(analytics|pymtw-config|googletagmanager)',text,re.I),name
assert 'Programs & workshops' not in (ROOT/'pymtw.js').read_text()
assert 'Programs &amp; workshops' not in (ROOT/'pymtw.js').read_text()
assert not re.search(r'Workshop:|See the workshop|Bitcoin Implementation Intensive',(ROOT/'assessment.html').read_text())
print(f'PASS: {checked} public references checked; legacy routes, forms and IDs preserved; three Service/FAQ schemas match private offers; remaining group/corporate wording scoped; four private tools unchanged and analytics-free.')
