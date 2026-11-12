#!/usr/bin/env python3
"""Generates design/home-screens-v3.html — 4 new Home variants (Mijoz + Advokat) in the spirit of
Aniq / Tun / Yorqin from home-screens.html. Reuses icons, logo and status bar from generate-home-screens.py."""
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "home-screens-v3.html")
ONLY = sys.argv[2] if len(sys.argv) > 2 else None

# --- shared helpers (icons, logo, status bar) from the first generator ---
_src = open(os.path.join(HERE, "generate-home-screens.py"), encoding="utf-8").read()
_head = _src.split("# ============================================================\n# V1")[0]
_ns = {"__name__": "base"}
_argv, sys.argv = sys.argv, ["base", os.devnull]
exec(_head, _ns)
sys.argv = _argv
I, ic, logo, status_bar, home_ind = _ns["I"], _ns["ic"], _ns["logo"], _ns["status_bar"], _ns["home_ind"]
I.update({
    "send": '<path d="M21.5 2.5 10.5 13.5"/><path d="M21.5 2.5 15 21.5l-4.5-8-8-4.5z"/>',
    "chevd": '<path d="m6 9 6 6 6-6"/>',
    "dot3": '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
    "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    "flame": '<path d="M12 21.5c4 0 7-2.7 7-6.6 0-4.4-4-6.4-4.4-11.4C11.4 5.8 9.5 8.6 9.6 11.6 8.4 10.8 7.7 9.6 7.5 8.4 5.8 10 5 12.3 5 14.9c0 3.9 3 6.6 7 6.6z"/>',
})

CLIENT_TABS = [("home", "Asosiy"), ("grid", "Xizmatlar"), ("spark", "AI"), ("bag", "Buyurtmalar"), ("msg", "Xabarlar")]
PRO_TABS = [("home", "Asosiy"), ("inbox", "So'rovlar"), ("spark", "AI"), ("users", "Mijozlar"), ("msg", "Xabarlar")]


def ring(size, stroke, pct, track, color, rot=-90):
    r = (size - stroke) / 2
    c = 2 * 3.14159 * r
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{track}" stroke-width="{stroke}"/>'
            f'<circle cx="{size/2}" cy="{size/2}" r="{r}" fill="none" stroke="{color}" stroke-width="{stroke}" stroke-linecap="round" '
            f'stroke-dasharray="{c*pct:.1f} {c:.1f}" transform="rotate({rot} {size/2} {size/2})"/></svg>')


# ============================================================
# 05 — "Ufq" : clean light evolved · DM Sans · unified action card, ticket, time grid
# ============================================================
def u_tabbar(tabs, badges):
    out = []
    for i, (n, l) in enumerate(tabs):
        if n == "spark":
            out.append(f'<div class="u-tab"><div class="u-ai">{ic("spark", 24, "#FFFFFF", 2)}</div></div>')
            continue
        on = i == 0
        col = "#0057F2" if on else "#98A2B3"
        b = f'<span class="u-badge">{badges[i]}</span>' if i in badges else ""
        bar = '<i class="u-tab-bar"></i>' if on else '<i class="u-tab-bar" style="background:transparent"></i>'
        out.append(f'<div class="u-tab">{bar}<div class="rel">{ic(n, 24, col, 2 if on else 1.7)}{b}</div><span style="color:{col};font-weight:{700 if on else 500}">{l}</span></div>')
    return f'<div class="u-tabbar"><div class="u-tabrow">{"".join(out)}</div>{home_ind("#101828")}</div>'


def u_head(t, s, right):
    return f'''<div class="u-head"><div class="row g10 ac">{logo(34)}<div class="col g2"><span class="u-brand">{t}</span><span class="u-cap">{s}</span></div></div><div class="row g8 ac">{right}</div></div>'''


def u_btn(n, dot=False):
    return f'<div class="u-ib">{ic(n, 21, "#101828", 1.8)}{"<span class=u-dot></span>" if dot else ""}</div>'


def u_client():
    acts = [("bolt", "Tezkor advokat", "24/7 · 15 daq", "#EFF4FF", "#0057F2"),
            ("siren", "SOS", "Bitta tugma", "#FEF3F2", "#F04438"),
            ("car", "Avtohalokat", "Joyida maslahat", "#FFF6ED", "#EF6820")]
    ac = '<i class="u-vd"></i>'.join(f'<div class="u-act"><div class="u-act-ic" style="background:{bg}">{ic(n, 22, c, 2)}</div><span class="u-act-t">{t}</span><span class="u-act-s">{s}</span></div>' for n, t, s, bg, c in acts)
    svc = [("heart", "Oilaviy"), ("brief", "Mehnat"), ("building", "Mulk"), ("trend", "Biznes"),
           ("scale", "Jinoiy"), ("file", "Hujjatlar"), ("doc_ai", "Tahlil"), ("grid", "Barchasi")]
    sv = "".join(f'<div class="u-svc"><div class="u-svc-ic">{ic(n, 24, "#101828" if n != "grid" else "#0057F2", 1.7)}</div><span>{l}</span></div>' for n, l in svc)
    law = [("DR", "Dilnoza Rahimova", "Oila huquqi", "4.9", "1.2 km", "#DCE8FF", "#0057F2"),
           ("SA", "Sardor Aliyev", "Mehnat huquqi", "4.8", "2.0 km", "#DCFAE6", "#079455"),
           ("MN", "Malika Nur", "Biznes huquqi", "5.0", "3.4 km", "#FEE4E2", "#D92D20")]
    lw = "".join(f'''<div class="u-lw"><div class="u-av" style="background:{bg};color:{c}">{a}<i></i></div>
<div class="col g2 f1"><span class="u-t15">{n}</span><span class="u-t13 row g4 ac">{s} · {ic("star", 12, "#F79009", 0, "#F79009")}{r} · {d}</span></div>
<div class="u-ghost">Yozish</div></div>''' for a, n, s, r, d, bg, c in law)
    steps = [("Yuborildi", "done"), ("Qabul", "done"), ("Jarayonda", "now"), ("Yakun", "")]
    st = "".join(f'<div class="u-node {k}"><i></i><span>{l}</span></div>' for l, k in steps)
    return f'''<div class="phone u" data-name="05 Ufq · Mijoz">
{status_bar("#101828")}
{u_head("Tezkor Himoya", ic("pin", 12, "#98A2B3", 2) + "Toshkent", u_btn("bell", True) + '<div class="u-me">AK</div>')}
<div class="u-body">
  <div class="row jb ac"><span class="u-h1">Xayrli kun, Aziz</span><span class="u-date">12 noy</span></div>

  <div class="u-help">
    <div class="u-help-in">
      <div class="u-spark">{ic("spark", 18, "#FFFFFF", 2)}</div>
      <span class="u-ph f1">Muammoingizni yozing…</span>
      {ic("mic", 20, "#667085", 1.8)}
    </div>
    <div class="u-acts">{ac}</div>
  </div>

  <div class="u-sec"><span class="u-h2">Faol buyurtma</span><span class="u-link">Barchasi</span></div>
  <div class="u-ticket">
    <div class="u-tk-top">
      <div class="row jb ac"><span class="u-pill" style="background:#ECFDF3;color:#067647"><i style="background:#17B26A"></i>Jarayonda</span><span class="u-t13">#LX-2048</span></div>
      <span class="u-tk-t">Mehnat nizosi bo'yicha maslahat</span>
      <div class="row g10 ac"><div class="u-av sm" style="background:#DCE8FF;color:#0057F2">DR</div><span class="u-t13 f1"><b>Dilnoza Rahimova</b> · advokat</span>{ic("msg", 20, "#101828", 1.8)}</div>
    </div>
    <div class="u-perf"><i class="l"></i><span></span><i class="r"></i></div>
    <div class="u-tk-bot">
      <div class="u-track">{st}</div>
      <div class="u-next">{ic("video", 18, "#0057F2", 2)}<span class="f1">Bugun 15:30 · Video</span><div class="u-mini-btn">Qo'shilish</div></div>
    </div>
  </div>

  <div class="u-sec"><span class="u-h2">Xizmatlar</span><span class="u-link">8 ta yo'nalish</span></div>
  <div class="u-svcs">{sv}</div>

  <div class="u-sec"><span class="u-h2">Yaqin advokatlar</span><span class="u-pill" style="background:#ECFDF3;color:#067647"><i style="background:#17B26A"></i>12 onlayn</span></div>
  <div class="u-card p0">{lw}</div>
</div>
{u_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''


def u_pro():
    kpi = [("Daromad", "1 250 000", "so'm", "+12%", "#079455"), ("Buyurtmalar", "4", "bugun", "2 yakunlandi", "#667085"),
           ("Reyting", "4.9", "★", "128 baho", "#667085"), ("Javob vaqti", "6", "daq", "maqsad ≤ 10", "#079455")]
    kp = "".join(f'<div class="u-kpi"><span class="u-t13">{a}</span><span class="u-kpi-v">{v}<small>{u}</small></span><span class="u-kpi-d" style="color:{c}">{d}</span></div>' for a, v, u, d, c in kpi)
    hours = [("09:00", None), ("10:00", ("Konsultatsiya · Malika K.", "Video · 45 daq", "#EFF4FF", "#0057F2")),
             ("12:00", "now"), ("14:00", ("Sud majlisi", "Yunusobod tuman sudi, 3-zal", "#FEF3F2", "#F04438")),
             ("16:30", ("Da'vo arizasi", "Ish #LX-1987 · muddat bugun", "#ECFDF3", "#079455"))]
    hg = ""
    for h, ev in hours:
        if ev is None:
            hg += f'<div class="u-hr"><span class="u-hr-t">{h}</span><i class="u-hr-l"></i></div>'
        elif ev == "now":
            hg += '<div class="u-hr"><span class="u-hr-t" style="color:#F04438;font-weight:700">12:40</span><div class="u-now"><b></b><i></i></div></div>'
        else:
            t, s, bg, c = ev
            hg += f'<div class="u-hr"><span class="u-hr-t">{h}</span><div class="u-ev" style="background:{bg};border-left-color:{c}"><span class="u-t14">{t}</span><span class="u-t12">{s}</span></div></div>'
    reqs = [("Ajrim va aliment", "Oila huquqi · 12 daq oldin", "300 000"),
            ("Ijara shartnomasini tekshirish", "Ko'chmas mulk · 40 daq oldin", "180 000")]
    rq = "".join(f'<div class="u-lw"><div class="col g2 f1"><span class="u-t15">{t}</span><span class="u-t13">{s}</span></div><div class="col" style="align-items:flex-end"><span class="u-t15">{p}</span><span class="u-t12">so\'m</span></div></div>' for t, s, p in reqs)
    return f'''<div class="phone u" data-name="05 Ufq · Advokat">
{status_bar("#101828")}
{u_head("Ish maydoni", "Advokat · Jasur Karimov", u_btn("bell", True) + '<div class="u-me">JK</div>')}
<div class="u-body">
  <div class="u-seg"><div class="u-seg-i on"><i style="background:#17B26A"></i>Onlayn</div><div class="u-seg-i"><i style="background:#F79009"></i>Band</div><div class="u-seg-i"><i style="background:#98A2B3"></i>Oflayn</div></div>

  <div class="u-card">
    <div class="row jb ac"><span class="u-h2">Bugun</span><span class="u-chip">Hafta {ic("chevd", 14, "#344054", 2)}</span></div>
    <div class="u-kpis">{kp}</div>
  </div>

  <div class="u-ticket" style="border-color:#FEC84B">
    <div class="u-tk-top">
      <div class="row jb ac"><span class="u-pill" style="background:#FFFAEB;color:#B54708">{ic("bolt", 13, "#B54708", 2.2)}Yangi tezkor so'rov</span><span class="u-t14" style="color:#B54708">04:59</span></div>
      <span class="u-tk-t">Avtohalokat bo'yicha maslahat</span>
      <div class="row g8"><span class="u-chip sm">{ic("pin", 13, "#475467", 2)}2.4 km</span><span class="u-chip sm">{ic("wallet", 13, "#475467", 2)}250 000</span><span class="u-chip sm">{ic("clock", 13, "#475467", 2)}~30 daq</span></div>
      <div class="u-cd"><i></i></div>
    </div>
    <div class="u-perf"><i class="l"></i><span></span><i class="r"></i></div>
    <div class="u-tk-bot" style="flex-direction:row;gap:10px"><div class="u-btn ghost">Rad etish</div><div class="u-btn">Qabul qilish</div></div>
  </div>

  <div class="u-sec"><span class="u-h2">Kun tartibi</span><span class="u-link">Kalendar</span></div>
  <div class="u-card" style="gap:6px">{hg}</div>

  <div class="u-sec"><span class="u-h2">Yangi so'rovlar</span><span class="u-pill" style="background:#EFF4FF;color:#0057F2">7 ta</span></div>
  <div class="u-card p0">{rq}</div>

  <div class="u-pay">{ic("wallet", 22, "#0057F2", 1.8)}<div class="col g2 f1"><span class="u-t15">Keyingi to'lov · 14-noyabr</span><span class="u-t13">Balans: 3 480 000 so'm</span></div>{ic("chev", 20, "#98A2B3", 2)}</div>
</div>
{u_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''


U_CSS = """
.u{background:#F4F6FA;font-family:'DM Sans',sans-serif;color:#101828}
.u-head{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}
.u-brand{font-size:16px;line-height:20px;font-weight:700;letter-spacing:-.2px}
.u-cap{font-size:12px;line-height:16px;color:#98A2B3;font-weight:500;display:flex;align-items:center;gap:4px}
.u-ib{width:44px;height:44px;border-radius:22px;background:#FFFFFF;border:1px solid #E4E7EC;display:flex;align-items:center;justify-content:center;position:relative}
.u-dot{position:absolute;top:10px;right:11px;width:8px;height:8px;border-radius:4px;background:#F04438;border:2px solid #FFFFFF}
.u-me{width:44px;height:44px;border-radius:22px;background:linear-gradient(135deg,#0057F2,#5B8DEF);color:#FFFFFF;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
.u-body{padding:6px 20px 124px;display:flex;flex-direction:column;gap:16px}
.u-h1{font-size:26px;line-height:32px;font-weight:700;letter-spacing:-.6px}
.u-date{height:30px;padding:0 12px;border-radius:15px;background:#FFFFFF;border:1px solid #E4E7EC;font-size:13px;font-weight:600;color:#344054;display:flex;align-items:center}
.u-h2{font-size:18px;line-height:24px;font-weight:700;letter-spacing:-.3px}
.u-sec{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.u-link{font-size:14px;font-weight:600;color:#0057F2}
.u-t15{font-size:15px;line-height:20px;font-weight:600}
.u-t14{font-size:14px;line-height:20px;font-weight:600}
.u-t13{font-size:13px;line-height:18px;color:#667085}
.u-t13 b{color:#101828;font-weight:600}
.u-t12{font-size:12px;line-height:16px;color:#667085}
.u-help{background:#FFFFFF;border:1px solid #E4E7EC;border-radius:24px;box-shadow:0 1px 2px rgba(16,24,40,.04),0 12px 24px -8px rgba(16,24,40,.08);overflow:hidden}
.u-help-in{height:64px;padding:0 16px 0 10px;display:flex;align-items:center;gap:12px;border-bottom:1px solid #EAECF0}
.u-spark{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#0057F2,#3B82F6);display:flex;align-items:center;justify-content:center}
.u-ph{font-size:15px;color:#667085}
.u-acts{display:flex;padding:14px 4px}
.u-act{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
.u-act-ic{width:48px;height:48px;border-radius:24px;display:flex;align-items:center;justify-content:center;margin-bottom:2px}
.u-act-t{font-size:13px;line-height:16px;font-weight:700}
.u-act-s{font-size:12px;line-height:16px;color:#667085}
.u-vd{width:1px;background:#EAECF0;margin:6px 0}
.u-pill{height:26px;padding:0 10px;border-radius:13px;font-size:12px;font-weight:600;display:inline-flex;align-items:center;gap:6px}
.u-pill i{width:6px;height:6px;border-radius:3px}
.u-ticket{background:#FFFFFF;border:1px solid #E4E7EC;border-radius:24px;position:relative}
.u-tk-top{padding:16px 16px 14px;display:flex;flex-direction:column;gap:12px}
.u-tk-t{font-size:17px;line-height:24px;font-weight:700;letter-spacing:-.3px}
.u-perf{height:20px;display:flex;align-items:center;position:relative}
.u-perf span{flex:1;margin:0 18px;border-top:1.5px dashed #D0D5DD}
.u-perf i{position:absolute;top:0;width:20px;height:20px;border-radius:10px;background:#F4F6FA;border:1px solid #E4E7EC}
.u-perf i.l{left:-11px;border-left-color:transparent;border-bottom-color:transparent;transform:rotate(45deg)}
.u-perf i.r{right:-11px;border-right-color:transparent;border-top-color:transparent;transform:rotate(45deg)}
.u-tk-bot{padding:12px 16px 16px;display:flex;flex-direction:column;gap:14px}
.u-track{display:flex;position:relative}
.u-track:before{content:'';position:absolute;left:12%;right:12%;top:7px;height:2px;background:linear-gradient(90deg,#0057F2 0%,#0057F2 66%,#E4E7EC 66%)}
.u-node{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;position:relative}
.u-node i{width:16px;height:16px;border-radius:8px;background:#FFFFFF;border:2px solid #D0D5DD}
.u-node.done i{background:#0057F2;border-color:#0057F2}
.u-node.now i{border-color:#0057F2;box-shadow:0 0 0 4px #D1E0FF}
.u-node span{font-size:11px;font-weight:600;color:#98A2B3}
.u-node.now span{color:#0057F2}
.u-next{height:48px;border-radius:14px;background:#F5F8FF;padding:0 6px 0 12px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:600}
.u-mini-btn{height:36px;padding:0 14px;border-radius:10px;background:#0057F2;color:#FFFFFF;font-size:13px;font-weight:700;display:flex;align-items:center}
.u-svcs{display:flex;flex-wrap:wrap;gap:14px 8px}
.u-svc{width:81.5px;display:flex;flex-direction:column;align-items:center;gap:8px}
.u-svc span{font-size:12px;font-weight:600;color:#344054}
.u-svc-ic{width:60px;height:60px;border-radius:20px;background:#FFFFFF;border:1px solid #E4E7EC;display:flex;align-items:center;justify-content:center}
.u-card{background:#FFFFFF;border:1px solid #E4E7EC;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:14px}
.u-card.p0{padding:0 16px;gap:0}
.u-lw{display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid #F2F4F7}
.u-lw:last-child{border-bottom:none}
.u-lw .u-t13{white-space:nowrap}
.u-av{width:44px;height:44px;border-radius:22px;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;position:relative;flex-shrink:0}
.u-av.sm{width:32px;height:32px;font-size:12px}
.u-av i{position:absolute;right:0;bottom:0;width:12px;height:12px;border-radius:6px;background:#17B26A;border:2px solid #FFFFFF}
.u-av.sm i{display:none}
.u-ghost{height:34px;padding:0 14px;border-radius:17px;border:1px solid #D0D5DD;font-size:13px;font-weight:600;display:flex;align-items:center}
.u-seg{height:46px;border-radius:14px;background:#EAECF0;padding:4px;display:flex}
.u-seg-i{flex:1;border-radius:10px;display:flex;align-items:center;justify-content:center;gap:8px;font-size:14px;font-weight:600;color:#475467}
.u-seg-i i{width:8px;height:8px;border-radius:4px}
.u-seg-i.on{background:#FFFFFF;color:#101828;box-shadow:0 1px 3px rgba(16,24,40,.1)}
.u-chip{height:30px;padding:0 10px;border-radius:10px;border:1px solid #E4E7EC;font-size:13px;font-weight:600;color:#344054;display:flex;align-items:center;gap:4px}
.u-chip.sm{height:28px;background:#F9FAFB;font-size:12px;gap:5px}
.u-kpis{display:flex;flex-wrap:wrap;border-top:1px solid #F2F4F7}
.u-kpi{width:50%;padding:14px 0 2px;display:flex;flex-direction:column;gap:4px}
.u-kpi:nth-child(odd){padding-right:12px;border-right:1px solid #F2F4F7}
.u-kpi:nth-child(even){padding-left:16px}
.u-kpi:nth-child(-n+2){padding-bottom:14px;border-bottom:1px solid #F2F4F7}
.u-kpi-v{font-size:24px;line-height:30px;font-weight:700;letter-spacing:-.6px}
.u-kpi-v small{font-size:13px;font-weight:600;color:#667085;letter-spacing:0;margin-left:4px}
.u-kpi-d{font-size:12px;font-weight:600}
.u-cd{height:4px;border-radius:2px;background:#FEF0C7}
.u-cd i{display:block;width:72%;height:4px;border-radius:2px;background:#F79009}
.u-btn{flex:1;height:48px;border-radius:14px;background:#0057F2;color:#FFFFFF;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center}
.u-btn.ghost{background:#FFFFFF;border:1px solid #D0D5DD;color:#344054}
.u-hr{display:flex;align-items:center;gap:12px;min-height:22px}
.u-hr-t{width:40px;font-size:12px;font-weight:600;color:#98A2B3}
.u-hr-l{flex:1;height:1px;background:#F2F4F7}
.u-ev{flex:1;border-radius:12px;border-left:3px solid;padding:9px 12px;display:flex;flex-direction:column;gap:2px}
.u-now{flex:1;display:flex;align-items:center}
.u-now b{width:8px;height:8px;border-radius:4px;background:#F04438}
.u-now i{flex:1;height:1.5px;background:#F04438}
.u-pay{background:#FFFFFF;border:1px solid #E4E7EC;border-radius:20px;padding:14px 16px;display:flex;align-items:center;gap:12px}
.u-tabbar{position:absolute;left:0;right:0;bottom:0;height:90px;background:#FFFFFF;border-top:1px solid #EAECF0}
.u-tabrow{height:62px;display:flex;align-items:flex-start;padding:0 8px}
.u-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:5px}
.u-tab span{font-size:11px;line-height:14px}
.u-tab-bar{width:28px;height:3px;border-radius:0 0 3px 3px;background:#0057F2;margin-bottom:5px}
.u-ai{width:48px;height:48px;border-radius:16px;background:#101828;display:flex;align-items:center;justify-content:center;margin-top:7px}
.u-badge{position:absolute;top:-4px;right:-9px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#F04438;color:#FFFFFF;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF}
"""

# ============================================================
# 06 — "Grafit" : dark bento evolved · Sora · lime accent, activity heatmap
# ============================================================
def g_tabbar(tabs, badges):
    out = []
    for i, (n, l) in enumerate(tabs):
        if n == "spark":
            out.append(f'<div class="g-ai">{ic("spark", 24, "#0A0C10", 2.2)}</div>')
            continue
        on = i == 0
        b = f'<span class="g-badge">{badges[i]}</span>' if i in badges else ""
        out.append(f'<div class="g-tab"><div class="rel">{ic(n, 23, "#C8F560" if on else "#6E768A", 2 if on else 1.8)}{b}</div><i style="background:{"#C8F560" if on else "transparent"}"></i></div>')
    return f'<div class="g-tabbar">{"".join(out)}</div>{home_ind("#FFFFFF")}'


def g_head(t, right):
    return f'<div class="g-head"><div class="row g10 ac">{logo(32, "#FFFFFF", "#0090FF")}<span class="g-brand">{t}</span></div><div class="row g8 ac">{right}</div></div>'


def g_btn(n, dot=False):
    return f'<div class="g-ib">{ic(n, 20, "#F2F4F8", 1.8)}{"<span class=g-dot></span>" if dot else ""}</div>'


SOS_RINGS = '''<svg width="150" height="150" viewBox="0 0 150 150" fill="none" style="position:absolute;right:-40px;top:-30px">
<circle cx="75" cy="75" r="30" stroke="#FFFFFF" stroke-opacity=".28" stroke-width="1.5"/>
<circle cx="75" cy="75" r="48" stroke="#FFFFFF" stroke-opacity=".18" stroke-width="1.5"/>
<circle cx="75" cy="75" r="66" stroke="#FFFFFF" stroke-opacity=".10" stroke-width="1.5"/></svg>'''


def g_client():
    chips = "".join(f'<span class="g-chip">{c}</span>' for c in ["Ish haqi", "Ajrim", "Ijara"])
    avs = "".join(f'<i style="background:{c};margin-left:{0 if k == 0 else -8}px">{t}</i>' for k, (t, c) in enumerate([("DR", "#9CC0FF"), ("SA", "#C8F560"), ("MN", "#FFB547")]))
    steps = [("Yuborildi", "done"), ("Qabul", "done"), ("Jarayonda", "now"), ("Yakun", "")]
    st = "".join(f'<div class="g-st {k}"><i>{ic("check", 12, "#0A0C10", 3) if k == "done" else ""}</i><span>{l}</span></div>' for l, k in steps)
    return f'''<div class="phone g" data-name="06 Grafit · Mijoz">
{status_bar("#FFFFFF")}
{g_head("Tezkor Himoya", g_btn("search") + g_btn("bell", True))}
<div class="g-body">
  <div class="col g6"><span class="g-cap">Salom, Aziz</span><span class="g-h1">Bugun qanday<br>yordam kerak?</span></div>

  <div class="g-tile g-aitile">
    <div class="row jb ac"><span class="g-lbl" style="color:#C8F560">{ic("spark", 14, "#C8F560", 2)}AI yordamchi</span><span class="g-cap">Free · 5 savol</span></div>
    <span class="g-prompt">Muammoingizni oddiy so'zlar bilan yozing<i></i></span>
    <div class="row jb ac"><div class="row g6">{chips}</div><div class="g-send">{ic("arrowup", 20, "#0A0C10", 2.4)}</div></div>
  </div>

  <div class="row g12">
    <div class="g-sos">{SOS_RINGS}
      <div class="g-sos-ic">{ic("siren", 26, "#FFFFFF", 2)}</div>
      <div class="col g4"><span class="g-sos-t">SOS</span><span class="g-sos-s">Shoshilinch yordam. Bosib turing 3 s</span></div>
    </div>
    <div class="col g12 f1">
      <div class="g-tile g-blue">
        <div class="row jb ac"><div class="g-avs">{avs}</div><span class="g-lbl" style="color:#FFFFFF">24/7</span></div>
        <div class="col g2"><span class="g-tt">Tezkor advokat</span><span class="g-ts" style="color:rgba(255,255,255,.75)">12 onlayn · ~15 daq</span></div>
      </div>
      <div class="g-tile">
        <div class="row jb ac">{ic("car", 22, "#FFB547", 1.9)}{ic("upright", 18, "#6E768A", 2)}</div>
        <div class="col g2"><span class="g-tt">Avtohalokat</span><span class="g-ts">Joyida maslahat</span></div>
      </div>
    </div>
  </div>
  <div class="row g12">
    <div class="g-tile f1 hz"><div class="g-sq" style="background:rgba(200,245,96,.12)">{ic("file", 20, "#C8F560", 1.9)}</div><div class="col g2"><span class="g-tt sm">Shablonlar</span><span class="g-ts">48 ta hujjat</span></div></div>
    <div class="g-tile f1 hz"><div class="g-sq" style="background:rgba(156,192,255,.12)">{ic("doc_ai", 20, "#9CC0FF", 1.9)}</div><div class="col g2"><span class="g-tt sm">Hujjat tahlili</span><span class="g-ts">PDF, rasm</span></div></div>
  </div>

  <div class="g-sec"><span class="g-h2">Buyurtmangiz</span><span class="g-link">Hammasi</span></div>
  <div class="g-tile" style="gap:16px">
    <div class="row jb as"><div class="col g4"><span class="g-tt">Mehnat nizosi bo'yicha maslahat</span><span class="g-ts">#LX-2048 · 3/4 bosqich</span></div></div>
    <div class="g-steps">{st}</div>
    <div class="g-div"></div>
    <div class="row g12 ac">
      <div class="g-av">DR</div>
      <div class="col g2 f1"><span class="g-name">Dilnoza Rahimova</span><span class="g-ts row g4 ac">{ic("star", 12, "#FFB547", 0, "#FFB547")}4.9 · Advokat</span></div>
      <div class="g-lime">{ic("video", 16, "#0A0C10", 2)}15:30</div>
    </div>
  </div>
</div>
{g_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''


def g_pro():
    bars = [38, 56, 44, 72, 60, 88, 26]
    days = ["D", "S", "C", "P", "J", "S", "Y"]
    ch = "".join(f'<div class="col g6 ac"><div class="g-bc"><i style="height:{h}%;background:{"#C8F560" if k == 5 else "#2A303C"}"></i></div><span class="g-bd" style="color:{"#C8F560" if k == 5 else "#6E768A"}">{d}</span></div>' for k, (h, d) in enumerate(zip(bars, days)))
    heat = [[0, 1, 2, 1, 3, 2, 0], [1, 2, 3, 2, 3, 1, 0], [2, 3, 1, 3, 4, 2, 1], [1, 2, 4, 3, 4, 3, 0]]
    lv = ["#1B1F28", "#33461B", "#5B7E26", "#8DBF3A", "#C8F560"]
    hm = "".join('<div class="row g6">' + "".join(f'<i class="g-hc" style="background:{lv[v]}"></i>' for v in row) + "</div>" for row in heat)
    leg = "".join(f'<i class="g-hl" style="background:{c}"></i>' for c in lv)
    agenda = [("10:00", "Konsultatsiya", "Malika K. · video", "#9CC0FF"), ("14:00", "Sud majlisi", "Yunusobod tuman sudi", "#FF5D5D"), ("16:30", "Da'vo arizasi", "Ish #LX-1987", "#C8F560")]
    ag = "".join(f'<div class="g-ag"><span class="g-ag-t">{t}</span><i style="background:{c}"></i><div class="col g2 f1"><span class="g-name">{a}</span><span class="g-ts">{b}</span></div></div>' for t, a, b, c in agenda)
    tog = '<div class="g-tog"><span>Onlayn</span><div class="g-sw"><i></i></div></div>'
    return f'''<div class="phone g" data-name="06 Grafit · Advokat">
{status_bar("#FFFFFF")}
{g_head("Ish maydoni", tog + g_btn("bell", True))}
<div class="g-body">
  <div class="g-tile" style="gap:14px">
    <div class="row jb ac"><span class="g-cap">Bu hafta daromad</span><span class="g-up">{ic("trend", 13, "#C8F560", 2.2)}+18%</span></div>
    <span class="g-big">4 850 000<small>so'm</small></span>
    <div class="g-chart">{ch}</div>
  </div>

  <div class="row g12">
    <div class="g-tile f1" style="height:150px">
      <span class="g-cap">Reyting</span>
      <div class="g-ring">{ring(76, 8, .98, "#252A35", "#FFB547")}<span>4.9</span></div>
      <span class="g-ts">128 baho</span>
    </div>
    <div class="g-tile f1" style="height:150px">
      <span class="g-cap">Javob foizi</span>
      <span class="g-mid">96<small>%</small></span>
      <div class="col g6"><div class="g-pb"><i style="width:96%"></i></div><span class="g-ts">O'rt. 6 daqiqa</span></div>
    </div>
  </div>

  <div class="g-req">
    <div class="row g14 ac">
      <div class="g-ring sm">{ring(60, 5, .8, "#3A2E14", "#FFB547")}<span style="color:#FFB547;font-size:14px">4:59</span></div>
      <div class="col g4 f1"><span class="g-lbl" style="color:#FFB547">{ic("bolt", 13, "#FFB547", 2.2)}Tezkor so'rov</span><span class="g-tt">Avtohalokat · maslahat</span><span class="g-ts">Chilonzor · 2.4 km · 250 000 so'm</span></div>
    </div>
    <div class="row g10"><div class="g-b ghost">Rad etish</div><div class="g-b">Qabul qilish {ic("arrowr", 17, "#0A0C10", 2.2)}</div></div>
  </div>

  <div class="g-tile" style="gap:14px">
    <div class="row jb ac"><span class="g-tt sm">Faollik · 4 hafta</span><span class="g-ts row g4 ac">{ic("flame", 14, "#C8F560", 2)}9 kun ketma-ket</span></div>
    <div class="col g6">{hm}</div>
    <div class="row jb ac"><span class="g-ts">Kam</span><div class="row g4">{leg}</div><span class="g-ts">Ko'p</span></div>
  </div>

  <div class="g-sec"><span class="g-h2">Bugun</span><span class="g-link">Kalendar</span></div>
  <div class="g-tile" style="padding:6px 16px;gap:0">{ag}</div>
</div>
{g_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''


G_CSS = """
.g{background:#0A0C10;font-family:'Sora',sans-serif;color:#F2F4F8}
.g-head{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}
.g-brand{font-size:16px;font-weight:600;letter-spacing:-.3px}
.g-ib{width:42px;height:42px;border-radius:14px;background:#14171E;border:1px solid #252A35;display:flex;align-items:center;justify-content:center;position:relative}
.g-dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:4px;background:#C8F560;border:2px solid #14171E}
.g-body{padding:8px 20px 132px;display:flex;flex-direction:column;gap:12px}
.g-cap{font-size:13px;line-height:18px;color:#8B93A7;font-weight:400}
.g-h1{font-size:28px;line-height:34px;font-weight:600;letter-spacing:-1px;margin-bottom:6px}
.g-h2{font-size:18px;font-weight:600;letter-spacing:-.4px}
.g-sec{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.g-link{font-size:13px;font-weight:500;color:#C8F560}
.g-tile{background:#14171E;border:1px solid #252A35;border-radius:24px;padding:16px;display:flex;flex-direction:column;justify-content:space-between;gap:10px;overflow:hidden;position:relative}
.g-tile.hz{flex-direction:row;align-items:center;justify-content:flex-start;gap:12px;height:72px;padding:0 14px}
.g-aitile{gap:16px;background:linear-gradient(160deg,#1A2016 0%,#14171E 60%);border-color:#2E3A1E}
.g-lbl{font-size:12px;font-weight:600;letter-spacing:.3px;display:flex;align-items:center;gap:6px}
.g-prompt{font-size:19px;line-height:26px;font-weight:500;color:#F2F4F8;letter-spacing:-.4px;display:block}
.g-prompt i{display:inline-block;width:2px;height:22px;background:#C8F560;margin-left:3px;vertical-align:-4px}
.g-chip{height:32px;padding:0 12px;border-radius:16px;background:#1F242E;font-size:12px;font-weight:500;color:#C5CBD8;display:flex;align-items:center}
.g-send{width:44px;height:44px;border-radius:22px;background:#C8F560;display:flex;align-items:center;justify-content:center}
.g-sos{width:160px;height:212px;border-radius:24px;background:linear-gradient(165deg,#FF6B5E 0%,#E5383B 100%);padding:16px;display:flex;flex-direction:column;justify-content:space-between;position:relative;overflow:hidden}
.g-sos-ic{width:52px;height:52px;border-radius:26px;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;position:relative}
.g-sos-t{font-size:30px;line-height:34px;font-weight:700;letter-spacing:-1px;color:#FFFFFF}
.g-sos-s{font-size:12px;line-height:17px;color:rgba(255,255,255,.85)}
.g-blue{background:#3F7BF6;border-color:#5A8FFF;flex:1}
.g-tile.f1{flex:1}
.g-tt{font-size:16px;line-height:21px;font-weight:600;letter-spacing:-.3px}
.g-tt.sm{font-size:14px;line-height:19px}
.g-ts{font-size:12px;line-height:17px;color:#8B93A7}
.g-avs{display:flex}
.g-avs i{width:28px;height:28px;border-radius:14px;border:2px solid #3F7BF6;font-size:10px;font-weight:700;color:#0A0C10;font-style:normal;display:flex;align-items:center;justify-content:center}
.g-sq{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.g-steps{display:flex;gap:6px}
.g-st{flex:1;display:flex;flex-direction:column;gap:8px}
.g-st i{height:24px;border-radius:12px;background:#1F242E;display:flex;align-items:center;justify-content:center}
.g-st.done i{background:#C8F560}
.g-st.now i{background:transparent;border:1.5px dashed #C8F560}
.g-st span{font-size:11px;color:#6E768A;text-align:center}
.g-st.now span{color:#C8F560;font-weight:600}
.g-div{height:1px;background:#252A35}
.g-av{width:40px;height:40px;border-radius:20px;background:#9CC0FF;color:#0A0C10;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
.g-name{font-size:14px;line-height:19px;font-weight:600}
.g-lime{height:38px;padding:0 14px;border-radius:19px;background:#C8F560;color:#0A0C10;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.g-tabbar{position:absolute;left:24px;right:24px;bottom:30px;height:66px;border-radius:33px;background:#14171E;border:1px solid #252A35;padding:0 10px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 18px 40px rgba(0,0,0,.6)}
.g-tab{width:48px;display:flex;flex-direction:column;align-items:center;gap:6px;padding-top:6px}
.g-tab>i{width:4px;height:4px;border-radius:2px}
.g-ai{width:52px;height:52px;border-radius:26px;background:#C8F560;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(200,245,96,.12)}
.g-badge{position:absolute;top:-6px;right:-9px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#FF5D5D;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;color:#FFFFFF}
.g-tog{height:36px;padding:0 6px 0 12px;border-radius:18px;background:#14171E;border:1px solid #252A35;display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#C8F560}
.g-sw{width:38px;height:24px;border-radius:12px;background:#C8F560;padding:3px;display:flex;justify-content:flex-end}
.g-sw i{width:18px;height:18px;border-radius:9px;background:#0A0C10}
.g-up{height:24px;padding:0 8px;border-radius:12px;background:rgba(200,245,96,.12);color:#C8F560;font-size:12px;font-weight:600;display:flex;align-items:center;gap:4px}
.g-big{font-size:36px;line-height:42px;font-weight:600;letter-spacing:-1.6px;display:flex;align-items:baseline;gap:6px}
.g-big small{font-size:15px;color:#8B93A7;letter-spacing:0;font-weight:500}
.g-chart{height:92px;display:flex;justify-content:space-between;align-items:flex-end}
.g-bc{width:32px;height:68px;display:flex;align-items:flex-end}
.g-bc i{display:block;width:100%;border-radius:10px}
.g-bd{font-size:11px;font-weight:600}
.g-ring{width:76px;height:76px;position:relative;display:flex;align-items:center;justify-content:center;align-self:center}
.g-ring svg{position:absolute;left:0;top:0}
.g-ring span{font-size:20px;font-weight:700;position:relative}
.g-ring.sm{width:60px;height:60px;flex-shrink:0}
.g-mid{font-size:40px;line-height:44px;font-weight:600;letter-spacing:-1.6px}
.g-mid small{font-size:18px;color:#8B93A7;letter-spacing:0}
.g-pb{height:6px;border-radius:3px;background:#252A35}
.g-pb i{display:block;height:6px;border-radius:3px;background:#9CC0FF}
.g-req{border-radius:24px;padding:16px;background:#17140C;border:1.5px solid #FFB547;display:flex;flex-direction:column;gap:14px}
.g-b{flex:1;height:48px;border-radius:24px;background:#FFB547;color:#0A0C10;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px}
.g-b.ghost{background:transparent;border:1px solid #4A3B1C;color:#FFE2B3}
.g-hc{flex:1;height:30px;border-radius:7px;display:block}
.g-hl{width:12px;height:12px;border-radius:3px;display:block}
.g-ag{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #252A35}
.g-ag:last-child{border-bottom:none}
.g-ag-t{width:44px;font-size:13px;font-weight:600}
.g-ag i{width:8px;height:8px;border-radius:4px}
"""

# ============================================================
# 07 — "Mozaika" : pastel mosaic · Outfit · AI chat preview
# ============================================================
def m_tabbar(tabs, badges):
    out = []
    for i, (n, l) in enumerate(tabs):
        on = i == 0
        if n == "spark":
            out.append(f'<div class="m-ai">{ic("spark", 22, "#FFFFFF", 2)}</div>')
        elif on:
            out.append(f'<div class="m-tab on">{ic(n, 20, "#FFFFFF", 2)}<span>{l}</span></div>')
        else:
            b = f'<span class="m-badge">{badges[i]}</span>' if i in badges else ""
            out.append(f'<div class="m-tab"><div class="rel">{ic(n, 22, "#8A87A0", 1.9)}{b}</div></div>')
    return f'<div class="m-tabbar">{"".join(out)}</div>{home_ind("#1E1B2E")}'


def m_head(sub, right):
    return f'<div class="m-head"><div class="row g10 ac"><div class="m-logo">{logo(26)}</div><div class="col g2"><span class="m-brand">Tezkor Himoya</span><span class="m-cap">{sub}</span></div></div><div class="row g8 ac">{right}</div></div>'


def m_btn(n, dot=False):
    return f'<div class="m-ib">{ic(n, 21, "#1E1B2E", 1.8)}{"<span class=m-dot></span>" if dot else ""}</div>'


def m_client():
    return f'''<div class="phone m" data-name="07 Mozaika · Mijoz">
{status_bar("#1E1B2E")}
{m_head("Huquqiy yordam", m_btn("bell", True) + '<div class="m-me">AK</div>')}
<div class="m-body">
  <div class="col g4"><span class="m-h1">Salom, Aziz</span><span class="m-sub">Huquqingizni biz himoya qilamiz</span></div>

  <div class="m-chat">
    <div class="row jb ac"><span class="m-lbl">{ic("spark", 15, "#6D28D9", 2)}AI yordamchi</span><span class="m-beta">Beta</span></div>
    <div class="m-bub me">Ish beruvchi 3 oydan beri maosh bermayapti. Nima qilay?</div>
    <div class="m-bub ai">Mehnat kodeksiga ko'ra, bu holatda talab xati yozasiz. Mehnat huquqi advokatiga ulaymi?</div>
    <div class="m-inp"><span class="f1">Savolingizni yozing…</span><div class="m-send">{ic("send", 17, "#FFFFFF", 2)}</div></div>
  </div>

  <div class="m-sec"><span class="m-h2">Tezkor yordam</span></div>
  <div class="row g12">
    <div class="m-tile tall" style="background:#FFDCE0">
      <div class="m-tile-ic">{ic("siren", 26, "#E11D48", 2)}</div>
      <div class="col g4"><span class="m-tt" style="font-size:28px;line-height:32px">SOS</span><span class="m-ts" style="color:#9F1239">Shoshilinch yordam. Advokat 5 daqiqada</span></div>
      <div class="m-arrow" style="background:#E11D48">{ic("arrowr", 18, "#FFFFFF", 2.2)}</div>
    </div>
    <div class="col g12 f1">
      <div class="m-tile" style="background:#D9E8FF"><div class="row jb ac"><div class="m-tile-ic sm">{ic("bolt", 20, "#2563EB", 2)}</div><span class="m-tag" style="color:#1D4ED8">24/7</span></div><div class="col g2"><span class="m-tt">Tezkor advokat</span><span class="m-ts" style="color:#1E40AF">~15 daqiqa</span></div></div>
      <div class="m-tile" style="background:#D3F4E4"><div class="row jb ac"><div class="m-tile-ic sm">{ic("doc_ai", 20, "#059669", 2)}</div><span class="m-tag" style="color:#047857">AI</span></div><div class="col g2"><span class="m-tt">Hujjat tahlili</span><span class="m-ts" style="color:#065F46">PDF yoki rasm</span></div></div>
    </div>
  </div>
  <div class="row g12">
    <div class="m-tile hz" style="background:#FFF1BF"><div class="m-tile-ic sm">{ic("file", 20, "#B45309", 2)}</div><div class="col g2"><span class="m-tt sm">Shablonlar</span><span class="m-ts" style="color:#92400E">48 ta</span></div></div>
    <div class="m-tile hz" style="background:#FFE3D0"><div class="m-tile-ic sm">{ic("car", 20, "#EA580C", 2)}</div><div class="col g2"><span class="m-tt sm">Avtohalokat</span><span class="m-ts" style="color:#9A3412">Maslahat</span></div></div>
  </div>

  <div class="m-sec"><span class="m-h2">Buyurtmam</span><span class="m-link">Tarix</span></div>
  <div class="m-card">
    <div class="row g12 ac"><div class="m-av" style="background:#E7E0FF;color:#6D28D9">DR</div><div class="col g2 f1"><span class="m-tt sm">Mehnat nizosi bo'yicha maslahat</span><span class="m-ts" style="color:#6B6880">Dilnoza Rahimova · ★ 4.9</span></div></div>
    <div class="m-dots"><i class="on"></i><i class="on"></i><i class="on"></i><i></i></div>
    <div class="row jb ac"><span class="m-ts" style="color:#6B6880"><b style="color:#1E1B2E">3/4</b> · Video uchrashuv bugun 15:30</span><div class="m-cta">Qo'shilish</div></div>
  </div>
</div>
{m_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''


def m_pro():
    chips = [("Barchasi", True), ("Tezkor · 2", False), ("Oila · 3", False), ("Mehnat · 2", False)]
    ch = "".join(f'<span class="m-chip{" on" if on else ""}">{t}</span>' for t, on in chips)
    ag = [("10:00", "Konsultatsiya", "Malika K.", "#D9E8FF", "#1D4ED8"), ("14:00", "Sud majlisi", "Yunusobod", "#FFDCE0", "#BE123C"), ("16:30", "Da'vo arizasi", "#LX-1987", "#D3F4E4", "#047857")]
    agc = "".join(f'<div class="m-agc" style="background:{bg}"><span class="m-agt" style="color:{c}">{t}</span><div class="col g2"><span class="m-tt sm">{a}</span><span class="m-ts" style="color:{c}">{b}</span></div></div>' for t, a, b, bg, c in ag)
    return f'''<div class="phone m" data-name="07 Mozaika · Advokat">
{status_bar("#1E1B2E")}
{m_head("Ish maydoni", '<div class="m-on"><i></i>Onlayn</div>' + m_btn("bell", True))}
<div class="m-body">
  <div class="col g4"><span class="m-h1">Xayrli tong, Jasur</span><span class="m-sub">Adolat yo'lida, har kuni.</span></div>

  <div class="m-goal">
    <div class="col g10 f1">
      <span class="m-lbl" style="color:#065F46">{ic("target", 15, "#047857", 2)}Bugungi maqsad</span>
      <span class="m-goal-v">1 250 000<small> so'm</small></span>
      <div class="row g8"><span class="m-mini">3/4 buyurtma</span><span class="m-mini">+12%</span></div>
    </div>
    <div class="m-ring">{ring(96, 10, .75, "rgba(255,255,255,.7)", "#059669")}<div class="col ac"><span class="m-ring-v">75%</span><span class="m-ts" style="color:#065F46">reja</span></div></div>
  </div>

  <div class="m-req">
    <div class="row jb ac"><span class="m-tag2">{ic("bolt", 13, "#FFFFFF", 2.4)}Tezkor so'rov</span><span class="m-timer">{ic("clock", 14, "#9A3412", 2.2)}04:59</span></div>
    <span class="m-tt" style="font-size:19px;line-height:24px">Avtohalokat bo'yicha maslahat</span>
    <span class="m-ts" style="color:#9A3412">Chilonzor · 2.4 km · 250 000 so'm</span>
    <div class="row g10"><div class="m-b ghost">Rad etish</div><div class="m-b">Qabul qilish</div></div>
  </div>

  <div class="m-sec"><span class="m-h2">Yangi so'rovlar</span><span class="m-link">7 ta</span></div>
  <div class="m-chips">{ch}</div>
  <div class="row g12">
    <div class="m-rq" style="background:#FFDCE0"><div class="row jb ac"><div class="m-tile-ic sm">{ic("heart", 18, "#E11D48", 2)}</div><span class="m-ts" style="color:#9F1239">12 daq</span></div><span class="m-tt sm">Ajrim va aliment</span><span class="m-price">300 000 <small>so'm</small></span></div>
    <div class="m-rq" style="background:#D3F4E4"><div class="row jb ac"><div class="m-tile-ic sm">{ic("building", 18, "#059669", 2)}</div><span class="m-ts" style="color:#065F46">40 daq</span></div><span class="m-tt sm">Ijara shartnomasi</span><span class="m-price">180 000 <small>so'm</small></span></div>
  </div>

  <div class="m-sec"><span class="m-h2">Bugungi reja</span><span class="m-link">Kalendar</span></div>
  <div class="row g10">{agc}</div>

  <div class="m-level">
    <div class="m-tile-ic">{ic("award", 22, "#6D28D9", 2)}</div>
    <div class="col g8 f1"><div class="row jb"><span class="m-tt sm">Super advokat sari</span><span class="m-tt sm" style="color:#6D28D9">4/6</span></div><div class="m-pb"><i></i></div><span class="m-ts" style="color:#5B21B6">Yana 2 ta yakunlangan buyurtma kerak</span></div>
  </div>
</div>
{m_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''


M_CSS = """
.m{background:#FBF8F4;font-family:'Outfit',sans-serif;color:#1E1B2E}
.m-head{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}
.m-logo{width:40px;height:40px;border-radius:14px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(30,27,46,.06)}
.m-brand{font-size:17px;line-height:20px;font-weight:700}
.m-cap{font-size:12px;line-height:16px;color:#8A87A0;font-weight:500}
.m-ib{width:42px;height:42px;border-radius:21px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;position:relative;box-shadow:0 2px 8px rgba(30,27,46,.06)}
.m-dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:4px;background:#E11D48;border:2px solid #FFFFFF}
.m-me{width:42px;height:42px;border-radius:21px;background:#FFE3D0;color:#EA580C;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center}
.m-on{height:32px;padding:0 12px;border-radius:16px;background:#D3F4E4;color:#047857;font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px}
.m-on i{width:8px;height:8px;border-radius:4px;background:#10B981}
.m-body{padding:6px 20px 130px;display:flex;flex-direction:column;gap:14px}
.m-h1{font-size:30px;line-height:36px;font-weight:700;letter-spacing:-.8px}
.m-sub{font-size:15px;line-height:20px;color:#6B6880}
.m-h2{font-size:19px;line-height:24px;font-weight:700;letter-spacing:-.3px}
.m-sec{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.m-link{font-size:14px;font-weight:600;color:#6D28D9}
.m-lbl{font-size:13px;font-weight:600;color:#6D28D9;display:flex;align-items:center;gap:6px}
.m-beta{height:22px;padding:0 8px;border-radius:11px;background:#FFFFFF;font-size:11px;font-weight:700;color:#6D28D9;display:flex;align-items:center}
.m-chat{background:#E7E0FF;border-radius:28px;padding:16px;display:flex;flex-direction:column;gap:10px}
.m-bub{max-width:270px;padding:10px 14px;font-size:14px;line-height:20px}
.m-bub.me{align-self:flex-end;background:#FFFFFF;border-radius:18px 18px 6px 18px}
.m-bub.ai{align-self:flex-start;background:#6D28D9;color:#FFFFFF;border-radius:18px 18px 18px 6px}
.m-inp{height:52px;margin-top:4px;border-radius:26px;background:#FFFFFF;padding:0 6px 0 18px;display:flex;align-items:center;font-size:15px;color:#8A87A0}
.m-send{width:40px;height:40px;border-radius:20px;background:#1E1B2E;display:flex;align-items:center;justify-content:center}
.m-tile{border-radius:24px;padding:14px;display:flex;flex-direction:column;justify-content:space-between;height:110px}
.m-tile.tall{width:166px;height:232px;flex-shrink:0;position:relative}
.m-tile.hz{flex:1;height:72px;flex-direction:row;align-items:center;justify-content:flex-start;gap:12px;padding:0 14px}
.m-tile-ic{width:48px;height:48px;border-radius:16px;background:#FFFFFF;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.m-tile-ic.sm{width:40px;height:40px;border-radius:13px}
.m-tt{font-size:16px;line-height:21px;font-weight:700;letter-spacing:-.2px}
.m-tt.sm{font-size:15px;line-height:20px}
.m-ts{font-size:12.5px;line-height:17px;font-weight:500}
.m-tag{font-size:12px;font-weight:700}
.m-arrow{position:absolute;right:14px;top:14px;width:36px;height:36px;border-radius:18px;display:flex;align-items:center;justify-content:center}
.m-card{background:#FFFFFF;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:14px;box-shadow:0 4px 16px rgba(30,27,46,.05)}
.m-av{width:44px;height:44px;border-radius:15px;font-size:14px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.m-dots{display:flex;gap:6px}
.m-dots i{flex:1;height:8px;border-radius:4px;background:#EFEBE4}
.m-dots i.on{background:#6D28D9}
.m-cta{height:38px;padding:0 16px;border-radius:19px;background:#1E1B2E;color:#FFFFFF;font-size:13px;font-weight:600;display:flex;align-items:center}
.m-tabbar{position:absolute;left:20px;right:20px;bottom:30px;height:66px;border-radius:33px;background:#FFFFFF;padding:0 9px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 14px 34px rgba(30,27,46,.12)}
.m-tab{height:48px;min-width:44px;border-radius:24px;display:flex;align-items:center;justify-content:center;gap:6px}
.m-tab.on{background:#1E1B2E;padding:0 16px;color:#FFFFFF;font-size:13px;font-weight:600}
.m-ai{width:48px;height:48px;border-radius:24px;background:linear-gradient(135deg,#8B5CF6,#6D28D9);display:flex;align-items:center;justify-content:center}
.m-badge{position:absolute;top:-6px;right:-9px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E11D48;color:#FFFFFF;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF}
.m-goal{border-radius:28px;padding:18px;background:linear-gradient(135deg,#D3F4E4 0%,#D9E8FF 100%);display:flex;align-items:center;gap:12px}
.m-goal-v{font-size:28px;line-height:32px;font-weight:700;letter-spacing:-.8px}
.m-goal-v small{font-size:14px;font-weight:600;color:#065F46;letter-spacing:0}
.m-mini{height:26px;padding:0 10px;border-radius:13px;background:rgba(255,255,255,.7);font-size:12px;font-weight:600;color:#065F46;display:flex;align-items:center}
.m-ring{width:96px;height:96px;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.m-ring svg{position:absolute;left:0;top:0}
.m-ring-v{font-size:20px;font-weight:700;line-height:22px}
.m-req{border-radius:28px;padding:16px;background:#FFE3D0;display:flex;flex-direction:column;gap:8px}
.m-tag2{height:28px;padding:0 10px;border-radius:14px;background:#EA580C;color:#FFFFFF;font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px}
.m-timer{font-size:14px;font-weight:700;color:#9A3412;display:flex;align-items:center;gap:4px}
.m-b{flex:1;height:48px;margin-top:6px;border-radius:24px;background:#1E1B2E;color:#FFFFFF;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center}
.m-b.ghost{background:#FFFFFF;color:#1E1B2E}
.m-chips{display:flex;gap:8px;margin-top:-2px;margin-right:-20px;overflow:hidden}
.m-chip{height:36px;padding:0 16px;border-radius:18px;background:#FFFFFF;font-size:13px;font-weight:600;color:#4B4860;display:flex;align-items:center;white-space:nowrap;box-shadow:0 2px 8px rgba(30,27,46,.04)}
.m-chip.on{background:#1E1B2E;color:#FFFFFF}
.m-rq{flex:1;border-radius:24px;padding:14px;display:flex;flex-direction:column;gap:10px}
.m-price{font-size:18px;font-weight:700;letter-spacing:-.3px}
.m-price small{font-size:12px;font-weight:500}
.m-agc{flex:1;height:110px;border-radius:20px;padding:12px;display:flex;flex-direction:column;justify-content:space-between}
.m-agt{font-size:14px;font-weight:700}
.m-level{background:#E7E0FF;border-radius:24px;padding:16px;display:flex;gap:14px;align-items:flex-start}
.m-pb{height:8px;border-radius:4px;background:#FFFFFF}
.m-pb i{display:block;width:66%;height:8px;border-radius:4px;background:#6D28D9}
"""

# ============================================================
# 08 — "Kobalt" : bold brand blue + white sheet · Figtree · yellow accent
# ============================================================
GRID_BG = ('<svg width="390" height="360" viewBox="0 0 390 360" fill="none" style="position:absolute;left:0;top:0">'
           + "".join(f'<path d="M{x} 0V360" stroke="#FFFFFF" stroke-opacity=".06"/>' for x in range(26, 390, 26))
           + "".join(f'<path d="M0 {y}H390" stroke="#FFFFFF" stroke-opacity=".06"/>' for y in range(26, 360, 26))
           + '<circle cx="340" cy="70" r="120" fill="#3D86FF" fill-opacity=".35"/></svg>')


def k_tabbar(tabs, badges):
    out = []
    for i, (n, l) in enumerate(tabs):
        if n == "spark":
            out.append(f'<div class="k-tab"><div class="k-ai">{ic("spark", 24, "#0C1A33", 2.2)}</div></div>')
            continue
        on = i == 0
        col = "#0057F2" if on else "#8593AB"
        b = f'<span class="k-badge">{badges[i]}</span>' if i in badges else ""
        out.append(f'<div class="k-tab"><div class="rel">{ic(n, 24, col, 2 if on else 1.7)}{b}</div><span style="color:{col};font-weight:{700 if on else 500}">{l}</span></div>')
    return f'<div class="k-tabbar"><div class="k-tabrow">{"".join(out)}</div>{home_ind("#0C1A33")}</div>'


def k_head(sub, right):
    return f'<div class="k-head"><div class="row g10 ac"><div class="k-logo">{logo(26)}</div><div class="col g2"><span class="k-brand">Tezkor Himoya</span><span class="k-cap">{sub}</span></div></div><div class="row g8 ac">{right}</div></div>'


def k_btn(n, dot=False):
    return f'<div class="k-ib">{ic(n, 21, "#FFFFFF", 1.9)}{"<span class=k-dot></span>" if dot else ""}</div>'


def k_client():
    quick = [("siren", "SOS", "Shoshilinch", "linear-gradient(160deg,#FF5A5F,#E0263A)", "#FFFFFF"),
             ("bolt", "Tezkor advokat", "24/7 · 15 daq", "linear-gradient(160deg,#0B66FF,#0047D1)", "#FFFFFF"),
             ("car", "Avtohalokat", "Maslahat", "linear-gradient(160deg,#FFD25E,#FFB800)", "#0C1A33")]
    qc = "".join(f'<div class="k-q" style="background:{bg};color:{c}"><div class="k-q-ic" style="background:{"rgba(12,26,51,.1)" if c != "#FFFFFF" else "rgba(255,255,255,.2)"}">{ic(n, 22, c, 2)}</div><div class="col g2"><span class="k-q-t">{t}</span><span class="k-q-s">{s}</span></div></div>' for n, t, s, bg, c in quick)
    svc = [("heart", "Oilaviy"), ("brief", "Mehnat"), ("building", "Mulk"), ("trend", "Biznes"),
           ("scale", "Jinoiy"), ("file", "Shablon"), ("doc_ai", "Tahlil"), ("more", "Yana")]
    sv = "".join(f'<div class="k-svc"><div class="k-svc-ic">{ic(n, 24, "#0057F2", 1.8)}</div><span>{l}</span></div>' for n, l in svc)
    return f'''<div class="phone k" data-name="08 Kobalt · Mijoz">
<div class="k-top">{GRID_BG}
  {status_bar("#FFFFFF")}
  {k_head("Toshkent", k_btn("bell", True))}
  <div class="k-top-in">
    <span class="k-h1">Salom, Aziz</span>
    <span class="k-sub">Huquqiy yordam — bir necha soniyada</span>
    <div class="k-search">{ic("search", 22, "#0C1A33", 2)}<span class="f1">Muammoingizni yozing…</span><span class="k-ai-b">{ic("spark", 13, "#0C1A33", 2.2)}AI</span></div>
    <div class="row g8"><span class="k-stat"><b>2</b> faol buyurtma</span><span class="k-stat"><b>3</b> xabar</span><span class="k-stat"><b>10%</b> chegirma</span></div>
  </div>
</div>
<div class="k-sheet">
  <div class="k-handle"></div>
  <div class="k-sec"><span class="k-h2">Tezkor yordam</span></div>
  <div class="k-qs">{qc}</div>
  <div class="k-sec"><span class="k-h2">Xizmatlar</span><span class="k-link">Hammasi</span></div>
  <div class="k-svcs">{sv}</div>
  <div class="k-sec"><span class="k-h2">Faol buyurtma</span><span class="k-link">2 ta</span></div>
  <div class="k-order">
    <div class="row jb ac"><span class="k-pill">Jarayonda · 3/4</span><span class="k-ts">#LX-2048</span></div>
    <span class="k-t">Mehnat nizosi bo'yicha maslahat</span>
    <div class="k-pb"><i style="width:75%"></i></div>
    <div class="row jb ac"><div class="row g10 ac"><div class="k-av">DR</div><div class="col g2"><span class="k-t15">Dilnoza Rahimova</span><span class="k-ts">Bugun 15:30 · video</span></div></div><div class="k-cta">{ic("video", 16, "#FFFFFF", 2)}Qo'shilish</div></div>
  </div>
</div>
{k_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''


def k_pro():
    metrics = [("Javob foizi", "96%", 96, "#0057F2"), ("Qabul foizi", "88%", 88, "#7C5CFF"), ("O'rtacha javob", "6 daq", 80, "#12B76A")]
    mt = "".join(f'<div class="k-mrow"><span class="k-t15 f1">{a}</span><div class="k-mbar"><i style="width:{p}%;background:{c}"></i></div><span class="k-mv">{v}</span></div>' for a, v, p, c in metrics)
    ag = [("10:00", "Konsultatsiya", "Malika K. · video", True), ("14:00", "Sud majlisi", "Yunusobod tuman sudi", False), ("16:30", "Da'vo arizasi", "Ish #LX-1987", False)]
    agh = "".join(f'<div class="k-ag{" now" if now else ""}"><span class="k-ag-t">{t}</span><div class="col g2 f1"><span class="k-t15">{a}</span><span class="k-ts">{b}</span></div>{ic("chev", 18, "#8593AB", 2)}</div>' for t, a, b, now in ag)
    tog = '<div class="k-tog"><i></i>Onlayn</div>'
    return f'''<div class="phone k" data-name="08 Kobalt · Advokat">
<div class="k-top" style="height:372px">{GRID_BG}
  {status_bar("#FFFFFF")}
  {k_head("Ish maydoni · Advokat", tog + k_btn("bell", True))}
  <div class="k-top-in">
    <div class="k-seg"><span class="on">Bugun</span><span>Hafta</span><span>Oy</span></div>
    <span class="k-sub" style="margin-top:6px">Hafta daromadi</span>
    <div class="row g10 ac"><span class="k-big">4 850 000</span><span class="k-sub" style="font-weight:700;color:#FFFFFF">so'm</span><span class="k-up">+18%</span></div>
    <div class="row g8"><div class="k-box"><span class="k-box-v">12</span><span class="k-box-l">buyurtma</span></div><div class="k-box"><span class="k-box-v">4.9 ★</span><span class="k-box-l">reyting</span></div><div class="k-box"><span class="k-box-v">3,48 mln</span><span class="k-box-l">balans</span></div></div>
  </div>
</div>
<div class="k-sheet">
  <div class="k-handle"></div>
  <div class="k-req">
    <div class="k-req-top"><span class="row g6 ac">{ic("bolt", 14, "#0C1A33", 2.4)}Yangi tezkor buyurtma</span><span>04:59</span></div>
    <div class="k-req-in">
      <span class="k-t">Avtohalokat bo'yicha maslahat</span>
      <span class="k-ts row g4 ac">{ic("pin", 14, "#5A6B85", 2)}Chilonzor · 2.4 km · 250 000 so'm</span>
      <div class="row g10"><div class="k-btn ghost">Rad etish</div><div class="k-btn">Qabul qilish</div></div>
    </div>
  </div>
  <div class="k-sec"><span class="k-h2">Kun tartibi</span><span class="k-link">Kalendar</span></div>
  <div class="k-list">{agh}</div>
  <div class="k-sec"><span class="k-h2">Ko'rsatkichlar</span><span class="k-link">Batafsil</span></div>
  <div class="k-list" style="padding:6px 16px">{mt}</div>
  <div class="k-prof"><div class="k-prof-ring">{ring(52, 6, .8, "#E3E9F5", "#0057F2")}<span>80%</span></div><div class="col g2 f1"><span class="k-t15">Profilni to'ldiring</span><span class="k-ts">Litsenziya va tajriba qoldi</span></div><div class="k-cta" style="background:#0C1A33">To'ldirish</div></div>
</div>
{k_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''


K_CSS = """
.k{background:#FFFFFF;font-family:'Figtree',sans-serif;color:#0C1A33}
.k-top{height:340px;background:linear-gradient(165deg,#0B66FF 0%,#0057F2 50%,#0043C9 100%);position:relative;overflow:hidden}
.k-head{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;position:relative}
.k-logo{width:40px;height:40px;border-radius:13px;background:#FFFFFF;display:flex;align-items:center;justify-content:center}
.k-brand{font-size:16px;line-height:20px;font-weight:800;color:#FFFFFF}
.k-cap{font-size:12px;line-height:16px;font-weight:500;color:rgba(255,255,255,.72)}
.k-ib{width:42px;height:42px;border-radius:21px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);display:flex;align-items:center;justify-content:center;position:relative}
.k-dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:4px;background:#FFC93C;border:2px solid #0057F2}
.k-tog{height:32px;padding:0 12px;border-radius:16px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.22);color:#FFFFFF;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.k-tog i{width:8px;height:8px;border-radius:4px;background:#4ADE80}
.k-top-in{padding:10px 20px 0;display:flex;flex-direction:column;gap:10px;position:relative}
.k-h1{font-size:30px;line-height:36px;font-weight:800;color:#FFFFFF;letter-spacing:-.8px}
.k-sub{font-size:14px;line-height:20px;color:rgba(255,255,255,.8);font-weight:500;margin-top:-6px}
.k-search{height:56px;margin-top:6px;border-radius:18px;background:#FFFFFF;padding:0 8px 0 16px;display:flex;align-items:center;gap:12px;font-size:15px;color:#8593AB;box-shadow:0 12px 30px rgba(0,30,90,.25)}
.k-ai-b{height:36px;padding:0 12px;border-radius:12px;background:#FFC93C;color:#0C1A33;font-size:13px;font-weight:800;display:flex;align-items:center;gap:5px}
.k-stat{height:30px;padding:0 12px;border-radius:15px;background:rgba(255,255,255,.14);font-size:12px;color:rgba(255,255,255,.88);font-weight:500;display:flex;align-items:center;gap:4px}
.k-stat b{color:#FFFFFF;font-weight:800}
.k-sheet{margin-top:-36px;position:relative;background:#F2F5FB;border-radius:30px 30px 0 0;padding:10px 20px 124px;display:flex;flex-direction:column;gap:14px}
.k-handle{width:40px;height:5px;border-radius:3px;background:#D3DBEA;align-self:center}
.k-sec{display:flex;justify-content:space-between;align-items:center}
.k-h2{font-size:18px;line-height:24px;font-weight:800;letter-spacing:-.3px}
.k-link{font-size:14px;font-weight:700;color:#0057F2}
.k-qs{display:flex;gap:10px;margin-right:-20px;overflow:hidden}
.k-q{width:140px;height:124px;flex-shrink:0;border-radius:22px;padding:14px;display:flex;flex-direction:column;justify-content:space-between}
.k-q-ic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center}
.k-q-t{font-size:16px;line-height:20px;font-weight:800}
.k-q-s{font-size:12px;font-weight:600;opacity:.8}
.k-svcs{background:#FFFFFF;border-radius:24px;padding:16px 8px;display:flex;flex-wrap:wrap;row-gap:16px}
.k-svc{width:25%;display:flex;flex-direction:column;align-items:center;gap:8px}
.k-svc span{font-size:12px;font-weight:600;color:#33415C}
.k-svc-ic{width:52px;height:52px;border-radius:18px;background:#EEF4FF;display:flex;align-items:center;justify-content:center}
.k-order{background:#FFFFFF;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;border-left:4px solid #0057F2}
.k-pill{height:26px;padding:0 10px;border-radius:13px;background:#EEF4FF;color:#0057F2;font-size:12px;font-weight:800;display:flex;align-items:center}
.k-t{font-size:17px;line-height:23px;font-weight:800;letter-spacing:-.2px}
.k-t15{font-size:15px;line-height:20px;font-weight:700}
.k-ts{font-size:13px;line-height:18px;color:#5A6B85;font-weight:500}
.k-pb{height:6px;border-radius:3px;background:#E3E9F5}
.k-pb i{display:block;height:6px;border-radius:3px;background:#0057F2}
.k-av{width:40px;height:40px;border-radius:20px;background:#FFE7A3;color:#7A5300;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center}
.k-cta{height:38px;padding:0 14px;border-radius:12px;background:#0057F2;color:#FFFFFF;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.k-tabbar{position:absolute;left:0;right:0;bottom:0;height:90px;background:#FFFFFF;box-shadow:0 -1px 0 #E3E9F5}
.k-tabrow{height:62px;display:flex;align-items:center;padding:0 8px}
.k-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.k-tab span{font-size:11px;line-height:14px}
.k-ai{width:52px;height:52px;border-radius:18px;background:#FFC93C;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 18px rgba(255,185,0,.35)}
.k-badge{position:absolute;top:-4px;right:-9px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#F04438;color:#FFFFFF;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF}
.k-seg{height:38px;border-radius:12px;background:rgba(0,20,70,.25);padding:3px;display:flex;align-self:flex-start}
.k-seg span{width:72px;border-radius:9px;font-size:13px;font-weight:700;color:rgba(255,255,255,.75);display:flex;align-items:center;justify-content:center}
.k-seg span.on{background:#FFFFFF;color:#0057F2}
.k-big{font-size:36px;line-height:42px;font-weight:800;color:#FFFFFF;letter-spacing:-1.2px}
.k-up{height:24px;padding:0 8px;border-radius:12px;background:#FFC93C;color:#0C1A33;font-size:12px;font-weight:800;display:flex;align-items:center}
.k-box{flex:1;height:60px;border-radius:16px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.18);padding:10px 12px;display:flex;flex-direction:column;justify-content:space-between}
.k-box-v{font-size:16px;font-weight:800;color:#FFFFFF}
.k-box-l{font-size:11px;font-weight:600;color:rgba(255,255,255,.72)}
.k-req{background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 10px 26px rgba(12,26,51,.08)}
.k-req-top{height:38px;padding:0 16px;background:#FFC93C;display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:800}
.k-req-in{padding:14px 16px 16px;display:flex;flex-direction:column;gap:10px}
.k-btn{flex:1;height:48px;margin-top:4px;border-radius:14px;background:#0057F2;color:#FFFFFF;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center}
.k-btn.ghost{background:#EEF2F8;color:#0C1A33}
.k-list{background:#FFFFFF;border-radius:24px;padding:4px 16px;display:flex;flex-direction:column}
.k-ag{display:flex;align-items:center;gap:14px;padding:12px 0;border-bottom:1px solid #EEF2F8}
.k-ag:last-child{border-bottom:none}
.k-ag-t{width:56px;height:36px;border-radius:10px;background:#F2F5FB;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center}
.k-ag.now .k-ag-t{background:#0057F2;color:#FFFFFF}
.k-mrow{display:flex;align-items:center;gap:12px;padding:10px 0}
.k-mbar{width:96px;height:8px;border-radius:4px;background:#EEF2F8}
.k-mbar i{display:block;height:8px;border-radius:4px}
.k-mv{width:52px;text-align:right;font-size:15px;font-weight:800}
.k-prof{background:#FFFFFF;border-radius:24px;padding:14px 16px;display:flex;align-items:center;gap:14px}
.k-prof-ring{width:52px;height:52px;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.k-prof-ring svg{position:absolute;left:0;top:0}
.k-prof-ring span{font-size:12px;font-weight:800;position:relative}
"""

# ============================================================
SPECS = {
 "u": ("Ufq", "Aniq'ning rivoji: barcha tezkor amallar bitta kartada, chipta (ticket) shaklidagi buyurtma, advokat uchun soatlik kun jadvali va holat tanlagich.",
       "DM Sans (700 / 600 / 500)",
       [("Primary", "#0057F2"), ("Ink", "#101828"), ("Text 2", "#667085"), ("Muted", "#98A2B3"), ("Background", "#F4F6FA"), ("Surface", "#FFFFFF"), ("Border", "#E4E7EC"), ("Success", "#17B26A"), ("Warning", "#F79009"), ("Danger", "#F04438")],
       [("H1", "26 / 32 · 700 · -0.6"), ("H2", "18 / 24 · 700 · -0.3"), ("Karta sarlavha", "17 / 24 · 700"), ("KPI", "24 / 30 · 700 · -0.6"), ("Body", "15 / 20 · 600"), ("Caption", "13 / 18 · 400")],
       [("Karta / ticket", "24"), ("Servis ikonka", "20 (60×60)"), ("Segment", "14 / 10"), ("Button", "14"), ("Avatar / act", "22–24 (doira)")],
       [("Frame", "390 × auto (min 844)"), ("Gutter", "20 · gap 16"), ("Action card", "input h64 + 3 ustun"), ("Tab bar", "h90 · indikator 28×3"), ("Button", "h48 · mini h36")]),
 "g": ("Grafit", "Tun'ning rivoji: grafit fon, lime urg'u, bento tizimi, AI prompt kartasi, SOS halqalari, faollik xaritasi (heatmap).",
       "Sora (700 / 600 / 500 / 400)",
       [("Background", "#0A0C10"), ("Surface", "#14171E"), ("Chip", "#1F242E"), ("Border", "#252A35"), ("Text 2", "#8B93A7"), ("Lime", "#C8F560"), ("Blue", "#3F7BF6"), ("Sky", "#9CC0FF"), ("SOS", "#E5383B"), ("Amber", "#FFB547")],
       [("Display", "36 / 42 · 600 · -1.6"), ("H1", "28 / 34 · 600 · -1"), ("Prompt", "19 / 26 · 500"), ("Tile title", "16 / 21 · 600"), ("Body", "14 / 19 · 600"), ("Caption", "12 / 17 · 400")],
       [("Tile", "24"), ("Icon btn", "14"), ("Chip / pill", "16 (to'liq)"), ("Heatmap katak", "7"), ("Tab bar", "33 (pill)")],
       [("Frame", "390 × auto (min 844)"), ("Gutter", "20 · gap 12"), ("SOS tile", "160 × 212"), ("Tab bar", "h66 · inset 24 · bottom 30"), ("Button", "h48 r24")]),
 "m": ("Mozaika", "Yorqin'ning rivoji: issiq krem fon, turli o'lchamli pastel mozaika, AI chat namunasi, kunlik maqsad halqasi.",
       "Outfit (700 / 600 / 500)",
       [("Ink", "#1E1B2E"), ("Text 2", "#6B6880"), ("Background", "#FBF8F4"), ("Violet", "#6D28D9"), ("Lilac", "#E7E0FF"), ("Sky", "#D9E8FF"), ("Rose", "#FFDCE0"), ("Mint", "#D3F4E4"), ("Lemon", "#FFF1BF"), ("Peach", "#FFE3D0")],
       [("H1", "30 / 36 · 700 · -0.8"), ("H2", "19 / 24 · 700"), ("Goal", "28 / 32 · 700"), ("Tile title", "16 / 21 · 700"), ("Chat", "14 / 20 · 400"), ("Caption", "12.5 / 17 · 500")],
       [("Chat / goal", "28"), ("Tile / karta", "24"), ("Bubble", "18 (burchak 6)"), ("Icon box", "16 / 13"), ("Tab bar / input", "33 / 26 (pill)")],
       [("Frame", "390 × auto (min 844)"), ("Gutter", "20 · gap 14/12"), ("SOS tile", "166 × 232"), ("Tab bar", "h66 · inset 20"), ("Button", "h48 r24")]),
 "k": ("Kobalt", "Brend ko'k yuqori qism (to'r naqshli) va ustiga chiqadigan oq panel (sheet), sariq urg'u. Asosiy raqamlar tepada, amallar panelda.",
       "Figtree (800 / 700 / 600 / 500)",
       [("Primary", "#0057F2"), ("Primary dark", "#0043C9"), ("Ink", "#0C1A33"), ("Text 2", "#5A6B85"), ("Muted", "#8593AB"), ("Sheet", "#F2F5FB"), ("Tint", "#EEF4FF"), ("Yellow", "#FFC93C"), ("Danger", "#E0263A"), ("Success", "#12B76A")],
       [("Display", "36 / 42 · 800 · -1.2"), ("H1", "30 / 36 · 800 · -0.8"), ("H2", "18 / 24 · 800"), ("Karta", "17 / 23 · 800"), ("Body", "15 / 20 · 700"), ("Caption", "13 / 18 · 500")],
       [("Sheet (tepa)", "30"), ("Karta", "24"), ("Quick tile", "22"), ("Search", "18"), ("Icon box / btn", "14–18")],
       [("Frame", "390 × auto (min 844)"), ("Top", "h340 · grid 26px"), ("Quick tile", "140 × 124"), ("Tab bar", "h90 · AI 52 r18"), ("Button", "h48 / h38")]),
}


def spec_card(key):
    name, desc, font, colors, typ, rad, comp = SPECS[key]
    sw = "".join(f'<div class="sp-sw"><i style="background:{h}"></i><div class="col"><span class="sp-k">{n}</span><span class="sp-v">{h}</span></div></div>' for n, h in colors)
    rows = lambda items: "".join(f'<div class="sp-r"><span class="sp-k">{a}</span><span class="sp-v">{b}</span></div>' for a, b in items)
    return f'''<div class="spec">
  <div class="col g6"><span class="sp-t">Dizayn tokenlari</span><span class="sp-d">{desc}</span></div>
  <div class="col g8"><span class="sp-h">Shrift</span><span class="sp-font">{font}</span></div>
  <div class="col g8"><span class="sp-h">Ranglar</span><div class="sp-sws">{sw}</div></div>
  <div class="col g4"><span class="sp-h">Tipografiya · size / line · weight · tracking</span>{rows(typ)}</div>
  <div class="col g4"><span class="sp-h">Border radius (px)</span>{rows(rad)}</div>
  <div class="col g4"><span class="sp-h">O'lchamlar</span>{rows(comp)}</div>
  <div class="col g4"><span class="sp-h">Ikonkalar</span><span class="sp-d">24×24 grid, stroke 1.7–2.2, round cap/join. Tab: 22–24px.</span></div>
</div>'''


BASE = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#E4E6EB}
body{font-family:'Inter',sans-serif;padding:72px;color:#111318;-webkit-font-smoothing:antialiased}
.board{display:flex;flex-direction:column;gap:120px;width:max-content}
.cover{display:flex;flex-direction:column;gap:12px;max-width:940px}
.cover h1{font-size:44px;line-height:52px;font-weight:800;letter-spacing:-1.2px}
.cover p{font-size:17px;line-height:26px;color:#4B5263}
.cover-tags{display:flex;gap:8px;margin-top:8px}
.cover-tags span{height:32px;padding:0 14px;border-radius:16px;background:#FFFFFF;font-size:13px;font-weight:600;display:flex;align-items:center;color:#30364A}
.variant{display:flex;flex-direction:column;gap:28px}
.vh{display:flex;align-items:baseline;gap:16px}
.vh-n{font-size:15px;font-weight:700;color:#FFFFFF;background:#111318;height:32px;padding:0 12px;border-radius:10px;display:flex;align-items:center}
.vh-t{font-size:32px;font-weight:800;letter-spacing:-.8px}
.vh-s{font-size:16px;color:#5B6274}
.vrow{display:flex;gap:56px;align-items:flex-start}
.fr{display:flex;flex-direction:column;gap:12px}
.fr-l{font-size:14px;font-weight:700;color:#4B5263}
.phone{width:390px;min-height:844px;position:relative;overflow:hidden;border-radius:44px;box-shadow:0 30px 60px rgba(17,19,24,.16),0 0 0 1px rgba(17,19,24,.06)}
.sb{height:50px;padding:0 28px 0 36px;display:flex;align-items:center;justify-content:space-between;position:relative}
.sb-time{font-family:-apple-system,'SF Pro Text','Inter',sans-serif;font-size:17px;font-weight:600}
.sb-r{display:flex;align-items:center;gap:6px}
.hi{position:absolute;left:128px;bottom:8px;width:134px;height:5px;border-radius:3px}
.row{display:flex}.col{display:flex;flex-direction:column}.f1{flex:1;min-width:0}.rel{position:relative;display:flex}
.ac{align-items:center}.as{align-items:flex-start}.jb{justify-content:space-between}
.g2{gap:2px}.g4{gap:4px}.g6{gap:6px}.g8{gap:8px}.g10{gap:10px}.g12{gap:12px}.g14{gap:14px}.g16{gap:16px}
svg{flex-shrink:0;display:block}
.spec{width:340px;background:#FFFFFF;border-radius:28px;padding:24px;display:flex;flex-direction:column;gap:22px}
.sp-t{font-size:20px;font-weight:800;letter-spacing:-.3px}
.sp-d{font-size:13px;line-height:19px;color:#5B6274}
.sp-h{font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#8A90A0}
.sp-font{font-size:14px;font-weight:700}
.sp-sws{display:flex;flex-wrap:wrap;gap:10px}
.sp-sw{width:141px;display:flex;align-items:center;gap:10px}
.sp-sw i{width:32px;height:32px;border-radius:10px;box-shadow:inset 0 0 0 1px rgba(17,19,24,.08);flex-shrink:0}
.sp-r{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid #F0F1F4}
.sp-k{font-size:13px;font-weight:600;color:#111318}
.sp-v{font-size:12px;font-weight:500;color:#5B6274;font-family:ui-monospace,'SF Mono',Menlo,monospace}
"""

FONTS = ("https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700"
         "&family=Sora:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Figtree:wght@500;600;700;800"
         "&family=Inter:wght@500;600;700;800&display=swap")

VARIANTS = [("u", "05", "Ufq", "Clean light 2.0 · DM Sans · bitta action-karta, ticket, soatlik jadval", u_client, u_pro),
            ("g", "06", "Grafit", "Dark bento 2.0 · Sora · lime urg'u, heatmap", g_client, g_pro),
            ("m", "07", "Mozaika", "Pastel mozaika · Outfit · AI chat namunasi", m_client, m_pro),
            ("k", "08", "Kobalt", "Brend ko'k + oq sheet · Figtree · sariq urg'u", k_client, k_pro)]

secs = []
for key, num, name, sub, fc, fp in VARIANTS:
    if ONLY and key != ONLY:
        continue
    secs.append(f'''<section class="variant" data-name="Variant {num} — {name}">
  <div class="vh"><span class="vh-n">{num}</span><span class="vh-t">{name}</span><span class="vh-s">{sub}</span></div>
  <div class="vrow"><div class="fr"><span class="fr-l">Mijoz · Home</span>{fc()}</div><div class="fr"><span class="fr-l">Advokat / Worker · Home</span>{fp()}</div>{spec_card(key)}</div>
</section>''')

html = f'''<!doctype html>
<html lang="uz"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tezkor Himoya Home</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<style>{BASE}{U_CSS}{G_CSS}{M_CSS}{K_CSS}</style></head>
<body><div class="board">
  <div class="cover">
    <h1>Tezkor Himoya — Home ekran, 4 yangi variant</h1>
    <p>Aniq, Tun va Yorqin yo'nalishlari asosida yangi variantlar: Mijoz va Advokat (worker) Home ekranlari, yonida dizayn tokenlari. Frame 390 pt, to'liq scroll balandligi. Logo va nom hozirgidek.</p>
    <div class="cover-tags"><span>05 Ufq</span><span>06 Grafit</span><span>07 Mozaika</span><span>08 Kobalt</span><span>Flex → Figma Auto Layout</span></div>
  </div>
  {"".join(secs)}
</div></body></html>'''

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)
print("wrote", OUT, len(html))
