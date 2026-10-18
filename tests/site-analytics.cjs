const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const code=fs.readFileSync(require('node:path').join(__dirname,'../assets/site-analytics.js'),'utf8');
function setup(dnt=false){const scripts=[],sends=[];let click;
const window={location:{pathname:'/tools/',search:'?salary=SECRET',hash:'#SECRET'},navigator:{doNotTrack:dnt?'1':'0'},requestIdleCallback:fn=>fn()};
const document={title:'Money Tools',querySelector:()=>null,addEventListener:(name,fn)=>{click=fn;},createElement:()=>({dataset:{}}),head:{appendChild(s){scripts.push(s);const c=window.goatcounter;assert.equal(c.no_onload,true);assert.equal(c.no_events,true);
// Emulate the provider's documented get_data API and its current extra query field.
c.get_data=vars=>({p:vars?.path||c.path(),r:'https://example.com/?SECRET',q:window.location.search,t:vars?.title||c.title,e:!!vars?.event});c.count=vars=>sends.push(c.get_data(vars));s.onload();}}};
vm.runInNewContext(code,{window,navigator:window.navigator,location:window.location,document,URL,requestIdleCallback:window.requestIdleCallback,setTimeout:fn=>fn()});
return {scripts,sends,click};}
let t=setup();assert.equal(t.scripts.length,1);assert.equal(t.sends.length,1);assert.equal(t.sends[0].p,'/tools/');assert.equal(t.sends[0].r,'');assert.ok(!('q' in t.sends[0]));
for(const [url,name] of [['https://amzn.to/4zwsLbQ','amazon-click'],['https://pymtwtools.beehiiv.com/subscribe','money-newsletter-click'],['https://pymtw.beehiiv.com/subscribe','bitcoin-newsletter-click']]){t.click({target:{closest:()=>({href:url+'?sensitive=SECRET'})}});assert.equal(t.sends.at(-1).t,name);}
assert.ok(!JSON.stringify(t.sends).includes('SECRET'));assert.equal(setup(true).scripts.length,0);
console.log('Analytics checks passed: no automatic send before sanitation, no query/referrer payload, fixed Amazon/newsletter events, DNT disables loading.');
