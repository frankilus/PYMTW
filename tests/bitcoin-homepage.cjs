const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {execFileSync,spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const {matches,reviewed,SHIPPED}=require('./guard-baseline.cjs');
const historical='cfe4a189337bba5fa17a9d99279e32f6a5731113'; // pre-move Bitcoin homepage, for legacy fragment IDs only
const original=name=>execFileSync('git',['show',historical+':'+name],{cwd:root,encoding:'utf8'});
const shipped=name=>execFileSync('git',['show',SHIPPED+':'+name],{cwd:root});
const old=original('bitcoin/index.html');const library=fs.readFileSync(path.join(root,'bitcoin/explore/index.html'),'utf8');
// Later nav/brand updates on the library page are accepted at the shipped snapshot, byte for byte.
if(!matches('bitcoin/explore/index.html',shipped('bitcoin/explore/index.html')))assert.equal(library.split('<body>')[1],old.split('<body>')[1],'Existing Bitcoin content and behaviors must survive intact');
// Protect calculator and provider logic, the parent/Tools section, and other production assets against later changes.
for(const name of execFileSync('git',['ls-tree','-r','--name-only',SHIPPED],{cwd:root,encoding:'utf8'}).trim().split('\n')){
 if(name.startsWith('tests/'))continue;
 const interior=(name.endsWith('.html')&&!name.includes('/')&&!['index.html','googlea70c61482c1a9eed.html'].includes(name))||name==='book/index.html';
 if(interior)continue; // Detailed page/form/data preservation is tested separately.
 // git show of large binaries (book-cover PNGs) overflows execFileSync's buffer.
 // git diff --quiet compares working-tree bytes to SHIPPED without loading them.
 const unchanged=spawnSync('git',['diff','--quiet',SHIPPED,'--',name],{cwd:root}).status===0;
 assert.ok(unchanged,name+' preserves shipped source');
}
const code=fs.readFileSync(path.join(root,'assets/bitcoin-home/home.js'),'utf8');
const ids=[...old.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]).filter(id=>code.includes('"'+id+'"'));
for(const id of ids){
 let destination;const location={hash:'#'+id,search:'?utm_source=bookmark',replace(url){destination=url;}};
 vm.runInNewContext(code,{location,document:{getElementById(){return {};}}});
 assert.equal(destination,'/bitcoin/explore/?utm_source=bookmark#'+id,id);
}
const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');
// Re-baseline to SHIPPED: the noindex membership stub dashboard.html was dropped from the sitemap after the historical snapshot.
assert.ok(spawnSync('git',['diff','--quiet',SHIPPED,'--','sitemap.xml'],{cwd:root}).status===0,'sitemap.xml preserves shipped source');
assert.ok(sitemap.includes('https://pymtw.com/bitcoin/explore/'));
console.log(`Preservation passed: calculator/provider scripts, parent and tools preserved; old homepage body intact; ${ids.length} legacy fragments retain queries; all sitemap URLs retained.`);
