// Bitcoin retirement drawdown planner in a real browser: every wizard step and the results at 320/375/1280 with no overflow (the year-by-year table scrolls inside its own container), no console errors, readable text, 44px tap targets, results computed by core.js, scenario table switch, CTAs in order, no outgoing requests, nl-click tracking, findable in "Find the right tool.", axe clean.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8782';
const D=require('../tools/bitcoin-retirement-drawdown/core.js');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];
p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::ERR_FAILED/.test(m.text()))errors.push(m.text());});p.on('response',r=>{if(r.url().startsWith(base+'/')&&r.status()>=400)errors.push(r.status()+' '+r.url());}); // ERR_FAILED = external requests this test aborts on purpose
await c.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/')){outgoing.push(u);return r.abort();}return r.continue();});
await c.addInitScript(()=>{window.__events=[];window.goatcounter={count:o=>window.__events.push(o.path)};});
const URL=base+'/tools/bitcoin-retirement-drawdown/';
const expected=D.run({btc:2,btcPrice:100000,basis:60000,ira:600000,roth:50000,spend:70000,otherIncome:36000,otherAge:67,age:52,retireAge:60,planAge:95,filing:'mfj',btcGrowth:.10,iraReturn:.06,inflation:.03,order:'smart'});
const noOverflow=async w=>assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+w);
for(const width of [320,375,1280]){await p.setViewportSize({width,height:900});const res=await p.goto(URL);assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/^Bitcoin Retirement Drawdown Planner/);assert.equal(await p.locator('h1').count(),1);
 // walk every step with Next and check each one
 for(let i=0;i<6;i++){await noOverflow(width);const small=await p.locator('.step.on .seg span,.btn').evaluateAll(es=>es.filter(e=>e.checkVisibility()&&e.getBoundingClientRect().height<43.5).map(e=>e.textContent.slice(0,30)));assert.deepEqual(small,[],'tap targets step '+i+' '+width);await p.click('[data-next]');}
 await p.locator('#results.show').waitFor();
 assert.equal(await p.locator('.big').innerText(),D.SCENARIOS&&('$'+expected.safe.toLocaleString('en-US')+'/yr'));
 assert.equal(await p.locator('#dd-scen .sc').count(),5);
 const cards=await p.locator('#dd-scen .sc b').allInnerTexts();assert.deepEqual(cards,D.SCENARIOS.map(s=>{const x=expected.scenarios[s.id];return x.lasts?'Lasts past 95':'Runs out at '+x.depletedAge;}));
 assert.ok((await p.locator('.dd-zero').innerText()).includes('0%'));
 assert.equal(await p.locator('#chart svg').count(),1);
 const rows=await p.locator('#dd-table tbody tr').count();assert.equal(rows,expected.scenarios.base.rows.filter(r=>r.retired).length);
 await noOverflow(width);
 const wrap=await p.locator('.dd-tbl-wrap').evaluate(w=>({cw:w.clientWidth,sw:w.scrollWidth,ox:getComputedStyle(w).overflowX}));assert.equal(wrap.ox,'auto');if(width<640)assert.ok(wrap.sw>wrap.cw,'table scrolls sideways on phones');
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>!e.closest('svg')&&e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,40)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('#results .seg span,#results .next a,.result-newsletter a,.dd-cta a,.again button').evaluateAll(es=>es.filter(e=>e.checkVisibility()&&e.getBoundingClientRect().height<43.5).map(e=>e.textContent.slice(0,30)));assert.deepEqual(small.filter(t=>!/Change my answers/.test(t)),[],'result tap targets '+width);
}
// switch the table to the crash scenario: rows end where that scenario runs out
await p.locator('#dd-table').scrollIntoViewIfNeeded();await p.locator('.dd-pick label',{hasText:'75% crash at retirement'}).click();
const bear=expected.scenarios.bear;const last=await p.locator('#dd-table tbody tr').last();
if(!bear.lasts){assert.match(await last.innerText(),new RegExp('^'+bear.depletedAge));assert.equal(await p.locator('#dd-table tr.out').count(),1);}
// CTAs, in order: written plan -> The Long Game -> BTC Loan Rates
const hrefs=await p.locator('#results a').evaluateAll(as=>as.map(a=>a.getAttribute('href')));
const iPlan=hrefs.indexOf('../bitcoin-household-plan/'),iNl=hrefs.indexOf('https://pymtw.beehiiv.com/subscribe'),iLoan=hrefs.indexOf('https://btc-loan-rates.vercel.app');
assert.ok(iPlan>-1&&iNl>iPlan&&iLoan>iNl,'CTA order '+hrefs.join(' '));
assert.equal(await p.locator('#results a[href="https://btc-loan-rates.vercel.app"]').getAttribute('target'),'_blank');
assert.ok((await p.locator('.next').innerText()).includes('Turn this into your written plan'));
await p.evaluate(()=>{document.querySelector('.result-newsletter a').addEventListener('click',e=>e.preventDefault());});
await p.click('.result-newsletter a');const ev=await p.evaluate(()=>window.__events);assert.ok(ev.includes('event/bitcoin-retirement-drawdown/nl-click'),ev.join());assert.ok(ev.includes('event/bitcoin-retirement-drawdown/results-shown'));
// validation: retiring before your age now is rejected
await p.goto(URL);for(let i=0;i<3;i++)await p.click('[data-next]');await p.fill('input[name=retireAge]','40');await p.click('[data-next]');assert.match(await p.locator('.err').innerText(),/retirement age/);
// a household with no savings gets a plain message, not NaN
await p.goto(URL);await p.fill('input[name=btc]','0');await p.click('[data-next]');await p.fill('input[name=ira]','0');await p.fill('input[name=roth]','0');for(let i=0;i<5;i++)await p.click('[data-next]');
assert.ok(!/NaN|undefined|Infinity/.test(await p.locator('#out').innerText()));
// findable in "Find the right tool." search
await p.goto(base+'/tools/');for(const q of ['retire on bitcoin','how much can i sell','drawdown','rmd bitcoin']){await p.locator('#directory-search-input').fill(q);assert.equal(await p.locator('#tools-grid a.directory-tool[href="./bitcoin-retirement-drawdown/"]').count(),1,q);}
await p.locator('#directory-search-input').fill('');await p.locator('[data-category=bitcoin]').click();assert.equal(await p.locator('#tools-grid a.directory-tool[href="./bitcoin-retirement-drawdown/"]').count(),1);
assert.deepEqual(errors,[]);assert.deepEqual(outgoing.filter(u=>!/fonts\.|goatcounter|gc\.zgo\.at\/count\.js/.test(u)),[],'outgoing');
if(process.env.AXE_PATH){for(const width of [375,1280]){await p.setViewportSize({width,height:1000});await p.goto(URL+'?demo=1');await p.locator('#results.show').waitFor();await p.addScriptTag({path:process.env.AXE_PATH});const v=await p.evaluate(async()=>(await axe.run()).violations.map(x=>x.id+':'+x.nodes.length));assert.deepEqual(v,[],'axe '+width);}}
console.log('ok');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
