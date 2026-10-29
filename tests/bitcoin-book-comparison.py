"""Book-guide integration checks: destinations, assets, disclosure and privacy boundaries."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import re, subprocess
ROOT = Path(__file__).resolve().parents[1]
BASE = '887b23f'
PAGE = ROOT / 'compare-bitcoin-books.html'
class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.assets=[]; self.amazon=[]; self.book_ids=[]
    def handle_starttag(self, tag, pairs):
        a=dict(pairs)
        if a.get('id'): self.ids.append(a['id'])
        if tag=='article' and a.get('id','').startswith('book-'): self.book_ids.append(a['id'])
        if tag=='a' and a.get('href'):
            self.links.append(a['href'])
            if urlsplit(a['href']).netloc in ('amzn.to','link.amazon','www.amazon.com'):
                assert 'sponsored' in a.get('rel','') and 'noopener' in a.get('rel',''), a
                self.amazon.append(a['href'])
        if tag in ('img','script') and a.get('src'): self.assets.append(a['src'])
        if tag=='link' and a.get('rel')=='stylesheet': self.assets.append(a['href'])
def parse(text):
    p=Page();p.feed(text);return p
text=PAGE.read_text();page=parse(text)
assert len(page.book_ids)==10 and len(page.ids)==len(set(page.ids))
assert text.count('<h1')==1 and 'review-strip' not in text
assert 'As an Amazon Associate, PYMTW earns from qualifying purchases' in text
assert 'currently link to no affiliate' not in text and 'interest list, not a purchase page' not in text
expected={'https://amzn.to/4zwsLbQ','https://amzn.to/4qqy0F3','https://amzn.to/4afPZrx',
'https://www.amazon.com/dp/1098150090?tag=frankilus0f-20','https://link.amazon/B0frKEqLh',
'https://amzn.to/4aiSrxD','https://amzn.to/4bBUizT','https://www.amazon.com/dp/1838318402?tag=frankilus0f-20',
'https://link.amazon/B04ahFJzg','https://amzn.to/4kn2s1t'}
assert set(page.amazon)==expected
assert len([x for x in page.assets if '/book-cover' in x])==10
for href in page.links+page.assets:
    url=urlsplit(urljoin('https://pymtw.com/compare-bitcoin-books.html',href))
    if url.netloc!='pymtw.com': continue
    target=ROOT / unquote(url.path.lstrip('/'))
    if target.is_dir(): target=target/'index.html'
    if not target.exists() and not target.suffix: target=target.with_suffix('.html')
    assert target.exists(),href
    if url.fragment and target.suffix=='.html': assert unquote(url.fragment) in parse(target.read_text()).ids,href
before=parse(subprocess.check_output(['git','show',BASE+':compare-bitcoin-books.html'],cwd=ROOT).decode())
normalize=lambda href:urljoin('https://pymtw.com/compare-bitcoin-books.html',href)
assert {normalize(x) for x in before.links if not x.startswith('#')} <= {normalize(x) for x in page.links}
for slug in ('paycheck-decoder','explain-my-401k','bitcoin-tax-lot-cleanup','bitcoin-household-plan'):
    name='tools/'+slug+'/index.html'
    current=(ROOT/name).read_bytes()
    assert current==subprocess.check_output(['git','show',BASE+':'+name],cwd=ROOT),slug
    scripts=re.findall(r'<script[^>]*src=["\x27]([^"\x27]+)',current.decode())
    assert not any(re.search('analytics|pymtw-config|googletagmanager',x,re.I) for x in scripts),slug
print('PASS: ten covers and purchase destinations, affiliate disclosure/attributes, retained original links, local assets/anchors, unique IDs; all four private tools unchanged and analytics-free.')
