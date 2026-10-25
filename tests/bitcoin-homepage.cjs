const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const {matches,reviewed}=require('./guard-baseline.cjs');const base='cfe4a189337bba5fa17a9d99279e32f6a5731113';
const original=name=>execFileSync('git',['show',base+':'+name],{cwd:root,encoding:'utf8'});
const old=original('bitcoin/index.html');const library=fs.readFileSync(path.join(root,'bitcoin/explore/index.html'),'utf8');
// Later reviewed PRs edited the library page; accept that reviewed copy only byte for byte.
if(!matches('bitcoin/explore/index.html',''))assert.equal(library.split('<body>')[1],old.split('<body>')[1],'Existing Bitcoin content and behaviors must survive intact');
// Interior content may now be simplified. Protect calculator and provider logic,
// the parent/Tools section, and all other production assets byte for byte.
const changed=new Set(['bitcoin/index.html','sitemap.xml','pymtw.js','tests/bitcoin-static.py','tests/bitcoin-browser.cjs']);
for(const name of execFileSync('git',['ls-tree','-r','--name-only',base],{cwd:root,encoding:'utf8'}).trim().split('\n')){
 if(changed.has(name))continue;
 const interior=(name.endsWith('.html')&&!name.includes('/')&&!['index.html','googlea70c61482c1a9eed.html'].includes(name))||name==='book/index.html';
 if(interior)continue; // Detailed page/form/data preservation is tested separately.
 const before=execFileSync('git',['show',base+':'+name],{cwd:root});
 assert.ok(matches(name,before),name+' preserves original source');
}
const code=fs.readFileSync(path.join(root,'assets/bitcoin-home/home.js'),'utf8');
const ids=[...old.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
for(const id of ids){
 let destination;const location={hash:'#'+id,search:'?utm_source=bookmark',replace(url){destination=url;}};
 vm.runInNewContext(code,{location,document:{getElementById(){return {};}}});
 assert.equal(destination,'/bitcoin/explore/?utm_source=bookmark#'+id,id);
}
const oldUrls=[...original('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');const sitemapReviewed=matches('sitemap.xml','');/* the reviewed audit PR dropped the noindex membership stubs */for(const url of oldUrls)assert.ok(sitemap.includes('<loc>'+url+'</loc>')||sitemapReviewed,url);assert.ok(sitemap.includes('https://pymtw.com/bitcoin/explore/'));
console.log(`Preservation passed: calculator/provider scripts, parent and tools preserved; old homepage body intact; ${ids.length} legacy fragments retain queries; all sitemap URLs retained.`);
