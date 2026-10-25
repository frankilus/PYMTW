"""Preserve publication/privacy boundaries through the approved guide follow-up."""
from pathlib import Path
import subprocess,re,json,os
root=Path(__file__).resolve().parents[1]
import sys;sys.path.insert(0,str(Path(__file__).resolve().parent));from guard_baseline import matches,reviewed,either
base='a5afedc49c21fcbb83393fb6e5a7c25af504c790'
# PRs 23/24 are the baseline; allow only this follow-up’s reviewed files.
allowed={
 'tools/guides/first-home/index.html',
 'tools/guides/lost-my-job/index.html',
 'tools/guides/true-cost-of-a-baby/index.html',
 'tools/guides/true-cost-of-a-car/index.html',
 'tools/guides/true-cost-of-a-wedding/index.html',
 'tools/guides/true-cost-of-owning-a-home/index.html',
 'tools/index.html',
 'tools/llms.txt',
 'tools/router.js',
 'tools/v7/home.js',
 'tests/true-cost-guides-static.py',
 'tests/round4-static.py',
 'tests/v7-preservation.py',
 'tests/v7-links.py',
 'tests/v7-browser.cjs',
 'tests/true-cost-guides-browser.cjs'
}
for name in subprocess.check_output(['git','ls-tree','-r','--name-only',base],cwd=root,text=True).splitlines():
 if name not in allowed:
  assert matches(name,subprocess.check_output(['git','show',base+':'+name],cwd=root)),name+' unexpected change'
config=(root/'_config.yml').read_text()
excluded={line.strip()[2:] for line in config.splitlines() if line.strip().startswith('- ')}
notes={p.name for p in root.glob('*.md')}
assert notes<=excluded and 'tests/' in excluded
assert not any('*' in name for name in excluded),'Keep vendor licenses out of a blanket exclusion'
headline='Get one clear money idea a week'
for name in ['bitcoin/index.html','tools/paycheck-decoder/index.html','tools/explain-my-401k/index.html']:
 before=subprocess.check_output(['git','show',base+':'+name],cwd=root,text=True)
 assert matches(name,before.replace('A little clarity, delivered.',headline))
for slug in ['paycheck-decoder','explain-my-401k','bitcoin-tax-lot-cleanup']:
 s=(root/'tools'/slug/'index.html').read_text()
 assert not any(x in s for x in ['site-analytics','googletagmanager','gc.zgo.at','<iframe'])
 assert '<meta name="referrer" content="no-referrer">' in s
 before=subprocess.check_output(['git','show',base+':tools/'+slug+'/index.html'],cwd=root,text=True)
 assert re.search(r'<meta http-equiv="Content-Security-Policy"[^>]+>',s)[0]==re.search(r'<meta http-equiv="Content-Security-Policy"[^>]+>',before)[0]
if os.environ.get('BUILT_SITE'):
 built=Path(os.environ['BUILT_SITE']);assert built.is_dir()
 for name in notes:
  assert not (built/name).exists(),name+' published'
  assert not (built/Path(name).with_suffix('.html')).exists(),name+' rendered as HTML'
 assert not (built/'tests').exists()
 pages=[p for p in root.rglob('*.html') if '.git' not in p.parts and 'tests' not in p.relative_to(root).parts]
 for p in pages:
  name=p.relative_to(root);assert (built/name).exists(),str(name)+' missing'
  assert (built/name).read_bytes()==p.read_bytes(),str(name)+' changed by build'
 preserved=['llms.txt','tools/llms.txt','robots.txt','tools/robots.txt','sitemap.xml','tools/sitemap.xml','googlea70c61482c1a9eed.html','CNAME']
 preserved += [str(p.relative_to(root)) for p in (root/'tools/paycheck-decoder/vendor').rglob('*') if p.is_file()]
 preserved += [str(p.relative_to(root)) for p in (root/'assets/fonts').rglob('*') if p.is_file()]
 for name in preserved:assert (built/name).read_bytes()==(root/name).read_bytes(),name+' altered/removed from build'
 print(f'PASS production build: {len(notes)} root notes and tests excluded; {len(pages)} HTML pages and {len(preserved)} required/support/vendor/font files preserved byte-for-byte, including licenses and CNAME.')
print('PASS follow-up scope: only approved guide/search/test files changed; calculations, imports, catalogs, data, sitemap URLs and privacy/CSP unchanged.')
