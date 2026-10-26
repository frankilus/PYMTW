// Old 401(k) guide in a real browser: load, calculator math, accessibility basics, and no outside requests except analytics.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8779';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];p.on('pageerror',e=>errors.push(e.message));
await c.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/')){outgoing.push(u);return r.abort();}return r.continue();});
for(const width of [320,390,1280]){await p.setViewportSize({width,height:950});const res=await p.goto(base+'/tools/guides/old-401k/');assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/Old 401\(k\) Rollover/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,60)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('.calc input,.calc select,.calc .check,.sources a,sup.ref a,.newsletter-archive a,.sharebar .btn:visible,.toolcard').evaluateAll(es=>es.filter(e=>e.checkVisibility()).filter(e=>{const h=e.getBoundingClientRect().height;return h<(e.matches('input[type=checkbox]')?24:e.matches('input,select,.check,.btn,.toolcard')?44:24)-.1;}).map(e=>e.id||e.className||e.tagName));assert.deepEqual(small,[],'tap targets '+width);
 // defaults: $50,000, age 40, 22% federal, 5% state
 assert.equal(await p.locator('#o-pen').innerText(),'$5,000');assert.equal(await p.locator('#o-fed').innerText(),'$11,000');assert.equal(await p.locator('#o-st').innerText(),'$2,500');assert.equal(await p.locator('#o-net').innerText(),'$31,500');assert.equal(await p.locator('#o-roll').innerText(),'$50,000');
 assert.match(await p.locator('#o-says').innerText(),/\$10,000/);assert.match(await p.locator('#o-says').innerText(),/\$40,000/);
 // Rule of 55 toggle and inputs
 await p.locator('#k-r55').check();assert.equal(await p.locator('#o-pen').innerText(),'$0');assert.equal(await p.locator('#o-net').innerText(),'$36,500');await p.locator('#k-r55').uncheck();
 await p.locator('#k-bal').fill('20000');await p.locator('#k-fed').selectOption('12');await p.locator('#k-state').fill('0');assert.equal(await p.locator('#o-net').innerText(),'$15,600');
 await p.locator('#k-bal').fill('');assert.equal(await p.locator('#o-net').innerText(),'$0');
 // every label has a control and the result is announced
 assert.equal(await p.locator('.out[aria-live=polite]').count(),1);for(const id of ['k-bal','k-age','k-fed','k-state','k-r55'])assert.equal(await p.locator('label:has(#'+id+')').count(),1,id);
}
const ld=JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());assert.deepEqual(ld['@graph'].map(x=>x['@type']),['BreadcrumbList','Article','FAQPage']);
// scroll so the lazy newsletter loader runs; only beehiiv + the shared analytics may be requested
await p.locator('#newsletter').scrollIntoViewIfNeeded();await p.waitForTimeout(400);
const bad=outgoing.filter(u=>!/^https:\/\/(subscribe-forms\.beehiiv\.com|gc\.zgo\.at|pymtw\.goatcounter\.com)\//.test(u));assert.deepEqual(bad,[],'unexpected requests');
assert.deepEqual(errors,[]);
// sitemap and llms.txt are served
assert.ok((await (await p.request.get(base+'/tools/sitemap.xml')).text()).includes('https://pymtw.com/tools/guides/old-401k/'));assert.ok((await (await p.request.get(base+'/tools/llms.txt')).text()).includes('https://pymtw.com/tools/guides/old-401k/'));
// search finds the guide on the tools home
await p.goto(base+'/tools/');await p.locator('#finder-input').fill('401k rollover');await p.locator('#finder-form button[type=submit], #finder-form button').first().click();assert.match(await p.locator('#finder-results').innerText(),/old 401\(k\)/i);
console.log('PASS old-401k browser at 320/390/1280: 200 + title, no overflow, >=12px text, tap targets, $31,500 default math, Rule of 55, inputs, schema, only beehiiv/analytics requests, sitemap/llms served, tools search.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
