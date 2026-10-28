// Lost-my-job checklist in a real browser: load, layout, tap targets, localStorage-only checkmarks, print button, print media, analytics events, guide link and tools search.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8779';
const PATH='/tools/guides/lost-my-job/checklist/',KEY='pymtw-lost-my-job-checklist-v1';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];p.on('pageerror',e=>errors.push(e.message));
await c.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/')){outgoing.push(u);return r.abort();}return r.continue();});
await c.addInitScript(()=>{window.__printed=0;window.print=()=>{window.__printed++;};window.__events=[];const t=setInterval(()=>{if(window.PT&&PT.track&&!PT.__wrapped){const o=PT.track;PT.track=function(n,ti){window.__events.push(n);try{return o.apply(this,arguments);}catch(e){}};PT.__wrapped=1;clearInterval(t);}},5);});
for(const width of [320,390,1280]){await p.setViewportSize({width,height:950});const res=await p.goto(base+PATH);assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/Lost Your Job\? Printable 90-Day Checklist/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,60)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('.actions button,.btn,label.ck,.chips a,.sources a,sup.refs a,.nl-line a,.back,input[type=checkbox]').evaluateAll(es=>es.filter(e=>e.checkVisibility()).filter(e=>{const r=e.getBoundingClientRect(),h=r.height;const min=e.matches('button,.btn,label.ck,.chips a')?44:24;return h<min-.1;}).map(e=>(e.id||e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().height)));assert.deepEqual(small,[],'tap targets '+width);
}
// six phases, each with checkboxes; checkmarks persist in localStorage only
assert.equal(await p.locator('section.phase').count(),4);const n=await p.locator('label.ck input[type=checkbox]').count();assert.ok(n>=30);
await p.evaluate(k=>localStorage.removeItem(k),KEY);await p.reload();
assert.match(await p.locator('#ck-done').innerText(),/^0\b/);
await p.locator('label.ck:has(#p1-1)').click();await p.locator('label.ck:has(#p4-3)').click();
assert.equal(await p.locator('#p1-1').isChecked(),true);assert.match(await p.locator('#ck-done').innerText(),/^2\b/);
assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),KEY)),{'p1-1':true,'p4-3':true});
await p.reload();assert.equal(await p.locator('#p1-1').isChecked(),true);assert.equal(await p.locator('#p4-3').isChecked(),true);assert.equal(await p.locator('#p2-1').isChecked(),false);
assert.equal(await p.evaluate(()=>document.cookie),'');assert.equal(await p.evaluate(()=>sessionStorage.length),0);
await p.locator('label.ck:has(#p1-1)').click();assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),KEY)),{'p4-3':true});
// print button calls window.print() and both actions are tracked
await p.locator('label.ck:has(#p2-1)').click();await p.locator('#ck-print').click();assert.equal(await p.evaluate(()=>window.__printed),1);
const ev=await p.evaluate(()=>window.__events);assert.ok(ev.includes('item-checked')&&ev.includes('print-click'),JSON.stringify(ev));
// reset clears everything after confirm
p.once('dialog',d=>d.accept());await p.locator('#ck-reset').click();assert.equal(await p.locator('label.ck input:checked').count(),0);
// print media: chrome hidden, footer URL shown, a page break before every phase after the first
await p.emulateMedia({media:'print'});
for(const sel of ['nav','footer','.actions','.nl-line','.chips','.v7-next'])for(const e of await p.locator(sel).all())assert.equal(await e.isVisible(),false,sel+' hidden in print');
assert.ok(await p.locator('.print-foot').isVisible());assert.match(await p.locator('.print-foot').innerText(),/pymtw\.com\/tools\/guides\/lost-my-job\/checklist\//);
const breaks=await p.locator('section.phase').evaluateAll(es=>es.map(e=>getComputedStyle(e).breakBefore));assert.deepEqual(breaks.slice(1),Array(3).fill('page'),JSON.stringify(breaks));
await p.emulateMedia({media:'screen'});
// newsletter line: one on-screen link to The Long Game, no embedded forms
assert.equal(await p.locator('a[href="https://pymtw.beehiiv.com/subscribe"]').count(),1);assert.equal(await p.locator('iframe,form').count(),0);
const ld=JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());assert.deepEqual(ld['@graph'].map(x=>x['@type']),['BreadcrumbList','HowTo']);
// only the shared analytics may be requested
const bad=outgoing.filter(u=>!/^https:\/\/(gc\.zgo\.at|pymtw\.goatcounter\.com)\//.test(u));assert.deepEqual(bad,[],'unexpected requests');
assert.deepEqual(errors,[]);
// sitemap and llms.txt are served
for(const f of ['/tools/sitemap.xml','/tools/llms.txt'])assert.ok((await (await p.request.get(base+f)).text()).includes('https://pymtw.com'+PATH),f);
// the lost-my-job guide links to it near the top
await p.goto(base+'/tools/guides/lost-my-job/');const top=p.locator('#get-checklist');assert.ok(await top.isVisible());assert.match(await top.innerText(),/Get the printable 90-day checklist/);
await top.click();await p.waitForURL('**'+PATH);
// findable in "Find the right tool." search and the hero search on /tools/
await p.goto(base+'/tools/');await p.locator('#directory-search-input').fill('layoff checklist');
assert.ok(await p.locator('#tools-grid a.directory-tool[href*="guides/lost-my-job/checklist"]').first().isVisible(),'directory search finds the checklist');
await p.locator('#finder-input').fill('lost my job checklist');await p.locator('#finder-form button[type=submit], #finder-form button').first().click();assert.match(await p.locator('#finder-results').innerText(),/lost-my-job checklist/i);
await p.locator('#directory-search-input').fill('lost my job checklist');assert.ok(await p.locator('#tools-grid a.directory-tool[href*="guides/lost-my-job/checklist"]').first().isVisible(),'directory search finds it by name');
console.log('PASS lost-my-job checklist browser at 320/390/1280: 200 + title, no overflow, >=12px text, tap targets, localStorage persistence/reset, print button + events, print media, newsletter line, schema, analytics-only requests, sitemap/llms, guide link, tools search.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
