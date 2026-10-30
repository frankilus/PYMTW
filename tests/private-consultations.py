"""Programs offer, detail navigation and payment-link regression checks (no form submissions)."""
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
for secret_field in ('access_key', 'botcheck', 'utm_source', 'utm_medium'):
    before = [a for t, a in base.nodes if t == 'input' and a.get('name') == secret_field]
    after = [a for t, a in page.nodes if t == 'input' and a.get('name') == secret_field]
    assert before == after, 'Inquiry field changed: ' + secret_field
assert any(t == 'input' and a.get('name') == 'subject' and a.get('value') == 'PYMTW consultation / program request' for t,a in page.nodes)
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
# Discovery links must open the matching detail page while inquiry and payment actions stay separate.
bitcoin_text = (ROOT / 'bitcoin/index.html').read_text()
for card_id, route in (
    ('busy-professionals', '/workshop-professionals.html'),
    ('self-custody', '/workshop-self-custody.html'),
    ('couples-families', '/workshop-family.html'),
):
    card = text.split('<article class="choice" id="' + card_id + '">')[1].split('</article>')[0]
    card_page = Page(card)
    detail_links = [a for t,a in card_page.nodes if t == 'a' and a.get('class') == 'consultation-details-link']
    assert len(detail_links) == 1 and detail_links[0]['href'] == route
    assert 'View consultation details' in card
    assert 'href="' + route + '"' in bitcoin_text
    assert 'href="/programs.html#' + card_id + '"' not in bitcoin_text
assert len([a for t,a in page.nodes if t == 'a' and a.get('class') == 'consultation-details-link']) == 3
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
# Business email context must be meaningful without interpreting legacy route names.
for file,title,duration,price,unit in (
    ('workshop-professionals.html','Bitcoin for Busy Professionals','75 minutes','$79 USD','one client'),
    ('workshop-self-custody.html','Self-Custody Without the Fear','90 minutes','$129 USD','one client'),
    ('workshop-family.html','Bitcoin for Couples & Families','90 minutes','$199 USD','one household'),
    ('programs.html',None,None,None,None),
):
    form_page=Page((ROOT/file).read_text())
    fields={a.get('name'):a.get('value','') for t,a in form_page.nodes if t=='input' and a.get('type')=='hidden'}
    assert fields['source_page']=='https://pymtw.com/'+file
    assert 'before payment' in fields['next_step']
    assert 'no appointment booked' in fields['request_status']
    assert 'payment collected' in fields['request_status']
    if title:
        assert fields['subject']=='PYMTW consultation request: '+title
        assert all(value in fields['interest'] for value in (title,duration,price,unit))
    else:
        assert fields['subject']=='PYMTW consultation / program request'
        assert any(t=='select' and a.get('name')=='interest' for t,a in form_page.nodes)
print('PASS: 3 consultation offers, preserved form configuration and legacy anchors, valid local links, inquiry-first CTAs, 3 approved Stripe links, 4 private tools unchanged and analytics-free.')
