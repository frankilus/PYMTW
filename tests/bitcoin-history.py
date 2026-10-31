"""Validate chronological coverage, native HTML access and real local destinations."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,subprocess,html
ROOT=Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'assets/bitcoin-history/events.js').read_text().split('window.BITCOIN_HISTORY = ',1)[1].rstrip(';\n'))
events=data['events']
assert len(events)>=60
assert len({e['id'] for e in events})==len(events)
assert [e['sort'] for e in events]==sorted(e['sort'] for e in events)
assert all(e['sort']<=data['asOf'] for e in events)
assert {e['year'] for e in events}=={str(y) for y in range(2008,2027)}
required={'uasf-proposal','uasf','bip91','bitcoin-cash','bitcoin-gold','bitcoin-sv','ecash-split','china-mining','spot-etps','spot-etfs-launch','canada-spot-etf','first-halving','second-halving','third-halving','fourth-halving','overflow-bug','2018-inflation-bug'}
assert required<={e['id'] for e in events}
class Page(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.local=[];self.milestones=[];self.scripts=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='details' and a.get('class')=='milestone':self.milestones.append(a['id'])
  if t=='script':self.scripts.append(a.get('src','inline'))
  for key in ('href','src'):
   u=a.get(key,'')
   if u.startswith(('/','#')):self.local.append(u)
page=ROOT/'bitcoin/history/index.html';before=page.read_bytes();subprocess.run(['python3',str(ROOT/'scripts/build-bitcoin-history.py')],check=True,capture_output=True);assert page.read_bytes()==before,'Generated HTML is stale'
p=Page();p.feed(before.decode());assert len(p.ids)==len(set(p.ids));assert p.milestones==[e['id'] for e in events]
for ref in p.local:
 u=urlsplit(ref);target=(ROOT/unquote(u.path).lstrip('/')) if u.path else page
 if target.is_dir():target=target/'index.html'
 assert target.exists(),f'Missing local file {ref}'
 if u.fragment:
  q=Page();q.feed(target.read_text());assert unquote(u.fragment) in q.ids,f'Missing anchor {ref}'
for e in events:
 assert e['body'] and e['summary'] and e['why'] and e['perspective']
 assert all(s['url'].startswith('https://') for s in e['sources'])
 assert html.escape(e['body']) in before.decode()
assert p.scripts==['/assets/bitcoin-history/history.js?v=20261031-continuous'],'No remote scripts or data-fetch dependencies'
print(f'PASS: {len(events)} ordered milestones; all 19 years; major forks, all four halvings and ETF stages; complete native HTML; local links and anchors; reproducible generation; local-only script.')
