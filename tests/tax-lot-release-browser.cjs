const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const assert=require('node:assert/strict');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{
 const p=await b.newPage({reducedMotion:'reduce'});await p.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 for(const width of [390,1280]){
  await p.setViewportSize({width,height:950});await p.goto(base+'/tools/');
  assert.equal(await p.locator('#tools-grid .tool-card').count(),14);assert.equal(await p.locator('#tools-grid .is-planned').count(),0);
  const card=p.locator('.tool-card').filter({has:p.getByRole('heading',{name:'Bitcoin tax-lot cleanup',exact:true})});
  assert.equal(await card.locator('.tool-state').innerText(),'AVAILABLE');assert.ok(!(await card.innerText()).includes('Coming soon'));
  await p.locator('.moment-card[data-moment="ahead"]').click();assert.ok(await card.isVisible());
  await p.locator('#finder-input').fill('Bitcoin tax lot');await p.locator('#finder-form').evaluate(f=>f.requestSubmit());
  const result=p.locator('#finder-results a[href="./bitcoin-tax-lot-cleanup/"]');assert.equal(await result.count(),1);await result.click();await p.waitForURL('**/tools/bitcoin-tax-lot-cleanup/');
  assert.equal(await p.locator('meta[name=robots][content*=noindex]').count(),0);assert.equal(await p.locator('.preview').count(),0);assert.equal(await p.locator('script[src*=analytics]').count(),0);
  assert.ok((await p.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content')).includes("connect-src 'none'"));
 }
 console.log('PASS release discovery: 14 available cards, no planned cards, life-moment category, search link, released tool title/indexing and no analytics loader at desktop/mobile widths.');
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
