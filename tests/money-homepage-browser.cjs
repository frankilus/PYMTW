const assert = require('node:assert/strict');
const fs = require('node:fs');
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:8781';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    for (const width of [320, 390, 768, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: 950 }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      // Keep the test local; no newsletter submissions or third-party analytics requests.
      await page.route('**/*', route => route.request().url().startsWith(base + '/') ? route.continue() : route.abort());
      await page.goto(base + '/tools/');
      await page.evaluate(() => document.fonts.ready);
      const expected = await page.evaluate(() => window.PT_CATS.flatMap(c => c.tools).filter(t => t.live).map(t => t.slug).sort());
      const categoryLinks = new Set();
      for (const category of ['everyday', 'debt', 'home', 'retirement', 'bitcoin']) {
        await page.locator(`[data-category="${category}"]`).focus();
        await page.keyboard.press('Enter');
        assert.equal(await page.locator('.category-button[aria-pressed=true]').count(), 1);
        assert.equal(await page.locator(`[data-category="${category}"]`).getAttribute('aria-pressed'), 'true');
        const links = await page.locator('a.directory-tool').evaluateAll(els => els.map(el => el.getAttribute('href')));
        assert.ok(links.length > 0);
        links.forEach(link => categoryLinks.add(link.replace(/^\.\//, '').replace(/\/$/, '')));
      }
      assert.deepEqual([...categoryLinks].sort(), expected, 'every live catalog tool must be discoverable');
      await page.locator('[data-category=all]').click();
      assert.equal(await page.locator('a.directory-tool').count(), expected.length);
      await page.locator('[data-category=everyday]').click();
      assert.equal(await page.locator('#moments > .photo-moment').count(), 1);
      assert.equal(await page.evaluate(() => document.querySelector('#moments').nextElementSibling.id), 'guides');
      assert.equal(await page.locator('.life-guides-grid > .life-guide-choice').count(), 6);
      assert.equal(await page.locator('#guides a').count(), 8); // the job card links to both lost-my-job and old-401k
      for (const img of await page.locator('#guides img').all()) {
        await img.scrollIntoViewIfNeeded();
        await img.evaluate(el => el.decode());
      }
      for (const [query, slug] of [['emergency savings', 'emergency-fund-runway'], ['wedding budget', 'true-cost-of-a-wedding'], ['401k', 'explain-my-401k']]) {
        await page.locator('#finder-input').fill(query);
        await page.locator('#finder-form button').click();
        assert.ok(await page.locator(`#finder-results a[href*="${slug}"]`).count());
      }
      if (width === 1280) {
        const urls = [...expected.map(slug => '/tools/' + slug + '/'), ...await page.locator('#guides a').evaluateAll(els => els.map(el => el.getAttribute('href')))];
        for (const url of new Set(urls)) assert.equal((await page.request.get(base + url)).status(), 200, url);
      }
      if (width === 390) {
        await page.locator('#menu-toggle').click();
        await page.locator('#main-nav a[href="#guides"]').click();
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'false');
        assert.ok(page.url().endsWith('#guides'));
      }
      await page.locator('#how summary').click();
      assert.equal(await page.locator('#how').getAttribute('open'), '');
      assert.equal(await page.locator('#example, #mobile-search-dock').count(), 0);
      assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(els => els.map(el => el.getAttribute('href')).filter(href => !document.getElementById(href.slice(1)))), []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      if (process.env.AXE_PATH) {
        await page.addScriptTag({ content: fs.readFileSync(process.env.AXE_PATH, 'utf8') });
        const violations = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
        assert.deepEqual(violations, []);
      }
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS homepage: all live catalog tools reachable, categories and keyboard controls, search, seven guide destinations, six photos, mobile menu, FAQ, anchors, responsive layout, and optional WCAG AA checks.');
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exit(1); });
