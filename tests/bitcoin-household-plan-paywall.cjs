// Bitcoin Household Plan binder paywall (/tools/bitcoin-household-plan/).
// Flag OFF since 2026-11-04 (Frank approved: Lemon Squeezy rejected the store, so its checkout can never take a real payment).
// Printing and PDF export are free: no unlock panel, no license prompt, no "$29" or buy link, no outside requests.
// The Lemon Squeezy ids stay in config.js for reference only. Pages outside /tools are out of scope for this test.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';const root=path.join(__dirname,'..');
const url=base+'/tools/bitcoin-household-plan/';const dir='tools/bitcoin-household-plan/';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const CHECKOUT='https://pymtw.lemonsqueezy.com/checkout/buy/257dd002-75eb-4224-8fd6-2b9cce985c73';
const MARK='Quillfeather-7Q';

// ---------- static: config ----------
const configSrc=read(dir+'config.js');
const flagLines=configSrc.split('\n').filter(l=>/^\s*enabled:\s*(true|false),\s*$/.test(l));
assert.equal(flagLines.length,1,'exactly one flag line');assert.equal(flagLines[0].trim(),'enabled: false,','paywall flag ships OFF');
global.window={};new Function('window',configSrc)(global.window);const PAY=global.window.HHP_CONFIG.paywall;
assert.equal(PAY.enabled,false);assert.equal(PAY.checkoutUrl,CHECKOUT,'Lemon Squeezy ids kept for reference');assert.equal(PAY.productId,1475812);assert.equal(PAY.storeId,508088);

// ---------- static: the page says what is true ----------
const html=read(dir+'index.html');
{const ld=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const j=JSON.parse(m[1]);return j['@graph']||[j];});
 const app=ld.find(x=>x['@type']==='WebApplication');assert.ok(app,'WebApplication JSON-LD');
 assert.equal(app.offers.price,'0');assert.equal(app.offers.priceCurrency,'USD');assert.equal(app.isAccessibleForFree,true,'marked free');
 assert.doesNotMatch(JSON.stringify(ld),/\$29|license key|Lemon Squeezy|purchase/i,'JSON-LD has no price, license or purchase copy');
 assert.match(app.description,/Free to build and print/);}
assert.doesNotMatch(html,/\$29|lemonsqueezy|Lemon Squeezy|license key|unlock|checkout|Get the binder/i,'no paywall copy, buy link or license prompt');
assert.doesNotMatch(html,/<script[^>]+src="license\.js"/,'license.js is not loaded');
assert.doesNotMatch(html,/id="paywall"|id="unlock-/,'no unlock panel markup');
assert.match(html,/never leave your browser, and nothing is sent anywhere/);
assert.match(html,/the plan sends nothing anywhere/);
const csp=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)[1];
assert.equal(csp,"default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' data:; font-src 'self'; style-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'none'; manifest-src 'none'; media-src 'none'",'CSP blocks all network requests (as PR #44 shipped)');
for(const f of ['index.html','app.js','binder.js','safety.js','config.js'])assert.doesNotMatch(read(dir+f),/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/,f+' makes no network calls');
// ---------- static: /tools listings and search call it free ----------
for(const f of ['tools/llms.txt','tools/catalog.js','tools/bitcoin-tax-lot-cleanup/index.html','tools/index.html']){
 const s=read(f);assert.doesNotMatch(s,/\$29 to print|one-time \$29|Lemon Squeezy|license key/i,f+' still describes the paywall');}
assert.match(read('tools/catalog.js'),/Free to build and print\. Never asks for secrets\./);
assert.match(read('tools/llms.txt'),/It is free to build and print\. Everything stays in your browser\./);
assert.match(read('tools/index.html'),/Free to build, print and save as a PDF\./);

// ---------- browser ----------
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const requests=[],errors=[];
 await ctx.addInitScript(()=>{window.__prints=0;window.print=()=>{window.__prints++;};});
 ctx.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()||''}));
 await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text())});
 // a stored key from the paid period and ?unlock=1 change nothing
 await page.goto(url);await page.evaluate(()=>localStorage.setItem('pymtw-hhp-license-v1','{"v":1,"key":"X"}'));
 await page.goto(url+'?unlock=1');await page.waitForSelector('#plan:not([hidden])');
 assert.match(await page.locator('#step-count').innerText(),/Step 1 of 12/,'?unlock=1 does nothing');
 await page.click('#next');await page.fill('[data-k="owner.name"]','Jordan '+MARK);
 await page.evaluate(()=>{document.querySelector('#flow-menu').open=true});await page.click('#step-list button >> nth=-1');await page.waitForSelector('#h-binder:visible');
 const text=await page.evaluate(()=>document.body.innerText);
 assert.doesNotMatch(text,/\$29|license|unlock|Lemon Squeezy|Get the binder/i,'no price, license prompt or buy link on the page');
 assert.equal(await page.locator('a[href*="lemonsqueezy"]').count(),0,'no checkout link');
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')),false);
 assert.ok(await page.locator('#print').isEnabled());await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),1,'print works free');
 await page.emulateMedia({media:'print'});assert.ok(await page.locator('#binder-wrap').isVisible(),'binder prints');await page.emulateMedia({media:'screen'});
 assert.deepEqual(requests.filter(r=>!r.url.startsWith(base+'/')).map(r=>r.url),[],'no outside requests');
 assert.ok(requests.every(r=>r.method==='GET'));
 for(const r of requests)assert.ok(!(r.url+r.body).includes(MARK),'request carries an answer');
 assert.deepEqual(errors,[]);await ctx.close();
 console.log('bitcoin household plan paywall-off checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
