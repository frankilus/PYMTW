const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8778';
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});try{const p=await b.newPage({reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
 const paths=['/starter-kit.html','/programs.html','/compare-coldcard-trezor-bitbox.html','/dca.html','/whitepaper.html','/tools/'];
 for(const width of [320,390,1280]){await p.setViewportSize({width,height:950});for(const route of paths){await p.goto(base+route);await p.evaluate(()=>document.fonts.ready);
  const tiny=await p.evaluate(()=>[...document.body.querySelectorAll('*')].filter(e=>e.checkVisibility()&&[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&parseFloat(getComputedStyle(e).fontSize)<12).map(e=>({text:e.textContent.trim().slice(0,90),size:getComputedStyle(e).fontSize})));
  assert.deepEqual(tiny,[],route+' tiny text at '+width);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' overflow');
 }
 await p.goto(base+'/tools/');assert.equal((await p.locator('#newsletter-title').innerText()).replace(/\s+/g,' '),'Smarter money decisions. A longer perspective.');assert.equal(await p.locator('#newsletter a.newsletter-subscribe-link').getAttribute('href'),'https://pymtw.beehiiv.com/subscribe');
 
 if(process.env.SCREENSHOT_DIR&&width!==320){await p.locator('#newsletter').scrollIntoViewIfNeeded();await p.screenshot({path:path.join(process.env.SCREENSHOT_DIR,'round4-newsletter-'+width+'.png')});}
 await p.goto(base+'/bitcoin/');assert.equal(await p.locator('#newsletter-title').innerText(),'Personal finance Tuesdays. Bitcoin Fridays.');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await p.goto(base+'/tools/emergency-fund-runway/');assert.ok((await p.locator('footer .brand a').boundingBox()).height>=24);assert.equal(await p.locator('footer .brand a').getAttribute('href'),'https://pymtw.com/');
 await p.goto(base+'/tools/paycheck-decoder/');for(const a of await p.locator('.pd-import .pd-mini a[download]').all()){assert.ok((await a.boundingBox()).height>=24);const url=new URL(await a.getAttribute('href'),p.url()).href;assert.equal((await p.request.get(url)).status(),200);}
 assert.equal(await p.locator('#paycheck-newsletter-title').textContent(),'Personal finance Tuesdays. Bitcoin Fridays.');
 await p.goto(base+'/tools/explain-my-401k/');await p.locator('#example').click();assert.equal(await p.locator('#plan-newsletter-title').innerText(),'Personal finance Tuesdays. Bitcoin Fridays.');assert.equal(await p.locator('#total-balance').innerText(),'$60,000.00');
 }
 const root=path.resolve(__dirname,'..'),notes=fs.readdirSync(root).filter(n=>n.endsWith('.md'));
 for(const note of notes){for(const url of [note,note.replace(/\.md$/,'.html')])assert.equal((await p.request.get(base+'/'+url)).status(),404,url);}
 for(const url of ['tests/tax-lot-core.cjs','tests/round4-browser.cjs'])assert.equal((await p.request.get(base+'/'+url)).status(),404,url);
 for(const url of ['llms.txt','tools/llms.txt','robots.txt','tools/robots.txt','sitemap.xml','tools/sitemap.xml','googlea70c61482c1a9eed.html','CNAME','tools/paycheck-decoder/vendor/ocr/tesseract.js-LICENSE.md'])assert.equal((await p.request.get(base+'/'+url)).status(),200,url);
 // Every source HTML page must remain reachable from the built output.
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.name==='.git'||e.name==='tests'?[]:e.isDirectory()?walk(path.join(d,e.name)):e.name.endsWith('.html')?[path.relative(root,path.join(d,e.name))]:[]);
 const pages=walk(root);for(const url of pages)assert.equal((await p.request.get(base+'/'+url)).status(),200,url);
 assert.deepEqual(errors,[]);console.log(`PASS 3 widths: >=12px text, no overflow, newsletter consistency and sample/header targets; ${notes.length} note URLs + HTML aliases and tests return 404; ${pages.length} HTML pages and required public files return 200 on the local production build.`);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exit(1)});
