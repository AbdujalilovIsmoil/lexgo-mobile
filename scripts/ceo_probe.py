#!/usr/bin/env python3
"""Shows where the CEO money KPIs (ARR, ARPU, take rate, LTV, ...) are in the backend answer.

Run it in your own terminal:  python3 scripts/ceo_probe.py
Logs in like check_access.py (phone, password, 2FA), then GETs /analytics/ceo and /admin/dashboard and prints
the status, the top-level keys and every place a KPI-looking key is found. The token is never printed.
"""
from check_access import call, login

WANT = ("arr", "arpu", "take_rate", "ltv", "gmv", "mrr", "cac", "platform")


def walk(v, path=""):
    if isinstance(v, dict):
        for k, x in v.items():
            p = f"{path}.{k}" if path else k
            if any(w in k.lower() for w in WANT):
                print(f"  {p} = {x!r}"[:160])
            walk(x, p)
    elif isinstance(v, list) and v:
        walk(v[0], f"{path}[0]")


def main():
    tok = login()
    for path in ("/analytics/ceo", "/admin/dashboard", "/admin/dashboard/kpis", "/analytics/revenue", "/analytics/unit-economics"):
        s, d = call("GET", path, token=tok)
        keys = list(d)[:40] if isinstance(d, dict) else type(d).__name__
        print(f"\n{path} -> {s}\n  keys: {keys}")
        if s == 200:
            walk(d)


if __name__ == "__main__":
    main()
