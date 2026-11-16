// Bitcoin 200-week moving average tracker in a real browser at 320/375/1280: no overflow, no console errors, readable text, 44px tap targets, snapshot and research table match core.js / research.js (with a mocked live price and with the ticker blocked), ranges, distance view, optional bands, hover/keyboard readout, CTAs, nl-click + results-shown events, only expected requests, findable in "Find the right tool.", axe clean.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8783';
const W=require('../tools/bitcoin-200-week-moving-average/core.js'),data=require('../tools/bitcoin-200-week-moving-average/data/weekly.json');
const Research=require('../tools/bitcoin-200-week-moving-average/research.js');
const TICK='https://api.exchange.coinbase.com/products/BTC-USD/ticker';
const usd=n=>n>=100?'$'+Math.round(n).toLocaleString('en-US'):'$'+n.toFixed(2);
const histDate=new Date(data.updated+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
async function open(mode){const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::ERR_FAILED|Failed to load resource/.test(m.text()))errors.push(m.text());});p.on('response',r=>{if(r.url().startsWith(base+'/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base+'/'))return r.continue();outgoing.push(u);if(u===TICK&&mode==='live')return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({price:'60000.00'})});return r.abort();});
await c.addInitScript(()=>{window.__events=[];window.goatcounter={count:o=>window.__events.push(o.path)};});return {c,p,errors,outgoing};}
const noOverflow=async(p,w)=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+w);
const waitLive=p=>p.waitForFunction(()=>/Coinbase snapshot fetched/.test(document.querySelector('#wm-asof')?.textContent||''));
const waitBlocked=p=>p.waitForFunction(()=>/Saved daily price and history as of/.test(document.querySelector('#wm-asof')?.textContent||'')&&/Live quote unavailable/.test(document.querySelector('#wm-asof')?.textContent||''));
const URL=base+'/tools/bitcoin-200-week-moving-average/';
const outcomes=Research.outcomes(Research.historicalSeries(data));
// 1) live price available (mocked)
let {c,p,errors,outgoing}=await open('live');
const today=new Date().toISOString().slice(0,10);const exp=W.build(data,{price:60000,date:today<data.latest.date?data.latest.date:today}).current;
for(const width of [320,375,1280]){await p.setViewportSize({width,height:900});const res=await p.goto(URL);assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/^Bitcoin 200-Week Moving Average Tracker/);assert.equal(await p.locator('h1').count(),1);
 await waitLive(p);
 const asof=await p.locator('#wm-asof').innerText();
 assert.match(asof,/^Coinbase snapshot fetched .+; history as of /);
 assert.ok(asof.includes('history as of '+histDate+'.'),asof);
 assert.equal(await p.locator('#wm-chart-asof').count(),0);
 assert.equal(await p.locator('#wm-mult').innerText(),exp.mult.toFixed(2)+'× the average');
 assert.equal(await p.locator('#wm-price').innerText(),usd(60000));
 assert.equal(await p.locator('#wm-ma').innerText(),usd(exp.ma));
 assert.equal(await p.locator('#wm-scale-title').innerText(),'Where today sits');
 assert.match(await p.locator('.wm-scale-marker').innerText(),new RegExp('Today '+exp.mult.toFixed(2).replace('.','\\.')+'×'));
 assert.equal(await p.locator('.wm-scale-legend li.is-current').count(),1);
 assert.match(await p.locator('.wm-scale-legend li.is-current').innerText(),new RegExp(exp.zone.name));
 assert.equal(await p.locator('#wm-chart svg').count(),1);
 assert.equal(await p.locator('#wm-chart polygon').count(),0,'bands off by default');
 assert.ok(await p.locator('#wm-chart path').count()>=2,'price and 200WMA lines');
 assert.match(await p.locator('#wm-chart svg title').textContent(),/Bitcoin price and 200-week average, log scale/);
 // research table is behind a details disclosure; open it and check computed history
 await p.locator('#wm-history summary').click();
 assert.equal(await p.locator('#wm-zones .wm-zone').count(),4);
 assert.equal(await p.locator('#wm-zones .wm-zone.now').count(),0);
 assert.match(await p.locator('#wm-history-period').innerText(),/Eligible starting observations:/);
 const zoneText=await p.locator('#wm-zones .wm-zone').evaluateAll(es=>es.map(e=>e.innerText));
 outcomes.forEach((s,i)=>{
  assert.match(zoneText[i],new RegExp(s.zone.name));
  assert.match(zoneText[i],/Eligible weekly observations/);
  assert.match(zoneText[i],/Observed stretches/);
  assert.match(zoneText[i],/Worst drop along the way/);
  assert.match(zoneText[i],new RegExp('\\b'+s.n+'\\b'));
  assert.match(zoneText[i],new RegExp('\\b'+s.stretches+'\\b'));
 });
 await noOverflow(p,width);
 const box=await p.locator('#wm-chart').evaluate(e=>({sw:e.scrollWidth,cw:e.clientWidth}));assert.ok(box.sw<=box.cw+1,'chart fits '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>!e.closest('svg')&&e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,40)));assert.deepEqual(tiny,[],'small text '+width);
 const svgTiny=await p.evaluate(()=>[...document.querySelectorAll('#wm-chart svg text')].filter(e=>parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent));assert.deepEqual(svgTiny,[],'small svg text '+width);
 const tapSel=width<1280?'.wm-view span,.wm-ranges span,.wm-bands,.result-newsletter a,.wm-links a,[data-moment]':'.wm-ranges span,.wm-bands,.result-newsletter a,.wm-links a,[data-moment]';
 const small=await p.locator(tapSel).evaluateAll(es=>es.filter(e=>e.checkVisibility()&&e.getBoundingClientRect().height<43.5).map(e=>e.textContent.slice(0,30)));assert.deepEqual(small,[],'tap targets '+width);
 // ranges redraw the chart; default is 5 years
 assert.ok(await p.locator('input[name="wm-range"][value="5"]').isChecked());
 const d0=await p.locator('#wm-chart path').first().getAttribute('d');
 await p.locator('.wm-ranges label',{hasText:'2 years'}).click();
 assert.notEqual(await p.locator('#wm-chart path').first().getAttribute('d'),d0);
 await p.locator('.wm-ranges label',{hasText:'All history'}).click();
 const bb=await p.locator('#wm-chart svg').boundingBox();
 await p.mouse.move(bb.x+bb.width*0.6,bb.y+bb.height*0.4);
 assert.match(await p.locator('#wm-hover').innerText(),/(Sunday sample|provisional snapshot)/);
 assert.match(await p.locator('#wm-hover').innerText(),/Bitcoin \$/);
 assert.match(await p.locator('#wm-hover').innerText(),/average \$/);
 assert.match(await p.locator('#wm-hover').innerText(),/×/);
 await p.mouse.move(bb.x+bb.width*0.05,bb.y+bb.height*0.4);
 assert.match(await p.locator('#wm-hover').innerText(),/200 observations needed before an average is available/);
 await p.locator('#wm-chart svg').focus();
 const h0=await p.locator('#wm-hover').innerText();
 await p.keyboard.press('ArrowRight');
 assert.notEqual(await p.locator('#wm-hover').innerText(),h0);
 // distance view redraws the chart around the 1× line
 await p.locator('.wm-view label',{hasText:'Distance from average'}).click();
 assert.match(await p.locator('#wm-chart svg title').textContent(),/Bitcoin price divided by its 200-week average, log scale/);
 assert.ok(await p.locator('#wm-chart path').count()>=1,'distance path');
 assert.ok((await p.locator('#wm-chart svg text').evaluateAll(es=>es.some(e=>e.textContent.includes('1×')))),'1× reference');
 // optional relative-price bands: price view draws polygons; distance view draws filled rects
 await p.locator('.wm-view label',{hasText:'Price & average'}).click();
 await p.locator('#wm-bands').check();
 assert.ok(await p.locator('#wm-chart polygon').count()>=4,'optional zone bands');
 await p.locator('.wm-view label',{hasText:'Distance from average'}).click();
 assert.ok(await p.locator('#wm-chart rect').count()>=5,'distance bands use rects');
}
// CTAs and events
const hrefs=await p.locator('main a, .wm-links a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
const iDca=hrefs.indexOf('../bitcoin-dca-backtester/'),iHh=hrefs.indexOf('../bitcoin-household-plan/'),iNl=hrefs.indexOf('https://pymtw.beehiiv.com/subscribe');assert.ok(iDca>-1&&iHh>iDca&&iNl>iHh,'CTA order '+hrefs.join(' '));
await p.evaluate(()=>{document.querySelector('.result-newsletter a').addEventListener('click',e=>e.preventDefault());});await p.click('.result-newsletter a');
const ev=await p.evaluate(()=>window.__events);assert.ok(ev.includes('event/bitcoin-200-week-moving-average/nl-click'),ev.join());assert.ok(ev.includes('event/bitcoin-200-week-moving-average/results-shown'));
assert.deepEqual(errors,[]);assert.deepEqual([...new Set(outgoing)].filter(u=>!/fonts\.|goatcounter|gc\.zgo\.at\/count\.js/.test(u)),[TICK],'outgoing requests: only the ticker');
await c.close();
// 2) ticker blocked: falls back to the saved daily price, still no layout or script errors
({c,p,errors}=await open('blocked'));await p.setViewportSize({width:375,height:900});await p.goto(URL);await waitBlocked(p);
const blockedAsof=await p.locator('#wm-asof').innerText();
assert.match(blockedAsof,/^Saved daily price and history as of /);
assert.ok(blockedAsof.startsWith('Saved daily price and history as of '+histDate+'.'),blockedAsof);
assert.match(blockedAsof,/Live quote unavailable/);
assert.equal(await p.locator('#wm-chart-asof').count(),0);
const fb=W.build(data,null).current;
assert.equal(await p.locator('#wm-mult').innerText(),fb.mult.toFixed(2)+'× the average');
assert.equal(await p.locator('#wm-price').innerText(),usd(fb.price));
assert.equal(await p.locator('#wm-ma').innerText(),usd(fb.ma));
assert.match(await p.locator('.wm-scale-legend li.is-current').innerText(),new RegExp(fb.zone.name));
await noOverflow(p,375);assert.deepEqual(errors,[]);await c.close();
// 3) findable in "Find the right tool." search and the Bitcoin topic
({c,p,errors}=await open('blocked'));await p.goto(base+'/tools/');
await p.locator('#directory-search-input').waitFor({state:'visible'});
for(const q of ['200 week moving average','200wma','is bitcoin cheap','moving average','buying opportunity']){await p.locator('#directory-search-input').fill(q);assert.equal(await p.locator(`#tools-grid a.directory-tool[href="./${'bitcoin-200-week-moving-average'}/"]`).count(),1,q);}
await p.locator('#directory-search-input').fill('');await p.locator('[data-category=bitcoin]').click();assert.equal(await p.locator('#tools-grid a.directory-tool[href="./bitcoin-200-week-moving-average/"]').count(),1);
assert.deepEqual(errors,[]);await c.close();
if(process.env.AXE_PATH){({c,p}=await open('live'));for(const width of [375,1280]){await p.setViewportSize({width,height:1000});await p.goto(URL);await waitLive(p);await p.addScriptTag({path:process.env.AXE_PATH});const v=await p.evaluate(async()=>(await axe.run()).violations.map(x=>x.id+':'+x.nodes.length));assert.deepEqual(v,[],'axe '+width);}await c.close();}
console.log('ok');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
