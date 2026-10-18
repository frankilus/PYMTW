const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8773';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try {
  const page=await browser.newPage();
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(base+'/tools/');
   const card=page.locator('.tool-card').filter({has:page.getByRole('heading',{name:'Paycheck decoder',exact:true})});
   assert.equal(await card.locator('.tool-state').innerText(),'AVAILABLE');
   assert.equal(await card.locator('.disabled').count(),0);
   assert.equal(await page.locator('.tool-card.is-planned').count(),1);
   assert.equal(await page.locator('.tool-footer a').count(),13);
   await page.locator('.moment-card[data-moment="starting"]').click();
   assert.equal(await card.count(),1);
   await page.locator('#finder-input').fill('Explain my paycheck');
   await page.locator('#finder-form').evaluate(el=>el.requestSubmit());
   assert.equal(await page.locator('#finder-results a[href="./paycheck-decoder/"]').count(),1);
   await card.getByRole('link',{name:'Open this tool'}).click();
   assert.equal(new URL(page.url()).pathname,'/tools/paycheck-decoder/');
   assert.equal(await page.title(),'Paycheck Decoder: Understand Your Pay Stub | PYMTW');
   assert.equal(await page.locator('.pd-preview').count(),0);
   assert.equal(await page.locator('meta[name=robots][content*=noindex]').count(),0);
   assert.ok(await page.locator('#pd-file').count());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  const sitemap=await page.request.get(base+'/tools/sitemap.xml');
  assert.ok((await sitemap.text()).includes('https://pymtw.com/tools/paycheck-decoder/'));
  console.log('PASS available listing, one remaining planned tool, search, life-moment category, navigation, public metadata, import control, sitemap and mobile/desktop layout.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
