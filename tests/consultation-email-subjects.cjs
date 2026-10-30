/* Programs choices and card shortcuts must produce the matching email subject. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const options = [
  ['busy-professionals', 'Bitcoin for Busy Professionals — 75 min, one client ($79 USD)'],
  ['self-custody', 'Self-Custody Without the Fear — 90 min, one client ($129 USD)'],
  ['couples-families', 'Bitcoin for Couples & Families — 90 min, one household ($199 USD)'],
  [null, 'PYMTW Professional membership'],
  [null, 'Not sure yet — help me choose'],
].map(([id,text])=>({dataset:id?{consultation:id}:{},textContent:text,value:text}));
let submit;
const form = {elements:{subject:{value:''}},addEventListener(type,fn,capture){assert.equal(type,'submit'); assert.equal(capture,true); submit=fn;}};
const interest = {options,selectedIndex:0,form,get value(){return options[this.selectedIndex].value;},set value(v){this.selectedIndex=options.findIndex(o=>o.value===v);}};
const links=options.slice(0,3).map(o=>({dataset:o.dataset,addEventListener(type,fn){assert.equal(type,'click');this.click=fn;}}));
vm.runInNewContext(fs.readFileSync('assets/private-consultations.js','utf8'),{document:{getElementById:()=>interest,querySelectorAll:()=>links}});
for(let i=0;i<options.length;i++){
  interest.selectedIndex=i; submit();
  assert.equal(form.elements.subject.value,i<3?'PYMTW consultation request: '+options[i].textContent.split(' — ')[0]:'PYMTW program inquiry: '+options[i].textContent);
}
for(const link of links){link.click();submit();assert.ok(form.elements.subject.value.endsWith(options[interest.selectedIndex].textContent.split(' — ')[0]));}
// Reset/default selection must not inherit the previous consultation's subject.
interest.selectedIndex=0;submit();assert.equal(form.elements.subject.value,'PYMTW consultation request: Bitcoin for Busy Professionals');
vm.runInNewContext(fs.readFileSync('assets/private-consultations.js','utf8'),{document:{getElementById:()=>null}});
console.log('PASS: all five Programs subjects, three card preselection paths, reset selection and missing form guard.');
