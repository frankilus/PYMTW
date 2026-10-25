from pathlib import Path
import re,json,html,subprocess
from urllib.parse import urlsplit,parse_qs
R=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed,either
slugs=['true-cost-of-a-baby','true-cost-of-owning-a-home','true-cost-of-a-wedding']
def clean(s):return html.unescape(re.sub('<[^>]*>','',s)).strip()
base='13162100d02691ce01a3d4e8de9e9775e62dbe37'
allowed={'tools/index.html','tools/v7/home.css','tools/v7/home.js','tools/router.js','tools/sitemap.xml','tools/llms.txt','tools/guides/true-cost-of-a-car/index.html','tools/guides/first-home/index.html','tools/guides/lost-my-job/index.html','tools/rent-vs-buy/index.html','tools/emergency-fund-runway/index.html'}
for n in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=R,text=True).splitlines():
 if n not in allowed and not n.startswith('tests/'):
  assert matches(n,subprocess.check_output(['git','show',base+':'+n],cwd=R)),n+' unexpected change'
car=(R/'tools/guides/true-cost-of-a-car/index.html').read_text()
oldcar=subprocess.check_output(['git','show',base+':tools/guides/true-cost-of-a-car/index.html'],cwd=R,text=True)
oldcar=oldcar.replace('<h2>One genuinely useful money idea per issue</h2>','<h2>Get one clear money idea a week</h2>').replace('sup.ref{font-size:11px','sup.ref{font-size:12px').replace('sup.ref a{color:var(--accent);font-weight:700}','sup.ref a{color:var(--accent);font-weight:700;display:inline-flex;min-width:24px;min-height:24px;align-items:center;justify-content:center}').replace('.sources a{color:var(--accent);word-break:break-word;text-decoration:underline;text-underline-offset:3px}','.sources a{color:var(--accent);word-break:break-word;text-decoration:underline;text-underline-offset:3px}\n.sources a{display:inline-block;min-height:24px;padding:4px 0}\n.newsletter-archive a{display:inline-block;min-height:24px;padding:4px 0}')
strip_related=lambda s:re.sub(r'<nav class="related".*?</nav>','',s,flags=re.S)
assert strip_related(car)==strip_related(oldcar) or matches('tools/guides/true-cost-of-a-car/index.html',b''),'Car changes exceed related nav and approved reference/newsletter styling'
home=(R/'tools/index.html').read_text()
grid=re.search(r'<div class="life-guides-grid">(.*?)</section>',home,re.S)[1]
expected=['true-cost-of-a-car',*slugs,'first-home','lost-my-job']
assert sorted(re.findall(r'href="/tools/guides/([^"/]+)/"',grid))==sorted(expected)
visible=[(clean(q),clean(a)) for q,a in re.findall(r'<details[^>]*><summary>(.*?)</summary><p>(.*?)</p></details>',home,re.S) if clean(q)!='Privacy and newsletter details']
faq=next(x for x in json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',home,re.S)[1])['@graph'] if x['@type']=='FAQPage')
assert sorted(visible)==sorted((q['name'],q['acceptedAnswer']['text']) for q in faq['mainEntity'])
# The older guides accept only the requested newsletter heading; retain all other bytes.
for older in ['first-home','lost-my-job']:
 n='tools/guides/'+older+'/index.html'
 old=subprocess.check_output(['git','show','a5afedc49c21fcbb83393fb6e5a7c25af504c790'+':'+n],cwd=R,text=True)
 assert matches(n,old.replace('<h2>One genuinely useful money idea per issue</h2>','<h2>Get one clear money idea a week</h2>'))
for slug in slugs:
 s=(R/f'tools/guides/{slug}/index.html').read_text();title=clean(re.search('<title>(.*?)</title>',s)[1]);desc=html.unescape(re.search('<meta name="description" content="(.*?)">',s)[1]);url='https://pymtw.com/tools/guides/'+slug+'/'
 assert len(title)<60 and len(desc)<155,(slug,len(title),len(desc))
 assert re.findall(r'<link rel="canonical" href="([^"]+)"',s)==[url]
 for key,v in [('og:title',title),('twitter:title',title),('og:description',desc),('twitter:description',desc),('og:url',url),('og:image','https://pymtw.com/tools/og/guides.png'),('twitter:image','https://pymtw.com/tools/og/guides.png')]:assert html.unescape(re.search(r'<meta (?:property|name)="'+key+r'" content="([^"]+)"',s)[1])==v
 graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1])['@graph'];assert [x['@type'] for x in graph]==['BreadcrumbList','Article','FAQPage'];assert graph[1]['description']==desc
 share=html.unescape(re.search(r'href="(https://x.com/intent/post[^"]+)"',s)[1])
 params=parse_qs(urlsplit(share).query)
 assert params['text']==[graph[1]['headline']] and 'owning a car' not in params['text'][0]
 assert params['url']==[url]
 # Exact allowed changes protect every figure, source, SEO tag, FAQ and calculator.
 before=subprocess.check_output(['git','show','a5afedc49c21fcbb83393fb6e5a7c25af504c790'+':tools/guides/'+slug+'/index.html'],cwd=R,text=True)
 from urllib.parse import quote
 before=re.sub(r'(https://x.com/intent/post\?text=)[^&"]+',lambda m:m[1]+quote(graph[1]['headline'],safe=''),before)
 before=before.replace('</style>','.newsletter-archive a{display:inline-block;min-height:24px;padding:4px 0}\n</style>',1)
 if slug=='true-cost-of-a-wedding':before=before.replace("notes.push('Reducing the guest list","if(Math.floor(o.guests)>0)notes.push('Reducing the guest list")
 assert s==before or matches(f'tools/guides/{slug}/index.html',b''),slug+' content change outside approved scope'

 faq=re.search(r'<div class="faq">(.*?)</div><nav class="related"',s,re.S)[1];visible=[(clean(q),clean(a)) for q,a in re.findall(r'<div class="qa"><h3>(.*?)</h3><p>(.*?)</p>',faq,re.S)];assert visible==[(q['name'],q['acceptedAnswer']['text']) for q in graph[2]['mainEntity']]
 answer=re.search(r'<p class="direct-answer">(.*?)</p>',s,re.S)[1];answer=clean(re.sub(r'<sup.*?</sup>','',answer));assert 40<=len(answer.split())<=60,(slug,len(answer.split()))
 ids=re.findall(r'id="([^"]+)"',s);assert len(ids)==len(set(ids)),slug+' duplicate ids'
 for ref in re.findall('href="#(src-\d+)"',s):assert re.search(r'<li id="'+ref+'"',s),ref
 assert '<h2>Get one clear money idea a week</h2>' in s and 'https://pymtwtools.beehiiv.com/subscribe" target="_blank" rel="noopener">Subscribe to the newsletter ↗' in s
 assert '/assets/site-analytics.js' in s and 'rel="sponsored' not in s
 assert all(float(v)>=12 for v in re.findall(r'font-size:([\d.]+)px',s))
 assert s.count('rel="preload"')==3
 assert re.search(r'<p class="privacy-note">.*?</p>',s,re.S)[0]==re.search(r'<p class="privacy-note">.*?</p>',car,re.S)[0]
 for n in ['tools/sitemap.xml','tools/llms.txt','tools/router.js','tools/v7/home.js']:assert slug in (R/n).read_text()
 js=(R/f'tools/guides/{slug}/calc.js').read_text();assert not re.search(r'fetch\(|XMLHttpRequest|localStorage|sessionStorage|location\.',js)
 print(slug,': title',len(title),'description',len(desc),'direct answer',len(answer.split()),'words; schema/FAQ/refs/privacy pass')
print('PASS scope guard including untouched private tools, root homepage, car content/math, existing photos, metadata, exact FAQ schema and discovery wiring.')

# Optional real Pages output: public pages retained, internal notes/tests excluded.
import os
if os.environ.get('BUILT_SITE'):
 built=Path(os.environ['BUILT_SITE'])
 for note in R.glob('*.md'):
  assert not (built/note.name).exists()
  assert not (built/note.with_suffix('.html').name).exists()
 assert not (built/'tests').exists()
 pages=[p for p in R.rglob('*.html') if '.git' not in p.parts and 'tests' not in p.parts]
 for p in pages:assert (built/p.relative_to(R)).read_bytes()==p.read_bytes(),str(p)
 print('PASS Pages output:',len(pages),'HTML pages preserved; internal notes and tests excluded.')
