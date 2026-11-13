// Severance agreement review sheet in a real browser: load, layout, tap targets, localStorage-only checkmarks, print button, print media, copy-only HR questions, analytics events, axe, guide/checklist/runway links and tools search.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8780';
const PATH='/tools/guides/lost-my-job/severance-review/',KEY='pymtw-severance-review-v1';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];p.on('pageerror',e=>errors.push(e.message));
await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
await c.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/')){outgoing.push(u);return r.abort();}return r.continue();});
await c.addInitScript(()=>{window.__printed=0;window.print=()=>{window.__printed++;};window.__events=[];const t=setInterval(()=>{if(window.PT&&PT.track&&!PT.__wrapped){const o=PT.track;PT.track=function(n,ti){window.__events.push(n);try{return o.apply(this,arguments);}catch(e){}};PT.__wrapped=1;clearInterval(t);}},5);});
for(const width of [320,390,1280]){await p.setViewportSize({width,height:950});const res=await p.goto(base+PATH);assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/Severance Agreement Review Sheet/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,60)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('.actions button,.btn,label.ck,.chips a,.sources a,sup.refs a,.nl-line a,.back,#qs-copy,input[type=checkbox]').evaluateAll(es=>es.filter(e=>e.checkVisibility()).filter(e=>{const h=e.getBoundingClientRect().height;const min=e.matches('button,.btn,label.ck,.chips a')?44:24;return h<min-.1;}).map(e=>(e.id||e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().height)));assert.deepEqual(small,[],'tap targets '+width);
 // the not-legal-advice notice is visible above the checklist
 const box=p.locator('.legal-box');assert.ok(await box.isVisible());assert.match(await box.innerText(),/This is not legal advice\./);
 assert.ok((await box.boundingBox()).y<(await p.locator('#phase-1').boundingBox()).y);
}
// five sections, each with checkboxes; checkmarks persist in localStorage only
assert.equal(await p.locator('section.phase').count(),5);const n=await p.locator('label.ck input[type=checkbox]').count();assert.ok(n>=40);
assert.match(await p.locator('.progress-top').innerText(),new RegExp('of '+n+' done'));
await p.evaluate(k=>localStorage.removeItem(k),KEY);await p.reload();
assert.match(await p.locator('#ck-done').innerText(),/^0\b/);
await p.locator('label.ck:has(#p1-1)').click();await p.locator('label.ck:has(#p5-3)').click();
assert.equal(await p.locator('#p1-1').isChecked(),true);assert.match(await p.locator('#ck-done').innerText(),/^2\b/);
assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),KEY)),{'p1-1':true,'p5-3':true});
await p.reload();assert.equal(await p.locator('#p1-1').isChecked(),true);assert.equal(await p.locator('#p5-3').isChecked(),true);assert.equal(await p.locator('#p2-1').isChecked(),false);
assert.equal(await p.evaluate(()=>document.cookie),'');assert.equal(await p.evaluate(()=>sessionStorage.length),0);
await p.locator('label.ck:has(#p1-1)').click();assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),KEY)),{'p5-3':true});
// a finished section says Done
const s3=await p.locator('#phase-3 label.ck').count();for(let i=1;i<=s3;i++)await p.locator(`label.ck:has(#p3-${i})`).click();assert.match(await p.locator('#phase-3 .count').innerText(),/Done/);
// HR questions: copied to the clipboard as a numbered list, nothing sent
await p.locator('#qs-copy').click();await p.waitForFunction(()=>document.getElementById('qs-msg').textContent.length>0);
assert.match(await p.locator('#qs-msg').innerText(),/Copied/);const clip=await p.evaluate(()=>navigator.clipboard.readText());
const qn=await p.locator('#qs-list li').count();assert.ok(qn>=10);assert.equal(clip.split('\n').length,qn);assert.match(clip,/^1\. What is the exact deadline to sign/);
// print button calls window.print() and the actions are tracked
await p.locator('#ck-print').click();assert.equal(await p.evaluate(()=>window.__printed),1);
const ev=await p.evaluate(()=>window.__events);for(const e of ['item-checked','print-click','questions-copied'])assert.ok(ev.includes(e),e+' '+JSON.stringify(ev));
// reset clears everything after confirm
p.once('dialog',d=>d.accept());await p.locator('#ck-reset').click();assert.equal(await p.locator('label.ck input:checked').count(),0);assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),null);
// accessibility: axe finds no WCAG A/AA or best-practice violations
if(process.env.AXE_PATH){await p.addScriptTag({content:fs.readFileSync(process.env.AXE_PATH,'utf8')});const v=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}})).violations.map(x=>x.id));assert.deepEqual(v,[],'axe');}
// print media: chrome hidden, cover key dates and footer shown, a page break before every section, the questions and the sources
await p.emulateMedia({media:'print'});
for(const sel of ['nav','footer','.actions','.nl-line','.chips','.v7-next','.qs-actions'])for(const e of await p.locator(sel).all())assert.equal(await e.isVisible(),false,sel+' hidden in print');
assert.ok(await p.locator('.keydates').isVisible());assert.ok(await p.locator('.legal-box').isVisible(),'legal notice prints on the cover');
assert.ok(await p.locator('.print-foot').isVisible());assert.match(await p.locator('.print-foot').innerText(),/pymtw\.com\/tools\/guides\/lost-my-job\/severance-review\/ · Not legal advice/);
const breaks=await p.locator('section.phase, section.qs, section.sources').evaluateAll(es=>es.map(e=>getComputedStyle(e).breakBefore));assert.deepEqual(breaks,Array(7).fill('page'),JSON.stringify(breaks));
const pdf=await p.pdf({format:'Letter',preferCSSPageSize:true});const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;assert.ok(pages>=8&&pages<=10,'print pages '+pages);
await p.emulateMedia({media:'screen'});
// newsletter line: one on-screen link to The Long Game, no embedded forms
assert.equal(await p.locator('a[href="https://pymtw.beehiiv.com/subscribe"]:not(.nl-success a)').count(),1);assert.equal(await p.locator('iframe,form').count(),0);
const ld=JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());assert.deepEqual(ld['@graph'].map(x=>x['@type']),['BreadcrumbList','HowTo']);
// only the shared analytics may be requested
const bad=outgoing.filter(u=>!/^https:\/\/(gc\.zgo\.at|pymtw\.goatcounter\.com)\//.test(u));assert.deepEqual(bad,[],'unexpected requests');
assert.deepEqual(errors,[]);
for(const f of ['/tools/sitemap.xml','/tools/llms.txt'])assert.ok((await (await p.request.get(base+f)).text()).includes('https://pymtw.com'+PATH),f);
// linked from the lost-my-job guide near the top, from its checklist and from the severance runway tool
await p.goto(base+'/tools/guides/lost-my-job/');const top=p.locator('#get-severance-review');assert.ok(await top.isVisible());assert.match(await top.innerText(),/Handed a severance agreement\? Get the review sheet/);
await top.click();await p.waitForURL('**'+PATH);
await p.goto(base+'/tools/guides/lost-my-job/checklist/');await p.locator('#phase-1 a[href="../severance-review/"]').click();await p.waitForURL('**'+PATH);
await p.goto(base+'/tools/severance-runway/');assert.equal(await p.locator('a[href="../guides/lost-my-job/severance-review/"]').count(),1);
// findable in "Find the right tool." and the hero search on /tools/
await p.goto(base+'/tools/');
for(const q of ['severance','severance agreement','release','separation agreement','non-compete','Severance agreement review sheet']){await p.locator('#directory-search-input').fill(q);
 assert.ok(await p.locator('#tools-grid a.directory-tool[href*="guides/lost-my-job/severance-review"]').first().isVisible(),'directory search finds it for '+q);}
for(const q of ['should I sign my severance agreement','severance package','non-compete in my separation agreement']){await p.locator('#finder-input').fill(q);await p.locator('#finder-form').evaluate(el=>el.requestSubmit());
 assert.equal(await p.locator('#finder-results a').first().getAttribute('href'),'./guides/lost-my-job/severance-review/',q);}
console.log('PASS severance review sheet browser at 320/390/1280: 200 + title, no overflow, >=12px text, tap targets, legal notice, localStorage persistence/reset, Done state, copy-only HR questions, print button + events, axe clean, print media + '+pages+' PDF pages, newsletter line, schema, analytics-only requests, sitemap/llms, guide/checklist/runway links, tools search.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
