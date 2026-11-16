// COBRA vs. Marketplace checklist in a real browser: load, layout, tap targets, localStorage-only checkmarks and fill-in fields, print button, print media + PDF pages, copy-only HR questions, success subscribe line, analytics events, axe, links from the guide/checklist/severance sheet/hub, and tools search.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict'),fs=require('node:fs');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8780';
const PATH='/tools/guides/lost-my-job/cobra-vs-marketplace/',KEY='pymtw-cobra-vs-marketplace-v1',FKEY='pymtw-cobra-vs-marketplace-fields-v1';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],consoleErr=[],outgoing=[];p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))consoleErr.push(m.text());});
await c.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
await c.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/')){outgoing.push(u);return r.abort();}return r.continue();});
await c.addInitScript(()=>{window.__printed=0;window.print=()=>{window.__printed++;};window.__events=[];const t=setInterval(()=>{if(window.PT&&PT.track&&!PT.__wrapped){const o=PT.track;PT.track=function(n,ti){window.__events.push(n);try{return o.apply(this,arguments);}catch(e){}};PT.__wrapped=1;clearInterval(t);}},5);});
for(const width of [320,375,1280]){await p.setViewportSize({width,height:950});const res=await p.goto(base+PATH);assert.equal(res.status(),200);await p.evaluate(()=>document.fonts.ready);
 assert.match(await p.title(),/COBRA vs\. Marketplace/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,60)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('.actions button,.btn,label.ck,.chips a,.sources a,sup.refs a,.nl-line a,.back,#qs-copy,input[type=checkbox],input.fld,.tiein a,.see a').evaluateAll(es=>es.filter(e=>e.checkVisibility()).filter(e=>{const h=e.getBoundingClientRect().height;const min=e.matches('button,.btn,label.ck,.chips a,input.fld,.tiein a,.see a')?44:24;return h<min-.1;}).map(e=>(e.id||e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().height)));assert.deepEqual(small,[],'tap targets '+width);
 // the Open Enrollment dates sit above the checklist; every field has an accessible name
 const oe=p.locator('.oe-box');assert.ok(await oe.isVisible());assert.match(await oe.innerText(),/November 1 to January 15/);assert.ok((await oe.boundingBox()).y<(await p.locator('#phase-1').boundingBox()).y);
 const unnamed=await p.locator('input.fld').evaluateAll(es=>es.filter(e=>!(e.labels&&e.labels.length)&&!e.getAttribute('aria-label')).length);assert.equal(unnamed,0);
 // the side-by-side table fits on phones with three columns
 const cols=await p.locator('#compare tbody tr').first().locator('input.fld').evaluateAll(es=>es.map(e=>Math.round(e.getBoundingClientRect().width)));assert.equal(cols.length,3);assert.ok(Math.min(...cols)>=60,'compare inputs '+cols+' at '+width);
}
// four sections; checkmarks and typed fields persist in localStorage only
assert.equal(await p.locator('section.phase').count(),4);const n=await p.locator('label.ck input[type=checkbox]').count();assert.ok(n>=30);
assert.match(await p.locator('.progress-top').innerText(),new RegExp('of '+n+' done'));
await p.evaluate(([k,f])=>{localStorage.removeItem(k);localStorage.removeItem(f);},[KEY,FKEY]);await p.reload();
assert.match(await p.locator('#ck-done').innerText(),/^0\b/);
await p.locator('label.ck:has(#p1-1)').click();await p.locator('label.ck:has(#p4-3)').click();
assert.match(await p.locator('#ck-done').innerText(),/^2\b/);
assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),KEY)),{'p1-1':true,'p4-3':true});
await p.fill('#dl-ends','Dec 31, 2026');await p.fill('#cmp-premium-1','$812');await p.fill('#cmp-premium-2','$390');
assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),FKEY)),{'dl-ends':'Dec 31, 2026','cmp-premium-1':'$812','cmp-premium-2':'$390'});
await p.reload();assert.equal(await p.locator('#p1-1').isChecked(),true);assert.equal(await p.locator('#p4-3').isChecked(),true);assert.equal(await p.locator('#p2-1').isChecked(),false);
assert.equal(await p.inputValue('#dl-ends'),'Dec 31, 2026');assert.equal(await p.inputValue('#cmp-premium-2'),'$390');
assert.equal(await p.evaluate(()=>document.cookie),'');assert.equal(await p.evaluate(()=>sessionStorage.length),0);
await p.fill('#cmp-premium-2','');assert.deepEqual(Object.keys(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),FKEY))).sort(),['cmp-premium-1','dl-ends']);
await p.locator('label.ck:has(#p1-1)').click();assert.deepEqual(JSON.parse(await p.evaluate(k=>localStorage.getItem(k),KEY)),{'p4-3':true});
// a finished section says Done
const s2=await p.locator('#phase-2 label.ck').count();for(let i=1;i<=s2;i++)await p.locator(`label.ck:has(#p2-${i})`).click();assert.match(await p.locator('#phase-2 .count').innerText(),/Done/);
// HR questions: copied as a numbered list, nothing sent, then one subscribe line appears
assert.equal(await p.isVisible('#nl-success-qs'),false);
await p.locator('#qs-copy').click();await p.waitForFunction(()=>document.getElementById('qs-msg').textContent.length>0);
assert.match(await p.locator('#qs-msg').innerText(),/Copied/);const clip=await p.evaluate(()=>navigator.clipboard.readText());
const qn=await p.locator('#qs-list li').count();assert.ok(qn>=10);assert.equal(clip.split('\n').length,qn);assert.match(clip,/^1\. On what exact date does my job-based health coverage end\?/);
assert.ok(await p.isVisible('#nl-success-qs'));
// print buttons call window.print() and show the success line once each
for(const id of ['nl-success-top','nl-success-bottom'])assert.equal(await p.isVisible('#'+id),false);
await p.locator('#ck-print').click();assert.equal(await p.evaluate(()=>window.__printed),1);assert.ok(await p.isVisible('#nl-success-top'));
await p.locator('#ck-print').click();await p.locator('#ck-print-2').click();assert.ok(await p.isVisible('#nl-success-bottom'));
const ev=await p.evaluate(()=>window.__events);for(const e of ['item-checked','field-filled','print-click','questions-copied'])assert.ok(ev.includes(e),e+' '+JSON.stringify(ev));
assert.equal(ev.filter(e=>e==='nl-success-shown').length,3,JSON.stringify(ev));
// Long Game link clicks are counted per page by tools.js
await p.evaluate(()=>{document.querySelector('.nl-line a').addEventListener('click',e=>e.preventDefault());});await p.click('.nl-line a');
assert.ok((await p.evaluate(()=>window.__events)).includes('nl-click'));
// accessibility: axe finds no WCAG A/AA or best-practice violations (desktop and phone)
if(process.env.AXE_PATH){for(const width of [375,1280]){await p.setViewportSize({width,height:950});await p.addScriptTag({content:fs.readFileSync(process.env.AXE_PATH,'utf8')});const v=await p.evaluate(async()=>(await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}})).violations.map(x=>x.id));assert.deepEqual(v,[],'axe '+width);}}
// print media: chrome hidden, deadlines + typed values on the cover, a page break before every section, the table, the questions and the sources
await p.setViewportSize({width:1280,height:950});await p.emulateMedia({media:'print'});
for(const sel of ['nav','footer','.actions','.nl-line','.chips','.v7-next','.qs-actions','.nl-success','.faq','.tiein'])for(const e of await p.locator(sel).all())assert.equal(await e.isVisible(),false,sel+' hidden in print');
assert.ok(await p.locator('#deadlines').isVisible());assert.equal(await p.inputValue('#dl-ends'),'Dec 31, 2026');assert.ok(await p.locator('.oe-box').isVisible());
assert.ok(await p.locator('.print-foot').isVisible());assert.match(await p.locator('.print-foot').innerText(),/cobra-vs-marketplace\/ · Not insurance or tax advice/);
const breaks=await p.locator('section.phase, #compare, section.qs, section.sources').evaluateAll(es=>es.map(e=>getComputedStyle(e).breakBefore));assert.deepEqual(breaks,Array(7).fill('page'),JSON.stringify(breaks));
const pdf=await p.pdf({format:'Letter',preferCSSPageSize:true});const pages=(pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g)||[]).length;assert.ok(pages>=7&&pages<=9,'print pages '+pages);
await p.emulateMedia({media:'screen'});
// reset clears checkmarks and fields after confirm
p.once('dialog',d=>d.accept());await p.locator('#ck-reset').click();assert.equal(await p.locator('label.ck input:checked').count(),0);assert.equal(await p.inputValue('#dl-ends'),'');
assert.equal(await p.evaluate(k=>localStorage.getItem(k),KEY),null);assert.equal(await p.evaluate(k=>localStorage.getItem(k),FKEY),null);
// newsletter: one on-screen Long Game link besides the success lines, no embedded forms; schema
assert.equal(await p.locator('a[href="https://pymtw.beehiiv.com/subscribe"]:not(.nl-success a)').count(),1);assert.equal(await p.locator('iframe,form').count(),0);
const ld=JSON.parse(await p.locator('script[type="application/ld+json"]').textContent());assert.deepEqual(ld['@graph'].map(x=>x['@type']),['BreadcrumbList','HowTo','FAQPage']);
// only the shared analytics may be requested; no errors
const bad=outgoing.filter(u=>!/^https:\/\/(gc\.zgo\.at|pymtw\.goatcounter\.com)\//.test(u));assert.deepEqual(bad,[],'unexpected requests');
assert.deepEqual(errors,[]);assert.deepEqual(consoleErr,[]);
for(const f of ['/tools/sitemap.xml','/tools/llms.txt'])assert.ok((await (await p.request.get(base+f)).text()).includes('https://pymtw.com'+PATH),f);
// linked from the lost-my-job guide, its checklist, the severance sheet, the runway tool and the checklists hub
await p.goto(base+'/tools/guides/lost-my-job/');const top=p.locator('#get-cobra-vs-marketplace');assert.ok(await top.isVisible());await top.click();await p.waitForURL('**'+PATH);
await p.goto(base+'/tools/guides/lost-my-job/checklist/');await p.locator('#phase-2 a[href="../cobra-vs-marketplace/"]').click();await p.waitForURL('**'+PATH);
await p.goto(base+'/tools/guides/lost-my-job/severance-review/');await p.locator('#phase-3 a[href="../cobra-vs-marketplace/"]').click();await p.waitForURL('**'+PATH);
await p.goto(base+'/tools/severance-runway/');assert.equal(await p.locator('a[href="../guides/lost-my-job/cobra-vs-marketplace/"]').count(),1);
await p.goto(base+'/tools/checklists/');assert.equal(await p.locator('article.cl').count(),6);const card=p.locator('article.cl[data-key="'+KEY+'"]');assert.ok(await card.isVisible());
await card.locator('.btn').click();await p.waitForURL('**'+PATH);
// findable in "Find the right tool." and the hero search on /tools/
await p.goto(base+'/tools/');
for(const q of ['cobra','COBRA vs. Marketplace','marketplace','health insurance','special enrollment','open enrollment']){await p.locator('#directory-search-input').fill(q);
 assert.ok(await p.locator('#tools-grid a.directory-tool[href*="guides/lost-my-job/cobra-vs-marketplace"]').first().isVisible(),'directory search finds it for '+q);}
for(const q of ['should I take COBRA','COBRA or a marketplace plan','health insurance after losing my job']){await p.locator('#finder-input').fill(q);await p.locator('#finder-form').evaluate(el=>el.requestSubmit());
 assert.equal(await p.locator('#finder-results a').first().getAttribute('href'),'./guides/lost-my-job/cobra-vs-marketplace/',q);}
console.log('PASS COBRA vs. Marketplace browser at 320/375/1280: 200 + title, no overflow, >=12px text, tap targets, OE box, labelled fields, 3-column table on phones, localStorage checkmarks + fields, Done state, copy-only HR questions, success lines + nl-click, axe clean, print media + '+pages+' PDF pages, reset, schema, analytics-only requests, sitemap/llms, guide/checklist/severance/runway/hub links, tools search.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
