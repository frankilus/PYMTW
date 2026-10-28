const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8776';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:950});
   await page.goto(base+'/tools/explain-my-401k/');
   await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.ok(await page.locator('.result-newsletter').isHidden());
   await page.locator('#example').click();
   assert.ok(await page.locator('.result-newsletter').isVisible());
   assert.equal(await page.locator('#total-balance').innerText(),'$60,000.00');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('#rate').fill('5');
   assert.ok(await page.locator('.result-newsletter').isHidden());
   await page.locator('#explain').click();
   assert.ok(await page.locator('.result-newsletter').isVisible());
   await page.locator('#clear').click();
   assert.ok(await page.locator('.result-newsletter').isHidden());
   await page.goto(base+'/tools/debt-payoff-planner/');
   const target=await page.locator('#add').boundingBox();
   assert.ok(target.width>=24&&target.height>=24);
   await page.locator('#add').click();
   assert.equal(await page.locator('#debts tbody tr').count(),5);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.ok(await page.evaluate(()=>document.fonts.check('italic 400 30px Fraunces')));
  }
  // Intercept only the explicit signup click; do not submit data or contact Beehiiv.
  let outgoing;
  await context.route('https://pymtw.beehiiv.com/**',async route=>{
   outgoing={url:route.request().url(),headers:await route.request().allHeaders(),body:route.request().postData()};
   await route.fulfill({status:200,contentType:'text/html',body:'Hosted newsletter destination'});
  });
  await page.goto(base+'/tools/explain-my-401k/');
  await page.locator('#example').click();
  const popupPromise=page.waitForEvent('popup');
  await page.locator('.result-newsletter a').click();
  const popup=await popupPromise;await popup.waitForLoadState();
  assert.equal(outgoing.url,'https://pymtw.beehiiv.com/subscribe');
  assert.equal(outgoing.body,null);assert.equal(outgoing.headers.referer,undefined);
  assert.equal(await popup.evaluate(()=>window.opener),null);
  await popup.close();
  assert.deepEqual(errors,[]);
  console.log('PASS 4 widths: newsletter hidden/show/stale/reset, unchanged sample math, tap target/add debt, loaded italic font, fixed signup URL with no payload/referrer/opener.');
  if(process.env.SCREENSHOT_DIR){
   for(const width of [390,1280]){
    await page.setViewportSize({width,height:950});
    await page.goto(base+'/tools/explain-my-401k/');
    await page.locator('#example').click();
    await page.locator('.result-newsletter').scrollIntoViewIfNeeded();
    await page.screenshot({path:process.env.SCREENSHOT_DIR+'/round3-401k-newsletter-'+width+'.png'});
   }
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
