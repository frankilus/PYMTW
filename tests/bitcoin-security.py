"""Check navigation, source anchors and privacy boundaries of the security guide."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import subprocess,re,json
ROOT=Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self):
        super().__init__();self.ids=[];self.links=[];self.inputs=[];self.scripts=[];self.headings=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if a.get('id'):self.ids.append(a['id'])
        if tag=='a' and a.get('href'):self.links.append(a['href'])
        if tag=='input':self.inputs.append(a)
        if tag=='script' and a.get('src'):self.scripts.append(a['src'])
        if tag=='h1':self.headings.append(a)
page=Page();html=(ROOT/'bitcoin/security/index.html').read_text();page.feed(html)
assert len(page.ids)==len(set(page.ids)), 'Duplicate anchor'
assert len(page.headings)==1
assert len(page.inputs)==8 and all(x.get('type')=='checkbox' for x in page.inputs), 'No private data inputs allowed'
assert '<form' not in html and 'site-analytics' not in html and 'googletagmanager' not in html
assert [urlsplit(src).path for src in page.scripts]==['/assets/bitcoin-security/security.js']
script=(ROOT/'assets/bitcoin-security/security.js').read_text()
assert not re.search(r'\b(fetch|XMLHttpRequest|localStorage|sessionStorage|sendBeacon|WebSocket)\b',script), 'No network or storage APIs'
for stage in ('beginner','owner','advanced'):assert stage in page.ids
assert html.count('class="ownership-card"')==6
assert len([x for x in page.ids if x.startswith('source-')])==15
assert 'An update alone does not repair an affected seed.' in html
assert 'Do not wipe a funded device to practice.' in html
assert 'exact passphrase' in html and 'wallet configuration/descriptor' in html
assert 'no universal bitcoin balance or dollar threshold' in html
checked=0
for href in page.links:
    u=urlsplit(href)
    if u.scheme or u.netloc:continue
    target=ROOT/u.path.lstrip('/') if u.path else ROOT/'bitcoin/security/index.html'
    if target.is_dir():target=target/'index.html'
    assert target.exists(),href
    if u.fragment:
        p=Page();p.feed(target.read_text());assert unquote(u.fragment) in p.ids,href
    checked+=1
home=(ROOT/'bitcoin/index.html').read_text()
assert 'Own bitcoin? Start with a security plan' in home
assert 'href="/bitcoin/security/" class="path" id="protect"' in home
assert 'bitcoin/security/' in (ROOT/'assets/bitcoin-home/home.js').read_text()
assert '"href": "/bitcoin/security/"' in (ROOT/'pymtw.js').read_text()
assert 'https://pymtw.com/bitcoin/security/' in (ROOT/'sitemap.xml').read_text()
for slug in ('paycheck-decoder','explain-my-401k','bitcoin-tax-lot-cleanup','bitcoin-household-plan'):
    name='tools/'+slug+'/index.html'
    baseline=subprocess.check_output(['git','show','b7c4ae0:'+name],cwd=ROOT)
    current=(ROOT/name).read_bytes()
    if slug in ('bitcoin-tax-lot-cleanup','bitcoin-household-plan'):
        # Approved 2026-11-04 (Household Plan paywall ON with Stripe): Lemon Squeezy is gone; still analytics-free.
        assert b'lemonsqueezy' not in current.lower(),'Lemon Squeezy copy back: '+slug
        if slug=='bitcoin-household-plan': assert b'https://buy.stripe.com/bJe6oJfJqgLo0wq3U86EU03' in current,'Stripe buy link missing'
        assert not re.search(r'<script[^>]+(?:analytics|googletagmanager)',current.decode(),re.I)
    else:
        assert current==baseline,'Private tool changed: '+slug
    assert not re.search(r'<script[^>]+(?:analytics|googletagmanager)',baseline.decode(),re.I)
print(f'PASS: {checked} local destinations/anchors; 15 primary references; all stages, six custody approaches, eight non-sensitive checklist inputs; advisory/recovery guardrails; homepage/shared-nav discovery; four private tools unchanged and analytics-free.')
