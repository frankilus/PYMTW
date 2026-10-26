// Bitcoin Household Plan (/tools/bitcoin-household-plan/): guided flow, five-section binder, secret blocking,
// erase, JSON round trip, no network use of answers, directory entries and no overflow at four widths.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';const root=path.join(__dirname,'..');
const url=base+'/tools/bitcoin-household-plan/';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const catalog=require('../tools/catalog.js');
const SEED='abandon ability able about above absent absorb abstract absurd abuse access accident';
const XPRV='xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi';
const MARK='Quillfeather-7Q';  // a value that must never appear in any request

// Directory, sitemap, llms and page head
const tool=catalog.flatMap(c=>c.tools).find(t=>t.slug==='bitcoin-household-plan');
assert.ok(tool&&tool.live,'catalog lists the plan as live');
for(const k of ['inheritance','executor letter','estate','bitcoin will','self custody plan','wallet inventory','family'])assert.ok(tool.kw.includes(k),'keyword '+k);
assert.ok(catalog.topics.some(t=>t.slugs.includes('bitcoin-household-plan')),'in a directory topic');
assert.match(read('tools/sitemap.xml'),/<loc>https:\/\/pymtw\.com\/tools\/bitcoin-household-plan\/<\/loc>/);
assert.match(read('tools/llms.txt'),/https:\/\/pymtw\.com\/tools\/bitcoin-household-plan\//);
assert.match(read('tools/index.html'),/<li><a href="\/tools\/bitcoin-household-plan\/">/);
const html=read('tools/bitcoin-household-plan/index.html');
assert.match(html,/<link rel="canonical" href="https:\/\/pymtw\.com\/tools\/bitcoin-household-plan\/">/);
assert.match(html,/connect-src 'none'/,'CSP blocks network calls');
assert.doesNotMatch(html,/amzn\.to|amazon\./i,'no affiliate links');
for(const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g))JSON.parse(m[1]);
assert.equal(JSON.parse(read('tools/bitcoin-household-plan/config.js').match(/enabled:\s*(true|false)/)[1]),false,'paywall flag ships OFF');
for(const f of ['index.html','app.js','binder.js'])assert.doesNotMatch(read('tools/bitcoin-household-plan/'+f),/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/,f+' makes no network calls');

(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900},acceptDownloads:true,reducedMotion:'reduce'});
 const page=await ctx.newPage();const errors=[],requests=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 page.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()||''}));
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 await page.goto(url);
 await page.waitForSelector('#plan:not([hidden])');
 const loaded=requests.length;
 assert.match(await page.locator('#step-count').innerText(),/Step 1 of 12/);
 assert.match(await page.locator('#never-ask').innerText(),/recovery words|seed/i);
 const next=()=>page.click('#next');const step=async n=>assert.match(await page.locator('#step-count').innerText(),new RegExp('Step '+n+' of 12'));

 await next();await step(2);
 await page.fill('[data-k="owner.name"]','Jordan '+MARK);await page.fill('[data-k="owner.household"]','The Lee household');
 // seed phrase in a normal field is cleared and explained
 await page.fill('[data-k="owner.household"]',SEED);
 await page.waitForSelector('#secret-alert:not([hidden])');
 assert.equal(await page.inputValue('[data-k="owner.household"]'),'','seed phrase cleared');
 assert.match(await page.locator('#secret-alert-text').innerText(),/recovery|seed/i);
 await page.click('#secret-alert-close');await page.fill('[data-k="owner.household"]','The Lee household');
 await next();await step(3);
 await page.check('input[data-k="why.reasons"] >> nth=0');await page.fill('[data-k="why.words"]','A small long-term savings slice.');
 await page.check('input[data-k="why.horizon"] >> nth=-1');
 await next();await step(4);
 await page.fill('[data-k="alloc.target"]','5');await page.fill('[data-k="alloc.cap"]','10');
 await next();await step(5);
 await page.check('input[data-k="buy.method"][value="recurring"]');
 await page.waitForSelector('#recurring-fields:not([hidden])');
 await page.fill('[data-k="buy.amount"]','100');
 await next();await step(6);
 await page.check('input[data-k="sell.coolOff"] >> nth=1');
 await next();await step(7);
 await page.selectOption('#accounts-0-type','hardware');
 await page.fill('#accounts-0-provider','A hardware wallet');await page.fill('#accounts-0-device','Home safe');
 await page.fill('#accounts-0-backup','Steel plate in the bank box');
 // a 24-word phrase and an xprv in inventory fields are both blocked
 await page.fill('#accounts-0-notes',SEED+' '+SEED);await page.waitForSelector('#secret-alert:not([hidden])');
 assert.equal(await page.inputValue('#accounts-0-notes'),'');
 await page.click('#secret-alert-close');
 await page.fill('#accounts-0-nickname',XPRV);await page.waitForSelector('#secret-alert:not([hidden])');
 assert.equal(await page.inputValue('#accounts-0-nickname'),'');
 await page.fill('#accounts-0-nickname','Savings');
 await page.click('#add-account');await page.selectOption('#accounts-1-type','exchange');await page.fill('#accounts-1-provider','An exchange');
 await next();await step(8);
 await page.fill('[data-k="people.executor"]','Sam Lee');await page.fill('[data-k="people.willLocation"]','With our attorney');
 await next();await step(9);
 assert.match(await page.locator('#letter-preview').innerText(),/Sam Lee/);
 await page.fill('[data-k="letter.note"]','Take your time.');
 await next();await step(10);
 await page.selectOption('#review-month','1');await page.selectOption('#review-day','15');
 assert.ok(await page.locator('#ics').isEnabled());
 const [ics]=await Promise.all([page.waitForEvent('download'),page.click('#ics')]);
 const icsText=fs.readFileSync(await ics.path(),'utf8');
 assert.match(icsText,/BEGIN:VCALENDAR[\s\S]*RRULE:FREQ=YEARLY[\s\S]*END:VCALENDAR/);
 assert.ok(!icsText.includes(MARK)&&!icsText.includes('Sam Lee'),'reminder has no personal data');
 await next();await step(11);
 assert.ok(await page.locator('a[href="/tools/bitcoin-tax-lot-cleanup/"]').count()>0,'records step links the tax-lot tool');
 await page.fill('[data-k="records.exports"]','Taxes folder');await page.check('input[data-k="records.basis"] >> nth=0');
 await next();await step(12);
 assert.match(await page.locator('#completeness').innerText(),/All five sections/);

 // binder has the cover and all five sections, and no secrets
 const binder=page.locator('#binder');await binder.waitFor();
 for(const id of ['b-policy','b-letter','b-inventory','b-review','b-records'])assert.equal(await binder.locator('#'+id).count(),1,id);
 const text=await binder.innerText();
 for(const s of ['Jordan '+MARK,'Sam Lee','A hardware wallet','An exchange','Steel plate in the bank box','Taxes folder'])assert.ok(text.includes(s),'binder shows '+s);
 assert.ok(!text.includes('abandon ability')&&!text.includes('xprv9s'),'binder has no secrets');
 // print shows only the binder, with page breaks before each section
 await page.emulateMedia({media:'print'});
 assert.equal(await page.locator('nav').first().isVisible(),false);assert.equal(await page.locator('.flow').isVisible(),false);
 assert.ok(await page.locator('#binder-wrap').isVisible());
 assert.equal(await page.locator('.b-section').first().evaluate(e=>getComputedStyle(e).breakBefore),'page');
 await page.emulateMedia({media:'screen'});

 // JSON round trip
 const [dl]=await Promise.all([page.waitForEvent('download'),page.click('#export-json')]);
 const saved=JSON.parse(fs.readFileSync(await dl.path(),'utf8'));
 assert.equal(saved.app,'pymtw-bitcoin-household-plan');assert.equal(saved.answers.owner.name,'Jordan '+MARK);
 assert.equal(saved.answers.accounts.length,2);
 // remember on, then erase everything
 await page.evaluate(()=>{document.querySelector('#flow-menu').open=true});await page.click('#step-list button[data-go="0"]');
 await page.check('#remember');await page.waitForTimeout(400);
 assert.ok((await page.evaluate(()=>localStorage.getItem('pymtw-hhp-v1')||'')).includes(MARK),'remember saves locally');
 await page.click('#erase');await page.click('#erase-yes');
 assert.equal(await page.evaluate(()=>localStorage.getItem('pymtw-hhp-v1')),null,'erase clears storage');
 await step(1);await page.click('#next');assert.equal(await page.inputValue('[data-k="owner.name"]'),'','erase clears answers');
 await page.click('#back');
 const tmp=path.join(require('node:os').tmpdir(),'hhp-answers.json');fs.writeFileSync(tmp,JSON.stringify(saved));
 await page.setInputFiles('#import-file',tmp);
 await page.waitForFunction(()=>/answers are back/.test(document.querySelector('#import-status').textContent));
 await page.click('#next');assert.equal(await page.inputValue('[data-k="owner.name"]'),'Jordan '+MARK,'import restores answers');
 // an imported file holding a seed phrase is scrubbed
 const bad=JSON.parse(JSON.stringify(saved));bad.answers.accounts[0].notes=SEED;fs.writeFileSync(tmp,JSON.stringify(bad));
 await page.click('#back');await page.setInputFiles('#import-file',tmp);
 await page.waitForSelector('#secret-alert:not([hidden])');
 assert.ok(!(await page.evaluate(()=>localStorage.getItem('pymtw-hhp-v1')||'')).includes('abandon'),'scrubbed import is not stored');

 // no request after load, and nothing ever carries answers
 assert.deepEqual(requests.slice(loaded).filter(r=>!r.url.startsWith('blob:')).map(r=>r.url),[],'no requests while using the plan');
 for(const r of requests){assert.ok(!(r.url+r.body).includes(MARK),'request carries an answer: '+r.url);assert.equal(r.method,'GET');}
 assert.deepEqual(errors,[]);await ctx.close();

 // layout: no sideways overflow at four widths, on a filled step and on the binder
 for(const width of [320,390,768,1280]){
  const p=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  await p.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await p.goto(url);await p.waitForSelector('#plan:not([hidden])');
  for(let i=0;i<11;i++){
   const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
   assert.ok(over<=1,`overflow ${over}px at ${width} on step ${i+1}`);
   const small=await p.evaluate(()=>[...document.querySelectorAll('.step:not([hidden]) button,.step:not([hidden]) .check,.flow-nav button')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<43.5).map(e=>e.textContent.trim().slice(0,30)));
   assert.deepEqual(small,[],`touch targets under 44px at ${width}`);
   await p.click('#next');
  }
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
  assert.ok(over<=1,`binder overflow ${over}px at ${width}`);
  await p.close();
 }
 console.log('bitcoin household plan browser checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
