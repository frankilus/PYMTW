// Bitcoin 200-week moving average tracker in a real browser at 320/375/1280: no overflow, no console errors, readable text, 44px tap targets, readout and chart match core.js (with a mocked live price and with the ticker blocked), ranges, hover/keyboard readout, CTAs, nl-click + results-shown events, only expected requests, findable in "Find the right tool.", axe clean.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8783';
const W=require('../tools/bitcoin-200-week-moving-average/core.js'),data=require('../tools/bitcoin-200-week-moving-average/data/weekly.json');
const TICK='https://api.exchange.coinbase.com/products/BTC-USD/ticker';
const usd=n=>n>=100?'$'+Math.round(n).toLocaleString('en-US'):'$'+n.toFixed(2);
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
async function open(mode){const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::ERR_FAILED|Failed to load resource/.test(m.text()))errors.push(m.text());});p.on('response',r=>{if(r.url().startsWith(base+'/')&&r.status()>=400)errors.push(r.status()+' '+r.url());});
await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith(base+'/'))return r.continue();outgoing.push(u);if(u===TICK&&mode==='live')return r.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify({price:'60000.00'})});return r.abort();});
await c.addInitScript(()=>{window.__events=[];window.goatcounter={count:o=>window.__events.push(o.path)};});return {c,p,errors,outgoing};}
const noOverflow=async(p,w)=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+w);
const URL=base+'/tools/bitcoin-200-week-moving-average/';
// 1) live price available (mocked)
let {c,p,errors,outgoing}=await open('live');
const today=new Date().toISOString().slice(0,10);const exp=W.build(data,{price:60000,date:today<data.latest.date?data.latest.date:today}).current;
for(const width of [320,375,1280]){await p.setViewportSize({width,height:900});const res=await p.goto(URL);assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/^Bitcoin 200-Week Moving Average Tracker/);assert.equal(await p.locator('h1').count(),1);
 await p.waitForFunction(()=>/Price live as of/.test(document.querySelector('#wm-asof')?.textContent||''));
 const hist=new Date(data.updated+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
 const asof=await p.locator('#wm-asof').innerText();assert.match(asof,/^Price live as of .+; weekly history as of /);assert.ok(asof.endsWith('weekly history as of '+hist+'.'),asof);
 assert.equal(await p.locator('#wm-chart-asof').innerText(),asof);
 assert.equal(await p.locator('#wm-mult').innerText(),exp.mult.toFixed(2)+'x');assert.equal(await p.locator('#wm-price').innerText(),usd(60000));assert.equal(await p.locator('#wm-ma').innerText(),usd(exp.ma));
 assert.ok((await p.locator('.wm-chip').innerText())===exp.zone.name);assert.equal(await p.locator('.wm-stats .stat').count(),6);assert.equal(await p.locator('#wm-zones .wm-zone').count(),4);assert.equal(await p.locator('#wm-zones .wm-zone.now').count(),1);
 assert.equal(await p.locator('#wm-chart svg').count(),1);assert.ok(await p.locator('#wm-chart polygon').count()>=4,'zone bands');assert.ok(await p.locator('#wm-chart path').count()>=2,'price and 200WMA lines');
 assert.match(await p.locator('#wm-chart svg title').textContent(),/log scale/);
 await noOverflow(p,width);
 const box=await p.locator('#wm-chart').evaluate(e=>({sw:e.scrollWidth,cw:e.clientWidth}));assert.ok(box.sw<=box.cw+1,'chart fits '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>!e.closest('svg')&&e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,40)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('.wm-pick .seg span,.result-newsletter a,.wm-links a').evaluateAll(es=>es.filter(e=>e.checkVisibility()&&e.getBoundingClientRect().height<43.5).map(e=>e.textContent.slice(0,30)));assert.deepEqual(small,[],'tap targets '+width);
 // ranges redraw the chart; hover and keyboard read a week
 const d0=await p.locator('#wm-chart path').first().getAttribute('d');await p.locator('.wm-pick label',{hasText:'5 years'}).click();assert.notEqual(await p.locator('#wm-chart path').first().getAttribute('d'),d0);
 await p.locator('.wm-pick label',{hasText:'All history'}).click();
 const bb=await p.locator('#wm-chart svg').boundingBox();await p.mouse.move(bb.x+bb.width*0.6,bb.y+bb.height*0.4);assert.match(await p.locator('#wm-hover').innerText(),/Week of .* price \$.*200-week avg/);
 await p.mouse.move(bb.x+bb.width*0.05,bb.y+bb.height*0.4);assert.match(await p.locator('#wm-hover').innerText(),/no 200-week average yet/);
 await p.locator('#wm-chart svg').focus();const h0=await p.locator('#wm-hover').innerText();await p.keyboard.press('ArrowRight');assert.notEqual(await p.locator('#wm-hover').innerText(),h0);
}
// CTAs and events
const hrefs=await p.locator('main a, .wm-links a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
const iDca=hrefs.indexOf('../bitcoin-dca-backtester/'),iHh=hrefs.indexOf('../bitcoin-household-plan/'),iNl=hrefs.indexOf('https://pymtw.beehiiv.com/subscribe');assert.ok(iDca>-1&&iHh>iDca&&iNl>iHh,'CTA order '+hrefs.join(' '));
await p.evaluate(()=>{document.querySelector('.result-newsletter a').addEventListener('click',e=>e.preventDefault());});await p.click('.result-newsletter a');
const ev=await p.evaluate(()=>window.__events);assert.ok(ev.includes('event/bitcoin-200-week-moving-average/nl-click'),ev.join());assert.ok(ev.includes('event/bitcoin-200-week-moving-average/results-shown'));
assert.deepEqual(errors,[]);assert.deepEqual([...new Set(outgoing)].filter(u=>!/fonts\.|goatcounter|gc\.zgo\.at\/count\.js/.test(u)),[TICK],'outgoing requests: only the ticker');
await c.close();
// 2) ticker blocked: falls back to the saved daily price, still no layout or script errors
({c,p,errors}=await open('blocked'));await p.setViewportSize({width:375,height:900});await p.goto(URL);await p.waitForFunction(()=>/Data as of/.test(document.querySelector('#wm-asof')?.textContent||'')&&/live price was not available/.test(document.querySelector('#wm-asof')?.textContent||''));
const histFb=new Date(data.updated+'T00:00:00Z').toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'});
assert.match(await p.locator('#wm-asof').innerText(),/^Data as of /);assert.ok((await p.locator('#wm-asof').innerText()).startsWith('Data as of '+histFb+'.'),await p.locator('#wm-asof').innerText());assert.match(await p.locator('#wm-asof').innerText(),/live price was not available/);
assert.equal(await p.locator('#wm-chart-asof').innerText(),await p.locator('#wm-asof').innerText());
const fb=W.build(data,null).current;assert.equal(await p.locator('#wm-mult').innerText(),fb.mult.toFixed(2)+'x');assert.equal(await p.locator('#wm-price').innerText(),usd(fb.price));await noOverflow(p,375);assert.deepEqual(errors,[]);await c.close();
// 3) findable in "Find the right tool." search and the Bitcoin topic
({c,p,errors}=await open('blocked'));await p.goto(base+'/tools/');
for(const q of ['200 week moving average','200wma','is bitcoin cheap','moving average','buying opportunity']){await p.locator('#directory-search-input').fill(q);assert.equal(await p.locator(`#tools-grid a.directory-tool[href="./${'bitcoin-200-week-moving-average'}/"]`).count(),1,q);}
await p.locator('#directory-search-input').fill('');await p.locator('[data-category=bitcoin]').click();assert.equal(await p.locator('#tools-grid a.directory-tool[href="./bitcoin-200-week-moving-average/"]').count(),1);
assert.deepEqual(errors,[]);await c.close();
if(process.env.AXE_PATH){({c,p}=await open('live'));for(const width of [375,1280]){await p.setViewportSize({width,height:1000});await p.goto(URL);await p.waitForFunction(()=>/Price live as of/.test(document.querySelector('#wm-asof')?.textContent||''));await p.addScriptTag({path:process.env.AXE_PATH});const v=await p.evaluate(async()=>(await axe.run()).violations.map(x=>x.id+':'+x.nodes.length));assert.deepEqual(v,[],'axe '+width);}await c.close();}
console.log('ok');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
