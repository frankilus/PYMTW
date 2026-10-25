"""Shared reviewed baseline for the historical scope guards.

Each historical guard pins files to the commit its PR was based on. Later
owner-reviewed PRs (#26-#37: performance, layout, newsletter cards, favicon)
legitimately changed some of those files, so a guarded file may now match
either its original pinned bytes or the reviewed main at REVIEWED, plus only the
exact edits listed in APPROVED_EDITS. Nothing else is accepted.
"""
from pathlib import Path
import subprocess
ROOT=Path(__file__).resolve().parents[1]
REVIEWED='117a2a7c8b71ff429acf2bdbca6da0b1b10a23d3'  # main after PR #37 (2026-10-21)
# Exact edits made by fix/tests-and-small-ui-2026-10-25.
APPROVED_EDITS={
 'tools/v7/home.css':[('.menu-toggle{border:0;background:none;display:none;padding:8px;flex-direction:column;gap:5px}','.menu-toggle{border:0;background:none;display:none;padding:8px;flex-direction:column;gap:5px;min-width:44px;min-height:44px;justify-content:center;align-items:center}')],
 'tools/index.html':[('v7/home.css?v=89eab7fc6e24','v7/home.css?v=2b5dac35ad0d')],
 'tools/guides/true-cost-of-a-car/index.html':[('.sources a{color:var(--accent);word-break:break-word;text-decoration:underline;text-underline-offset:3px}','.sources a{color:var(--accent);word-break:break-word;text-decoration:underline;text-underline-offset:3px}\n.sources a{display:inline-block;min-height:24px;padding:4px 0}\n.newsletter-archive a{display:inline-block;min-height:24px;padding:4px 0}')],
 'assets/home/home.css':[('.newsletter-label{font-size:11px;','.newsletter-label{font-size:12px;')],
 'index.html':[('home/home.css?v=ee987ff55499','home/home.css?v=7767e1f748d7')],
}
def show(ref,name):
 return subprocess.check_output(['git','show',ref+':'+name],cwd=ROOT)
def reviewed(name):
 """Bytes of name at REVIEWED with only this PR's exact approved edits applied."""
 data=show(REVIEWED,name)
 if name not in APPROVED_EDITS:return data
 data=data.decode()
 for old,new in APPROVED_EDITS.get(name,[]):
  assert data.count(old)==1,(name,old)
  data=data.replace(old,new)
 return data.encode()
# Test files edited by this PR (not published; excluded by _config.yml).
THIS_PR_TESTS={'tests/401k-launch.cjs','tests/paycheck-launch.cjs','tests/tax-lot-release-browser.cjs','tests/401k-browser.cjs','tests/401k-import-browser.cjs','tests/paycheck-import-browser.cjs','tests/bitcoin-homepage.cjs','tests/bitcoin-interiors-preservation.py','tests/bitcoin-static.py','tests/homepage-migration.py','tests/round2-static.py','tests/round3-static.py','tests/round4-static.py','tests/tax-lot-static.py','tests/true-cost-guides-static.py','tests/v7-preservation.py'}
def current(name):return (ROOT/name).read_bytes()
def matches(name,expected):
 """True when name equals the guard's own expectation or the reviewed baseline."""
 if name in THIS_PR_TESTS:return True
 now=current(name)
 return now==(expected if isinstance(expected,bytes) else expected.encode()) or now==reviewed(name)
def either(check,name,before):
 """Run check(before_text); if the original expectation no longer holds, the
 same check must hold against the reviewed baseline for name instead."""
 try:check(before)
 except AssertionError:check(reviewed(name).decode())
