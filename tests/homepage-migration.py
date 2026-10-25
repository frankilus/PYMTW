"""Guard the route move against lost content and changed calculators."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import subprocess, re, xml.etree.ElementTree as ET
root = Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed
base = '95a2e842cd69f2fdd885be011fd87e49e9601f77'
def original(name):
    return subprocess.check_output(['git', 'show', base + ':' + name], cwd=root)
paths = subprocess.check_output(['git', 'ls-tree', '-r', '--name-only', base], cwd=root, text=True).splitlines()
# The approved green theme changes only these presentation files.
theme_files = {'tools/v7/home.css', 'tools/v7/pages.css'}
protected = [p for p in paths if p not in theme_files and (p.startswith('tools/') or (p.endswith('.js') and p != 'pymtw.js') or p in ['legal.html', 'CNAME'])]
for name in protected:
    assert matches(name, original(name)), name + ' must remain unchanged'
old = original('index.html').decode()
bitcoin = (root/'bitcoin/index.html').read_text()
# All original content IDs and all executable inline scripts survive the move.
# Later reviewed PRs moved the full Bitcoin content to /bitcoin/explore/ (checked by
# bitcoin-homepage.cjs); the reviewed simplified page is accepted only byte for byte.
simplified = (root/'bitcoin/index.html').read_bytes() == reviewed('bitcoin/index.html')
if not simplified:
  assert re.findall(r'\bid="([^"]+)"', old) == re.findall(r'\bid="([^"]+)"', bitcoin)
executable = lambda s: re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', re.sub(r'<script type="application/ld\+json">.*?</script>', '', s, flags=re.S), re.S)
if not simplified:
  assert executable(old) == executable(bitcoin)
class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(); self.refs=[]; self.ids=set(); self.text=[]; self.feed(source)
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if 'id' in d: self.ids.add(d['id'])
        for k in ['href','src','action']:
            if d.get(k): self.refs.append(d[k])
    def handle_data(self, data):
        if data.strip(): self.text.append(data.strip())
# Navigation labels and added page schema are the only textual additions.
strip_scripts = lambda s: re.sub(r'<script.*?</script>', '', s, flags=re.S)
normalized = bitcoin.replace('<li><a href="/">PYMTW Home</a></li>\n        <li><a href="/bitcoin/" aria-current="page">Bitcoin</a></li>', '<li><a href="/index.html">Home</a></li>')
assert simplified or Page(strip_scripts(old)).text == Page(strip_scripts(normalized)).text, 'Bitcoin content changed'
checked=0
for name in ['index.html','bitcoin/index.html']:
    page = Page((root/name).read_text())
    for ref in page.refs:
        u=urlsplit(ref)
        if u.scheme or u.netloc: continue
        target=(root/u.path.lstrip('/') if u.path.startswith('/') else (root/name).parent/unquote(u.path)) if u.path else root/name
        if target.is_dir(): target=target/'index.html'
        assert target.exists(), (name, ref)
        if u.fragment and target.suffix == '.html':
            assert unquote(u.fragment) in Page(target.read_text()).ids, (name, ref, 'missing anchor')
        checked+=1
home=(root/'index.html').read_text()
assert 'noindex' not in home and 'new-section' not in home and 'class="review' not in home
assert 'https://pymtw.com/bitcoin/' in bitcoin and 'https://pymtw.com/' in home
for loc in ET.parse(root/'sitemap.xml').iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
    p=root/urlsplit(loc.text).path.lstrip('/')
    assert (p/'index.html' if p.is_dir() else p).exists(), loc.text
print(f'Migration passed: {len(protected)} protected files unchanged; Bitcoin content, IDs and executable scripts preserved; {checked} homepage/Bitcoin local references and sitemap routes valid.')
