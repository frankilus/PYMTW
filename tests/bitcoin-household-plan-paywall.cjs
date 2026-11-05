// Bitcoin Household Plan binder paywall (/tools/bitcoin-household-plan/).
// Flag ON with Stripe since 2026-11-04 (Frank approved: Lemon Squeezy rejected the store on 2026-10-31).
// Building the plan is free; printing and PDF export unlock after the Stripe Payment Link redirect
// (?unlock=1&session_id=cs_...), stored in localStorage. Honor-system: the session id is not verified.
// The page CSP keeps connect-src 'none'; the Buy button is a plain link to buy.stripe.com.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';const root=path.join(__dirname,'..');
const url=base+'/tools/bitcoin-household-plan/';const dir='tools/bitcoin-household-plan/';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const CHECKOUT='https://buy.stripe.com/bJe6oJfJqgLo0wq3U86EU03';
const MARK='Quillfeather-7Q';const KEY='pymtw-hhp-unlock-v1';

// ---------- static: config ----------
const configSrc=read(dir+'config.js');
const flagLines=configSrc.split('\n').filter(l=>/^\s*enabled:\s*(true|false),\s*$/.test(l));
assert.equal(flagLines.length,1,'exactly one flag line');assert.equal(flagLines[0].trim(),'enabled: true,','paywall flag ships ON');
global.window={};new Function('window',configSrc)(global.window);const PAY=global.window.HHP_CONFIG.paywall;
assert.equal(PAY.enabled,true);assert.equal(PAY.provider,'stripe');assert.equal(PAY.checkoutUrl,CHECKOUT);assert.equal(PAY.price,'$29');assert.equal(PAY.storeKey,KEY);
assert.ok(!fs.existsSync(path.join(root,dir+'license.js')),'license.js removed');

// ---------- static: the page says what is true ----------
const html=read(dir+'index.html');
{const ld=[...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap(m=>{const j=JSON.parse(m[1]);return j['@graph']||[j];});
 const app=ld.find(x=>x['@type']==='WebApplication');assert.ok(app,'WebApplication JSON-LD');
 assert.equal(app.isAccessibleForFree,true,'the tool itself is free');
 const offers=[].concat(app.offers);const binder=offers.find(o=>o.price==='29'||o.price===29);
 assert.ok(binder,'binder Offer');assert.equal(binder.priceCurrency,'USD');assert.equal(binder.url,CHECKOUT);
 assert.doesNotMatch(JSON.stringify(ld),/Lemon Squeezy|lemonsqueezy|license key|verified/i);}
assert.doesNotMatch(html,/lemonsqueezy|Lemon Squeezy|license key|license\.js|unlock-key/i,'no Lemon Squeezy or license-key UI');
assert.match(html,/id="paywall"/);assert.match(html,/\$29, one-time/);
assert.match(html,/<a class="button" id="unlock-buy" href="https:\/\/buy\.stripe\.com\/bJe6oJfJqgLo0wq3U86EU03" target="_blank" rel="noopener noreferrer">/);
assert.match(html,/Payment is handled by Stripe/);assert.match(html,/PYMTW never sees your card number/);
assert.match(html,/nothing you type is sent anywhere/);assert.match(html,/the plan sends nothing anywhere/);
assert.doesNotMatch(html.slice(html.indexOf('id="unlock-owned"'),html.indexOf('</div>',html.indexOf('id="paywall"'))+400),/verif/i,'never claims the unlock is verified');
const csp=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)[1];
assert.equal(csp,"default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' data:; font-src 'self'; style-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'none'; manifest-src 'none'; media-src 'none'",'CSP blocks all network requests');
for(const f of ['index.html','app.js','binder.js','safety.js','config.js'])assert.doesNotMatch(read(dir+f),/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/,f+' makes no network calls');
// ---------- static: /tools listings say the plan is free and the binder is $29 ----------
for(const f of ['tools/llms.txt','tools/catalog.js','tools/index.html']){
 const s=read(f);assert.doesNotMatch(s,/Lemon Squeezy|lemonsqueezy|license key/i,f);assert.match(s,/\$29/,f+' mentions the $29 binder');}

// ---------- browser ----------
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 const ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const requests=[],errors=[];
 await ctx.addInitScript(()=>{window.__prints=0;window.print=()=>{window.__prints++;};});
 ctx.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()||''}));
 await ctx.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text())});
 const toEnd=async()=>{await page.evaluate(()=>{document.querySelector('#flow-menu').open=true});await page.click('#step-list button >> nth=-1');await page.waitForSelector('#h-binder:visible');};
 await page.goto(url);await page.waitForSelector('#plan:not([hidden])');
 await page.click('#next');await page.fill('[data-k="owner.name"]','Jordan '+MARK);
 await toEnd();
 // locked: print shows the panel instead of printing
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')),true);
 await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),0,'locked print does not print');
 assert.ok(await page.locator('#paywall').isVisible(),'unlock panel shown');
 assert.equal(await page.locator('#unlock-buy').getAttribute('href'),CHECKOUT);
 assert.match(await page.locator('#unlock-buy').innerText(),/\$29/);
 assert.match(await page.locator('#paywall').innerText(),/\$29, one-time/);
 // ?unlock=1 without a session id does not unlock
 await page.goto(url+'?unlock=1');await page.waitForSelector('#plan:not([hidden])');
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),KEY),null,'no session id, no unlock');
 // Stripe redirect unlocks this device
 await page.goto(url+'?unlock=1&session_id=cs_test_a1B2c3');await page.waitForSelector('#plan:not([hidden])');
 const rec=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),KEY));assert.equal(rec.v,1);assert.equal(rec.session,'cs_test_a1B2c3');
 assert.doesNotMatch(page.url(),/session_id|unlock=1/,'query stripped');
 await page.waitForSelector('#h-binder:visible');
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')),false);
 assert.ok(await page.locator('#unlock-owned').isVisible());assert.ok(await page.locator('#paywall').isHidden());
 assert.equal(await page.evaluate(()=>document.activeElement&&document.activeElement.id),'print');
 await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),1,'unlocked print works');
 await page.emulateMedia({media:'print'});assert.ok(await page.locator('#binder-wrap').isVisible(),'binder prints');await page.emulateMedia({media:'screen'});
 // reload: still unlocked; remove clears it
 await page.reload();await page.waitForSelector('#plan:not([hidden])');await toEnd();
 assert.ok(await page.locator('#unlock-owned').isVisible(),'unlock persists');
 await page.click('#unlock-remove');assert.equal(await page.evaluate(k=>localStorage.getItem(k),KEY),null);
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')),true);
 assert.deepEqual(requests.filter(r=>!r.url.startsWith(base+'/')).map(r=>r.url),[],'no outside requests');
 assert.ok(requests.every(r=>r.method==='GET'));
 for(const r of requests)assert.ok(!(r.url+r.body).includes(MARK),'request carries an answer');
 assert.deepEqual(errors,[]);await ctx.close();
 console.log('bitcoin household plan Stripe paywall checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
