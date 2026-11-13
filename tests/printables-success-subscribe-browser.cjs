// After Print/Save as PDF (and Copy questions on the severance sheet), each printable shows one
// subscribe line to The Long Game. Hidden before the action, hidden in print, link counted as nl-click.
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const assert = require('assert');
const base = process.env.BASE || 'http://127.0.0.1:8797';
const pages = ['first-home/checklist', 'lost-my-job/checklist', 'true-cost-of-a-car/checklist', 'old-401k/checklist', 'lost-my-job/severance-review'];
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  for (const width of [1280, 375]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    for (const p of pages) {
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(String(e)));
      await page.addInitScript(() => { window.print = () => { window.__printed = (window.__printed || 0) + 1; }; window.__ev = []; });
      await page.goto(`${base}/tools/guides/${p}/`, { waitUntil: 'load' });
      await page.evaluate(() => { window.PT = window.PT || {}; const t = PT.track; PT.track = (n, ti) => { window.__ev.push(n); }; });
      for (const id of ['nl-success-top', 'nl-success-bottom']) assert.strictEqual(await page.isVisible('#' + id), false, `${p} ${id} hidden at start`);
      await page.click('#ck-print');
      assert.strictEqual(await page.evaluate(() => window.__printed), 1, `${p} print called`);
      assert.ok(await page.isVisible('#nl-success-top'), `${p} top line shown`);
      assert.strictEqual(await page.isVisible('#nl-success-bottom'), false, `${p} bottom still hidden`);
      const href = await page.getAttribute('#nl-success-top a', 'href');
      assert.strictEqual(href, 'https://pymtw.beehiiv.com/subscribe');
      await page.click('#ck-print'); // no duplicate shown event
      await page.click('#ck-print-2');
      assert.ok(await page.isVisible('#nl-success-bottom'), `${p} bottom line shown`);
      const ev = await page.evaluate(() => window.__ev);
      assert.strictEqual(ev.filter(e => e === 'nl-success-shown').length, 2, `${p} shown events ${ev}`);
      if (p.includes('severance')) {
        await ctx.grantPermissions(['clipboard-read', 'clipboard-write']);
        await page.click('#qs-copy');
        await page.waitForSelector('#nl-success-qs:not([hidden])', { timeout: 3000 });
      }
      const sw = await page.evaluate(() => document.documentElement.scrollWidth);
      assert.ok(sw <= width, `${p} no overflow at ${width} (${sw})`);
      const box = await page.locator('#nl-success-top a').boundingBox();
      assert.ok(box.height >= 18, `${p} link height ${box.height}`);
      await page.emulateMedia({ media: 'print' });
      assert.strictEqual(await page.isVisible('#nl-success-top'), false, `${p} hidden in print`);
      await page.emulateMedia({ media: 'screen' });
      if (process.env.SHOTS) {
        await page.locator('#nl-success-top').scrollIntoViewIfNeeded();
        await page.screenshot({ path: `${process.env.SHOTS}/${p.replace(/\//g, '_')}-${width}.png` });
      }
      assert.deepStrictEqual(errors, [], `${p} page errors`);
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  console.log('printables-success-subscribe-browser: ok');
})().catch(e => { console.error(e); process.exit(1); });
