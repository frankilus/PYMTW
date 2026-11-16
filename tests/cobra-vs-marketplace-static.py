"""COBRA vs. Marketplace checklist: page structure, numbered official sources, the verified facts, fill-in deadline sheet and comparison table, print stylesheet, localStorage-only storage, copy-only HR questions, FAQ schema, and wiring (guide/checklist/severance/runway links, hub, catalog/search, noscript, router, sitemap, llms.txt)."""
from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parents[1]
p=R/'tools/guides/lost-my-job/cobra-vs-marketplace/index.html';assert p.exists(),'page missing';s=p.read_text()
URL='https://pymtw.com/tools/guides/lost-my-job/cobra-vs-marketplace/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);d=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=70 and 'COBRA vs. Marketplace' in t,t;assert 0<len(d)<=160,d
assert f'<link rel="canonical" href="{URL}">' in s and f'<meta property="og:url" content="{URL}">' in s and 'severance' not in s[:s.index('<style>')].lower()
for a in ['property="og:title"','name="twitter:title"','property="og:description"','name="twitter:description"','name="twitter:card"','property="og:image"']:assert re.search(r'<meta '+a+r' content="[^"]+"',s),a
assert (R/'tools/og/guides.png').exists() and 'https://pymtw.com/tools/og/guides.png' in s
assert s.count('<script src="/assets/site-analytics.js" defer></script>')==1 and 'goatcounter.com/count' not in s and 'gc.zgo.at' not in s
assert '../../../tools.js' in s and 'PT.track(name, title)' in s
for ev in ["track('print-click'","track('item-checked'","track('questions-copied'","track('nl-success-shown'","track('field-filled'"]:assert ev in s,ev
# schema: breadcrumb + HowTo + FAQPage, no ratings; FAQ answers are visible on the page
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert list(g)==['BreadcrumbList','HowTo','FAQPage'],list(g)
assert g['BreadcrumbList']['itemListElement'][-1]['item']==URL and g['HowTo']['url']==URL and g['HowTo']['dateModified']=='2026-11-16'
assert 'aggregateRating' not in s and 'ratingValue' not in s and 'reviewCount' not in s
faq=g['FAQPage']['mainEntity'];assert len(faq)>=5
vis=html.unescape(re.sub('<[^>]+>','',re.search(r'<section class="faq".*?</section>',s,re.S)[0]))
for q in faq:assert q['name'] in vis and q['acceptedAnswer']['text'] in vis,q['name']
# four sections, one printable page each; HowTo steps match the checkboxes
phases=re.findall(r'<section class="phase" id="phase-(\d)" data-phase',s);assert phases==['1','2','3','4'],phases
assert len(g['HowTo']['step'])==4
items=re.findall(r'<input type="checkbox" id="p\d-\d+" data-item="(p\d-\d+)"',s);assert len(items)>=30 and len(set(items))==len(items)
assert sum(len(x['itemListElement']) for x in g['HowTo']['step'])==len(items)
assert f'of {len(items)} done' in s and f'has {len(items)} items in 4 sections' in s
# numbered official sources: every one is cited, every citation resolves, only DOL / HealthCare.gov / IRS
ids=re.findall(r'<li id="src-(\d+)"><a href="(https://[^"]+)" target="_blank" rel="noopener">',s);assert [int(i) for i,_ in ids]==list(range(1,len(ids)+1)) and len(ids)>=15
for _,u in ids:assert re.match(r'https://www\.(dol\.gov|healthcare\.gov|irs\.gov)/',u),u
cited=set(int(x) for x in re.findall(r'href="#src-(\d+)"',s));assert cited==set(range(1,len(ids)+1)),cited^set(range(1,len(ids)+1))
for li in re.findall(r'<li><label class="ck".*?</li>',s):assert '<sup class="refs">' in li,li[:120]
srcs=dict((int(i),u) for i,u in ids)
def cites(text,*hosts):
    i=s.index(text,s.index("<body>"));sup=re.search(r'<sup class="refs">(.*?)</sup>',s[i:i+900])[1];nums=[int(x) for x in re.findall(r'#src-(\d+)',sup)]
    for h in hosts:assert any(h in srcs[n] for n in nums),(text,h,nums)
# the facts that matter, as verified against the sources on 2026-11-16
cites('20 or more employees','dol.gov');cites('up to 102% of its cost','dol.gov')
cites('within 44 days after a job loss','dol.gov');cites('at least 60 days to elect COBRA','dol.gov')
cites('you have 45 days to pay','dol.gov');cites('as early as 60 days before your coverage ends and up to 60 days after','healthcare.gov/coverage-outside-open-enrollment/special-enrollment-period/')
cites('even if you quit or were fired','healthcare.gov/have-job-based-coverage/');cites('if you ask within 30 days','dol.gov')
cites('generally lasts up to 18 months','dol.gov');cites('fewer than 20 employees','dol.gov')
cites('voluntarily dropping COBRA or choosing to stop paying','healthcare.gov/unemployed/cobra-coverage/')
cites('Enroll by December 15 for coverage that starts January 1','healthcare.gov/quick-guide/dates-and-deadlines/')
cites('$10,600 for one person or $21,200 for a family in 2026, or $12,000 and $24,000 in 2027','healthcare.gov/glossary/out-of-pocket-maximum-limit/')
cites('Severance pay is taxable income','irs.gov/publications/p525');cites('including what you earned before you left your job','healthcare.gov')
cites('coverage can start right away','healthcare.gov');cites('waiting period (generally up to 90 days)','dol.gov/agencies/ebsa/workers-and-families/changing-jobs-and-job-loss')
assert 'Open Enrollment runs November 1 to January 15.' in s and 'December 15, 2026 for a January 1 start' in s and 'January 15, 2027' in s
assert 'healthcare.gov/lower-costs/' in s and 'healthcare.gov/see-plans/' in s and 'healthcare.gov/medicaid-chip/getting-medicaid-chip/' in s
# no invented subsidy math: no FPL thresholds or percentages of poverty
for bad in ['poverty level','FPL','400%','% of the federal']:assert bad not in s,bad
# fill-in deadline sheet + side-by-side table, every input labelled
dl=re.findall(r'<label for="(dl-[a-z]+)">',s);assert len(dl)>=8
for i in dl:assert f'id="{i}" data-field="{i}"' in s
cmp=re.findall(r'<input class="fld" type="text" id="(cmp-[a-z]+-\d)" data-field="\1" aria-label="([^"]+)"',s);assert len(cmp)>=24 and len(cmp)%3==0
for row in ['Monthly premium','Deductible','Out-of-pocket maximum','Your doctors in network?','Your prescriptions covered?']:assert any(row in a for _,a in cmp),row
# print: letter paper, one page per section, compare table and questions on their own pages, chrome hidden
pr=' '.join(re.findall(r'@media print\{(.*?)\n\}',s,re.S))
assert re.search(r'@page\s*\{[^}]*size:\s*letter',s,re.I)
assert re.search(r'\.phase\{[^}]*break-before:page',pr) and re.search(r'\.qs\{[^}]*break-before:page',pr) and re.search(r'#compare\{[^}]*break-before:page',pr) and re.search(r'\.sources\{[^}]*break-before:page',pr)
for hid in ['nav','footer','.actions','.nl-line','.nl-success','.v7-next','.qs-actions','.faq','.tiein']:assert hid in pr,hid
assert '.fld::placeholder{color:transparent}' in pr
assert '<div class="print-foot"' in s and 'pymtw.com/tools/guides/lost-my-job/cobra-vs-marketplace/ · Not insurance or tax advice' in s and 'window.print()' in s
# HR questions: copy to clipboard only, nothing is sent
qs=re.findall(r'<li>([^<]+)</li>',re.search(r'<ol id="qs-list">(.*?)</ol>',s,re.S)[1]);assert len(qs)>=10,qs
assert 'navigator.clipboard.writeText' in s and 'mailto:' not in s and 'Nothing is sent from this page.' in s
# storage: localStorage only (checkmarks key read by the hub + separate fields key), nothing sent anywhere, no embeds
js=' '.join(re.findall(r'<script>(.*?)</script>',s,re.S))
assert "'pymtw-cobra-vs-marketplace-v1'" in js and "'pymtw-cobra-vs-marketplace-fields-v1'" in js
for bad in ['fetch(','XMLHttpRequest','sendBeacon','sessionStorage','indexedDB','document.cookie','<form','<iframe','embed.beehiiv','subscribe-forms.beehiiv','pymtwtools.beehiiv.com']:assert bad not in s,bad
assert re.sub(r'<p class="nl-success".*?</p>','',s,flags=re.S).count('href="https://pymtw.beehiiv.com/subscribe"')==1 and s.count('class="nl-success"')==3 and 'Personal finance Tuesdays. Bitcoin Fridays.' in s
# severance tie-in and next steps
for h in ['href="../severance-review/"','href="../../../severance-runway/"','href="../checklist/"','href="../"','href="../../../checklists/"']:assert h in s,h
# wiring: linked from the guide (top card, COBRA step, Related), its checklist, the severance sheet and the runway tool
gd=(R/'tools/guides/lost-my-job/index.html').read_text()
assert gd.count('href="cobra-vs-marketplace/"')>=3 and 'id="get-cobra-vs-marketplace"' in gd
assert 'href="../cobra-vs-marketplace/"' in (R/'tools/guides/lost-my-job/checklist/index.html').read_text()
sv=(R/'tools/guides/lost-my-job/severance-review/index.html').read_text();i=sv.index('id="phase-3"');assert 'href="../cobra-vs-marketplace/"' in sv[i:sv.index('</section>',i)]
assert 'href="../guides/lost-my-job/cobra-vs-marketplace/"' in (R/'tools/severance-runway/index.html').read_text()
# findable: catalog (Find the right tool.), topics, aliases, noscript, router, hub, sitemap, llms.txt
cat=(R/'tools/catalog.js').read_text();assert cat.count('"guides/lost-my-job/cobra-vs-marketplace"')>=3
entry=re.search(r'\{"slug": "guides/lost-my-job/cobra-vs-marketplace".*?\]\}',cat)[0]
for k in ['"cobra"','"marketplace"','"health insurance"','"special enrollment"','"open enrollment"']:assert k in entry,k
assert '<a href="/tools/guides/lost-my-job/cobra-vs-marketplace/">' in (R/'tools/index.html').read_text()
assert "slug: 'guides/lost-my-job/cobra-vs-marketplace'" in (R/'tools/router.js').read_text()
assert "['guides/lost-my-job/cobra-vs-marketplace','guides/lost-my-job']" in (R/'tools/v7/home.js').read_text()
hub=(R/'tools/checklists/index.html').read_text();assert f'data-key="pymtw-cobra-vs-marketplace-v1" data-items="{len(items)}"' in hub and 'Six free' in hub
assert f'<loc>{URL}</loc>' in (R/'tools/sitemap.xml').read_text() and f'({URL})' in (R/'tools/llms.txt').read_text()
print('PASS COBRA vs. Marketplace static: page, meta, HowTo/FAQ/Breadcrumb schema, 4 sections, %d items, %d official sources, verified facts, %d deadline fields, %d table fields, %d HR questions, print CSS, localStorage only, links, hub/catalog/noscript/router/sitemap/llms.'%(len(items),len(ids),len(dl),len(cmp),len(qs)))
