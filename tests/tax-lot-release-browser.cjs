const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage({reducedMotion:'reduce'});await p.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 for(const width of [390,1280]){
  await p.setViewportSize({width,height:950});await p.goto(base+'/tools/');
  await p.locator('[data-category=all]').click();assert.equal(await p.locator('a.directory-tool').count(),22);
  assert.ok(!(await p.locator('main').innerText()).match(/coming soon|planned/i));
  const card=p.locator('a.directory-tool[href="./bitcoin-tax-lot-cleanup/"]');assert.equal(await card.count(),1);
  assert.equal(await card.locator('h4').innerText(),'Bitcoin tax-lot cleanup');assert.ok(!(await card.innerText()).includes('Coming soon'));
  await p.locator('.category-button[data-category="bitcoin"]').click();assert.ok(await card.isVisible());
  await p.locator('#finder-input').fill('Bitcoin tax lot');await p.locator('#finder-form').evaluate(f=>f.requestSubmit());
  const result=p.locator('#finder-results a[href="./bitcoin-tax-lot-cleanup/"]');assert.equal(await result.count(),1);await result.click();await p.waitForURL('**/tools/bitcoin-tax-lot-cleanup/');
  assert.equal(await p.locator('meta[name=robots][content*=noindex]').count(),0);assert.equal(await p.locator('.preview').count(),0);assert.equal(await p.locator('script[src*=analytics]').count(),0);
  assert.ok((await p.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')).includes("connect-src 'none'"));
 }
 console.log('PASS release discovery: 14 available directory tools, no planned/coming-soon tools, Bitcoin category, search link, released tool title/indexing and no analytics loader at desktop/mobile widths.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
