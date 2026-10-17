const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const base='cfe4a189337bba5fa17a9d99279e32f6a5731113';
const original=name=>execFileSync('git',['show',base+':'+name],{cwd:root,encoding:'utf8'});
const old=original('bitcoin/index.html');const library=fs.readFileSync(path.join(root,'bitcoin/explore/index.html'),'utf8');
assert.equal(library.split('<body>')[1],old.split('<body>')[1],'Existing Bitcoin content and behaviors must survive intact');
const changed=new Set(['bitcoin/index.html','sitemap.xml','tests/bitcoin-static.py','tests/bitcoin-browser.cjs']);
for(const name of execFileSync('git',['ls-tree','-r','--name-only',base],{cwd:root,encoding:'utf8'}).trim().split('\n')){
 if(changed.has(name))continue;
 const before=execFileSync('git',['show',base+':'+name],{cwd:root});
 let after=fs.readFileSync(path.join(root,name));
 // Interiors may add only the theme stylesheet; all content, metadata and scripts survive.
 if ((name.endsWith('.html') && !name.includes('/') && !['index.html','googlea70c61482c1a9eed.html'].includes(name)) || name==='book/index.html') {
  const link='  <link rel="stylesheet" href="/assets/bitcoin-theme.css">\n';
  assert.equal(after.toString().split(link).length,2,name+' loads theme exactly once');
  after=Buffer.from(after.toString().replace(link,''));
 }
 assert.deepEqual(after,before,name+' preserves original source apart from the interior theme link');
}
const code=fs.readFileSync(path.join(root,'assets/bitcoin-home/home.js'),'utf8');
const ids=[...old.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
for(const id of ids){
 let destination;const location={hash:'#'+id,search:'?utm_source=bookmark',replace(url){destination=url;}};
 vm.runInNewContext(code,{location,document:{getElementById(){return {};}}});
 assert.equal(destination,'/bitcoin/explore/?utm_source=bookmark#'+id,id);
}
const oldUrls=[...original('sitemap.xml').matchAll(/<loc>(.*?)<\/loc>/g)].map(m=>m[1]);const sitemap=fs.readFileSync(path.join(root,'sitemap.xml'),'utf8');for(const url of oldUrls)assert.ok(sitemap.includes('<loc>'+url+'</loc>'));assert.ok(sitemap.includes('https://pymtw.com/bitcoin/explore/'));
console.log(`Preservation passed: existing content, scripts and tools unchanged apart from homepage/sitemap and interior theme links; old homepage body intact; ${ids.length} legacy fragments retain queries; all sitemap URLs retained.`);
