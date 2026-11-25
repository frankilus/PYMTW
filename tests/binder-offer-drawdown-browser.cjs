// Binder offer on the Bitcoin Retirement Drawdown Planner results (2026-11-25): one honest card that states the $29 price
// (matching the Household Plan config), lists what the binder contains (checked against binder.js), links to the free
// tool and the fictional sample, and counts clicks as event/bitcoin-retirement-drawdown/binder-click with the placement
// as the title. The Household Plan page itself stays tracker-free (strict CSP, no analytics script), and
// #sample-title opens its fictional example. 375 and 1280: no overflow, 44px tap targets, readable text.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8782',root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
// static checks
const dd=read('tools/bitcoin-retirement-drawdown/index.html'),cfg=read('tools/bitcoin-household-plan/config.js'),binder=read('tools/bitcoin-household-plan/binder.js'),hhp=read('tools/bitcoin-household-plan/index.html'),legal=read('legal.html'),tools=read('tools/tools.js');
assert.equal((dd.match(/data-binder-placement=/g)||[]).length,2);
assert.match(cfg,/price: '\$29'/);assert.ok(dd.includes('one-time $29 purchase through Stripe'));
for(const t of ["'My Bitcoin policy'","'Letter to my executor & family'","'Wallet & account inventory'","'Yearly review checklist'","'Records & cost basis'"])assert.ok(binder.includes(t),t);
assert.ok(binder.includes('Target share of my investments')&&binder.includes('First safe steps'));
assert.ok(legal.includes('id="payments"'));assert.ok(hhp.includes('id="sample-title"'));
assert.ok(hhp.includes("connect-src 'none'")&&!/goatcounter|site-analytics|tools\.js/.test(hhp),'Household Plan page stays tracker-free');
assert.ok(!/buy\.stripe\.com/.test(dd),'the card links to the free tool, not straight to checkout');
assert.ok(!/guarantee|refund|limited time|only \d+ left/i.test(dd.split('id="dd-binder"')[1].split('</aside>')[0]),'no invented guarantee, refund or scarcity');
assert.match(tools,/a\[data-binder-placement\]/);
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::ERR_FAILED/.test(m.text()))errors.push(m.text());});
await c.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
await c.addInitScript(()=>{window.__events=[];window.goatcounter={count:o=>window.__events.push(o.path+'|'+o.title)};});
for(const width of [375,1280]){await p.setViewportSize({width,height:900});await p.goto(base+'/tools/bitcoin-retirement-drawdown/?demo=1');await p.locator('#results.show').waitFor();
 const card=p.locator('#dd-binder');assert.ok(await card.isVisible());const txt=await card.innerText();
 assert.match(txt,/\$29/);assert.match(txt,/free/i);assert.equal(await card.locator('li').count(),4);
 assert.ok(/never recovery words, keys or passwords/.test(txt));assert.ok(/Stripe brings you back/.test(txt));
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
 const small=await card.locator('.dd-binder-actions a').evaluateAll(es=>es.filter(e=>e.getBoundingClientRect().height<43.5).map(e=>e.textContent));assert.deepEqual(small,[],'tap '+width);
 const tiny=await card.evaluate(el=>[...el.querySelectorAll('*')].filter(e=>[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).length);assert.equal(tiny,0);
 // card sits before the newsletter and loan CTAs
 const order=await p.evaluate(()=>{const r=document.querySelector('#results'),all=[...r.querySelectorAll('#dd-binder,.result-newsletter,#dd-borrow')];return all.map(e=>e.id||e.className);});assert.deepEqual(order,['dd-binder','result-newsletter','dd-borrow']);
}
await p.evaluate(()=>document.querySelectorAll('#dd-binder a').forEach(a=>a.addEventListener('click',e=>e.preventDefault())));
await p.click('#dd-binder a.btn');await p.click('#dd-binder a[href$="#sample-title"]');
const ev=await p.evaluate(()=>window.__events);
assert.ok(ev.includes('event/bitcoin-retirement-drawdown/binder-click|drawdown-results'),ev.join());
assert.ok(ev.includes('event/bitcoin-retirement-drawdown/binder-click|drawdown-results-sample'),ev.join());
// the sample link opens the fictional example on the Household Plan page
await p.goto(base+'/tools/bitcoin-household-plan/#sample-title');await p.locator('#sample-binder').waitFor({state:'attached'});
assert.equal(await p.evaluate(()=>document.getElementById('sample-binder').closest('details').open),true);
assert.ok(/fictional/i.test(await p.locator('#sample-binder').innerText()));
await p.goto(base+'/tools/bitcoin-household-plan/');assert.equal(await p.evaluate(()=>document.getElementById('sample-binder').closest('details').open),false);
if(process.env.AXE_PATH){await p.goto(base+'/tools/bitcoin-retirement-drawdown/?demo=1');await p.locator('#results.show').waitFor();await p.addScriptTag({path:process.env.AXE_PATH});const v=await p.evaluate(async()=>(await axe.run('#dd-binder')).violations.map(x=>x.id));assert.deepEqual(v,[]);}
assert.deepEqual(errors,[]);console.log('ok');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
