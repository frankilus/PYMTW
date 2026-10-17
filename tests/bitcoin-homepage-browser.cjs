const assert=require('node:assert/strict');const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8771';
(async()=>{const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
for(const width of [320,390,768,1280,1440]){
 await page.setViewportSize({width,height:900});assert.equal((await page.goto(base+'/bitcoin/')).status(),200);
 assert.equal(await page.locator('.review').count(),0);assert.equal(await page.locator('meta[name=robots][content*=noindex]').count(),0);
 for(const name of ['evaluate','protect','understand']){
  await page.locator('#'+name).click();assert.equal(await page.locator('#'+name).getAttribute('aria-expanded'),'true');assert.equal(await page.locator('[aria-expanded=true]').count(),1);assert.equal(await page.locator('#lessons a').count(),3);assert.equal(await page.evaluate(()=>location.hash),'#'+name);assert.equal(await page.locator('#path-detail').evaluate(el=>el===document.activeElement),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,width+' '+name);
  for(const href of await page.locator('#lessons a').evaluateAll(links=>links.map(a=>a.getAttribute('href')))){assert.equal((await page.request.get(base+href)).status(),200,href);}
 }
 assert.ok(await page.locator('.book-art img').evaluate(i=>i.complete&&i.naturalWidth>0));
 if(process.env.SCREENSHOT_DIR&&[390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(500);await page.screenshot({path:process.env.SCREENSHOT_DIR+'/bitcoin-homepage-'+width+'.png',fullPage:true});}
}
await page.locator('#evaluate').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('#evaluate').getAttribute('aria-expanded'),'true');await page.locator('#protect').click();await page.goBack();assert.equal(await page.locator('#evaluate').getAttribute('aria-expanded'),'true');await page.goForward();assert.equal(await page.locator('#protect').getAttribute('aria-expanded'),'true');await page.reload();assert.equal(await page.locator('#protect').getAttribute('aria-expanded'),'true');await page.locator('#start-simple').click();assert.equal(await page.locator('#understand').getAttribute('aria-expanded'),'true');
for(const name of ['understand','evaluate','protect']){await page.goto(base+'/bitcoin/#'+name);assert.equal(await page.locator('#'+name).getAttribute('aria-expanded'),'true');}
for(const hash of ['faq','learn','why-bitcoin','getting-started','resources']){await page.goto(base+'/bitcoin/?utm_source=review#'+hash,{waitUntil:'domcontentloaded'});await page.waitForURL(base+'/bitcoin/explore/?utm_source=review#'+hash);assert.equal(await page.locator('#'+hash).count(),1);}
await page.goto(base+'/?utm_source=old#faq',{waitUntil:'domcontentloaded'});await page.waitForURL(base+'/bitcoin/explore/?utm_source=old#faq');
await page.goto(base+'/bitcoin/#%E0%A4%A');assert.equal(await page.locator('#understand').getAttribute('aria-expanded'),'true');
const noJS=await browser.newContext({javaScriptEnabled:false});const fallback=await noJS.newPage();await fallback.goto(base+'/bitcoin/');assert.equal(await fallback.locator('a[data-path]').count(),3);assert.equal(await fallback.locator('#lessons a').count(),3);await fallback.locator('#evaluate').click();await fallback.waitForURL(base+'/bitcoin-on-exchange.html');await noJS.close();
assert.deepEqual(errors,[]);console.log('Homepage browser checks passed: 5 widths, 3 paths, 9 lesson destinations, keyboard/focus, back/forward/reload/deep links, old section/root bookmarks, malformed hashes, no-JS fallback and authentic book image. No external requests sent.');await browser.close();})().catch(e=>{console.error(e);process.exit(1)});
