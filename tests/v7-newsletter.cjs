const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname,'../tools/v7/newsletter.js'),'utf8');
function setup(open=false) {
  const scripts=[];const timers=new Map();let n=0;
  const details={open,addEventListener(type,callback){this.toggle=callback;}};
  const box={dataset:{formId:'e52526c9-fd98-4fde-bda0-ee1a61507c09'},iframe:null,appendChild(script){scripts.push(script);},querySelector(sel){return sel==='iframe'?this.iframe:null;}};
  const status={textContent:''};const elements={'newsletter-inline':details,'beehiiv-signup-widget':box,'newsletter-form-status':status};
  vm.runInNewContext(source,{document:{getElementById:id=>elements[id],createElement:()=>({setAttribute(k,v){this[k]=v;}}),body:{appendChild(){}}},window:{setTimeout(fn){timers.set(++n,fn);return n;},clearTimeout(id){timers.delete(id);}}});
  return {details,box,status,scripts,timers};
}
let t=setup();assert.equal(t.scripts.length,0,'no provider request until user opens optional form');
t.details.open=true;t.details.toggle();assert.equal(t.scripts.length,1);assert.equal(t.scripts[0]['data-beehiiv-form'],t.box.dataset.formId);assert.equal(t.scripts[0].src,'https://subscribe-forms.beehiiv.com/v3/loader.js');
t.details.toggle();assert.equal(t.scripts.length,1,'no duplicate loader');
t.scripts[0].onerror();assert.match(t.status.textContent,/could not load/);assert.equal(t.timers.size,0);
t=setup(true);t.scripts[0].onload();assert.match(t.status.textContent,/If it stalls/);assert.equal(t.timers.size,1,'timeout stays armed after loader onload');assert.doesNotMatch(t.status.textContent,/success|subscribed/i);
[...t.timers.values()][0]();assert.match(t.status.textContent,/has not appeared/,'loader loaded but rendered no iframe');
t=setup(true);t.scripts[0].onload();t.box.iframe={};[...t.timers.values()][0]();assert.match(t.status.textContent,/If it stalls/,'no fallback once iframe rendered');assert.doesNotMatch(t.status.textContent,/success|subscribed/i);
t=setup(true);[...t.timers.values()][0]();assert.match(t.status.textContent,/has not appeared/);
const html=fs.readFileSync(path.join(__dirname,'../tools/index.html'),'utf8');assert.match(html,/href="https:\/\/pymtw.beehiiv.com\/subscribe"/);assert.ok(html.includes('Subscribe free on Beehiiv'));assert.ok(!html.includes('pymtwtools.beehiiv.com'),'no Next Dollar links since PR #55');
// PR #55 removed the optional embedded form; the loader must stay inert on the page (no elements, no provider request).
assert.ok(!html.includes('id="newsletter-inline"')&&!html.includes('data-form-id='));{const scripts=[];vm.runInNewContext(source,{document:{getElementById:()=>null,createElement:()=>{const o={setAttribute(){}};scripts.push(o);return o;},body:{appendChild(){}}},window:{setTimeout(){},clearTimeout(){}}});assert.equal(scripts.length,0,'inert without the form');}
console.log('Newsletter checks passed: explicit opt-in load, duplicate protection, failure/timeout guidance, no false success, direct hosted signup.');
