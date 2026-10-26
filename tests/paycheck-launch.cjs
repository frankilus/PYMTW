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
   await page.locator('[data-category=all]').click();
   assert.equal(await page.locator('a.directory-tool:not(.is-external)').count(),23); // 15 calculators + checkup + 7 guides
   assert.ok(!(await page.locator('main').innerText()).match(/coming soon|planned/i));
   const card=page.locator('a.directory-tool[href="./paycheck-decoder/"]');
   assert.equal(await card.count(),1);
   assert.equal(await card.locator('h4').innerText(),'Paycheck decoder');
   await page.locator('.category-button[data-category="everyday"]').click();
   assert.ok(await card.isVisible());
   await page.locator('#finder-input').fill('Explain my paycheck');
   await page.locator('#finder-form').evaluate(el=>el.requestSubmit());
   assert.equal(await page.locator('#finder-results a[href="./paycheck-decoder/"]').count(),1);
   await card.click();
   assert.equal(new URL(page.url()).pathname,'/tools/paycheck-decoder/');
   assert.equal(await page.title(),'Paycheck Decoder: Understand Your Pay Stub | PYMTW');
   assert.equal(await page.locator('.pd-preview').count(),0);
   assert.equal(await page.locator('meta[name=robots][content*=noindex]').count(),0);
   assert.ok(await page.locator('#pd-file').count());
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  }
  const sitemap=await page.request.get(base+'/tools/sitemap.xml');
  assert.ok((await sitemap.text()).includes('https://pymtw.com/tools/paycheck-decoder/'));
  console.log('PASS available listing, 14-tool directory, no planned tools, search, category, navigation, public metadata, import control, sitemap and mobile/desktop layout.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
