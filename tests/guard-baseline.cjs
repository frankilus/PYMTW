// JavaScript twin of tests/guard_baseline.py; see that file for the rationale.
const {execFileSync}=require('node:child_process');const fs=require('node:fs');const path=require('node:path');
const root=path.resolve(__dirname,'..');
const REVIEWED='117a2a7c8b71ff429acf2bdbca6da0b1b10a23d3';
const shared=JSON.parse(execFileSync('python3',['-c','import json,sys;sys.path.insert(0,"tests");import guard_baseline as g;print(json.dumps({"edits":g.APPROVED_EDITS,"tests":sorted(g.THIS_PR_TESTS)}))'],{cwd:root,encoding:'utf8'}));
const APPROVED_EDITS=shared.edits;const THIS_PR_TESTS=new Set(shared.tests);
const reviewed=name=>{const raw=execFileSync('git',['show',REVIEWED+':'+name],{cwd:root});if(!APPROVED_EDITS[name])return raw;let data=raw.toString('utf8');for(const [o,n] of APPROVED_EDITS[name]||[]){if(data.split(o).length!==2)throw new Error('approved edit not found once: '+name);data=data.replace(o,()=>n);}return Buffer.from(data);};
const matches=(name,expected)=>{if(THIS_PR_TESTS.has(name))return true;const now=fs.readFileSync(path.join(root,name));return now.equals(Buffer.isBuffer(expected)?expected:Buffer.from(expected))||now.equals(reviewed(name));};
module.exports={REVIEWED,reviewed,matches};
