// Bitcoin Household Plan license-key paywall (/tools/bitcoin-household-plan/).
// Flag OFF (shipped): behaviour identical to the free tool. Flag ON (config.js served with the one-line flip):
// unlock panel, Lemon Squeezy License API mocked by route interception (success and every failure),
// unlock persists and can be removed, ?unlock=1 opens the key field, CSP allows only api.lemonsqueezy.com,
// and no request ever carries the plan's answers.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const {execFileSync}=require('node:child_process');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';const root=path.join(__dirname,'..');
const url=base+'/tools/bitcoin-household-plan/';const dir='tools/bitcoin-household-plan/';
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const API='https://api.lemonsqueezy.com/v1/licenses/activate';
const CHECKOUT='https://pymtw.lemonsqueezy.com/checkout/buy/257dd002-75eb-4224-8fd6-2b9cce985c73';
const KEY='38B1460A-5104-4067-A91D-77B872934D51';
const MARK='Quillfeather-7Q';  // a plan answer that must never appear in any request

// ---------- static: config, CSP, where network code lives ----------
const configSrc=read(dir+'config.js');
const flagLines=configSrc.split('\n').filter(l=>/^\s*enabled:\s*(true|false),\s*$/.test(l));
assert.equal(flagLines.length,1,'exactly one flag line');assert.equal(flagLines[0].trim(),'enabled: false,','paywall flag ships OFF');
global.window={};new Function('window',configSrc)(global.window);const PAY=global.window.HHP_CONFIG.paywall;
assert.equal(PAY.checkoutUrl,CHECKOUT);assert.equal(PAY.productId,1475812);assert.equal(PAY.storeId,508088);
assert.equal(PAY.licenseApi,API);assert.equal(new URL(PAY.licenseApi).origin,'https://api.lemonsqueezy.com');
const html=read(dir+'index.html');
const csp=html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)[1];
const directives=Object.fromEntries(csp.split(';').map(d=>d.trim().split(/\s+/)).map(([k,...v])=>[k,v.join(' ')]));
assert.equal(directives['connect-src'],'https://api.lemonsqueezy.com','connect-src allows only the License API');
// every other directive is exactly what PR #44 shipped, so no other host was added
const shipped="default-src 'self'; script-src 'self'; connect-src 'none'; img-src 'self' data:; font-src 'self'; style-src 'self'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'; worker-src 'none'; manifest-src 'none'; media-src 'none'";
assert.equal(csp,shipped.replace("connect-src 'none'","connect-src https://api.lemonsqueezy.com"),'only connect-src changed');
for(const [k,v] of Object.entries(directives))if(k!=='connect-src')assert.doesNotMatch(v,/https?:|\*/,k+' allows no outside host');
assert.doesNotMatch(html,/<script[^>]+src="https?:/,'no outside scripts (no lemon.js)');
const lic=read(dir+'license.js');
assert.equal((lic.match(/\bfetch\(|f\(cfg\.licenseApi/g)||[]).length,1,'license.js makes one request');
assert.doesNotMatch(lic,/XMLHttpRequest|sendBeacon|WebSocket|https?:\/\//,'license.js has no other endpoints');
for(const f of ['index.html','app.js','binder.js','safety.js','config.js'])assert.doesNotMatch(read(dir+f),/fetch\(|XMLHttpRequest|sendBeacon|WebSocket/,f+' makes no network calls');
assert.doesNotMatch(read(dir+'app.js'),/LIC\.activate\([^)]*state/,'answers are never passed to the license check');
assert.match(read(dir+'app.js'),/LIC\.activate\(key, PAY\)/,'only the typed key goes to the license check');

// ---------- unit: response handling ----------
const L=require('../'+dir+'license.js');
const meta={store_id:508088,order_id:2,product_id:1475812,variant_id:2300876};
const ok={activated:true,error:null,license_key:{id:1,status:'active',key:KEY,activation_limit:null,activation_usage:1,expires_at:null},instance:{id:'inst-1',name:'pymtw.com household plan'},meta};
assert.equal(L.interpret(200,ok,PAY,KEY).ok,true);
assert.deepEqual(Object.keys(L.interpret(200,ok,PAY,KEY).record).sort(),['at','instance','key','productId','storeId','v'],'stores no customer name or email');
assert.equal(L.interpret(200,{...ok,meta:{...meta,product_id:4}},PAY,KEY).reason,'product');
assert.equal(L.interpret(200,{...ok,meta:{...meta,store_id:1}},PAY,KEY).reason,'product');
assert.equal(L.interpret(200,{...ok,meta:undefined},PAY,KEY).ok,false,'no meta, no unlock');
assert.equal(L.interpret(404,{activated:false,error:'license_key not found.'},PAY,KEY).reason,'invalid');
assert.equal(L.interpret(400,{activated:false,error:'This license key is disabled.',license_key:{status:'disabled'},meta},PAY,KEY).reason,'disabled');
assert.equal(L.interpret(400,{activated:false,error:'This license key has expired.',license_key:{status:'expired'},meta},PAY,KEY).reason,'expired');
assert.equal(L.interpret(400,{activated:false,error:'This license key has reached the activation limit.',license_key:{status:'active'},meta},PAY,KEY).reason,'limit');
assert.equal(L.interpret(429,{},PAY,KEY).reason,'busy');assert.equal(L.interpret(500,null,PAY,KEY).reason,'service');
assert.equal(L.looksLikeKey(L.normalize(' '+KEY+'\n')),true);assert.equal(L.looksLikeKey('abc'),false);assert.equal(L.mask(KEY),'••••4D51');

// ---------- browser ----------
const flipOn=src=>{const out=src.replace(/^(\s*)enabled: false,$/m,'$1enabled: true,');assert.notEqual(out,src,'the one-line flip applies');return out;};
async function setup(browser,{on,api}){
 const ctx=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const requests=[],errors=[],csp=[];
 await ctx.addInitScript(()=>{window.__prints=0;window.print=()=>{window.__prints++;};document.addEventListener('securitypolicyviolation',e=>{(window.__csp=window.__csp||[]).push(e.blockedURI+' '+e.violatedDirective);});});
 ctx.on('request',r=>requests.push({url:r.url(),method:r.method(),body:r.postData()||'',headers:r.headers()}));
 await ctx.route('**/*',async r=>{const u=r.request().url();
  if(on&&u.startsWith(url+'config.js')){const res=await r.fetch();return r.fulfill({response:res,body:flipOn(await res.text())});}
  if(u.startsWith(base+'/'))return r.continue();
  if(u===API&&api)return api(r);
  return r.abort();});
 const page=await ctx.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errors.push(m.text())});
 return {ctx,page,requests,errors};
}
const lsReply=(status,body)=>r=>r.fulfill({status,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(body)});
async function toBinder(page){await page.evaluate(()=>{document.querySelector('#flow-menu').open=true});await page.click('#step-list button >> nth=-1');await page.waitForSelector('#h-binder:visible');}
async function fillSome(page){await page.click('#next');await page.fill('[data-k="owner.name"]','Jordan '+MARK);await page.fill('[data-k="owner.household"]','The '+MARK+' household');}

(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 // Flag OFF: identical to the free tool, even with ?unlock=1 and a stored key
 {const {ctx,page,requests,errors}=await setup(browser,{on:false});
  await page.goto(url+'?unlock=1');await page.waitForSelector('#plan:not([hidden])');
  assert.match(await page.locator('#step-count').innerText(),/Step 1 of 12/,'?unlock=1 does nothing when OFF');
  assert.equal(new URL(page.url()).search,'?unlock=1','URL untouched when OFF');
  await fillSome(page);await toBinder(page);
  assert.equal(await page.locator('#paywall').isVisible(),false);assert.equal(await page.locator('#unlock-owned').isVisible(),false);
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')),false);
  assert.ok(await page.locator('#print').isEnabled());await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),1,'print works');
  await page.emulateMedia({media:'print'});assert.ok(await page.locator('#binder-wrap').isVisible());await page.emulateMedia({media:'screen'});
  assert.deepEqual(requests.filter(r=>!r.url.startsWith(base+'/')).map(r=>r.url),[],'no outside requests when OFF');
  assert.ok(requests.every(r=>r.method==='GET'));assert.deepEqual(errors,[]);await ctx.close();}

 // Flag ON
 let api=lsReply(404,{activated:false,error:'license_key not found.'});
 const {ctx,page,requests,errors}=await setup(browser,{on:true,api:r=>api(r)});
 await page.goto(url);await page.waitForSelector('#plan:not([hidden])');
 await fillSome(page);await page.click('#back');await page.check('#remember');await toBinder(page);
 assert.ok(await page.locator('#paywall').isVisible(),'unlock panel shows');
 assert.ok(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')));
 const buy=page.locator('#unlock-buy');assert.equal(await buy.innerText(),'Get the binder, $29');
 assert.equal(await buy.getAttribute('href'),CHECKOUT);assert.equal(await buy.getAttribute('target'),'_blank');assert.match(await buy.getAttribute('rel'),/noopener/);
 assert.equal(await buy.evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)','buy button text is readable');
 assert.equal(await page.locator('#unlock-key-box').isVisible(),false);
 await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),0,'print is locked');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'paywall','print sends you to the panel');
 await page.emulateMedia({media:'print'});assert.equal(await page.locator('#binder-wrap').isVisible(),false,'binder hidden from Ctrl+P while locked');await page.emulateMedia({media:'screen'});
 await page.click('#unlock-have');assert.ok(await page.locator('#unlock-key').isVisible());
 assert.equal(await page.locator('#unlock-have').getAttribute('aria-expanded'),'true');
 const status=()=>page.locator('#unlock-status').innerText();
 const tryKey=async(k,re)=>{await page.fill('#unlock-key',k);await page.click('#unlock-submit');await page.waitForFunction(r=>new RegExp(r).test(document.querySelector('#unlock-status').textContent),re.source);};
 // format check needs no request
 const before=requests.length;await tryKey('abc',/doesn’t look like a license key/);assert.equal(requests.length,before,'malformed key is not sent');
 await tryKey(KEY,/couldn’t find that key/);
 api=r=>r.abort('internetdisconnected');await tryKey(KEY,/couldn’t reach the license service/);
 api=lsReply(400,{activated:false,error:'This license key is disabled.',license_key:{status:'disabled'},meta});await tryKey(KEY,/turned off/);
 api=lsReply(400,{activated:false,error:'This license key has expired.',license_key:{status:'expired'},meta});await tryKey(KEY,/expired/);
 api=lsReply(200,{...ok,meta:{...meta,product_id:4}});await tryKey(KEY,/different product/);
 api=r=>r.fulfill({status:502,contentType:'text/html',headers:{'access-control-allow-origin':'*'},body:'<html>bad gateway</html>'});await tryKey(KEY,/didn’t answer as expected/);
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),L.STORE_KEY),null,'failures store nothing');
 assert.equal(await page.evaluate(()=>window.__prints),0);assert.ok(await page.locator('#paywall').isVisible());
 // a second tab of the same plan unlocks when the first one does
 const other=await ctx.newPage();await other.goto(url);await other.waitForSelector('#plan:not([hidden])');await toBinder(other);assert.ok(await other.locator('#paywall').isVisible());
 // success
 api=lsReply(200,ok);await page.fill('#unlock-key','  '+KEY+' ');await page.click('#unlock-submit');
 await page.waitForSelector('#paywall',{state:'hidden'});
 assert.match(await page.locator('#unlock-owned').innerText(),/unlocked on this device \(key ••••4D51\)/);
 assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('hhp-locked')),false);
 const rec=JSON.parse(await page.evaluate(k=>localStorage.getItem(k),L.STORE_KEY));assert.equal(rec.key,KEY);assert.equal(rec.productId,1475812);
 await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),1,'print works once unlocked');
 await page.emulateMedia({media:'print'});assert.ok(await page.locator('#binder-wrap').isVisible());await page.emulateMedia({media:'screen'});
 await other.waitForSelector('#paywall',{state:'hidden'});assert.ok(await other.locator('#unlock-owned').isVisible(),'other tab unlocked');await other.close();
 // persists across reloads, with no new request
 const n=requests.filter(r=>r.url===API).length;
 await page.reload();await page.waitForSelector('#plan:not([hidden])');await toBinder(page);
 assert.equal(await page.locator('#paywall').isVisible(),false,'unlock persists');await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),1);
 assert.equal(requests.filter(r=>r.url===API).length,n,'no re-check on load');
 // remove the key
 await page.click('#unlock-remove');await page.waitForSelector('#paywall:visible');
 assert.equal(await page.evaluate(k=>localStorage.getItem(k),L.STORE_KEY),null,'key removed');
 assert.match(await page.locator('#save-status').innerText(),/key is removed/);
 await page.click('#print');assert.equal(await page.evaluate(()=>window.__prints),1,'locked again: print not called');
 // the remembered answers are still there, and erase keeps a paid key
 assert.ok((await page.evaluate(()=>localStorage.getItem('pymtw-hhp-v1')||'')).includes(MARK));
 // CSP: the page itself refuses any other host
 await page.evaluate(()=>fetch('https://example.com/x',{method:'POST',body:'x'}).catch(()=>0));await page.waitForTimeout(200);
 assert.ok((await page.evaluate(()=>window.__csp||[])).some(v=>/example\.com.*connect-src/.test(v)),'CSP blocks other hosts');
 // what went over the network
 const outside=requests.filter(r=>!r.url.startsWith(base+'/'));
 assert.ok(outside.length>=6);assert.ok(outside.every(r=>r.url===API||r.url==='https://example.com/x'),'only the License API: '+outside.map(r=>r.url));
 for(const r of outside.filter(r=>r.url===API)){
  assert.equal(r.method,'POST');const f=new URLSearchParams(r.body);
  assert.deepEqual([...f.keys()],['license_key','instance_name'],'only the key and a fixed label are sent');
  assert.equal(f.get('license_key'),KEY);assert.equal(f.get('instance_name'),'pymtw.com household plan');
  assert.ok(!r.headers.cookie&&!r.headers.referer,'no cookies or referrer');
 }
 assert.equal(requests.filter(r=>r.method==='OPTIONS').length,0,'simple CORS request, no preflight');
 for(const r of requests)assert.ok(!(r.url+r.body+JSON.stringify(r.headers)).includes(MARK),'request carries an answer: '+r.url);
 assert.deepEqual(errors.filter(e=>!/example\.com/.test(e)),[]);await ctx.close();

 // ?unlock=1 after checkout: lands on the binder with the key field open and a receipt-email note
 {const s=await setup(browser,{on:true,api:lsReply(200,ok)});const p=s.page;
  await p.goto(url+'?unlock=1');await p.waitForSelector('#plan:not([hidden])');
  assert.match(await p.locator('#step-count').innerText(),/Step 12 of 12/);
  assert.ok(await p.locator('#unlock-note').isVisible());assert.match(await p.locator('#unlock-note').innerText(),/receipt email/);
  assert.ok(await p.locator('#unlock-key').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'unlock-key');
  assert.equal(new URL(p.url()).search,'','?unlock=1 is cleaned from the URL');
  await p.fill('#unlock-key',KEY);await p.keyboard.press('Enter');await p.waitForSelector('#paywall',{state:'hidden'});
  // layout: no sideways overflow and 44px targets on the panel at small widths
  await p.click('#unlock-remove');await p.click('#unlock-have');
  for(const width of [320,390,768]){await p.setViewportSize({width,height:900});
   const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);assert.ok(over<=1,`overflow ${over}px at ${width}`);
   const small=await p.evaluate(()=>[...document.querySelectorAll('#paywall button,#paywall a.button,#unlock-key')].filter(e=>e.offsetParent&&e.getBoundingClientRect().height<43.5).map(e=>e.id));
   assert.deepEqual(small,[],`touch targets at ${width}`);}
  await p.screenshot({path:path.join(require('node:os').tmpdir(),'hhp-paywall-390.png'),fullPage:false});
  assert.deepEqual(s.errors,[]);await s.ctx.close();}
 console.log('bitcoin household plan paywall checks passed');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
