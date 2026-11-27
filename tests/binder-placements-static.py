"""Binder-click placements on Bitcoin pages (2026-11-27): the existing Household Plan links on the
200-week MA tracker and the DCA backtester carry data-binder-placement so tools.js counts them as
event/<page>/binder-click. Both pages load tools.js; links still go to the free tool, not checkout."""
from pathlib import Path
R=Path(__file__).resolve().parents[1]
for f,pl in [('tools/bitcoin-200-week-moving-average/index.html','wm-related'),('tools/bitcoin-dca-backtester/index.html','dca-related')]:
    s=(R/f).read_text()
    assert s.count('data-binder-placement=')==1,f
    assert f'href="../bitcoin-household-plan/" data-binder-placement="{pl}"' in s,f
    assert 'tools.js' in s,f
    assert 'buy.stripe.com' not in s,f
assert 'a[data-binder-placement]' in (R/'tools/tools.js').read_text()
print('binder placements ok: wm-related, dca-related')
