const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8775';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage();
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:950});
   await page.goto(base+'/tools/');
   const card=page.locator('.tool-card').filter({has:page.getByRole('heading',{name:'Explain my 401(k)',exact:true})});
   assert.equal(await card.locator('.tool-state').innerText(),'AVAILABLE');
   assert.equal(await card.locator('.disabled').count(),0);
   assert.equal(await page.locator('.tool-card.is-planned').count(),1);
   assert.equal(await page.locator('.tool-footer a').count(),13);
   await page.locator('.moment-card[data-moment="ahead"]').click();
   assert.equal(await card.count(),1);
   await page.locator('#finder-input').fill('Explain my 401k');
   await page.locator('#finder-form').evaluate(el=>el.requestSubmit());
   assert.equal(await page.locator('#finder-results a[href="./explain-my-401k/"]').count(),1);
   await card.getByRole('link',{name:'Open this tool'}).click();
   assert.equal(new URL(page.url()).pathname,'/tools/explain-my-401k/');
   assert.equal(await page.title(),'Explain My 401(k) | PYMTW Money Tools');
   assert.equal(await page.locator('.preview, meta[name=robots][content*=noindex]').count(),0);
   assert.ok(await page.locator('#ki-file').count());
   assert.equal(await page.locator('script[src*=analytics], script[src*=goatcounter], iframe').count(),0);
   await page.locator('#example').click();
   assert.equal(await page.locator('#total-balance').innerText(),'$60,000.00');
   assert.ok((await page.locator('#fee-total').innerText()).includes('$102.00'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.locator('a.logo').click();
   assert.equal(new URL(page.url()).pathname,'/');
  }
  assert.ok((await (await page.request.get(base+'/tools/sitemap.xml')).text()).includes('https://pymtw.com/tools/explain-my-401k/'));
  console.log('PASS 401(k) available listing, search, life-moment category, public metadata, private import control, sample math, parent-home logo, sitemap and mobile/desktop layout.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
