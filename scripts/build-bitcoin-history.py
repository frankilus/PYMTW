"""Render source-linked native details into the static history page; no runtime fetch needed."""
from pathlib import Path
from html import escape as esc
import json,re
ROOT=Path(__file__).resolve().parents[1]
source=(ROOT/'assets/bitcoin-history/events.js').read_text()
data=json.loads(source.split('window.BITCOIN_HISTORY = ',1)[1].rstrip(';\n'))
events=data['events']
assert len({e['id'] for e in events})==len(events)
assert all(events[i]['sort']<=events[i+1]['sort'] for i in range(len(events)-1))
years=list(dict.fromkeys(e['year'] for e in events))
labels={'2008':'The idea','2009':'A network begins','2010':'Early experiments','2011':'Open-source branches','2012':'Rules in action','2013':'The outside world arrives','2014':'Trust & responsibility','2015':'The scaling question','2016':'Another issuance era','2017':'Who decides the rules?','2018':'Building & breaking','2019':'The next proposal','2020':'A wider circle','2021':'A global stress test','2022':'Custody, revisited','2023':'New uses, new arguments','2024':'A different kind of access','2025':'Policy takes new turns','2026':'The work continues'}
feature={'white-paper','genesis','pizza','first-halving','uasf','bitcoin-cash','china-mining','spot-etfs-launch','eighteen-years'}
parts=['<div class="reading-bar"><div class="shell reading-inner"><span class="jump-label">JUMP TO A YEAR</span><nav class="year-nav" aria-label="Jump to a year">'+''.join('<a href="#year-'+y+'">'+y+'</a>' for y in years)+'</nav><button class="expand-all" type="button" hidden aria-pressed="false">Expand all <span aria-hidden="true">+</span></button></div></div>', '<section class="shell timeline" id="timeline" aria-label="Bitcoin history, in chronological order"><div class="timeline-spine" aria-hidden="true"></div>']
index=0
for year in years:
 parts.append('<section class="year-section" id="year-'+year+'" aria-labelledby="heading-'+year+'"><div class="year-heading"><h2 id="heading-'+year+'">'+year+'</h2><p>'+labels[year]+'</p></div><ol class="year-events">')
 for e in (e for e in events if e['year']==year):
  index+=1
  side='left' if index%2 else 'right'
  cat='fork' if e['category']=='Forks & governance' else 'halving' if e['category']=='Monetary policy' else 'normal'
  cls='event-row '+side+(' featured' if e['id'] in feature else '')+' '+cat
  sources=''.join('<a href="'+esc(s['url'],quote=True)+'">'+esc(s['label'])+' <span aria-hidden="true">↗</span></a>' for s in e['sources'])
  stat=''
  if e['stat'] and (e['kind']=='halving' or e['id'] in ['white-paper','hal-finney','pizza']):
   stat='<div class="event-stat"><strong>'+esc(e['stat'])+'</strong><span>'+esc(e['unit'])+'</span></div>'
  title=e['short']
  if e['id']=='white-paper':title='Satoshi publishes the Bitcoin white paper'
  if e['id']=='genesis':title='The genesis block starts the chain'
  if e['id']=='hal-finney':title='The first person-to-person transfer'
  parts.append('''<li class="'''+cls+'''"><div class="point-date"><time>'''+esc(e['date'])+'''</time><span>'''+esc(e['category'])+'''</span></div><span class="point" aria-hidden="true"><i></i></span><details class="milestone" id="'''+e['id']+'''"><summary><span class="entry-label"><span>'''+str(index).zfill(2)+''' / '''+esc(e['category'].upper())+'''</span><span class="entry-symbol" aria-hidden="true">'''+('⑂' if cat=='fork' else '◈' if cat=='halving' else '↗')+'''</span></span><h3>'''+esc(title)+'''</h3><p class="event-summary">'''+esc(e['summary'])+'''</p><span class="read-more"><span class="closed-label">Explore this moment</span><span class="open-label">Close details</span><span class="plus" aria-hidden="true">+</span></span></summary><div class="event-details">'''+stat+'''<p>'''+esc(e['body'])+'''</p><h4>Why it mattered</h4><p>'''+esc(e['why'])+'''</p><div class="context"><h4>Keep it in perspective</h4><p>'''+esc(e['perspective'])+'''</p></div><div class="event-sources">'''+sources+'''</div><a class="permalink" href="#'''+e['id']+'''">Link to this moment <span aria-hidden="true">↗</span></a></div></details></li>''')
 parts.append('</ol></section>')
parts.append('<div class="timeline-end"><span class="end-point" aria-hidden="true"></span><p>TO BE CONTINUED</p><span>Reviewed through 31 October 2026.</span></div></section>')
page=ROOT/'bitcoin/history/index.html';html=page.read_text();rendered='\n'.join(parts)
assert '<!-- TIMELINE START -->' in html
html=re.sub(r'<!-- TIMELINE START -->.*?<!-- TIMELINE END -->','<!-- TIMELINE START -->\n'+rendered+'\n<!-- TIMELINE END -->',html,flags=re.S)
html=re.sub(r'(<span data-milestone-count>).*?(</span>)',lambda m:m[1]+str(len(events))+m[2],html)
page.write_text(html)
print(f'Rendered {len(events)} milestones across {len(years)} calendar years. All details and source links are in HTML.')
