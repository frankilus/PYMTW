"""Severance agreement review sheet: page structure, not-legal-advice notice, numbered primary sources, print stylesheet, localStorage-only storage, copy-only HR questions, and wiring (guide/checklist/runway links, catalog/search, noscript, router, sitemap, llms.txt)."""
from pathlib import Path
import re,json,html
R=Path(__file__).resolve().parents[1]
p=R/'tools/guides/lost-my-job/severance-review/index.html';assert p.exists(),'page missing';s=p.read_text()
URL='https://pymtw.com/tools/guides/lost-my-job/severance-review/'
t=html.unescape(re.search('<title>(.*?)</title>',s)[1]);d=html.unescape(re.search(r'<meta name="description" content="([^"]+)"',s)[1])
assert 0<len(t)<=70,t;assert 0<len(d)<=160,d;assert 'Not legal advice' in d
assert f'<link rel="canonical" href="{URL}">' in s and f'<meta property="og:url" content="{URL}">' in s
for a in ['property="og:title"','name="twitter:title"','property="og:description"','name="twitter:description"','name="twitter:card"','property="og:image"']:assert re.search(r'<meta '+a+r' content="[^"]+"',s),a
assert s.count('<script src="/assets/site-analytics.js" defer></script>')==1 and 'goatcounter.com/count' not in s and 'gc.zgo.at' not in s
assert '../../../tools.js' in s and 'PT.track(name, title)' in s and "track('print-click'" in s and "track('item-checked'" in s and "track('questions-copied'" in s
# schema: breadcrumb + HowTo, no ratings
ld=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[1]);g={x['@type']:x for x in ld['@graph']}
assert set(g)=={'BreadcrumbList','HowTo'},set(g)
assert g['BreadcrumbList']['itemListElement'][-1]['item']==URL and g['HowTo']['url']==URL and g['HowTo']['dateModified']=='2026-11-09'
assert 'aggregateRating' not in s and 'ratingValue' not in s and 'reviewCount' not in s
# five sections, one printable page each, steps match the HowTo
phases=re.findall(r'<section class="phase" id="phase-(\d)" data-phase',s);assert phases==[str(i) for i in range(1,6)],phases
assert len(g['HowTo']['step'])==5
items=re.findall(r'<input type="checkbox" id="p\d-\d+" data-item="(p\d-\d+)"',s);assert len(items)>=40 and len(set(items))==len(items)
assert sum(len(x['itemListElement']) for x in g['HowTo']['step'])==len(items)
assert f'of {len(items)} done' in s and f'has {len(items)} items in 5 sections' in s
# not legal advice, said plainly, with lawyer referral and legal aid
assert '<strong>This is not legal advice.</strong>' in s and 'employment lawyer' in s
assert 'americanbar.org/groups/lawyer_referral/resources/lawyer-referral-directory/' in s and 'lsc.gov/about-lsc/what-legal-aid/get-legal-help' in s
assert 'Not legal advice' in re.search(r'<div class="print-foot"[^>]*>(.*?)</div>',s)[1]
# the facts that matter, as verified against the sources on 2026-11-09
for need in ['at least 21 days','final offer','restarts','at least 45 days','job titles and ages','wider than one year','7 days after signing','can’t be shortened','threatening to withdraw','red flag','name the Age Discrimination in Employment Act','advise you in writing to consult a lawyer','on top of what you’re already owed','filing a charge with the EEOC','workers’ compensation','180 days','300 days','salary continuation','some states do','unused vacation','supplemental wages','3 months after your employment ends','always 100% vested','forfeited','tax-filing due date, including extensions','Social Security and Medicare','flat 22%','37% on amounts over $1 million','Tax Withholding Estimator','unreduced severance','pay in lieu of notice','quitting without good cause','44 days','plus 2%','up to 18 months','isn’t required','new enrollment window','60 days to elect COBRA','45 days to make the first payment','within 30 days','20 or more employees','mini-COBRA','without proving you’re insurable','In Maryland','31 days','up to 90 days','no nationwide federal ban','February 12, 2026','your state’s law','directly to the SEC','mutual','repay severance if you’re rehired','dates and title','claims that arise after you sign','eighth day','Updated Nov 9, 2026']:assert need.lower() in s.lower(),need
# sources: numbered list, every ref points to an existing source, every source is primary/official
src=re.search(r'<section class="sources"[^>]*>.*?<ol>(.*?)</ol>',s,re.S);assert src,'numbered sources list'
ids=re.findall(r'<li id="src-(\d+)"',src[1]);assert ids==[str(i) for i in range(1,len(ids)+1)] and len(ids)>=20
refs=set(re.findall(r'href="#src-(\d+)"',s));assert refs and refs<=set(ids) and set(ids)<=refs,'unused or missing sources'
hosts=set(re.findall(r'href="https://([^/"]+)',src[1]))
assert hosts<={'www.eeoc.gov','www.ecfr.gov','www.americanbar.org','www.lsc.gov','www.dol.gov','www.irs.gov','oui.doleta.gov','www.careeronestop.org','www.healthcare.gov','mgaleg.maryland.gov','www.insurance.ca.gov','www.govinfo.gov'},hosts
assert 'ftc.gov/legal-library/browse/rules/noncompete-rule' not in s,'the FTC rule page is gone; cite the Federal Register removal instead'
# print stylesheet: US Letter, page break per section, questions and sources on their own pages, footer URL, hidden chrome, cover key dates
pr=re.search(r'@media print\s*\{(.*)',s,re.S)[1].replace(' ','').replace('\n','')
assert re.search(r'@page\s*\{[^}]*size:\s*letter',s,re.I)
assert re.search(r'\.phase\{[^}]*break-before:page',pr) and re.search(r'\.qs\{[^}]*break-before:page',pr) and re.search(r'\.sources\{[^}]*break-before:page',pr)
for hid in ['nav','footer','.actions','.nl-line','.v7-next','.qs-actions']:assert hid in pr,hid
assert '<div class="keydates" aria-hidden="true">' in s and '.keydates{display:block' in pr
assert '<div class="print-foot"' in s and 'pymtw.com/tools/guides/lost-my-job/severance-review/' in s and 'window.print()' in s
# HR questions: copy to clipboard only, nothing is sent
qs=re.findall(r'<li>([^<]+)</li>',re.search(r'<ol id="qs-list">(.*?)</ol>',s,re.S)[1]);assert len(qs)>=10,qs
assert 'navigator.clipboard.writeText' in s and 'mailto:' not in s and 'Nothing is sent from this page.' in s
# storage: localStorage only, nothing sent anywhere, no embeds
js=' '.join(re.findall(r'<script>(.*?)</script>',s,re.S))
assert 'localStorage' in js and "'pymtw-severance-review-v1'" in js
for bad in ['fetch(','XMLHttpRequest','sendBeacon','sessionStorage','indexedDB','document.cookie','<form','<iframe','embed.beehiiv','subscribe-forms.beehiiv','pymtwtools.beehiiv.com']:assert bad not in s,bad
assert __import__('re').sub(r'<p class="nl-success".*?</p>','',s,flags=__import__('re').S).count('href="https://pymtw.beehiiv.com/subscribe"')==1 and s.count('class="nl-success"')>=2 and 'Personal finance Tuesdays. Bitcoin Fridays.' in s
assert 'href="../"' in s and 'href="../checklist/"' in s and '../../../severance-runway/' in s and '../../old-401k/' in s and '../../../paycheck-decoder/' in s
# linked from the lost-my-job guide (top + severance step + Related), its checklist and the severance runway tool
gd=(R/'tools/guides/lost-my-job/index.html').read_text()
assert gd.count('href="severance-review/"')>=3 and 'id="get-severance-review"' in gd
top=gd.index('class="direct-answer"');assert gd.index('href="severance-review/"',top)-top<2500,'review sheet link near the top answer'
assert 'href="../severance-review/"' in (R/'tools/guides/lost-my-job/checklist/index.html').read_text()
assert 'href="../guides/lost-my-job/severance-review/"' in (R/'tools/severance-runway/index.html').read_text()
# findable: catalog (Find the right tool.), both topics, aliases, noscript, router, sitemap, llms.txt
cat=(R/'tools/catalog.js').read_text();assert '"slug": "guides/lost-my-job/severance-review"' in cat and cat.count('"guides/lost-my-job/severance-review"')>=3
entry=re.search(r'\{"slug": "guides/lost-my-job/severance-review".*?\]\}',cat)[0]
for k in ['"severance"','"severance agreement"','"release"','"separation agreement"','"non-compete"']:assert k in entry,k
assert '<a href="/tools/guides/lost-my-job/severance-review/">' in (R/'tools/index.html').read_text()
assert "slug: 'guides/lost-my-job/severance-review'" in (R/'tools/router.js').read_text()
assert "['guides/lost-my-job/severance-review','guides/lost-my-job']" in (R/'tools/v7/home.js').read_text()
assert f'<loc>{URL}</loc>' in (R/'tools/sitemap.xml').read_text() and f'({URL})' in (R/'tools/llms.txt').read_text()
print('PASS severance review sheet static: page, meta, not-legal-advice notice, HowTo/Breadcrumb schema, 5 sections, %d items, %d numbered primary sources, %d HR questions, print CSS, localStorage only, guide/checklist/runway links, catalog/noscript/router/sitemap/llms.'%(len(items),len(ids),len(qs)))
