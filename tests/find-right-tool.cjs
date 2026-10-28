// "Find the right tool." must reach every page in tools/sitemap.xml: in the catalog data
// (tools/catalog.js, the single source), in the no-JavaScript list, in the rendered directory and in its search.
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const base=process.env.PREVIEW_URL||'http://127.0.0.1:8777';const root=path.join(__dirname,'..');
const catalog=require('../tools/catalog.js');
const sitemap=[...fs.readFileSync(path.join(root,'tools/sitemap.xml'),'utf8').matchAll(/<loc>https:\/\/pymtw\.com\/tools\/([^<]*)<\/loc>/g)].map(m=>m[1].replace(/\/$/,'')).filter(Boolean).sort();
const items=[...catalog.flatMap(c=>c.tools).filter(t=>t.live),...catalog.guides];
const slugs=items.map(t=>t.slug).sort();
// External sister-site links (PT_EXTERNAL) are searchable in the directory but are not PYMTW pages, so they stay out of the sitemap.
const ext=catalog.external||[];const extSlugs=ext.map(e=>e.slug);
assert.equal(ext.length,1,'exactly one StackCost external link');assert.deepEqual(extSlugs,['ext/stackcost-calculator']);assert.equal(ext[0].url,'https://stackcost-pink.vercel.app/calculator');
assert.ok(catalog.topics.find(t=>t.id==='bitcoin').slugs.filter(s=>s.startsWith('ext/')).join()==='ext/stackcost-calculator','Bitcoin topic lists the one StackCost link');
assert.ok(ext.length===1&&ext.every(e=>/^https:\/\//.test(e.url)&&e.kind==='external'&&e.kw.length>=3&&!sitemap.includes(e.slug)),'external links are https, tagged external and kept out of the sitemap');
for(const e of ext)assert.ok(catalog.topics.find(c=>c.id==='bitcoin').slugs.includes(e.slug),e.slug+' is in the Bitcoin topic');
assert.ok(sitemap.length>=22,'sitemap lists the tools and guides');
assert.deepEqual(slugs,sitemap,'tools/catalog.js (PT_CATS + PT_GUIDES) must list exactly the pages in tools/sitemap.xml');
assert.equal(new Set(slugs).size,slugs.length,'no duplicate slugs');
for(const t of items){
 assert.ok(fs.existsSync(path.join(root,'tools',t.slug,'index.html')),t.slug+' page exists');
 assert.ok(catalog.topics.some(c=>c.slugs.includes(t.slug)),t.slug+' is in at least one directory topic');
 assert.ok(t.name&&t.desc&&Array.isArray(t.kw)&&t.kw.length>=3,t.slug+' has a name, description and keywords');
}
for(const c of catalog.topics)for(const s of c.slugs)assert.ok(slugs.includes(s)||extSlugs.includes(s),`topic ${c.id} lists unknown slug ${s}`);
const html=fs.readFileSync(path.join(root,'tools/index.html'),'utf8');
const section=html.slice(html.indexOf('id="moments"'),html.indexOf('id="guides"'));
const noscript=section.slice(section.indexOf('<noscript>'),section.indexOf('</noscript>'));
for(const s of sitemap)assert.ok(noscript.includes(`href="/tools/${s}/"`),s+' is linked in the no-JavaScript directory list');
for(const e of ext)assert.ok(noscript.includes(`href="${e.url}" target="_blank" rel="noopener"`),e.slug+' is linked (new tab) in the no-JavaScript list');
const old=catalog.guides.find(g=>g.slug==='guides/old-401k');
for(const k of ['rollover','ira','roth','leaving job','cash out','401k'])assert.ok(old.kw.some(w=>w.toLowerCase()===k),'old-401k keyword '+k);
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true});try{
 for(const width of [320,390,768,1280]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());
  await page.goto(base+'/tools/');
  const search=page.locator('#directory-search-input');
  assert.ok(await search.isVisible(),'directory search is shown when JavaScript runs');
  assert.equal(await page.locator('label[for=directory-search-input]').innerText(),'Search tools & guides');
  assert.ok((await search.boundingBox()).height>=44,'search field is a 44px touch target');
  for(const b of await page.locator('.category-button').all())assert.ok((await b.boundingBox()).height>=44);
  await page.locator('[data-category=all]').click();
  const hrefs=await page.locator('#tools-grid a.directory-tool').evaluateAll(els=>els.map(e=>e.getAttribute('href')));
  assert.deepEqual(hrefs.filter(h=>/^https:/.test(h)).sort(),ext.map(e=>e.url).sort(),'All view shows each external link once');
  for(const e of ext){const a=page.locator(`#tools-grid a.directory-tool[href="${e.url}"]`);assert.equal(await a.getAttribute('target'),'_blank');assert.equal(await a.getAttribute('rel'),'noopener');assert.equal(await a.locator('.directory-tag').innerText(),'External site');}
  const all=hrefs.filter(h=>!/^https:/.test(h)).map(h=>h.replace(/^\.\//,'').replace(/\/$/,'')).sort();
  assert.deepEqual(all,sitemap,'the All view shows every sitemap page exactly once');
  assert.match(await page.locator('#tool-count').innerText(),/15 tools, 10 guides & 1 external link in all topics/);
  for(const s of sitemap){await search.fill('');await search.fill(items.find(t=>t.slug===s).name);
   assert.equal(await page.locator(`#tools-grid a.directory-tool[href="./${s}/"]`).count(),1,'searching its name finds '+s);}
  for(const q of ['rollover','old 401k','IRA','Roth IRA','leaving job','cash out','401k','401(k) rollover','what should I do with my old 401(k)']){
   await search.fill(q);assert.equal(await page.locator('#tools-grid a.directory-tool[href="./guides/old-401k/"]').count(),1,'old-401k for '+q);
   assert.equal(await page.locator('.category-button[aria-pressed=true]').count(),0);}
  await search.fill('rollover');assert.equal(await page.locator('#tools-grid a.directory-tool').first().getAttribute('href'),'./guides/old-401k/');
  assert.match(await page.locator('#tool-count').innerText(),/1 match for “rollover”/);
  for(const [q,s] of [['checkup','checkup'],['laid off','guides/lost-my-job'],['daycare','guides/true-cost-of-a-baby'],['wedding','guides/true-cost-of-a-wedding'],['car insurance','guides/true-cost-of-a-car'],['property tax','guides/true-cost-of-owning-a-home'],['down payment','guides/first-home'],['bitcoin taxes','bitcoin-tax-lot-cleanup'],['pay stub','paycheck-decoder']]){
   await search.fill(q);assert.ok(await page.locator(`#tools-grid a.directory-tool[href="./${s}/"]`).count()===1,q+' finds '+s);}
  for(const q of ['dca cost','cash app','cheapest app to buy bitcoin','strike fees','coinbase spread','compare bitcoin apps']){await search.fill(q);assert.equal(await page.locator('#tools-grid a.directory-tool[href="https://stackcost-pink.vercel.app/calculator"]').count(),1,q+' finds the DCA cost calculator');}
  await search.fill('compare bitcoin apps');assert.equal(await page.locator('#tools-grid a.directory-tool[href^="https://stackcost-pink.vercel.app"]').count(),1,'one StackCost result');assert.equal(await page.locator('#tools-grid a.directory-tool[href="https://stackcost-pink.vercel.app/compare"]').count(),0);
  await search.fill('');await page.locator('[data-category=bitcoin]').click();assert.match(await page.locator('#tool-count').innerText(),/3 tools & 1 external link in bitcoin/);await page.locator('[data-category=all]').click();
  await search.fill('zzqx');assert.equal(await page.locator('#tools-grid a.directory-tool').count(),0);assert.equal(await page.locator('.directory-empty a[href="/tools/checkup/"]').count(),1);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'no horizontal overflow at '+width);
  // Keyboard: Escape clears and restores the topic; the clear button and a topic click also clear.
  await search.focus();await page.keyboard.press('Escape');assert.equal(await search.inputValue(),'');assert.equal(await page.locator('.category-button[aria-pressed=true]').getAttribute('data-category'),'all');
  await search.focus();await page.keyboard.type('mortgage');await page.keyboard.press('Enter');
  assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('href')),'./rent-vs-buy/','Enter moves focus to the first match');
  const clear=page.locator('#directory-search-clear');assert.ok(await clear.isVisible());const box=await clear.boundingBox();assert.ok(box.width>=44&&box.height>=44);
  await clear.click();assert.equal(await search.inputValue(),'');assert.ok(await clear.isHidden());
  await search.fill('roth');await page.locator('[data-category=retirement]').click();assert.equal(await search.inputValue(),'');
  assert.equal(await page.locator('#tools-grid a.directory-tool[href="./guides/old-401k/"]').count(),1,'old-401k is in Retirement & investing');
  assert.deepEqual(errors,[]);await page.close();
 }
 const ctx=await browser.newContext({javaScriptEnabled:false});const page=await ctx.newPage();
 await page.route('**/*',r=>r.request().url().startsWith(base+'/')?r.continue():r.abort());await page.goto(base+'/tools/');
 assert.ok(await page.locator('#directory-search').isHidden(),'no dead search box without JavaScript');
 const links=(await page.locator('#moments noscript').innerHTML()).match(/href="\/tools\/[^"]+\/"/g)||[];
 assert.equal(links.length,sitemap.length,'every page is listed without JavaScript');
 assert.equal(((await page.locator('#moments noscript').innerHTML()).match(/href="https:\/\/stackcost-pink\.vercel\.app\/[^"]+"/g)||[]).length,1,'the one external link listed without JavaScript');
 assert.ok(!(await page.locator('#moments noscript').innerHTML()).includes('stackcost-pink.vercel.app/compare'));
 await ctx.close();
 console.log('find-right-tool: ok,',sitemap.length,'pages reachable from "Find the right tool."');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exit(1);});
