const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8771';const root=path.resolve(__dirname,'..');
const pages=[...fs.readdirSync(root).filter(n=>n.endsWith('.html')),'book/index.html'].filter(n=>fs.readFileSync(path.join(root,n),'utf8').includes('/assets/bitcoin-interiors.js'));
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
  for(const file of pages){await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}: ${file}`);}
 }
 await page.goto(base+'/dca.html');
 assert.equal(await page.locator('#nav-links > li').count(),5);
 assert.equal(await page.locator('#nav-links > li').evaluateAll(items=>items.map(e=>e.firstElementChild.textContent.trim()).join(', ')),'Understand, Evaluate, Protect, Library, More');
 assert.ok(await page.evaluate(()=>document.querySelector('#navbar').getBoundingClientRect().top>=document.querySelector('#btc-price-bar').getBoundingClientRect().bottom-1),'header clears live price strip');
 for(const href of await page.locator('#nav-links a, #site-footer a').evaluateAll(items=>items.map(e=>e.getAttribute('href')))){assert.equal((await page.request.get(base+href)).status(),200,href);}
 // Library searches include metadata, combine with topics, and recover from no results.
 await page.goto(base+'/resources.html');const total=await page.locator('.res-cat .p-card, .res-cat .res-card').count();assert.equal(total,45);
 await page.locator('#resource-topic').selectOption('wallets');assert.equal(await page.locator('.res-card:visible').count(),5);for(const notice of await page.locator('#wallets .callout-security').all())assert.ok(await notice.isVisible());
 await page.locator('#resource-search').fill('trezor');assert.equal(await page.locator('.res-card:visible').count(),1);
 const detail=page.locator('.res-card:visible details');assert.equal(await detail.getAttribute('open'),null);await detail.locator('summary').focus();await page.keyboard.press('Enter');assert.ok(await detail.locator('.res-meta').isVisible());
 await page.locator('#resource-search').fill('nothing-matches-987');assert.ok(await page.locator('#resource-empty').isVisible());assert.match(await page.locator('#resource-count').innerText(),/^0 resources/);
 await page.locator('#resource-reset').click();assert.match(await page.locator('#resource-count').innerText(),/^45 resources/);assert.equal(await page.locator('#resource-search').evaluate(e=>e===document.activeElement),true);
 await page.locator('#resource-search').fill('nothing-matches-987');await page.evaluate(()=>location.hash='wallets');await page.waitForFunction(()=>document.querySelector('#resource-topic').value==='wallets');assert.equal(await page.locator('.res-card:visible').count(),5);
 await page.goto(base+'/resources.html#books');assert.equal(await page.locator('#resource-topic').inputValue(),'books');assert.ok(await page.locator('#books').isVisible());
 // Every deep guide contents link lands at an existing readable heading.
 await page.goto(base+'/compare-hardware-wallets.html');for(const href of await page.locator('.guide-contents a').evaluateAll(items=>items.map(e=>e.getAttribute('href')))){assert.equal(await page.locator(href).count(),1);}
 // Whitepaper chapter links and direct bookmarks reveal the explanation.
 await page.goto(base+'/whitepaper.html');assert.equal(await page.locator('.wp-section-card details[open]').count(),0);
 await page.locator('[data-reading=expand]').click();assert.equal(await page.locator('.wp-section-card details[open]').count(),13);
 await page.locator('[data-reading=collapse]').click();assert.equal(await page.locator('.wp-section-card details[open]').count(),0);
 await page.locator('.wp-sidebar-link[data-section="3"]').click();assert.ok(await page.locator('#wp-section-3 details').evaluate(e=>e.open));
 await page.goto(base+'/whitepaper.html#wp-section-5');assert.ok(await page.locator('#wp-section-5 details').evaluate(e=>e.open));
 await page.goto(base+'/workshop-professionals.html#outcomes');assert.ok(await page.locator('#outcomes details').evaluate(e=>e.open));
 await page.goto(base+'/book/#chapters');assert.ok(await page.locator('#chapters details').evaluate(e=>e.open));
 // The static fallback still provides navigation, resources and native disclosure.
 const noJS=await browser.newContext({javaScriptEnabled:false});const fallback=await noJS.newPage();await fallback.route('**/*',r=>r.request().url().startsWith(base)?r.continue():r.abort());
 await fallback.goto(base+'/resources.html');assert.ok(await fallback.locator('.fallback-nav').isVisible());assert.equal(await fallback.locator('.res-cat .p-card:visible, .res-cat .res-card:visible').count(),45);await fallback.locator('.res-card details summary').first().click();assert.ok(await fallback.locator('.res-card .res-meta').first().isVisible());await noJS.close();
 if(process.env.SCREENSHOT_DIR){for(const width of [390,1280]){await page.setViewportSize({width,height:900});for(const route of ['start-here.html','resources.html','compare-hardware-wallets.html','dca.html','whitepaper.html']){await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(1500);await page.screenshot({path:process.env.SCREENSHOT_DIR+'/bitcoin-simplified-'+route.replace('.html','')+'-'+width+'.png'});}}}
 assert.deepEqual(errors.filter(e=>e!=='Chart is not defined'),[]);
 console.log(`Simplified interiors passed: ${pages.length} pages at 4 widths; five-item navigation and header clearance; 45 searchable resources, topic/empty/reset/bookmark states; keyboard disclosures; guide/whitepaper/workshop/book bookmarks; no-JavaScript navigation and library.`);await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
