const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const context=await browser.newContext({reducedMotion:'reduce',acceptDownloads:true});const page=await context.newPage();const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push({url:r.url(),method:r.method()}));
  await context.addInitScript(()=>{
   window.__writes=[];
   for(const name of ['setItem','removeItem','clear'])Storage.prototype[name]=function(){window.__writes.push(name);throw Error('Storage write forbidden');};
   indexedDB.open=()=>{window.__writes.push('indexedDB');throw Error('IndexedDB forbidden');};
   navigator.sendBeacon=()=>{window.__writes.push('beacon');throw Error('Beacon forbidden');};
  });
  for(const width of [320,390,768,1280]){
   await page.setViewportSize({width,height:950});await page.goto(base+'/tools/bitcoin-tax-lot-cleanup/');await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('.logo').getAttribute('href'),'/');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(process.env.SCREENSHOT_DIR&&[390,1280].includes(width))await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,`tax-lot-${width}.png`),fullPage:true});
   await page.locator('#example').click();assert.ok((await page.locator('#review-status').innerText()).includes('need attention'));assert.ok(await page.locator('#results').isHidden());
   await page.getByRole('button',{name:'Exclude record 5',exact:true}).click();
   await page.getByRole('button',{name:'Edit record 6',exact:true}).click();await page.locator('#f-amount_usd').fill('4000');await page.getByRole('button',{name:'Save record',exact:true}).click();
   await page.locator('#fifo-confirm').check();await page.locator('#analyze').click();
   assert.deepEqual(await page.locator('.metric strong').allTextContents(),['$1,800.00','$800.00','$1,000.00']);
   assert.ok((await page.locator('#results').innerText()).includes('0.03000000'));
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   if(process.env.AXE_PATH){await page.evaluate(fs.readFileSync(process.env.AXE_PATH,'utf8'));const axe=await page.evaluate(async()=>axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}}));assert.deepEqual(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)})),[]);}
   if(process.env.SCREENSHOT_DIR&&width===390)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'tax-lot-records-mobile.png'),fullPage:true});
   if(width===1280){
    const downloadPromise=page.waitForEvent('download');await page.locator('#export-lots').click();const download=await downloadPromise;const text=fs.readFileSync(await download.path(),'utf8');assert.ok(text.includes('1000.00'));assert.ok(text.includes('Not')||text.includes('not Form 8949'));assert.ok(text.includes('excluded records: 1'));
    if(process.env.SCREENSHOT_DIR)await page.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'tax-lot-worksheet.png'),fullPage:true});
   }
   await page.getByRole('button',{name:'Edit record 1',exact:true}).click();await page.locator('#f-amount_usd').fill('');await page.getByRole('button',{name:'Save record',exact:true}).click();assert.ok(await page.locator('#results').isHidden());assert.ok(await page.locator('#export-lots').isHidden());
   await page.locator('#analyze').click();assert.ok((await page.locator('#record-list').innerText()).includes('Missing or invalid cost basis'));
   await page.locator('#clear').click();assert.equal(await page.locator('#record-list table').count(),0);assert.ok(await page.locator('#results').isHidden());assert.equal(await page.locator('#file').inputValue(),'');
  }
  const fixture=path.join(__dirname,'../tools/bitcoin-tax-lot-cleanup/examples/template.csv');
  await page.locator('#file').setInputFiles(fixture);await page.locator('#mapping').waitFor({state:'visible'});assert.equal(await page.locator('#record-list table').count(),0);
  await page.locator('#import-use').click();assert.ok((await page.locator('#import-error').innerText()).includes('Confirm'));
  await page.locator('#map-confirm').check();await page.locator('#import-use').click();assert.ok((await page.locator('#record-count').innerText()).includes('3 records'));
  await page.locator('#fifo-confirm').check();await page.locator('#analyze').click();assert.deepEqual(await page.locator('.metric strong').allTextContents(),['$1,500.00','$800.00','$700.00']);
  // A second copy is appended and flagged, never silently deduplicated.
  await page.locator('#file').setInputFiles(fixture);await page.locator('#mapping').waitFor({state:'visible'});await page.locator('#map-confirm').check();await page.locator('#import-use').click();await page.locator('#analyze').click();assert.ok((await page.locator('#record-list').innerText()).includes('Possible duplicate'));assert.ok(await page.locator('#export-lots').isHidden());
  let dp=page.waitForEvent('download');await page.locator('#export-records').click();let dl=await dp;const exported=fs.readFileSync(await dl.path(),'utf8');assert.ok(exported.includes('Possible duplicate'));assert.ok(exported.includes('original_values'));assert.ok(exported.includes('template.csv'));
  await page.locator('#clear').click();
  const hostile='timestamp,type,account,destination,btc,amount_usd,btc_fee,reference\n2025-02-01T12:00:00Z,buy,<img src=x onerror=alert(1)>,,0.1,4000,0,=WEBSERVICE(1)\n';
  await page.locator('#file').setInputFiles({name:'hostile.csv',mimeType:'text/csv',buffer:Buffer.from(hostile)});await page.locator('#mapping').waitFor({state:'visible'});await page.locator('#map-confirm').check();await page.locator('#import-use').click();assert.equal(await page.locator('#record-list img').count(),0);
  dp=page.waitForEvent('download');await page.locator('#export-records').click();dl=await dp;assert.ok(fs.readFileSync(await dl.path(),'utf8').includes("'=WEBSERVICE"));
  await page.reload();assert.ok((await page.locator('#record-count').innerText()).includes('No records'));
  await page.locator('#file').setInputFiles({name:'bad.csv',mimeType:'text/csv',buffer:Buffer.from('a,b\n1')});await page.locator('#import-error').waitFor({state:'visible'});assert.equal(await page.locator('#record-list table').count(),0);
  // Manual input is supported and an in-progress import can be canceled.
  await page.locator('#clear').click();await page.locator('#add').click();
  for(const [id,value] of Object.entries({timestamp:'2025-01-01T10:00:00Z',account:'Manual wallet',btc:'0.01',amount_usd:'300',btc_fee:'0'}))await page.locator('#f-'+id).fill(value);
  await page.getByRole('button',{name:'Save record',exact:true}).click();await page.locator('#fifo-confirm').check();await page.locator('#analyze').click();assert.ok((await page.locator('#results').innerText()).includes('$300.00'));
  await page.locator('#file').setInputFiles(fixture);await page.locator('#mapping').waitFor({state:'visible'});await page.locator('#import-cancel').click();assert.ok((await page.locator('#record-count').innerText()).startsWith('1 records'));
  await page.locator('#clear').click();
  assert.deepEqual(await page.evaluate(()=>window.__writes),[]);assert.deepEqual(await context.cookies(),[]);
  assert.deepEqual(errors,[]);assert.deepEqual(requests.filter(r=>!r.url.startsWith(base+'/')||r.method!=='GET'),[]);
  assert.ok(requests.every(r=>!r.url.includes('analytics')&&!r.url.includes('googletag')&&!r.url.includes('beehiiv')));
  console.log('PASS four responsive widths, WCAG AA automated checks, sample corrections/FIFO math, stale results, CSV mapping/append/review/exports, injection escaping, clear/reload, no external requests, no analytics or storage writes.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
