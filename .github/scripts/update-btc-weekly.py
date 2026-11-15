#!/usr/bin/env python3
"""Rebuild tools/bitcoin-200-week-moving-average/data/weekly.json.

Free, keyless source: Blockchain.com Charts API "market-price" (daily average USD
price across major exchanges, history from 2010-08-18). Weekly price = the daily
value on each Sunday (00:00 UTC). The newest daily value is kept separately as
"latest" so the page can show a current-week reading.
Exits non-zero (so nothing is committed) if the download looks wrong.
"""
import json, sys, urllib.request, datetime as dt
from pathlib import Path
URL = "https://api.blockchain.info/charts/market-price?timespan=all&sampled=false&metadata=false&format=json"
OUT = Path(__file__).resolve().parents[2] / "tools/bitcoin-200-week-moving-average/data/weekly.json"
req = urllib.request.Request(URL, headers={"User-Agent": "pymtw-btc-200wma-updater (+https://pymtw.com/tools/)"})
vals = json.load(urllib.request.urlopen(req, timeout=60))["values"]
day = {dt.datetime.fromtimestamp(v["x"], dt.timezone.utc).date(): float(v["y"]) for v in vals if v["y"] and v["y"] > 0}
days = sorted(day)
first, last = days[0], days[-1]
today = dt.datetime.now(dt.timezone.utc).date()
if (today - last).days > 3: sys.exit("stale source data: newest day is %s" % last)
if first != dt.date(2010, 8, 18): sys.exit("unexpected first day %s" % first)
d = first
while d <= last:
    if d not in day: sys.exit("missing day %s" % d)
    d += dt.timedelta(days=1)
sunday = first + dt.timedelta(days=(6 - first.weekday()) % 7)
weekly = []
while sunday <= last:
    weekly.append(round(day[sunday], 2)); sunday += dt.timedelta(days=7)
if len(weekly) < 800 or min(weekly) <= 0: sys.exit("too few weeks")
out = {
 "source": "Blockchain.com Charts API, market-price (daily average USD price across major exchanges)",
 "sourceUrl": "https://www.blockchain.com/explorer/charts/market-price",
 "firstWeek": (first + dt.timedelta(days=(6 - first.weekday()) % 7)).isoformat(),
 "weekly": weekly,
 "latest": {"date": last.isoformat(), "price": round(day[last], 2)},
 "updated": last.isoformat(),
}
new = json.dumps(out, separators=(",", ":")) + "\n"
if OUT.exists() and OUT.read_text() == new: print("no change"); sys.exit(0)
OUT.write_text(new); print("wrote", len(weekly), "weeks through", last)
