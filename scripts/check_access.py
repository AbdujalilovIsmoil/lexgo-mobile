#!/usr/bin/env python3
"""Shows what an account (e.g. the superadmin) may do on the LexGo backend.

Run it in your own terminal:  python3 scripts/check_access.py
It asks for the phone, password and (if required) the 2FA code, then prints
the role, permissions and whether document analysis/upload is allowed.
The access token is never printed or saved.
"""
import getpass, json, os, urllib.error, urllib.request, uuid

BASE = os.environ.get("LEXGO_API", "https://lexgo.api.cognilabs.org").rstrip("/")


def call(method, path, body=None, token=None, raw=None, ctype="application/json"):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(BASE + path, data=data, method=method)
    req.add_header("Accept", "application/json")
    if data is not None:
        req.add_header("Content-Type", ctype)
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=90) as r:
            return r.status, json.loads(r.read() or b"{}")
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read() or b"{}")
        except ValueError:
            return e.code, {}


def login():
    phone = input("Phone (+998...): ").strip()
    status, d = call("POST", "/auth/login", {"phone": phone, "password": getpass.getpass("Password: ")})
    if status == 428:
        ch = d.get("detail") if isinstance(d.get("detail"), dict) else d
        status, d = call("POST", "/auth/login/2fa", {"verification_id": ch.get("verification_id"), "code": input("2FA code: ").strip()})
    token = d.get("access_token") or d.get("token")
    if not token:
        raise SystemExit(f"Login failed (HTTP {status}): {d.get('detail')}")
    return token


def multipart(name, text):
    b = uuid.uuid4().hex
    head = f'--{b}\r\nContent-Disposition: form-data; name="file"; filename="{name}"\r\nContent-Type: text/plain\r\n\r\n'
    return (head + text + f"\r\n--{b}--\r\n").encode(), f"multipart/form-data; boundary={b}"


def main():
    tok = login()
    s, me = call("GET", "/auth/me", token=tok)
    u = me.get("user", me)
    print(f"\n/auth/me -> {s}\n  role: {u.get('role')}\n  roles: {u.get('roles')}\n  permissions ({len(u.get('permissions') or [])}): {u.get('permissions')}")
    s, perms = call("GET", "/admin/permissions", token=tok)
    print(f"\n/admin/permissions -> {s}: {[p.get('code') for p in perms] if isinstance(perms, list) else perms.get('detail')}")
    s, q = call("POST", "/ai/document-analysis/quote", {"page_count": 1, "ocr": False, "lawyer_review": False, "urgency": "normal"}, tok)
    print(f"\nquote -> {s}: payment_required={q.get('payment_required')} total={q.get('total_amount')} ai_included={q.get('ai_included_in_subscription')} detail={q.get('detail')}")
    if input("\nRun a REAL tiny upload test (runs one AI analysis)? [y/N] ").lower() == "y":
        raw, ct = multipart("test.txt", "Shartnoma. Sotuvchi tovarni 10 kun ichida yetkazadi. Xaridor 100% oldindan to'laydi. Nizolar sudda hal qilinadi. " * 3)
        s, a = call("POST", "/ai/document-analysis/file", token=tok, raw=raw, ctype=ct)
        print(f"upload -> {s}: pages={a.get('page_count')} summary={str(a.get('summary'))[:100]!r} detail={a.get('detail')}")


if __name__ == "__main__":
    main()
