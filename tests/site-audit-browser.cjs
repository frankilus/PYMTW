const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8771';
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
const p=await browser.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
const catalog=require('../tools/catalog.js').flatMap(c=>c.tools);
for(const width of [320,390,1280]){await p.setViewportSize({width,height:900});
 for(const slug of [...catalog.map(t=>t.slug),'checkup','guides/first-home','guides/lost-my-job','guides/true-cost-of-a-car','guides/true-cost-of-a-baby','guides/true-cost-of-owning-a-home','guides/true-cost-of-a-wedding']){
  await p.goto(base+'/tools/'+slug+'/');await p.evaluate(()=>document.fonts.ready);
  assert.ok(await p.evaluate(()=>document.fonts.check('500 24px Fraunces')&&document.fonts.check('400 16px "DM Sans"')),slug+' fonts');
  // Include every wizard step, not just the first screen.
  await p.locator('.step').evaluateAll(es=>es.forEach(e=>e.style.display='block'));
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug+' form overflow '+width);
  if(catalog.find(t=>t.slug===slug)?.live||slug==='checkup'){
   await p.goto(base+'/tools/'+slug+'/?demo=1');
   if(slug==='explain-my-401k'){await p.locator('#example').click();assert.ok(await p.locator('#results').isVisible());}else if(slug==='bitcoin-tax-lot-cleanup'){await p.locator('#example').click();assert.ok((await p.locator('#review-status').innerText()).includes('need attention'));}else assert.ok(await p.locator('.result-newsletter').isVisible(),slug+' result signup');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,slug+' result overflow '+width);
  }
 }
 for(const route of ['/','/tools/','/book/','/members.html','/dashboard.html']){
  await p.goto(base+route);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow '+width);
 }
}
await p.goto(base+'/tools/debt-payoff-planner/');for(const button of await p.locator('#debts .x').all()){const b=await button.boundingBox();assert.ok(b.width>=44&&b.height>=44);}
await p.setViewportSize({width:390,height:900});await p.goto(base+'/tools/debt-payoff-planner/');await p.locator('#add').click();assert.equal(await p.locator('#debts tbody tr').count(),5);await p.locator('#debts .x').last().click();assert.equal(await p.locator('#debts tbody tr').count(),4);
for(const route of ['/members.html','/dashboard.html']){await p.goto(base+route);assert.equal(await p.locator('meta[name=robots]').getAttribute('content'),'noindex');assert.equal(await p.locator('input').count(),0);assert.ok(await p.getByRole('heading',{name:'Not yet available.'}).isVisible());}
await p.route(base+'/missing/deep/path',r=>r.fulfill({status:404,contentType:'text/html',body:fs.readFileSync(path.join(__dirname,'../404.html'),'utf8')}));
assert.equal((await p.goto(base+'/missing/deep/path')).status(),404);await p.locator('#tool-query').fill('lost my job');await p.locator('#not-found-search button').click();await p.waitForURL('**/tools/#search=*');assert.ok((await p.locator('#finder-results').innerText()).includes('job'));
await p.goto(base+'/book/');assert.ok(await p.locator('.bk-real-cover img').evaluate(i=>i.complete&&i.naturalWidth>0));assert.equal(await p.locator('.bk-book').count(),0);assert.equal(await p.locator('a[href="https://amzn.to/4zwsLbQ"][rel*=sponsored]').count(),2);
// Fixed events must never contain typed values, queries, fragments, or destination tags.
await p.addInitScript(()=>{window.auditEvents=[];window.goatcounter={count:x=>window.auditEvents.push(x)};});
await p.goto(base+'/?salary=private-value#private-value');await p.evaluate(()=>{document.querySelector('a[href="https://amzn.to/4zwsLbQ"]').addEventListener('click',e=>e.preventDefault());document.querySelector('a[href="https://amzn.to/4zwsLbQ"]').click();});
const events=await p.evaluate(()=>({path:goatcounter.path(),ref:goatcounter.referrer(),events:auditEvents}));assert.equal(events.path,'/');assert.equal(events.ref,'');assert.equal(events.events.length,1);assert.ok(!JSON.stringify(events).includes('private-value'));assert.equal(events.events[0].title,'amazon-click');
const dnt=await browser.newContext();await dnt.addInitScript(()=>Object.defineProperty(navigator,'doNotTrack',{value:'1'}));const dp=await dnt.newPage();await dp.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());await dp.goto(base+'/');await dp.waitForTimeout(2200);assert.equal(await dp.locator('script[data-goatcounter]').count(),0);await dnt.close();
if(process.env.SCREENSHOT_DIR){for(const width of [390,1280]){await p.setViewportSize({width,height:900});for(const [name,route] of [['tools','/tools/'],['book','/book/'],['debt','/tools/debt-payoff-planner/']]){await p.goto(base+route);await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:process.env.SCREENSHOT_DIR+'/audit-'+name+'-'+width+'.png'});}}}
assert.deepEqual(errors,[]);console.log('Audit browser checks passed: 18 Tools routes, every wizard step and live results at 3 widths; local fonts; newsletter cards; debt labels/add/remove/tap targets; member holding pages; deep 404 search; real cover; fixed analytics events and DNT.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1)});
