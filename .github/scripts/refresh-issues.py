from datetime import datetime, timezone
from html import escape, unescape
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
from zoneinfo import ZoneInfo

home = Path('index.html')
page = home.read_text()
pattern = r'<a class="issue" href="([^"]+)" target="_blank" rel="noopener noreferrer"><time datetime="([^"]+)">[^<]+</time><span>([^<]+)</span></a>'
entries = {url: (date, unescape(title)) for url, date, title in re.findall(pattern, page)}
if len(entries) != 3:
    raise ValueError('Expected three existing issue links; leaving homepage unchanged.')
root = ET.parse(sys.argv[1])
for item in root.findall('{*}url'):
    url = item.findtext('{*}loc', '')
    title = item.findtext('.//{*}title', '').strip()
    published = item.findtext('.//{*}publication_date')
    if not (re.fullmatch(r'https://pymtw\.beehiiv\.com/p/[a-z0-9-]+', url) and title and published):
        continue
    stamp = datetime.fromisoformat(published.replace('Z', '+00:00'))
    if stamp <= datetime.now(timezone.utc):
        entries[url] = (stamp.astimezone(ZoneInfo('America/New_York')).date().isoformat(), title)
links = []
for url, (date, title) in sorted(entries.items(), key=lambda entry: entry[1][0], reverse=True)[:3]:
    label = datetime.fromisoformat(date).strftime('%B %d, %Y').replace(' 0', ' ')
    links.append(f'<a class="issue" href="{escape(url, quote=True)}" target="_blank" rel="noopener noreferrer"><time datetime="{date}">{label}</time><span>{escape(title)}</span></a>')
page, count = re.subn(r'(?:' + pattern + r'){3}', lambda match: ''.join(links), page)
if count != 1:
    raise ValueError('Issue markup changed; refusing to overwrite.')
home.write_text(page)
