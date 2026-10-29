"""Preserve current routes, program details and private tools during the learning redesign."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin, urlsplit, unquote
import re
import subprocess
import io
import tarfile

ROOT = Path(__file__).resolve().parents[1]
BASE = 'f36f58a1483ee4eb2aa4e707e148f3b207923756'
PAGES = ('bitcoin/index.html', 'programs.html', 'start-here.html')
ALLOWED = set(PAGES) | {'assets/bitcoin-learning.css', 'assets/bitcoin-learning.js', 'tests/bitcoin-learning-structure.py'}
def original(name):
    return subprocess.check_output(['git', 'show', BASE + ':' + name], cwd=ROOT)
class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.main_links, self.ids, self.hidden, self.meta = [], [], [], [], []
        self.in_main = False
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'main': self.in_main = True
        if attrs.get('id'): self.ids.append(attrs['id'])
        if tag == 'a' and attrs.get('href'):
            self.links.append(attrs['href'])
            if self.in_main: self.main_links.append(attrs['href'])
        if tag == 'input' and attrs.get('type') == 'hidden': self.hidden.append(attrs)
        if tag == 'meta': self.meta.append(attrs)
    def handle_endtag(self, tag):
        if tag == 'main': self.in_main = False

def parse(text):
    page = Page(); page.feed(text); return page

# Catch unintended changes to calculators, imports, providers, assets and privacy.
archive = tarfile.open(fileobj=io.BytesIO(subprocess.check_output(['git', 'archive', BASE], cwd=ROOT)))
for member in archive.getmembers():
    if member.isfile() and member.name not in ALLOWED:
        assert (ROOT / member.name).read_bytes() == archive.extractfile(member).read(), f'Unrelated file changed: {member.name}'
checked = 0
for name in PAGES:
    before_text, after_text = original(name).decode(), (ROOT / name).read_text()
    before, after = parse(before_text), parse(after_text)
    base = 'https://pymtw.com/' + name
    assert {urljoin(base, x) for x in before.main_links} <= {urljoin(base, x) for x in after.links}, f'Original link missing: {name}'
    assert len(after.ids) == len(set(after.ids)), f'Duplicate ID: {name}'
    assert before.meta == after.meta, f'SEO/privacy metadata changed: {name}'
    assert after_text.count('<h1') == 1, f'Multiple primary headings: {name}'
    assert 'review-strip' not in after_text and 'Preview only' not in after_text, name
    assert 'site-analytics.js' in after_text, f'Existing public-page analytics preserved: {name}'
    for href in after.links:
        url = urlsplit(urljoin(base, href))
        if url.netloc != 'pymtw.com': continue
        target = ROOT / unquote(url.path.lstrip('/'))
        if target.is_dir(): target = target / 'index.html'
        if not target.exists() and not target.suffix: target = target.with_suffix('.html')
        assert target.exists(), (name, href)
        if url.fragment and target.suffix == '.html':
            assert unquote(url.fragment) in parse(target.read_text()).ids, (name, href)
        checked += 1

before_program = original('programs.html').decode()
after_program = (ROOT / 'programs.html').read_text()
assert parse(before_program).hidden == parse(after_program).hidden, 'Inquiry hidden fields changed'
assert 'action="https://api.web3forms.com/submit"' in after_program
assert 'id="program-form"' in after_program and '/inquiry-forms.js' in after_program
for price in ('$79', '$129', '$199', '$149', '$399', '$499', '$29', '$290', '$59'):
    assert price in after_program, price
for text in re.findall(r'<li\b[^>]*>(.*?)</li>', before_program, re.S):
    normalize = lambda value: re.sub(r'\s+', ' ', re.sub(r'<[^>]+>', ' ', value)).strip()
    assert normalize(text) in normalize(after_program), f'Program inclusion missing: {normalize(text)}'
for slug in ('paycheck-decoder', 'explain-my-401k', 'bitcoin-tax-lot-cleanup', 'bitcoin-household-plan'):
    text = (ROOT / 'tools' / slug / 'index.html').read_text()
    scripts = re.findall(r'<script[^>]*src=["\x27]([^"\x27]+)', text)
    assert not any(re.search(r'analytics|pymtw-config|googletagmanager', item, re.I) for item in scripts), slug
print(f'PASS: {checked} local links/anchors; original main destinations, offer inclusions/prices, inquiry fields, metadata and all unrelated source files preserved. All four private tools remain analytics-free.')
