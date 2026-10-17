const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(__dirname,'..');const base=process.env.PREVIEW_URL||'http://127.0.0.1:8771';
const files=[...fs.readdirSync(root).filter(n=>n.endsWith('.html')),'book/index.html','bitcoin/explore/index.html'].filter(n=>fs.readFileSync(path.join(root,n),'utf8').includes('/assets/bitcoin-theme.css'));
const luminance=rgb=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>{const x=luminance(a),y=luminance(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const color of [[41,38,31],[101,93,82],[113,105,94],[165,68,21],[40,97,63],[165,43,38]])assert.ok(contrast(color,[255,252,247])>=4.5,'text contrast');
assert.ok(contrast([255,255,255],[165,68,21])>=4.5,'button contrast');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'chrome'});const page=await browser.newPage();const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().url().startsWith(base)?route.continue():route.abort());
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});
  for(const file of files){
   assert.equal((await page.goto(base+'/'+file,{waitUntil:'domcontentloaded'})).status(),200,file);
   assert.equal(await page.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 252, 247)',file);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width} ${file}`);
   if(await page.locator('.nav-cta').count())assert.equal(await page.locator('.nav-cta').first().evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
  }
 }
 // Separate parent and Money Tools themes must not load this interior stylesheet.
 for(const route of ['/','/bitcoin/','/tools/','/tools/emergency-fund-runway/']){
  await page.goto(base+route,{waitUntil:'domcontentloaded'});assert.equal(await page.locator('link[href="/assets/bitcoin-theme.css"]').count(),0,route);
 }
 for(const width of [320,768]){
  await page.setViewportSize({width,height:900});
  for(const route of ['/start-here.html','/dca.html','/resources.html','/assessment.html','/book/','/playbook.html','/whitepaper.html']){
   await page.goto(base+route,{waitUntil:'domcontentloaded'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width} ${route}`);
  }
 }
 await page.goto(base+'/start-here.html',{waitUntil:'domcontentloaded'});await page.locator('.skip-link').focus();assert.equal(await page.locator('.skip-link').evaluate(e=>getComputedStyle(e).color),'rgb(255, 255, 255)');
 await page.locator('#nav-toggle').click();assert.equal(await page.locator('#nav-links').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(255, 252, 247)');
 if(process.env.SCREENSHOT_DIR){
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   for(const route of ['start-here.html','dca.html','book/','resources.html']){
    await page.goto(base+'/'+route,{waitUntil:'domcontentloaded'});await page.waitForTimeout(1800);await page.screenshot({path:process.env.SCREENSHOT_DIR+'/bitcoin-theme-'+route.replace(/\W+/g,'-')+'-'+width+'.png',fullPage:false});
   }
  }
 }
 assert.deepEqual(errors.filter(e=>e!=='Chart is not defined'),[]);
 console.log(`Bitcoin theme passed: ${files.length} interiors at mobile/desktop, representative 320/768px layouts, text/button contrast, menu/skip-link colors and separate parent/Tools themes. External services blocked; existing missing member/dashboard assets are outside scope.`);
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
