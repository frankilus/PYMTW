const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8769';
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});
 const page=await browser.newPage();page.setDefaultTimeout(10000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 let outcome='success',requests=[];
 await page.route('**/*',async route=>{
  const req=route.request();
  if(req.url()==='https://api.web3forms.com/submit'){
   requests.push(req.postData());
   if(outcome==='network')return route.abort();
   if(outcome==='pending')return; // held for timeout check; no real request is sent
   return route.fulfill({status:outcome==='http'?500:200,contentType:'application/json',body:outcome==='malformed'?'not-json':JSON.stringify({success:outcome==='success'||outcome==='http'})});
  }
  if(req.url().startsWith(base))return route.continue();
  return route.abort(); // test never submits to providers or loads tracking
 });
 for(const width of [320,390,768,1280]){
  await page.setViewportSize({width,height:900});
 for(const path of ['/bitcoin/','/programs.html','/book/','/newsletter.html','/dca.html','/corporate.html','/membership.html']){
   await page.goto(base+path,{waitUntil:'domcontentloaded'});await page.waitForTimeout(100);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width} ${path}`);
  }
 }
 for(const path of ['/bitcoin/explore/','/programs.html','/dca.html','/calculator.html','/performance.html','/videos.html','/whitepaper.html','/services.html']){
  await page.setViewportSize({width:390,height:844});await page.goto(base+path,{waitUntil:'domcontentloaded'});
  const toggle=page.locator('#nav-toggle');await toggle.click();assert.equal(await toggle.getAttribute('aria-expanded'),'true');
  const trigger=page.locator('button.nav-dropdown-trigger').first();await trigger.click();
  assert.equal(await toggle.getAttribute('aria-expanded'),'true');assert.equal(await trigger.getAttribute('aria-expanded'),'true');
  await trigger.press('Escape');assert.equal(await trigger.getAttribute('aria-expanded'),'false');
  await toggle.press('Escape');assert.equal(await toggle.getAttribute('aria-expanded'),'false');
  assert.equal(await page.locator('#nav-links').evaluate(el=>el.inert),true);
 }
 console.log('Mobile menus passed');
 await page.setViewportSize({width:1280,height:900});await page.goto(base+'/programs.html',{waitUntil:'domcontentloaded'});
 const trigger=page.locator('button.nav-dropdown-trigger').first();await trigger.focus();await trigger.press('Enter');assert.equal(await trigger.getAttribute('aria-expanded'),'true');await trigger.press('Tab');assert.ok(await page.evaluate(()=>document.activeElement.closest('.nav-dropdown-menu')!==null));await page.keyboard.press('Escape');assert.equal(await trigger.getAttribute('aria-expanded'),'false');
 await page.goto(base+'/dca.html',{waitUntil:'domcontentloaded'});await page.locator('#initial').fill('0');await page.locator('#monthly').fill('0');await page.locator('#calculate-btn').click();assert.match(await page.locator('#dca-status').innerText(),/greater than zero/);assert.equal(await page.locator('#results-section').isVisible(),false);
 await page.locator('#initial').fill('1000');await page.locator('#monthly').fill('200');await page.locator('#start-date').fill('2026-01');await page.locator('#duration').selectOption('10');await page.locator('#calculate-btn').click();assert.match(await page.locator('#dca-status').innerText(),/SHORTENED RANGE.*2036-01.*2026-03/);assert.match(await page.locator('#total-invested').innerText(),/1,400/);assert.doesNotMatch(await page.locator('#results-section').innerText(),/NaN|Infinity/);
 await page.goto(base+'/assessment.html',{waitUntil:'domcontentloaded'});for(let i=0;i<10;i++){await page.locator('#assess-options button').first().click();await page.waitForTimeout(300);}assert.equal(await page.locator('#assess-result').isVisible(),true);assert.equal(await page.locator('input[type=email]').count(),0);await page.locator('#assess-retake').click();assert.equal(await page.locator('#assess-quiz').isVisible(),true);
 for(const path of ['/newsletter.html','/bitcoin/']){await page.goto(base+path,{waitUntil:'domcontentloaded'});assert.ok(await page.locator('a[href="https://pymtw.beehiiv.com/subscribe"]').count());assert.equal(await page.locator('form[action*="beehiiv"]').count(),0);}
 console.log('Calculator, assessment and newsletter checks passed');
 const forms=['/programs.html','/membership.html','/corporate.html','/about.html','/digital-credit.html','/book/','/workshop-professionals.html','/workshop-self-custody.html','/workshop-family.html'];
 for(const path of forms){
  await page.goto(base+path,{waitUntil:'domcontentloaded'});const form=page.locator('form[data-inquiry-form]');assert.equal(await form.count(),1,path);
  await form.locator('input[type=email]').fill('test@example.invalid');
  for(const required of await form.locator('textarea[required], input[type=text][required]').all())await required.fill('Test inquiry details');
  outcome='success';await form.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('form[data-inquiry-form] [role=status]').textContent.includes('accepted your request'));
  assert.equal(await form.locator('input[type=email]').inputValue(),'');
 }
 console.log('Nine inquiry forms passed provider-acceptance checks');
 await page.goto(base+'/corporate.html',{waitUntil:'domcontentloaded'});const form=page.locator('form[data-inquiry-form]');
 const before=requests.length;await form.locator('button[type=submit]').click();assert.equal(requests.length,before,'invalid form sent');
 await page.locator('#co-email').fill('test@example.invalid');await page.locator('#co-org').fill('Test organization');await page.locator('#co-notes').fill('Test timing and goals');
 for(const failure of ['http','rejected','malformed','network','pending']){
  outcome=failure;await form.locator('button[type=submit]').click();await page.waitForFunction(()=>document.querySelector('#co-status').textContent.includes('could not confirm'),{},{timeout:20000});
  assert.equal(await page.locator('#co-org').inputValue(),'Test organization');assert.equal(await page.locator('#co-notes').inputValue(),'Test timing and goals');assert.equal(await form.locator('button[type=submit]').isEnabled(),true);
 }
 assert.ok(requests.some(body=>body.includes('Test organization')&&body.includes('Test timing and goals')));
 await page.goto(base+'/book/',{waitUntil:'domcontentloaded'});assert.equal(await page.locator('.bk-footer-links a').filter({hasText:'Newsletter'}).getAttribute('href'),'/newsletter.html');
 // External chart/price scripts are deliberately blocked; unrelated legacy chart errors aren't failures of this suite.
 const relevant=errors.filter(e=>!e.includes('Chart is not defined'));
 assert.deepEqual(relevant,[]);
 console.log('Browser checks passed: 7 routes at 4 widths, 8 mobile menus, keyboard dropdowns, DCA errors/range warnings, ungated assessment, newsletter handoffs, 9 inquiry forms, preserved payloads and 5 failure modes. All external requests intercepted.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
