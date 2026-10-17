const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const code = fs.readFileSync(require('node:path').join(__dirname, '../assets/home/legacy-links.js'), 'utf8');
for (const [hash, expected] of [
  ['#learn', '/bitcoin/?utm_source=review#learn'],
  ['#why-bitcoin', '/bitcoin/?utm_source=review#why-bitcoin'],
  ['#getting-started', '/bitcoin/?utm_source=review#getting-started'],
  ['#directory', undefined], ['#unknown', undefined], ['#%E0%A4%A', undefined], ['', undefined]
]) {
  let destination, listener;
  const location = {hash, search:'?utm_source=review', replace(url) {destination=url;}};
  vm.runInNewContext(code, {location, window:{addEventListener(event, fn) {assert.equal(event, 'hashchange'); listener=fn;}}});
  assert.equal(destination, expected, hash);
  location.hash='#faq'; listener();
  assert.equal(destination, '/bitcoin/?utm_source=review#faq');
}
console.log('Legacy fragment checks passed: Bitcoin sections, parent sections, unknown/malformed hashes, query preservation and hash changes.');
