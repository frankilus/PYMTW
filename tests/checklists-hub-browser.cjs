// Printable checklists hub in a real browser: load at 320/390/1280 with no overflow or tiny text, tap targets, read-only progress from each checklist's localStorage, no outgoing requests, nl-click tracking on the Long Game link, axe clean.
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright'),assert=require('node:assert/strict');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8781';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const c=await b.newContext({reducedMotion:'reduce'}),p=await c.newPage(),errors=[],outgoing=[];p.on('pageerror',e=>errors.push(e.message));
await c.route('**/*',r=>{const u=r.request().url();if(!u.startsWith(base+'/')){outgoing.push(u);return r.abort();}return r.continue();});
await c.addInitScript(()=>{window.__events=[];window.goatcounter={count:o=>window.__events.push(o.path)};});
for(const width of [320,390,1280]){await p.setViewportSize({width,height:950});const res=await p.goto(base+'/tools/checklists/');assert.equal(res.status(),200);
 assert.match(await p.title(),/Printable Money Checklists/);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'overflow '+width);
 const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>e.textContent.slice(0,40)));assert.deepEqual(tiny,[],'small text '+width);
 const small=await p.locator('.btn,.cl-guide,.back,.money a,.nl-line a').evaluateAll(es=>es.filter(e=>e.checkVisibility()&&e.getBoundingClientRect().height<43.9).map(e=>e.textContent.slice(0,30)));assert.deepEqual(small,[],'tap targets '+width);
 assert.equal(await p.locator('article.cl').count(),5);
}
// no progress shown until a checklist has saved some; then shown read-only
assert.equal(await p.locator('.cl-progress:not([hidden])').count(),0);
await p.evaluate(()=>{localStorage.setItem('pymtw-car-checklist-v1',JSON.stringify({'p1-1':true,'p2-3':true}));localStorage.setItem('pymtw-severance-review-v1','not json');});
const before=await p.evaluate(()=>JSON.stringify(localStorage));await p.reload();
assert.deepEqual(await p.locator('.cl-progress:not([hidden])').allInnerTexts(),['You’ve ticked 2 of 42 in this browser']);
assert.equal(await p.evaluate(()=>JSON.stringify(localStorage)),before,'hub must not write storage');
// newsletter click is counted per page (tools.js), link opens in a new tab
await p.evaluate(()=>{document.querySelector('.nl-line a').addEventListener('click',e=>e.preventDefault());});
await p.click('.nl-line a');assert.ok((await p.evaluate(()=>window.__events)).includes('event/checklists/nl-click'));
assert.deepEqual(errors,[]);assert.deepEqual(outgoing.filter(u=>!/fonts\.|goatcounter|gc\.zgo\.at\/count\.js/.test(u)),[],'outgoing');
if(process.env.AXE_PATH){for(const width of [390,1280]){await p.setViewportSize({width,height:1000});await p.goto(base+'/tools/checklists/');await p.addScriptTag({path:process.env.AXE_PATH});const v=await p.evaluate(async()=>(await axe.run()).violations.map(x=>x.id));assert.deepEqual(v,[],'axe '+width);}}
console.log('ok');}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1);});
