"""Programs offer, navigation and no-checkout regression checks (no form submissions)."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import subprocess

ROOT = Path(__file__).resolve().parents[1]
BASE = '864a189'

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.nodes = []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))

text = (ROOT / 'programs.html').read_text()
page = Page(text)
base = Page(subprocess.check_output(['git', 'show', BASE + ':programs.html'], cwd=ROOT, text=True))
ids = [attrs['id'] for _, attrs in page.nodes if 'id' in attrs]
assert len(ids) == len(set(ids)), 'Duplicate IDs'
assert sum(tag == 'h1' for tag, _ in page.nodes) == 1
for old_id in ('workshops', 'private-options', 'private', 'busy-professionals', 'self-custody', 'couples-families', 'request', 'register', 'membership', 'corporate'):
    assert old_id in ids, old_id
for secret_field in ('access_key', 'subject', 'botcheck', 'utm_source', 'utm_medium'):
    before = [a for t, a in base.nodes if t == 'input' and a.get('name') == secret_field]
    after = [a for t, a in page.nodes if t == 'input' and a.get('name') == secret_field]
    assert before == after, 'Inquiry field changed: ' + secret_field
assert [a for t,a in page.nodes if t == 'form'] == [a for t,a in base.nodes if t == 'form']
assert any(t == 'input' and a.get('type') == 'email' and 'required' in a for t,a in page.nodes)
for tag, attrs in page.nodes:
    assert 'data-checkout' not in attrs
    href = attrs.get('href', attrs.get('src', ''))
    url = urlsplit(href)
    if url.scheme or url.netloc or not href:
        continue
    path = ROOT / unquote(url.path.lstrip('/')) if url.path.startswith('/') else ROOT / unquote(url.path or 'programs.html')
    if path.is_dir():
        path /= 'index.html'
    assert path.exists(), href
    if url.fragment and path.suffix == '.html':
        target = Page(path.read_text())
        assert any(a.get('id') == unquote(url.fragment) for _,a in target.nodes), href
links = [a for t,a in page.nodes if t == 'a' and 'data-consultation' in a]
options = [a for t,a in page.nodes if t == 'option' and 'data-consultation' in a]
assert len(links) == len(options) == 3
assert {a['data-consultation'] for a in links} == {a['data-consultation'] for a in options}
assert all(a['href'] == '#request' for a in links)
for amount in ('79', '129', '199'):
    assert '$' + amount in text
for obsolete in ('$149', '$399', '$499', 'Seats are limited', 'Workshops are recorded', 'View Workshop'):
    assert obsolete not in text
assert '75 minutes · One client' in text
assert '90 minutes · One client' in text
assert '90 minutes · One household' in text
assert 'Payment links are for agreed appointments only' in text
expected_payments = {
    'https://buy.stripe.com/fZu6oJgNu0Mq2EyeyM6EU00',
    'https://buy.stripe.com/cNi3cxdBi8eS7YSaiw6EU01',
    'https://buy.stripe.com/bJeaEZfJqgLo92W62g6EU02',
}
assert {a['href'] for t,a in page.nodes if t == 'a' and 'buy.stripe.com' in a.get('href', '')} == expected_payments
assert 'Payment does not select or confirm an appointment time' in text
assert '/assets/site-analytics.js' in text
for tool in ('paycheck-decoder', 'explain-my-401k', 'bitcoin-tax-lot-cleanup', 'bitcoin-household-plan'):
    name = 'tools/' + tool + '/index.html'
    current = (ROOT / name).read_bytes()
    assert current == subprocess.check_output(['git', 'show', BASE + ':' + name], cwd=ROOT), name
    assert b'site-analytics.js' not in current and b'googletagmanager' not in current, name
print('PASS: 3 consultation offers, preserved form configuration and legacy anchors, valid local links, inquiry-first CTAs, 3 approved Stripe links, 4 private tools unchanged and analytics-free.')
