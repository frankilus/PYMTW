const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const site = path.resolve(__dirname, '..');
const C = require(path.join(site, 'tools/checkup/logic.js'));
const app = fs.readFileSync(path.join(site, 'tools/checkup/app.js'), 'utf8');
const key = 'pymtw-checkup-entry-v1';
function run(raw, saved, blocked) {
  const elements = new Map();
  const el = (selector) => {
    if (!elements.has(selector)) elements.set(selector, {style:{}, checked:false, innerHTML:'', textContent:'', classList:{add(){},remove(){}}});
    return elements.get(selector);
  };
  const tab = new Map(raw === undefined ? [] : [[key, raw]]);
  const localWrites = [];
  const sandbox = {
    window:{PT_CHECKUP:C},
    document:{querySelector:el},
    localStorage:{getItem:()=>saved || null,setItem:(...args)=>localWrites.push(args),removeItem:()=>localWrites.push('remove')},
    sessionStorage:{getItem:k=>{if(blocked) throw Error('blocked'); return tab.get(k)||null;},removeItem:k=>tab.delete(k)},
    location:{search:''},
    PT:{$$:()=>[]}, Date,
  };
  vm.runInNewContext(app, sandbox);
  return {elements,tab,localWrites,el};
}
const entry = (answer, created=Date.now()) => JSON.stringify({version:1,answer,created});
let count=0;
for (const answer of ['lt1','1to3','3to6','6plus']) {
  const r=run(entry(answer));
  assert.equal(r.el('#count').textContent, 'Question 2 of 14');
  assert.match(r.el('#qwrap').innerHTML, /high-interest debt/);
  assert.equal(r.tab.has(key), false, 'one-time copy cleared');
  assert.deepEqual(r.localWrites, [], 'no new persistent save');
  r.el('#back').onclick();
  assert.equal(r.el('#count').textContent, 'Question 1 of 14');
  assert.match(r.el('#qwrap').innerHTML, new RegExp('data-v="'+answer+'" aria-pressed="true"'));
  count++;
}
for (const raw of [undefined, 'broken', 'null', entry('invalid'),entry('1to3',Date.now()-600001),entry('1to3',Date.now()+60000),JSON.stringify({version:2,answer:'1to3',created:Date.now()})]) {
  const r=run(raw);
  assert.equal(r.el('#count').textContent, 'Question 1 of 14');
  assert.equal(r.tab.has(key), false);
  count++;
}
const saved=run(entry('1to3'), JSON.stringify({ef:'6plus',debt:'plan'}));
assert.equal(saved.el('#remember').checked, true);
assert.match(saved.el('#qwrap').innerHTML,/data-v="plan" aria-pressed="true"/);
saved.el('#back').onclick();
assert.match(saved.el('#qwrap').innerHTML,/data-v="1to3" aria-pressed="true"/);
assert.deepEqual(saved.localWrites, [], 'existing saved answers are not overwritten on arrival');
count++;
const blocked=run(undefined,undefined,true);
assert.equal(blocked.el('#count').textContent,'Question 1 of 14');
count++;
console.log(`${count} checkup handoff cases passed: valid answers, Back, clearing, no persistent writes, stale/malformed entries, saved answers, blocked storage.`);
