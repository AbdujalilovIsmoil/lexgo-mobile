#!/usr/bin/env python3
"""Generates design/home-screens.html: 4 Home-screen variants x (Mijoz, Advokat) as static, Figma-importable HTML."""
import sys

OUT = sys.argv[1]
ONLY = sys.argv[2] if len(sys.argv) > 2 else None

# ---------- icons (24x24 stroke, Lucide-style) ----------
I = {
 "home": '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
 "grid": '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
 "spark": '<path d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z"/><path d="M19 15l.7 2.1 2.1.7-2.1.7L19 20.6l-.7-2.1-2.1-.7 2.1-.7z"/>',
 "bag": '<rect x="3" y="7" width="18" height="14" rx="2.5"/><path d="M8 7V5.5A2.5 2.5 0 0 1 10.5 3h3A2.5 2.5 0 0 1 16 5.5V7"/><path d="M3 12h18"/>',
 "msg": '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20.5l1.4-4.9A8 8 0 1 1 21 12z"/>',
 "bell": '<path d="M18 8.5a6 6 0 1 0-12 0c0 6.5-2.5 8.5-2.5 8.5h17S18 15 18 8.5"/><path d="M10.3 20.5a2 2 0 0 0 3.4 0"/>',
 "search": '<circle cx="11" cy="11" r="7"/><path d="m20.5 20.5-4.5-4.5"/>',
 "shield": '<path d="M12 21.5s8-3.6 8-9.8V5.2L12 2.5 4 5.2v6.5c0 6.2 8 9.8 8 9.8z"/><path d="m8.8 11.8 2.2 2.2 4.4-4.4"/>',
 "siren": '<path d="M7 18v-6a5 5 0 0 1 10 0v6"/><path d="M5 18h14v3H5z"/><path d="M12 2v2M4.2 5.2l1.4 1.4M19.8 5.2l-1.4 1.4M2 12h1.5M20.5 12H22"/>',
 "car": '<path d="M5 16.5h14M3 16.5V12l2.2-5.2A2 2 0 0 1 7 5.5h10a2 2 0 0 1 1.8 1.3L21 12v4.5"/><path d="M3 12h18"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
 "file": '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/>',
 "scale": '<path d="M12 3v18M7.5 21h9M4.5 7h15M12 5.5"/><path d="M4.5 7 2 13.5a2.8 2.8 0 0 0 5 0zM19.5 7 17 13.5a2.8 2.8 0 0 0 5 0z"/>',
 "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20.5v-1A4.5 4.5 0 0 1 7 15h4a4.5 4.5 0 0 1 4.5 4.5v1"/><path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M21.5 20.5v-1a4.5 4.5 0 0 0-3-4.2"/>',
 "heart": '<path d="M12 20.5s-8.5-4.8-8.5-11A4.8 4.8 0 0 1 12 6.6a4.8 4.8 0 0 1 8.5 2.9c0 6.2-8.5 11-8.5 11z"/>',
 "brief": '<rect x="2.5" y="7" width="19" height="13.5" rx="2.5"/><path d="M8.5 7V5a1.5 1.5 0 0 1 1.5-1.5h4A1.5 1.5 0 0 1 15.5 5v2M2.5 12.5h19"/>',
 "building": '<path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M16 9h3a1 1 0 0 1 1 1v11M2.5 21h19"/><path d="M8 7.5h4M8 11.5h4M8 15.5h4"/>',
 "trend": '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
 "inbox": '<path d="M2.5 13h5l1.5 3h6l1.5-3h5"/><path d="M5.5 5h13l3 8v5.5a2 2 0 0 1-2 2h-15a2 2 0 0 1-2-2V13z"/>',
 "cal": '<rect x="3" y="4.5" width="18" height="16.5" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
 "star": '<path d="m12 2.8 2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z"/>',
 "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
 "wallet": '<path d="M19 7.5V5.5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H5"/><circle cx="16.5" cy="14" r="1.3"/>',
 "chev": '<path d="m9 6 6 6-6 6"/>',
 "arrowr": '<path d="M5 12h14M13 6l6 6-6 6"/>',
 "arrowup": '<path d="M12 19V5M6 11l6-6 6 6"/>',
 "upright": '<path d="M7 17 17 7M8 7h9v9"/>',
 "mic": '<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4"/>',
 "clip": '<path d="m20.5 11.5-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l8.6-8.6a3.7 3.7 0 0 1 5.2 5.2l-8.6 8.6a1.8 1.8 0 0 1-2.6-2.6l7.9-7.9"/>',
 "check": '<path d="m4.5 12.5 4.5 4.5L19.5 6.5"/>',
 "checkc": '<circle cx="12" cy="12" r="9"/><path d="m8 12.3 2.8 2.8L16.2 9.6"/>',
 "phone": '<path d="M21 16.5v3a1.8 1.8 0 0 1-2 1.8A17.5 17.5 0 0 1 2.7 5 1.8 1.8 0 0 1 4.5 3h3a1.8 1.8 0 0 1 1.8 1.5c.1 1 .4 1.9.7 2.7a1.8 1.8 0 0 1-.4 1.9L8.3 10.4a14 14 0 0 0 5.3 5.3l1.3-1.3a1.8 1.8 0 0 1 1.9-.4c.9.3 1.8.6 2.7.7a1.8 1.8 0 0 1 1.5 1.8z"/>',
 "gift": '<rect x="3" y="8" width="18" height="4.5" rx="1"/><path d="M4.5 12.5V20a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-7.5M12 8v13"/><path d="M12 8S10.8 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.2-5 4-5a2.5 2.5 0 0 1 0 5"/>',
 "plus": '<path d="M12 5v14M5 12h14"/>',
 "video": '<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5"/>',
 "pin": '<path d="M19.5 10c0 6-7.5 11.5-7.5 11.5S4.5 16 4.5 10a7.5 7.5 0 0 1 15 0z"/><circle cx="12" cy="10" r="2.6"/>',
 "tasks": '<path d="M9.5 6h11M9.5 12h11M9.5 18h11"/><path d="m3.5 6 1.5 1.5L7.5 5M3.5 12l1.5 1.5L7.5 11"/><circle cx="5" cy="18" r="1.3"/>',
 "scan": '<path d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16M7 12h10"/>',
 "more": '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
 "bolt": '<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z"/>',
 "award": '<circle cx="12" cy="9" r="6"/><path d="m8.5 14 -1.5 7.5L12 19l5 2.5-1.5-7.5"/>',
 "user": '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 "filter": '<path d="M3 5h18M6.5 12h11M10 19h4"/>',
 "doc_ai": '<path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h5"/><path d="M14 2.5V8h5.5v3"/><path d="M17.5 14l.9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9z"/>',
}

def ic(name, size=24, color="currentColor", sw=1.8, fill="none"):
    return (f'<svg width="{size}" height="{size}" viewBox="0 0 24 24" fill="{fill}" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{I[name]}</svg>')

def logo(size, ink="#1B1C20", blue="#0057F2"):
    return (f'<svg width="{size}" height="{size}" viewBox="156 163 940 940">'
            f'<path fill="{ink}" d="M229 614 C204.1 517.9 204.5 415.9 219 318 L627 170 L1036 316 C1057.3 476.9 1032.5 643.9 961 790 C959.1 660.9 958.9 530.6 938 403 L627 279 L309 401 C304.0 452.3 297.6 504.8 307 556 L229 614 Z"/>'
            f'<path fill="{ink}" d="M346 437 C503.0 367.6 684.6 372.5 849 412 L848 508 C761.9 484.6 671.9 476.6 583 483 L583 922 L481 820 L481 494 C433.9 499.4 388.5 515.4 346 536 L346 437 Z"/>'
            f'<path fill="{blue}" d="M628 532 L723 537 L723 660 L836 660 L838 550 L925 567 L929 812 L836 883 L836 756 L723 756 L723 940 L628 970 L628 532 Z"/>'
            f'<path fill="{blue}" d="M242 664 L324 603 C370.8 771.3 485.0 921.8 637 1008 C735.8 977.1 831.8 932.3 912 866 C837.2 964.6 735.6 1039.4 627 1097 C448.5 1012.2 295.9 857.0 242 664 Z"/>'
            '</svg>')

def status_bar(color):
    return f'''<div class="sb" style="color:{color}">
  <span class="sb-time">9:41</span>
  <div class="sb-r">
    <svg width="18" height="12" viewBox="0 0 18 12" fill="{color}"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="{color}"><path d="M8 2.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 8 .5C5.2.5 2.7 1.6.8 3.4L2 4.6a8.5 8.5 0 0 1 6-2.4zm0 3.4c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.9 6.9 0 0 0 8 3.9 6.9 6.9 0 0 0 3.2 5.8L4.4 7c1-.9 2.2-1.4 3.6-1.4zM8 9a1.6 1.6 0 0 0-1.2.5L8 11.5l1.2-2A1.6 1.6 0 0 0 8 9z"/></svg>
    <svg width="27" height="13" viewBox="0 0 27 13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="{color}" opacity=".4"/><rect x="2" y="2" width="20" height="9" rx="2" fill="{color}"/><rect x="25" y="4.5" width="1.6" height="4" rx=".8" fill="{color}" opacity=".5"/></svg>
  </div>
</div>'''

def home_ind(color):
    return f'<div class="hi" style="background:{color}"></div>'

CLIENT_TABS = [("home", "Asosiy"), ("grid", "Xizmatlar"), ("spark", "AI"), ("bag", "Buyurtmalar"), ("msg", "Xabarlar")]
PRO_TABS = [("home", "Asosiy"), ("inbox", "So'rovlar"), ("spark", "AI"), ("users", "Mijozlar"), ("msg", "Xabarlar")]

# ============================================================
# V1 — "Aniq" : clean light, Manrope, solid brand blue
# ============================================================
def v1_tabbar(tabs, badges):
    items = []
    for i, (icn, lab) in enumerate(tabs):
        if icn == "spark":
            items.append(f'<div class="v1-tab"><div class="v1-ai">{ic("spark", 26, "#FFFFFF", 2)}</div></div>')
            continue
        active = i == 0
        col = "#0057F2" if active else "#8A94A6"
        b = f'<span class="v1-badge">{badges[i]}</span>' if i in badges else ""
        items.append(f'<div class="v1-tab"><div class="v1-tab-ic">{ic(icn, 24, col, 2 if active else 1.8)}{b}</div>'
                     f'<span class="v1-tab-l" style="color:{col};font-weight:{700 if active else 600}">{lab}</span></div>')
    return f'<div class="v1-tabbar"><div class="v1-tabrow">{"".join(items)}</div>{home_ind("#0F1524")}</div>'

def v1_header(sub, right):
    return f'''<div class="v1-header">
  <div class="row g10 ac">{logo(36)}<div class="col g2"><span class="v1-brand">Tezkor Himoya</span><span class="v1-cap row g4 ac">{sub}</span></div></div>
  <div class="row g8 ac">{right}</div>
</div>'''

def v1_iconbtn(name, dot=False):
    d = '<span class="v1-dot"></span>' if dot else ""
    return f'<div class="v1-iconbtn">{ic(name, 22, "#0F1524")}{d}</div>'

def v1_client():
    svc = [("heart", "Oilaviy", "#FFF0F3", "#E5484D"), ("brief", "Mehnat", "#EEF4FF", "#0057F2"),
           ("building", "Ko'chmas mulk", "#EAF8F1", "#12A267"), ("trend", "Biznes", "#FFF6E5", "#D98A00"),
           ("scale", "Jinoiy ish", "#F2EEFF", "#6E56CF"), ("file", "Shablonlar", "#E8F7FA", "#0A8FA3")]
    tiles = "".join(f'<div class="v1-svc"><div class="v1-svc-ic" style="background:{bg}">{ic(n, 24, c)}</div><span class="v1-svc-l">{l}</span></div>' for n, l, bg, c in svc)
    lawyers = [("DR", "Dilnoza Rahimova", "Oila huquqi", "4.9", "180 000", "#DCE8FF", "#0057F2"),
               ("SA", "Sardor Aliyev", "Mehnat nizolari", "4.8", "150 000", "#E3F6EC", "#12A267"),
               ("MN", "Malika Nur", "Biznes", "5.0", "220 000", "#FCE9EC", "#E5484D")]
    lc = "".join(f'''<div class="v1-law">
  <div class="row jb as"><div class="v1-av" style="background:{bg};color:{c}">{ini}</div><div class="v1-rate">{ic("star", 12, "#F5A524", 0, "#F5A524")}<span>{r}</span></div></div>
  <div class="col g2"><span class="v1-law-n">{n}</span><span class="v1-law-s">{s}</span></div>
  <div class="v1-law-p"><span class="v1-law-pv">{p}</span><span class="v1-law-pu">so'm dan</span></div>
</div>''' for ini, n, s, r, p, bg, c in lawyers)
    right = v1_iconbtn("bell", True) + '<div class="v1-avatar">AK</div>'
    return f'''<div class="phone v1" data-name="V1 · Mijoz · Home">
{status_bar("#0F1524")}
{v1_header(ic("pin", 12, "#8A94A6", 2) + "Toshkent", right)}
<div class="v1-body">
  <div class="col g4"><span class="v1-h1">Salom, Aziz</span><span class="v1-sub">Bugun qanday huquqiy yordam kerak?</span></div>

  <div class="v1-ask">
    <div class="v1-chip-ai">{ic("spark", 14, "#0057F2", 2)}<span>AI yordamchi</span></div>
    <span class="v1-ask-t">Muammoingizni yozing, masalan: <b>maoshim 3 oydan beri to'lanmayapti</b></span>
    <div class="row jb ac">
      <div class="row g8"><div class="v1-sq">{ic("clip", 20, "#4A5468")}</div><div class="v1-sq">{ic("mic", 20, "#4A5468")}</div></div>
      <div class="v1-send"><span>Yuborish</span>{ic("arrowr", 18, "#FFFFFF", 2)}</div>
    </div>
  </div>

  <div class="row g12">
    <div class="v1-urg" style="background:#FFF1F0;border-color:#FFD9D6">
      <div class="v1-urg-ic" style="background:#E5484D">{ic("siren", 22, "#FFFFFF", 2)}</div>
      <div class="col g2"><span class="v1-urg-t">SOS</span><span class="v1-urg-s">Shoshilinch yordam</span></div>
    </div>
    <div class="v1-urg" style="background:#EEF4FF;border-color:#D6E4FF">
      <div class="v1-urg-ic" style="background:#0057F2">{ic("bolt", 22, "#FFFFFF", 2)}</div>
      <div class="col g2"><span class="v1-urg-t">Tezkor advokat</span><span class="v1-urg-s">24/7 · 15 daq</span></div>
    </div>
  </div>
  <div class="v1-row">
    <div class="v1-row-ic">{ic("car", 22, "#0F1524")}</div>
    <div class="col g2 f1"><span class="v1-row-t">Avtohalokat · maslahat</span><span class="v1-row-s">YPX hujjatlari va sug'urta bo'yicha</span></div>
    {ic("chev", 20, "#8A94A6", 2)}
  </div>

  <div class="v1-sec"><span class="v1-h2">Xizmatlar</span><span class="v1-link">Hammasi</span></div>
  <div class="v1-svcgrid">{tiles}</div>

  <div class="v1-sec"><span class="v1-h2">Faol buyurtma</span><span class="v1-link">2 ta</span></div>
  <div class="v1-card">
    <div class="row jb ac"><span class="v1-pill" style="background:#E7F7EF;color:#0E8A57"><i class="v1-pdot" style="background:#12A267"></i>Jarayonda</span><span class="v1-id">#LX-2048</span></div>
    <span class="v1-card-t">Mehnat nizosi bo'yicha maslahat</span>
    <div class="row g12 ac">
      <div class="v1-av" style="background:#DCE8FF;color:#0057F2">DR</div>
      <div class="col g2 f1"><span class="v1-law-n">Dilnoza Rahimova</span><span class="v1-law-s row g4 ac">Advokat · {ic("star", 12, "#F5A524", 0, "#F5A524")} 4.9</span></div>
      <div class="v1-sq">{ic("msg", 20, "#0F1524")}</div><div class="v1-sq">{ic("phone", 20, "#0F1524")}</div>
    </div>
    <div class="col g8">
      <div class="row g4"><i class="v1-step on"></i><i class="v1-step on"></i><i class="v1-step on"></i><i class="v1-step"></i></div>
      <div class="row jb"><span class="v1-mini">Yuborildi</span><span class="v1-mini">Qabul</span><span class="v1-mini b">Jarayonda</span><span class="v1-mini">Yakun</span></div>
    </div>
    <div class="v1-meet">{ic("video", 18, "#0057F2")}<span class="f1">Bugun 15:30 · Video</span><span class="v1-link">Qo'shilish</span></div>
  </div>

  <div class="v1-sec"><span class="v1-h2">Tavsiya etilgan advokatlar</span><span class="v1-link">Hammasi</span></div>
  <div class="v1-hscroll">{lc}</div>

  <div class="v1-ref">
    <div class="v1-ref-ic">{ic("gift", 22, "#0057F2")}</div>
    <div class="col g8 f1">
      <div class="col g2"><span class="v1-row-t">Do'stlarni taklif qiling</span><span class="v1-row-s">2/5 bajarildi · 10% chegirma</span></div>
      <div class="v1-bar"><i style="width:40%"></i></div>
    </div>
  </div>
</div>
{v1_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''

def v1_pro():
    bars = [42, 64, 38, 80, 56, 92, 30]
    days = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]
    chart = "".join(f'<div class="col g6 ac"><div class="v1-bc"><i style="height:{h}%;background:{"#FFFFFF" if i == 5 else "rgba(255,255,255,.32)"}"></i></div><span class="v1-bd">{d}</span></div>' for i, (h, d) in enumerate(zip(bars, days)))
    metrics = [("star", "Reyting", "4.9", "128 baho", "#FFF6E5", "#D98A00", 98),
               ("msg", "Javob foizi", "96%", "maqsad 90%", "#EEF4FF", "#0057F2", 96),
               ("clock", "O'rtacha javob", "6 daq", "maqsad 10 daq", "#EAF8F1", "#12A267", 80),
               ("checkc", "Qabul foizi", "88%", "oxirgi 30 kun", "#F2EEFF", "#6E56CF", 88)]
    mc = "".join(f'''<div class="v1-met">
  <div class="row jb ac"><div class="v1-met-ic" style="background:{bg}">{ic(n, 18, c, 2)}</div>{ic("upright", 16, "#8A94A6", 2)}</div>
  <div class="col g2"><span class="v1-met-v">{v}</span><span class="v1-met-l">{l}</span></div>
  <div class="v1-bar sm"><i style="width:{p}%;background:{c}"></i></div>
  <span class="v1-mini">{s}</span>
</div>''' for n, l, v, s, bg, c, p in metrics)
    sched = [("10:00", "Konsultatsiya · Malika K.", "Video qo'ng'iroq · 45 daq", "#0057F2", True),
             ("14:00", "Sud majlisi", "Yunusobod tuman sudi", "#E5484D", False),
             ("16:30", "Da'vo arizasini tayyorlash", "Ish #LX-1987", "#12A267", False)]
    sc = "".join(f'''<div class="v1-tl">
  <span class="v1-tl-t">{t}</span>
  <div class="v1-tl-line"><i style="background:{c}"></i></div>
  <div class="v1-tl-c{" now" if now else ""}"><span class="v1-row-t">{a}</span><span class="v1-row-s">{b}</span></div>
</div>''' for t, a, b, c, now in sched)
    cases = [("Ajrim va aliment", "Oila huquqi", "300 000 so'm", "12 daq oldin"),
             ("Ijara shartnomasini tekshirish", "Ko'chmas mulk", "180 000 so'm", "40 daq oldin")]
    cc = "".join(f'''<div class="v1-case">
  <div class="col g6 f1"><span class="v1-tag">{tg}</span><span class="v1-row-t">{t}</span><span class="v1-row-s">{w} · {p}</span></div>
  <div class="v1-sq">{ic("chev", 20, "#0F1524", 2)}</div>
</div>''' for t, tg, p, w in cases)
    right = '<div class="v1-online"><i></i>Onlayn</div>' + v1_iconbtn("bell", True)
    return f'''<div class="phone v1" data-name="V1 · Advokat · Home">
{status_bar("#0F1524")}
{v1_header("Ish maydoni · Advokat", right)}
<div class="v1-body">
  <div class="col g4"><span class="v1-h1">Xayrli tong, Jasur</span><span class="v1-sub">Adolat yo'lida, har kuni.</span></div>

  <div class="v1-earn">
    <div class="row jb as">
      <div class="col g4"><span class="v1-earn-l">Bu hafta daromad</span><span class="v1-earn-v">4 850 000 <small>so'm</small></span></div>
      <span class="v1-earn-d">{ic("trend", 14, "#FFFFFF", 2.2)}+18%</span>
    </div>
    <div class="v1-chart">{chart}</div>
    <div class="v1-earn-f"><span>{ic("wallet", 16, "#FFFFFF")}Balans: 3 480 000 so'm</span><span>To'lov: 14-noy</span></div>
  </div>

  <div class="v1-alert">
    <div class="row jb ac"><span class="v1-pill" style="background:#FFF1E5;color:#C2410C">{ic("bolt", 13, "#C2410C", 2.2)}Yangi tezkor buyurtma</span><span class="v1-timer">{ic("clock", 14, "#C2410C", 2)}04:59</span></div>
    <div class="col g4"><span class="v1-card-t">Avtohalokat bo'yicha maslahat</span><span class="v1-row-s row g4 ac">{ic("pin", 14, "#8A94A6")}Chilonzor · 2.4 km · 250 000 so'm</span></div>
    <div class="row g10"><div class="v1-btn ghost">Rad etish</div><div class="v1-btn">Qabul qilish</div></div>
  </div>

  <div class="v1-sec"><span class="v1-h2">Ko'rsatkichlar</span><span class="v1-link">Batafsil</span></div>
  <div class="v1-metgrid">{mc}</div>

  <div class="v1-sec"><span class="v1-h2">Bugungi jadval</span><span class="v1-link">Kalendar</span></div>
  <div class="v1-card g14">{sc}</div>

  <div class="v1-sec"><span class="v1-h2">Yangi keyslar</span><span class="v1-pill" style="background:#EEF4FF;color:#0057F2">7 ta yangi</span></div>
  <div class="col g10">{cc}</div>

  <div class="v1-ref">
    <div class="v1-ref-ic">{ic("user", 22, "#0057F2")}</div>
    <div class="col g8 f1">
      <div class="row jb"><span class="v1-row-t">Profil to'liqligi</span><span class="v1-row-t" style="color:#0057F2">80%</span></div>
      <div class="v1-bar"><i style="width:80%"></i></div>
      <span class="v1-row-s">Qolgan: 2 — litsenziya va ish tajribasi</span>
    </div>
  </div>
</div>
{v1_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''

V1_CSS = """
.v1{background:#F6F7F9;font-family:'Manrope',sans-serif;color:#0F1524}
.v1-header{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}
.v1-brand{font-size:16px;line-height:20px;font-weight:800;letter-spacing:-.2px}
.v1-cap{font-size:12px;line-height:16px;font-weight:600;color:#8A94A6}
.v1-iconbtn{width:44px;height:44px;border-radius:14px;background:#FFFFFF;border:1px solid #E7EAF0;display:flex;align-items:center;justify-content:center;position:relative}
.v1-dot{position:absolute;top:10px;right:11px;width:8px;height:8px;border-radius:4px;background:#E5484D;border:2px solid #FFFFFF}
.v1-avatar{width:44px;height:44px;border-radius:14px;background:#0F1524;color:#FFFFFF;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center}
.v1-online{height:32px;padding:0 12px;border-radius:16px;background:#E7F7EF;color:#0E8A57;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.v1-online i{width:8px;height:8px;border-radius:4px;background:#12A267}
.v1-body{padding:8px 20px 124px;display:flex;flex-direction:column;gap:16px}
.v1-h1{font-size:28px;line-height:34px;font-weight:800;letter-spacing:-.6px}
.v1-sub{font-size:15px;line-height:22px;font-weight:500;color:#5B6478}
.v1-h2{font-size:18px;line-height:24px;font-weight:800;letter-spacing:-.3px}
.v1-sec{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.v1-link{font-size:14px;line-height:20px;font-weight:700;color:#0057F2}
.v1-ask{background:#FFFFFF;border:1px solid #E7EAF0;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 8px 24px rgba(15,21,36,.06)}
.v1-chip-ai{align-self:flex-start;height:28px;padding:0 10px;border-radius:14px;background:#EEF4FF;color:#0057F2;font-size:12px;font-weight:700;display:flex;gap:6px;align-items:center}
.v1-ask-t{font-size:15px;line-height:22px;color:#8A94A6;font-weight:500}
.v1-ask-t b{color:#4A5468;font-weight:600}
.v1-sq{width:40px;height:40px;border-radius:12px;background:#F2F4F7;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v1-send{height:40px;padding:0 14px 0 16px;border-radius:12px;background:#0057F2;color:#FFFFFF;font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}
.v1-urg{flex:1;min-width:0;height:76px;border-radius:20px;border:1px solid;padding:12px 10px;display:flex;align-items:center;gap:8px}
.v1-urg-ic{width:40px;height:40px;border-radius:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v1-urg-t{white-space:nowrap;font-size:14px;line-height:20px;font-weight:800}
.v1-urg-s{font-size:12px;line-height:16px;font-weight:600;color:#5B6478}
.v1-row{background:#FFFFFF;border:1px solid #E7EAF0;border-radius:20px;padding:14px 16px;display:flex;align-items:center;gap:12px}
.v1-row-ic{width:44px;height:44px;border-radius:14px;background:#F2F4F7;display:flex;align-items:center;justify-content:center}
.v1-row-t{font-size:15px;line-height:20px;font-weight:700}
.v1-row-s{font-size:13px;line-height:18px;font-weight:500;color:#5B6478}
.v1-svcgrid{display:flex;flex-wrap:wrap;gap:12px}
.v1-svc{width:108px;height:104px;background:#FFFFFF;border:1px solid #E7EAF0;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.v1-svc-ic{width:48px;height:48px;border-radius:16px;display:flex;align-items:center;justify-content:center}
.v1-svc-l{font-size:13px;line-height:16px;font-weight:700}
.v1-card{background:#FFFFFF;border:1px solid #E7EAF0;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:14px}
.v1-pill{height:26px;padding:0 10px;border-radius:13px;font-size:12px;font-weight:700;display:inline-flex;align-items:center;gap:6px}
.v1-pdot{width:6px;height:6px;border-radius:3px}
.v1-id{font-size:12px;font-weight:700;color:#8A94A6}
.v1-card-t{font-size:17px;line-height:24px;font-weight:800;letter-spacing:-.2px}
.v1-av{width:44px;height:44px;border-radius:22px;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v1-step{flex:1;height:6px;border-radius:3px;background:#E7EAF0}
.v1-step.on{background:#0057F2}
.v1-mini{font-size:11px;line-height:14px;font-weight:600;color:#8A94A6}
.v1-mini.b{color:#0057F2;font-weight:800}
.v1-meet{height:44px;border-radius:14px;background:#F2F6FF;padding:0 12px;display:flex;align-items:center;gap:10px;font-size:13px;font-weight:700}
.v1-hscroll{display:flex;gap:12px;margin-right:-20px;overflow:hidden}
.v1-law{width:164px;flex-shrink:0;background:#FFFFFF;border:1px solid #E7EAF0;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:12px}
.v1-rate{height:22px;padding:0 8px;border-radius:11px;background:#FFF6E5;display:flex;align-items:center;gap:4px;font-size:12px;font-weight:800}
.v1-law-n{font-size:14px;line-height:18px;font-weight:800}
.v1-law-s{font-size:12px;line-height:16px;font-weight:600;color:#5B6478}
.v1-law-p{display:flex;align-items:baseline;gap:4px;padding-top:10px;border-top:1px solid #EEF0F4}
.v1-law-pv{font-size:15px;font-weight:800}
.v1-law-pu{font-size:11px;font-weight:600;color:#8A94A6}
.v1-ref{background:#FFFFFF;border:1px dashed #B7CCF7;border-radius:20px;padding:16px;display:flex;gap:14px;align-items:flex-start}
.v1-ref-ic{width:44px;height:44px;border-radius:14px;background:#EEF4FF;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v1-bar{height:8px;border-radius:4px;background:#E7EAF0;overflow:hidden}
.v1-bar.sm{height:4px;border-radius:2px}
.v1-bar i{display:block;height:100%;border-radius:4px;background:#0057F2}
.v1-earn{background:#0057F2;border-radius:24px;padding:20px;display:flex;flex-direction:column;gap:18px;color:#FFFFFF;box-shadow:0 12px 28px rgba(0,87,242,.28)}
.v1-earn-l{font-size:13px;font-weight:600;color:rgba(255,255,255,.72)}
.v1-earn-v{font-size:30px;line-height:36px;font-weight:800;letter-spacing:-.8px}
.v1-earn-v small{font-size:15px;font-weight:700;letter-spacing:0;color:rgba(255,255,255,.72)}
.v1-earn-d{height:26px;padding:0 10px;border-radius:13px;background:rgba(255,255,255,.18);font-size:12px;font-weight:800;display:flex;align-items:center;gap:4px}
.v1-chart{height:96px;display:flex;justify-content:space-between;align-items:flex-end}
.v1-bc{width:30px;height:72px;border-radius:8px;display:flex;align-items:flex-end}
.v1-bc i{display:block;width:100%;border-radius:8px}
.v1-bd{font-size:11px;font-weight:700;color:rgba(255,255,255,.72)}
.v1-earn-f{display:flex;justify-content:space-between;padding-top:14px;border-top:1px solid rgba(255,255,255,.2);font-size:13px;font-weight:700}
.v1-earn-f span{display:flex;align-items:center;gap:6px}
.v1-alert{background:#FFFFFF;border:1.5px solid #FDBA8C;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:14px;box-shadow:0 8px 24px rgba(234,88,12,.10)}
.v1-timer{font-size:14px;font-weight:800;color:#C2410C;display:flex;align-items:center;gap:4px}
.v1-btn{flex:1;height:48px;border-radius:14px;background:#0057F2;color:#FFFFFF;font-size:15px;font-weight:800;display:flex;align-items:center;justify-content:center}
.v1-btn.ghost{background:#F2F4F7;color:#0F1524}
.v1-metgrid{display:flex;flex-wrap:wrap;gap:12px}
.v1-met{width:169px;background:#FFFFFF;border:1px solid #E7EAF0;border-radius:20px;padding:14px;display:flex;flex-direction:column;gap:10px}
.v1-met-ic{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.v1-met-v{font-size:22px;line-height:28px;font-weight:800;letter-spacing:-.4px}
.v1-met-l{font-size:13px;font-weight:600;color:#5B6478}
.v1-tl{display:flex;gap:12px;align-items:stretch}
.v1-tl-t{width:44px;font-size:13px;font-weight:800;padding-top:12px}
.v1-tl-line{width:4px;display:flex}
.v1-tl-line i{width:4px;border-radius:2px}
.v1-tl-c{flex:1;padding:10px 12px;border-radius:14px;background:#F6F7F9;display:flex;flex-direction:column;gap:2px}
.v1-tl-c.now{background:#EEF4FF}
.v1-case{background:#FFFFFF;border:1px solid #E7EAF0;border-radius:20px;padding:14px 14px 14px 16px;display:flex;align-items:center;gap:12px}
.v1-tag{align-self:flex-start;font-size:11px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#6E56CF}
.v1-tabbar{position:absolute;left:0;right:0;bottom:0;height:90px;background:#FFFFFF;border-top:1px solid #E7EAF0}
.v1-tabrow{height:62px;display:flex;align-items:center;padding:0 8px}
.v1-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.v1-tab-ic{position:relative;width:24px;height:24px}
.v1-tab-l{font-size:11px;line-height:14px}
.v1-badge{position:absolute;top:-4px;right:-9px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E5484D;color:#FFFFFF;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF}
.v1-ai{width:56px;height:56px;border-radius:20px;background:#0057F2;display:flex;align-items:center;justify-content:center;margin-top:-22px;box-shadow:0 8px 20px rgba(0,87,242,.35);border:4px solid #F6F7F9}
"""

# ============================================================
# V2 — "Tun" : dark midnight, Inter Tight, bento, floating tab bar
# ============================================================
def v2_tabbar(tabs, badges):
    items = []
    for i, (icn, lab) in enumerate(tabs):
        if icn == "spark":
            items.append(f'<div class="v2-ai">{ic("spark", 24, "#FFFFFF", 2)}</div>')
            continue
        active = i == 0
        b = f'<span class="v2-badge">{badges[i]}</span>' if i in badges else ""
        if active:
            items.append(f'<div class="v2-tab on">{ic(icn, 22, "#050B1A", 2)}<span>{lab}</span></div>')
        else:
            items.append(f'<div class="v2-tab"><div class="rel">{ic(icn, 22, "#7D8AAD")}{b}</div></div>')
    return f'<div class="v2-tabbar">{"".join(items)}</div>{home_ind("#FFFFFF")}'

def v2_header(title, right):
    return f'''<div class="v2-header">
  <div class="row g10 ac">{logo(34, "#FFFFFF", "#0090FF")}<span class="v2-brand">{title}</span></div>
  <div class="row g8 ac">{right}</div>
</div>'''

def v2_btn(name, dot=False):
    d = '<span class="v2-dot"></span>' if dot else ""
    return f'<div class="v2-iconbtn">{ic(name, 20, "#E6ECFF")}{d}</div>'

def v2_client():
    chips = ["Ish haqi", "Ajrim", "Ijara", "Meros", "Kredit"]
    ch = "".join(f'<span class="v2-chip">{c}</span>' for c in chips)
    cats = [("heart", "Oilaviy"), ("brief", "Mehnat"), ("building", "Mulk"), ("trend", "Biznes"), ("scale", "Jinoiy")]
    cat = "".join(f'<div class="v2-cat"><div class="v2-cat-ic">{ic(n, 22, "#9DB8FF")}</div><span>{l}</span></div>' for n, l in cats)
    ring = '''<svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="27" fill="none" stroke="#1C2848" stroke-width="7"/><circle cx="32" cy="32" r="27" fill="none" stroke="#3D7BFF" stroke-width="7" stroke-linecap="round" stroke-dasharray="127 170" transform="rotate(-90 32 32)"/></svg>'''
    return f'''<div class="phone v2" data-name="V2 · Mijoz · Home">
{status_bar("#FFFFFF")}
{v2_header("Tezkor Himoya", v2_btn("search") + v2_btn("bell", True))}
<div class="v2-body">
  <div class="col g8">
    <span class="v2-eyebrow">Salom, Aziz</span>
    <span class="v2-h1">Huquqiy himoya —<br><span style="color:#5B9BFF">bir teginishda.</span></span>
  </div>

  <div class="v2-ask">
    {ic("spark", 22, "#5B9BFF", 2)}
    <span class="v2-ask-t f1">AI'dan so'rang: maoshim 3 oydan beri to'lanmayapti…</span>
    <div class="v2-send">{ic("arrowup", 20, "#FFFFFF", 2.4)}</div>
  </div>
  <div class="v2-chips">{ch}</div>

  <div class="v2-bento">
    <div class="v2-sos">
      <div class="v2-sos-ic">{ic("siren", 28, "#FFFFFF", 2)}</div>
      <div class="col g4"><span class="v2-tile-t" style="font-size:28px;line-height:32px">SOS</span><span class="v2-tile-s" style="color:rgba(255,255,255,.8)">Shoshilinch yordam — bitta tugma</span></div>
      <div class="v2-hold">Bosib turing · 3 s</div>
    </div>
    <div class="col g12 f1">
      <div class="v2-tile" style="background:linear-gradient(135deg,#1E5BFF 0%,#3D7BFF 100%);border-color:#4A86FF">
        <div class="row jb"><span class="v2-tile-k" style="background:rgba(255,255,255,.18)">24/7</span>{ic("upright", 18, "#FFFFFF", 2)}</div>
        <div class="col g2"><span class="v2-tile-t">Tezkor advokat</span><span class="v2-tile-s" style="color:rgba(255,255,255,.8)">~15 daqiqada</span></div>
      </div>
      <div class="v2-tile">
        <div class="row jb">{ic("car", 22, "#FFB547")}{ic("upright", 18, "#7D8AAD", 2)}</div>
        <div class="col g2"><span class="v2-tile-t">Avtohalokat</span><span class="v2-tile-s">Maslahat</span></div>
      </div>
    </div>
  </div>
  <div class="row g12">
    <div class="v2-tile f1 hz">{ic("file", 22, "#34D399")}<div class="col g2"><span class="v2-tile-t sm">Shablonlar</span><span class="v2-tile-s">48 ta hujjat</span></div></div>
    <div class="v2-tile f1 hz">{ic("doc_ai", 22, "#B794FF")}<div class="col g2"><span class="v2-tile-t sm">Hujjat tahlili</span><span class="v2-tile-s">AI · PDF, rasm</span></div></div>
  </div>

  <div class="v2-sec"><span class="v2-h2">Faol buyurtma</span><span class="v2-link">Hammasi {ic("chev", 16, "#5B9BFF", 2)}</span></div>
  <div class="v2-card">
    <div class="row g14 ac">
      <div class="v2-ring">{ring}<span>3/4</span></div>
      <div class="col g4 f1"><span class="v2-card-t">Mehnat nizosi bo'yicha maslahat</span><span class="v2-tile-s">#LX-2048 · Jarayonda</span></div>
    </div>
    <div class="v2-div"></div>
    <div class="row g12 ac">
      <div class="v2-av">DR</div>
      <div class="col g2 f1"><span class="v2-name">Dilnoza Rahimova</span><span class="v2-tile-s row g4 ac">{ic("star", 12, "#FFB547", 0, "#FFB547")}4.9 · Advokat</span></div>
      <div class="v2-pillbtn">{ic("video", 16, "#FFFFFF", 2)}15:30</div>
    </div>
  </div>

  <div class="v2-sec"><span class="v2-h2">Yo'nalishlar</span><span class="v2-link">Barchasi {ic("chev", 16, "#5B9BFF", 2)}</span></div>
  <div class="v2-cats">{cat}</div>
</div>
{v2_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''

def v2_pro():
    spark_area = '''<svg width="310" height="84" viewBox="0 0 310 84" fill="none">
<defs><linearGradient id="g2a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3D7BFF" stop-opacity=".45"/><stop offset="1" stop-color="#3D7BFF" stop-opacity="0"/></linearGradient></defs>
<path d="M0 62 C25 58 40 40 62 44 S100 66 124 52 S160 18 186 26 S226 54 248 36 S288 10 310 14 L310 84 L0 84Z" fill="url(#g2a)"/>
<path d="M0 62 C25 58 40 40 62 44 S100 66 124 52 S160 18 186 26 S226 54 248 36 S288 10 310 14" stroke="#5B9BFF" stroke-width="2.5" stroke-linecap="round"/>
<circle cx="310" cy="14" r="5" fill="#FFFFFF" stroke="#3D7BFF" stroke-width="3"/></svg>'''
    cdn = '''<svg width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="none" stroke="#3A2A10" stroke-width="5"/><circle cx="28" cy="28" r="24" fill="none" stroke="#FFB547" stroke-width="5" stroke-linecap="round" stroke-dasharray="120 151" transform="rotate(-90 28 28)"/></svg>'''
    crit = [True, True, True, True, False, False]
    seg = "".join(f'<i style="background:{"#34D399" if c else "#1C2848"}"></i>' for c in crit)
    agenda = [("10:00", "Konsultatsiya", "Malika K. · video", "#3D7BFF"),
              ("14:00", "Sud majlisi", "Yunusobod tuman sudi", "#FF5A5F"),
              ("16:30", "Da'vo arizasi", "Ish #LX-1987", "#34D399")]
    ag = "".join(f'<div class="v2-ag"><i style="background:{c}"></i><span class="v2-ag-t">{t}</span><div class="col g2 f1"><span class="v2-name">{a}</span><span class="v2-tile-s">{b}</span></div>{ic("chev", 18, "#7D8AAD", 2)}</div>' for t, a, b, c in agenda)
    toggle = '<div class="v2-toggle"><span>Onlayn</span><div class="v2-sw"><i></i></div></div>'
    return f'''<div class="phone v2" data-name="V2 · Advokat · Home">
{status_bar("#FFFFFF")}
{v2_header("Ish maydoni", toggle + v2_btn("bell", True))}
<div class="v2-body">
  <div class="v2-card" style="gap:6px;padding:20px 20px 0">
    <div class="row jb ac"><span class="v2-eyebrow">Bugungi daromad</span><span class="v2-up">{ic("trend", 14, "#34D399", 2.2)}+12%</span></div>
    <span class="v2-big">1 250 000 <small>so'm</small></span>
    <span class="v2-tile-s">Kecha: 1 115 000 so'm · 4 ta buyurtma</span>
    <div style="margin:10px -20px 0;display:flex;justify-content:flex-end">{spark_area}</div>
  </div>

  <div class="v2-stats">
    <div class="v2-stat"><span class="v2-stat-v">4.9{ic("star", 16, "#FFB547", 0, "#FFB547")}</span><span class="v2-tile-s">Reyting</span></div>
    <div class="v2-stat"><span class="v2-stat-v">96%</span><span class="v2-tile-s">Javob</span></div>
    <div class="v2-stat"><span class="v2-stat-v">6<small>daq</small></span><span class="v2-tile-s">O'rt. javob</span></div>
  </div>

  <div class="v2-req">
    <div class="row g14 ac">
      <div class="v2-ring">{cdn}<span style="color:#FFB547;font-size:13px">4:59</span></div>
      <div class="col g4 f1"><span class="v2-eyebrow" style="color:#FFB547">Yangi tezkor buyurtma</span><span class="v2-card-t">Avtohalokat · maslahat</span><span class="v2-tile-s">Chilonzor · 2.4 km · 250 000 so'm</span></div>
    </div>
    <div class="row g10"><div class="v2-b2 ghost">Rad etish</div><div class="v2-b2">Qabul qilish {ic("arrowr", 18, "#050B1A", 2.2)}</div></div>
  </div>

  <div class="v2-card">
    <div class="row jb ac"><div class="row g10 ac">{ic("award", 22, "#34D399", 2)}<span class="v2-name">Super advokat maqomi</span></div><span class="v2-name" style="color:#34D399">4/6</span></div>
    <div class="v2-seg">{seg}</div>
    <span class="v2-tile-s">Keyingi shart: kamida 10 ta yakunlangan buyurtma (8 ta)</span>
  </div>

  <div class="v2-sec"><span class="v2-h2">Bugun</span><span class="v2-link">Kalendar {ic("chev", 16, "#5B9BFF", 2)}</span></div>
  <div class="v2-card" style="padding:6px 16px;gap:0">{ag}</div>

  <div class="v2-pay">
    {ic("wallet", 22, "#9DB8FF")}
    <div class="col g2 f1"><span class="v2-name">Keyingi to'lov · 14-noyabr</span><span class="v2-tile-s">Balans: 3 480 000 so'm</span></div>
    <span class="v2-link">Tarix</span>
  </div>
</div>
{v2_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''

V2_CSS = """
.v2{background:#050B1A;font-family:'Inter Tight',sans-serif;color:#FFFFFF}
.v2-header{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}
.v2-brand{font-size:17px;font-weight:700;letter-spacing:-.2px}
.v2-iconbtn{width:42px;height:42px;border-radius:21px;background:#0E1730;border:1px solid #1C2848;display:flex;align-items:center;justify-content:center;position:relative}
.v2-dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:4px;background:#FF5A5F;border:2px solid #0E1730}
.v2-body{padding:8px 20px 132px;display:flex;flex-direction:column;gap:16px}
.v2-eyebrow{font-size:13px;line-height:16px;font-weight:600;color:#7D8AAD;letter-spacing:.2px}
.v2-h1{font-size:32px;line-height:38px;font-weight:700;letter-spacing:-1px}
.v2-h2{font-size:19px;line-height:24px;font-weight:700;letter-spacing:-.3px}
.v2-sec{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.v2-link{font-size:14px;font-weight:600;color:#5B9BFF;display:flex;align-items:center;gap:2px}
.v2-ask{height:60px;border-radius:30px;background:#0E1730;border:1px solid #22305A;padding:0 8px 0 18px;display:flex;align-items:center;gap:12px}
.v2-ask-t{font-size:15px;color:#7D8AAD;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.v2-send{width:44px;height:44px;border-radius:22px;background:#3D7BFF;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v2-chips{display:flex;gap:8px;margin-top:-4px}
.v2-chip{white-space:nowrap;height:32px;padding:0 14px;border-radius:16px;border:1px solid #22305A;font-size:13px;font-weight:600;color:#C5D0EE;display:flex;align-items:center}
.v2-bento{display:flex;gap:12px;height:232px}
.v2-sos{width:160px;border-radius:28px;padding:16px;background:linear-gradient(160deg,#FF5A5F 0%,#C81E4A 100%);display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 14px 30px rgba(255,90,95,.28)}
.v2-sos-ic{width:52px;height:52px;border-radius:18px;background:rgba(255,255,255,.18);display:flex;align-items:center;justify-content:center}
.v2-hold{height:30px;border-radius:15px;background:rgba(5,11,26,.28);font-size:12px;font-weight:600;display:flex;align-items:center;justify-content:center}
.v2-tile{flex:1;border-radius:24px;background:#0E1730;border:1px solid #1C2848;padding:14px 16px;display:flex;flex-direction:column;justify-content:space-between}
.v2-tile.hz{flex-direction:row;align-items:center;justify-content:flex-start;gap:12px;height:72px}
.v2-tile-k{height:24px;padding:0 9px;border-radius:12px;font-size:12px;font-weight:700;display:flex;align-items:center}
.v2-tile-t{font-size:17px;line-height:22px;font-weight:700;letter-spacing:-.2px}
.v2-tile-t.sm{font-size:15px;line-height:20px}
.v2-tile-s{font-size:13px;line-height:18px;font-weight:500;color:#7D8AAD}
.v2-card{background:#0E1730;border:1px solid #1C2848;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:14px;overflow:hidden}
.v2-ring{width:64px;height:64px;position:relative;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v2-ring svg{position:absolute;left:0;top:0}
.v2-ring span{font-size:15px;font-weight:700;position:relative}
.v2-card-t{font-size:16px;line-height:22px;font-weight:700;letter-spacing:-.2px}
.v2-div{height:1px;background:#1C2848}
.v2-av{width:40px;height:40px;border-radius:20px;background:#1C2848;color:#9DB8FF;font-size:13px;font-weight:700;display:flex;align-items:center;justify-content:center}
.v2-name{font-size:15px;line-height:20px;font-weight:600}
.v2-pillbtn{height:36px;padding:0 14px;border-radius:18px;background:#3D7BFF;font-size:14px;font-weight:700;display:flex;align-items:center;gap:6px}
.v2-cats{display:flex;gap:10px}
.v2-cat{flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;font-weight:600;color:#C5D0EE}
.v2-cat-ic{width:58px;height:58px;border-radius:20px;background:#0E1730;border:1px solid #1C2848;display:flex;align-items:center;justify-content:center}
.v2-tabbar{position:absolute;left:16px;right:16px;bottom:30px;height:68px;border-radius:34px;background:#111B36;border:1px solid #24325C;padding:0 8px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 16px 40px rgba(0,0,0,.5)}
.v2-tab{height:52px;min-width:52px;border-radius:26px;display:flex;align-items:center;justify-content:center;gap:8px}
.v2-tab.on{background:#FFFFFF;padding:0 16px;color:#050B1A;font-size:14px;font-weight:700}
.v2-ai{width:52px;height:52px;border-radius:26px;background:linear-gradient(135deg,#3D7BFF,#8B5CF6);display:flex;align-items:center;justify-content:center;box-shadow:0 6px 18px rgba(61,123,255,.45)}
.v2-badge{position:absolute;top:-6px;right:-8px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#FF5A5F;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;color:#FFFFFF}
.v2-toggle{height:36px;padding:0 6px 0 12px;border-radius:18px;background:#0E1730;border:1px solid #1C2848;display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:#34D399}
.v2-sw{width:40px;height:24px;border-radius:12px;background:#34D399;padding:3px;display:flex;justify-content:flex-end}
.v2-sw i{width:18px;height:18px;border-radius:9px;background:#FFFFFF}
.v2-up{height:24px;padding:0 8px;border-radius:12px;background:rgba(52,211,153,.12);color:#34D399;font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px}
.v2-big{font-size:38px;line-height:44px;font-weight:700;letter-spacing:-1.4px}
.v2-big small{font-size:17px;letter-spacing:0;color:#7D8AAD;font-weight:600}
.v2-stats{display:flex;gap:12px}
.v2-stat{flex:1;height:78px;border-radius:20px;background:#0E1730;border:1px solid #1C2848;padding:14px;display:flex;flex-direction:column;justify-content:space-between}
.v2-stat-v{font-size:22px;line-height:26px;font-weight:700;display:flex;align-items:center;gap:4px;letter-spacing:-.4px}
.v2-stat-v small{font-size:13px;color:#7D8AAD;font-weight:600;margin-left:2px}
.v2-req{border-radius:24px;padding:16px;background:#17130A;border:1.5px solid #FFB547;display:flex;flex-direction:column;gap:14px;box-shadow:0 0 0 4px rgba(255,181,71,.10)}
.v2-b2{flex:1;height:48px;border-radius:24px;background:#FFB547;color:#050B1A;font-size:15px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:6px}
.v2-b2.ghost{background:transparent;border:1px solid #4A3B1C;color:#FFE2B3}
.v2-seg{display:flex;gap:6px}
.v2-seg i{flex:1;height:8px;border-radius:4px}
.v2-ag{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #1C2848}
.v2-ag:last-child{border-bottom:none}
.v2-ag i{width:4px;height:36px;border-radius:2px}
.v2-ag-t{width:46px;font-size:14px;font-weight:700}
.v2-pay{border-radius:20px;background:#0E1730;border:1px solid #1C2848;padding:14px 16px;display:flex;align-items:center;gap:12px}
"""

# ============================================================
# V3 — "Klassik" : editorial, warm paper, Fraunces serif + Inter
# ============================================================
def v3_tabbar(tabs, badges):
    items = []
    for i, (icn, lab) in enumerate(tabs):
        active = i == 0
        if icn == "spark":
            items.append(f'<div class="v3-tab"><div class="v3-ai">{ic("spark", 22, "#F5F1EA", 2)}</div><span class="v3-tab-l" style="color:#14161A">AI</span></div>')
            continue
        col = "#14161A" if active else "#8C8679"
        b = f'<span class="v3-badge">{badges[i]}</span>' if i in badges else ""
        dot = '<i class="v3-tdot"></i>' if active else '<i class="v3-tdot" style="background:transparent"></i>'
        items.append(f'<div class="v3-tab"><div class="rel">{ic(icn, 22, col, 2 if active else 1.6)}{b}</div><span class="v3-tab-l" style="color:{col};font-weight:{600 if active else 500}">{lab}</span>{dot}</div>')
    return f'<div class="v3-tabbar"><div class="v3-tabrow">{"".join(items)}</div>{home_ind("#14161A")}</div>'

def v3_header(right):
    return f'''<div class="v3-header">
  <div class="row g10 ac">{logo(32)}<span class="v3-brand">Tezkor Himoya</span></div>
  <div class="row g8 ac">{right}</div>
</div>'''

def v3_btn(name, dot=False):
    d = '<span class="v3-dot"></span>' if dot else ""
    return f'<div class="v3-iconbtn">{ic(name, 20, "#14161A", 1.6)}{d}</div>'

def v3_client():
    svc = [("01", "Oilaviy huquq", "Ajrim, aliment, meros"), ("02", "Mehnat nizolari", "Ish haqi, ishdan bo'shatish"),
           ("03", "Ko'chmas mulk", "Oldi-sotdi, ijara, ro'yxat"), ("04", "Biznes va soliq", "Shartnoma, tekshiruv")]
    sv = "".join(f'<div class="v3-li"><span class="v3-num">{n}</span><div class="col g2 f1"><span class="v3-li-t">{t}</span><span class="v3-li-s">{s}</span></div>{ic("arrowr", 18, "#14161A", 1.6)}</div>' for n, t, s in svc)
    steps = [("Buyurtma yuborildi", "10-noy, 09:12", "done"), ("Advokat qabul qildi", "10-noy, 09:20", "done"),
             ("Video uchrashuv", "Bugun, 15:30", "now"), ("Yakuniy xulosa", "Kutilmoqda", "")]
    st = "".join(f'''<div class="v3-st {k}"><div class="v3-st-m"><i></i>{"" if i == 3 else "<b></b>"}</div><div class="col g2 f1" style="padding-bottom:{0 if i == 3 else 14}px"><span class="v3-li-t sm">{a}</span><span class="v3-li-s">{b}</span></div></div>''' for i, (a, b, k) in enumerate(steps))
    return f'''<div class="phone v3" data-name="V3 · Mijoz · Home">
{status_bar("#14161A")}
{v3_header(v3_btn("bell", True) + '<div class="v3-avatar">AK</div>')}
<div class="v3-body">
  <div class="col g8">
    <span class="v3-over">Chorshanba · 12 noyabr</span>
    <span class="v3-h1">Qanday yordam<br>kerak, <i>Aziz?</i></span>
  </div>

  <div class="v3-ask">
    <span class="v3-ask-t">Vaziyatingizni o'z so'zlaringiz bilan yozing — AI yo'naltiradi, advokat yechadi.</span>
    <div class="v3-ask-line"></div>
    <div class="row jb ac">
      <div class="row g16 ac"><span class="v3-li-s row g6 ac">{ic("clip", 18, "#5E5A52", 1.6)}Fayl</span><span class="v3-li-s row g6 ac">{ic("mic", 18, "#5E5A52", 1.6)}Ovoz</span></div>
      <div class="v3-send">Yuborish {ic("arrowr", 16, "#F5F1EA", 2)}</div>
    </div>
  </div>

  <div class="v3-urg">
    <div class="v3-urg-c">
      <div class="row jb ac"><span class="v3-urg-k">{ic("siren", 16, "#FF6B5B", 2)}SOS</span>{ic("upright", 18, "#F5F1EA", 1.6)}</div>
      <span class="v3-urg-t">Shoshilinch<br>yordam</span>
    </div>
    <div class="v3-urg-sep"></div>
    <div class="v3-urg-c">
      <div class="row jb ac"><span class="v3-urg-k" style="color:#8DB4FF">{ic("bolt", 16, "#8DB4FF", 2)}24/7</span>{ic("upright", 18, "#F5F1EA", 1.6)}</div>
      <span class="v3-urg-t">Tezkor<br>advokat</span>
    </div>
  </div>
  <div class="v3-note">{ic("car", 20, "#14161A", 1.6)}<span class="f1"><b>Avtohalokat bo'ldimi?</b> Joyida nima qilish kerakligini bilib oling.</span>{ic("chev", 18, "#14161A", 1.6)}</div>

  <div class="v3-sec"><span class="v3-h2">Yo'nalishlar</span><span class="v3-link">Barchasi →</span></div>
  <div class="v3-list">{sv}</div>

  <div class="v3-sec"><span class="v3-h2">Sizning ishingiz</span><span class="v3-link">№ LX-2048</span></div>
  <div class="v3-card">
    <div class="row jb as">
      <div class="col g4"><span class="v3-card-t">Mehnat nizosi bo'yicha maslahat</span><span class="v3-li-s">Advokat Dilnoza Rahimova · ★ 4.9</span></div>
    </div>
    <div class="col">{st}</div>
    <div class="row g10"><div class="v3-b ghost">{ic("msg", 18, "#14161A", 1.6)}Yozish</div><div class="v3-b">{ic("video", 18, "#F5F1EA", 1.6)}Qo'shilish</div></div>
  </div>

  <div class="v3-quote">
    <span class="v3-qm">“</span>
    <span class="v3-q">Huquqingizni bilish — himoyaning birinchi qadami.</span>
    <div class="row jb ac"><span class="v3-li-s">48 ta tayyor hujjat shabloni</span><span class="v3-link">Shablonlar →</span></div>
  </div>
</div>
{v3_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''

def v3_pro():
    agenda = [("10:00", "Konsultatsiya", "Malika K. · video", True),
              ("14:00", "Sud majlisi", "Yunusobod tuman sudi, 3-zal", False),
              ("16:30", "Da'vo arizasi", "Ish № LX-1987 · muddat bugun", False)]
    ag = "".join(f'<div class="v3-ag{" now" if now else ""}"><span class="v3-ag-t">{t}</span><div class="col g2 f1"><span class="v3-li-t">{a}</span><span class="v3-li-s">{b}</span></div>{"<span class=v3-now>Hozir</span>" if now else ""}</div>' for t, a, b, now in agenda)
    cases = [("Ajrim va aliment", "Oila · 300 000 so'm · 12 daq oldin"),
             ("Ijara shartnomasini tekshirish", "Mulk · 180 000 so'm · 40 daq oldin"),
             ("Ish haqi undirish", "Mehnat · 220 000 so'm · 1 soat oldin")]
    cs = "".join(f'<div class="v3-li"><span class="v3-num">0{i+1}</span><div class="col g2 f1"><span class="v3-li-t">{t}</span><span class="v3-li-s">{s}</span></div>{ic("arrowr", 18, "#14161A", 1.6)}</div>' for i, (t, s) in enumerate(cases))
    return f'''<div class="phone v3" data-name="V3 · Advokat · Home">
{status_bar("#14161A")}
{v3_header('<div class="v3-online"><i></i>Qabulda</div>' + v3_btn("bell", True))}
<div class="v3-body">
  <div class="col g8">
    <span class="v3-over">Ish kuni · Chorshanba</span>
    <span class="v3-h1">12 noyabr,<br><i>Jasur Karimov</i></span>
  </div>

  <div class="v3-kpi">
    <div class="v3-kpi-c"><span class="v3-kpi-v">1,25<small>mln</small></span><span class="v3-li-s">Bugungi daromad</span></div>
    <div class="v3-kpi-sep"></div>
    <div class="v3-kpi-c"><span class="v3-kpi-v">4.9</span><span class="v3-li-s">Reyting · 128</span></div>
    <div class="v3-kpi-sep"></div>
    <div class="v3-kpi-c"><span class="v3-kpi-v">96<small>%</small></span><span class="v3-li-s">Javob foizi</span></div>
  </div>

  <div class="v3-alert">
    <div class="row jb ac"><span class="v3-urg-k" style="color:#FFB86B">{ic("bolt", 16, "#FFB86B", 2)}Sizga biriktirildi</span><span class="v3-timer">04:59</span></div>
    <span class="v3-alert-t">Avtohalokat bo'yicha<br>tezkor maslahat</span>
    <span class="v3-li-s" style="color:#B9B3A6">Chilonzor tumani · 2.4 km · 250 000 so'm</span>
    <div class="row g10"><div class="v3-b ghost dark">Rad etish</div><div class="v3-b light">Qabul qilish</div></div>
  </div>

  <div class="v3-sec"><span class="v3-h2">Kun tartibi</span><span class="v3-link">Kalendar →</span></div>
  <div class="v3-card" style="padding:4px 16px;gap:0">{ag}</div>

  <div class="v3-sec"><span class="v3-h2">Yangi so'rovlar</span><span class="v3-link">7 ta →</span></div>
  <div class="v3-list">{cs}</div>

  <div class="v3-card">
    <div class="row jb ac"><span class="v3-li-t">Keyingi to'lov — 14 noyabr</span><span class="v3-card-t" style="font-size:20px">3,48 mln</span></div>
    <div class="v3-thin"><i style="width:80%"></i></div>
    <div class="row jb"><span class="v3-li-s">Profil to'liqligi 80%</span><span class="v3-link">To'ldirish →</span></div>
  </div>
</div>
{v3_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''

V3_CSS = """
.v3{background:#F5F1EA;font-family:'Inter',sans-serif;color:#14161A}
.v3-header{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #E2DCD0}
.v3-brand{font-family:'Fraunces',serif;font-size:19px;font-weight:600;letter-spacing:-.3px}
.v3-iconbtn{width:40px;height:40px;border-radius:20px;border:1px solid #D9D2C3;display:flex;align-items:center;justify-content:center;position:relative}
.v3-dot{position:absolute;top:8px;right:9px;width:7px;height:7px;border-radius:4px;background:#D6452F}
.v3-avatar{width:40px;height:40px;border-radius:20px;background:#14161A;color:#F5F1EA;font-family:'Fraunces',serif;font-size:15px;font-weight:600;display:flex;align-items:center;justify-content:center}
.v3-online{height:30px;padding:0 12px;border-radius:15px;border:1px solid #BFD7C6;background:#E8F1EA;color:#1F6B3A;font-size:12px;font-weight:600;display:flex;align-items:center;gap:6px}
.v3-online i{width:7px;height:7px;border-radius:4px;background:#2E8B57}
.v3-body{padding:20px 20px 120px;display:flex;flex-direction:column;gap:18px}
.v3-over{font-size:12px;line-height:16px;font-weight:600;letter-spacing:1.4px;text-transform:uppercase;color:#8C8679}
.v3-h1{font-family:'Fraunces',serif;font-size:36px;line-height:40px;font-weight:500;letter-spacing:-1px}
.v3-h1 i{font-style:italic;color:#0057F2}
.v3-h2{font-family:'Fraunces',serif;font-size:22px;line-height:28px;font-weight:500;letter-spacing:-.4px}
.v3-sec{display:flex;justify-content:space-between;align-items:baseline;margin-top:10px}
.v3-link{font-size:13px;font-weight:600;color:#0057F2}
.v3-ask{background:#FFFFFF;border:1px solid #E2DCD0;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:14px}
.v3-ask-t{font-size:16px;line-height:24px;color:#8C8679}
.v3-ask-line{height:1px;background:#EBE6DC}
.v3-send{height:40px;padding:0 16px;border-radius:20px;background:#14161A;color:#F5F1EA;font-size:14px;font-weight:600;display:flex;align-items:center;gap:8px}
.v3-urg{height:132px;border-radius:16px;background:#14161A;display:flex;padding:16px 0}
.v3-urg-c{flex:1;padding:0 16px;display:flex;flex-direction:column;justify-content:space-between}
.v3-urg-sep{width:1px;background:#33352F}
.v3-urg-k{font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#FF6B5B;display:flex;align-items:center;gap:6px}
.v3-urg-t{font-family:'Fraunces',serif;font-size:22px;line-height:26px;font-weight:500;color:#F5F1EA;letter-spacing:-.3px}
.v3-note{border:1px solid #E2DCD0;border-radius:16px;padding:14px 16px;display:flex;align-items:center;gap:12px;font-size:14px;line-height:20px;color:#5E5A52}
.v3-note b{color:#14161A;font-weight:600}
.v3-list{border-top:1px solid #14161A}
.v3-li{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #E2DCD0}
.v3-num{font-family:'Fraunces',serif;font-size:15px;font-weight:500;color:#8C8679;width:24px}
.v3-li-t{font-size:16px;line-height:22px;font-weight:600}
.v3-li-t.sm{font-size:15px;line-height:20px}
.v3-li-s{font-size:13px;line-height:18px;color:#5E5A52}
.v3-card{background:#FFFFFF;border:1px solid #E2DCD0;border-radius:16px;padding:16px;display:flex;flex-direction:column;gap:16px}
.v3-card-t{font-family:'Fraunces',serif;font-size:20px;line-height:26px;font-weight:500;letter-spacing:-.3px}
.v3-st{display:flex;gap:12px}
.v3-st-m{width:14px;display:flex;flex-direction:column;align-items:center;padding-top:4px}
.v3-st-m i{width:12px;height:12px;border-radius:6px;border:1.5px solid #C9C1B1;background:#FFFFFF;flex-shrink:0}
.v3-st-m b{flex:1;width:1.5px;background:#E2DCD0;margin-top:2px}
.v3-st.done .v3-st-m i{background:#14161A;border-color:#14161A}
.v3-st.done .v3-st-m b{background:#14161A}
.v3-st.now .v3-st-m i{background:#0057F2;border-color:#0057F2;box-shadow:0 0 0 4px #DCE6FB}
.v3-b{flex:1;height:46px;border-radius:23px;background:#14161A;color:#F5F1EA;font-size:14px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:8px}
.v3-b.ghost{background:transparent;border:1px solid #D9D2C3;color:#14161A}
.v3-b.ghost.dark{border-color:#3A3C36;color:#F5F1EA}
.v3-b.light{background:#F5F1EA;color:#14161A}
.v3-quote{background:#E9E2D4;border-radius:16px;padding:18px 18px 16px;display:flex;flex-direction:column;gap:10px}
.v3-qm{font-family:'Fraunces',serif;font-size:48px;line-height:28px;color:#0057F2;height:24px}
.v3-q{font-family:'Fraunces',serif;font-size:21px;line-height:28px;font-style:italic;font-weight:400;letter-spacing:-.2px}
.v3-kpi{display:flex;border-top:1px solid #14161A;border-bottom:1px solid #E2DCD0;padding:16px 0}
.v3-kpi-c{flex:1;display:flex;flex-direction:column;gap:4px;padding:0 2px}
.v3-kpi-sep{width:1px;background:#E2DCD0;margin:0 14px}
.v3-kpi-v{font-family:'Fraunces',serif;font-size:30px;line-height:34px;font-weight:500;letter-spacing:-.8px}
.v3-kpi-v small{font-size:16px;color:#8C8679;margin-left:2px;letter-spacing:0}
.v3-alert{background:#14161A;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px}
.v3-alert-t{font-family:'Fraunces',serif;font-size:24px;line-height:30px;font-weight:500;color:#F5F1EA;letter-spacing:-.4px}
.v3-timer{font-size:14px;font-weight:700;color:#FFB86B;font-variant-numeric:tabular-nums}
.v3-ag{display:flex;align-items:center;gap:14px;padding:14px 0;border-bottom:1px solid #EBE6DC}
.v3-ag:last-child{border-bottom:none}
.v3-ag-t{font-family:'Fraunces',serif;font-size:18px;font-weight:500;width:52px}
.v3-ag.now .v3-ag-t{color:#0057F2}
.v3-now{height:24px;padding:0 10px;border-radius:12px;background:#0057F2;color:#FFFFFF;font-size:11px;font-weight:700;display:flex;align-items:center}
.v3-thin{height:3px;background:#EBE6DC;border-radius:2px}
.v3-thin i{display:block;height:3px;background:#14161A;border-radius:2px}
.v3-tabbar{position:absolute;left:0;right:0;bottom:0;height:92px;background:#F5F1EA;border-top:1px solid #E2DCD0}
.v3-tabrow{height:64px;display:flex;align-items:center;padding:0 6px}
.v3-tab{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px}
.v3-tab-l{font-size:11px;line-height:14px}
.v3-tdot{width:4px;height:4px;border-radius:2px;background:#14161A}
.v3-ai{width:34px;height:34px;border-radius:17px;background:#14161A;display:flex;align-items:center;justify-content:center;margin-top:-6px}
.v3-badge{position:absolute;top:-5px;right:-9px;min-width:17px;height:17px;padding:0 5px;border-radius:9px;background:#D6452F;color:#FFFFFF;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center}
"""

# ============================================================
# V4 — "Yorqin" : gradient hero + pastel tiles, Plus Jakarta Sans
# ============================================================
def v4_tabbar(tabs, badges):
    items = []
    for i, (icn, lab) in enumerate(tabs):
        active = i == 0
        if icn == "spark":
            items.append(f'<div class="v4-ai">{ic("spark", 24, "#FFFFFF", 2)}</div>')
            continue
        b = f'<span class="v4-badge">{badges[i]}</span>' if i in badges else ""
        if active:
            items.append(f'<div class="v4-tab on">{ic(icn, 20, "#FFFFFF", 2.2)}<span>{lab}</span></div>')
        else:
            items.append(f'<div class="v4-tab"><div class="rel">{ic(icn, 22, "#7A80A0", 2)}{b}</div></div>')
    return f'<div class="v4-tabbar">{"".join(items)}</div>{home_ind("#1A1D3A")}'

def v4_top(sub, right):
    return f'''<div class="v4-header">
  <div class="row g10 ac"><div class="v4-logo">{logo(28)}</div><div class="col g2"><span class="v4-brand">Tezkor Himoya</span><span class="v4-cap">{sub}</span></div></div>
  <div class="row g8 ac">{right}</div>
</div>'''

def v4_btn(name, dot=False):
    d = '<span class="v4-dot"></span>' if dot else ""
    return f'<div class="v4-iconbtn">{ic(name, 20, "#FFFFFF", 2)}{d}</div>'

def v4_client():
    tiles = [("bolt", "Tezkor advokat", "24/7 · ~15 daqiqa", "#DCEBFF", "#0057F2"),
             ("siren", "SOS", "Shoshilinch yordam", "#FFE1E6", "#E11D48"),
             ("car", "Avtohalokat", "Joyida maslahat", "#FFE9D6", "#EA580C"),
             ("file", "Shablonlar", "48 ta hujjat", "#ECE7FF", "#6D28D9")]
    tl = "".join(f'''<div class="v4-tile" style="background:{bg}">
  <div class="v4-tile-ic" style="background:#FFFFFF">{ic(n, 22, c, 2)}</div>
  <div class="col g2"><span class="v4-tile-t">{t}</span><span class="v4-tile-s" style="color:{c}">{s}</span></div>
</div>''' for n, t, s, bg, c in tiles)
    cats = [("heart", "Oila", "#FFE1E6", "#E11D48"), ("brief", "Mehnat", "#DCEBFF", "#0057F2"), ("building", "Mulk", "#DDF7EC", "#059669"),
            ("trend", "Biznes", "#FFF4C7", "#B45309"), ("scale", "Jinoiy", "#ECE7FF", "#6D28D9")]
    ct = "".join(f'<div class="v4-cat"><div class="v4-cat-ic" style="background:{bg}">{ic(n, 24, c, 2)}</div><span>{l}</span></div>' for n, l, bg, c in cats)
    return f'''<div class="phone v4" data-name="V4 · Mijoz · Home">
<div class="v4-hero">
  {status_bar("#FFFFFF")}
  {v4_top("Huquqiy yordam", v4_btn("bell", True))}
  <div class="v4-hero-in">
    <span class="v4-h1">Salom, Aziz!</span>
    <span class="v4-hsub">Muammoingizni yozing — AI 10 soniyada yo'naltiradi</span>
    <div class="v4-ask">
      <div class="v4-ask-ic">{ic("spark", 20, "#FFFFFF", 2)}</div>
      <span class="v4-ask-t f1">Maoshim 3 oydan beri to'lanmayapti…</span>
      {ic("mic", 22, "#7A80A0", 2)}
    </div>
  </div>
</div>
<div class="v4-body">
  <div class="v4-tiles">{tl}</div>

  <div class="v4-sec"><span class="v4-h2">Kategoriyalar</span><span class="v4-link">Hammasi</span></div>
  <div class="v4-cats">{ct}</div>

  <div class="v4-sec"><span class="v4-h2">Buyurtmam</span><span class="v4-link">Tarix</span></div>
  <div class="v4-card">
    <div class="row jb ac"><span class="v4-badge2">Bosqich 3/4</span><span class="v4-tile-s" style="color:#7A80A0">#LX-2048</span></div>
    <span class="v4-card-t">Mehnat nizosi bo'yicha maslahat</span>
    <div class="v4-prog"><i style="width:75%"></i></div>
    <div class="row jb ac">
      <div class="row g10 ac"><div class="v4-av" style="background:#DCEBFF;color:#0057F2">DR</div><div class="col g2"><span class="v4-name">Dilnoza Rahimova</span><span class="v4-tile-s" style="color:#7A80A0">★ 4.9 · Advokat</span></div></div>
      <div class="v4-cta">{ic("video", 18, "#FFFFFF", 2)}15:30</div>
    </div>
  </div>

  <div class="v4-promo">
    <div class="col g6 f1">
      <span class="v4-promo-k">PRO OBUNA</span>
      <span class="v4-promo-t">Cheksiz AI savollar va hujjat tahlili</span>
      <div class="v4-promo-b">Ulanish {ic("arrowr", 16, "#4F2BD9", 2.2)}</div>
    </div>
    <div class="v4-promo-art">{ic("shield", 56, "#FFFFFF", 1.6)}</div>
  </div>
</div>
{v4_tabbar(CLIENT_TABS, {4: "3"})}
</div>'''

def v4_pro():
    chips = [("Barchasi", True), ("Tezkor · 2", False), ("Oila · 3", False), ("Mehnat · 2", False)]
    ch = "".join(f'<span class="v4-chip{" on" if on else ""}">{t}</span>' for t, on in chips)
    reqs = [("Ajrim va aliment", "Oila huquqi", "300 000", "12 daq", "#FFE1E6", "#E11D48", "heart"),
            ("Ijara shartnomasi", "Ko'chmas mulk", "180 000", "40 daq", "#DDF7EC", "#059669", "building")]
    rq = "".join(f'''<div class="v4-rq">
  <div class="v4-tile-ic" style="background:{bg}">{ic(n, 22, c, 2)}</div>
  <div class="col g2 f1"><span class="v4-name">{t}</span><span class="v4-tile-s" style="color:#7A80A0">{s} · {w} oldin</span></div>
  <div class="col g2" style="align-items:flex-end"><span class="v4-name">{p}</span><span class="v4-tile-s" style="color:#7A80A0">so'm</span></div>
</div>''' for t, s, p, w, bg, c, n in reqs)
    agenda = [("10:00", "Konsultatsiya", "#DCEBFF", "#0057F2"), ("14:00", "Sud majlisi", "#FFE1E6", "#E11D48"), ("16:30", "Ariza", "#DDF7EC", "#059669")]
    ag = "".join(f'<div class="v4-agc" style="background:{bg}"><span class="v4-agc-t" style="color:{c}">{t}</span><span class="v4-name">{a}</span></div>' for t, a, bg, c in agenda)
    toggle = '<div class="v4-online"><i></i>Onlayn</div>'
    return f'''<div class="phone v4" data-name="V4 · Advokat · Home">
<div class="v4-hero" style="height:300px">
  {status_bar("#FFFFFF")}
  {v4_top("Ish maydoni", toggle + v4_btn("bell", True))}
  <div class="v4-hero-in">
    <span class="v4-hsub" style="font-size:14px">Bu hafta daromad</span>
    <div class="row g10 ac"><span class="v4-h1" style="font-size:34px;line-height:40px">4 850 000</span><span class="v4-hsub" style="font-size:16px;font-weight:700">so'm</span><span class="v4-up">+18%</span></div>
    <span class="v4-hsub">Keyingi to'lov: 14-noyabr · Balans 3,48 mln</span>
  </div>
</div>
<div class="v4-body" style="margin-top:-56px">
  <div class="v4-stats">
    <div class="v4-st"><div class="v4-st-ic" style="background:#FFF4C7">{ic("star", 18, "#B45309", 2)}</div><span class="v4-st-v">4.9</span><span class="v4-tile-s" style="color:#7A80A0">Reyting</span></div>
    <div class="v4-st-sep"></div>
    <div class="v4-st"><div class="v4-st-ic" style="background:#DCEBFF">{ic("msg", 18, "#0057F2", 2)}</div><span class="v4-st-v">96%</span><span class="v4-tile-s" style="color:#7A80A0">Javob</span></div>
    <div class="v4-st-sep"></div>
    <div class="v4-st"><div class="v4-st-ic" style="background:#DDF7EC">{ic("clock", 18, "#059669", 2)}</div><span class="v4-st-v">6 daq</span><span class="v4-tile-s" style="color:#7A80A0">O'rt. javob</span></div>
  </div>

  <div class="v4-urgent">
    <div class="row jb ac"><span class="v4-urgent-k">{ic("bolt", 14, "#FFFFFF", 2.4)}Yangi tezkor buyurtma</span><span class="v4-urgent-k" style="background:rgba(255,255,255,.22)">{ic("clock", 14, "#FFFFFF", 2.2)}04:59</span></div>
    <span class="v4-card-t" style="color:#FFFFFF">Avtohalokat bo'yicha maslahat</span>
    <span class="v4-hsub" style="font-size:13px">Chilonzor · 2.4 km · 250 000 so'm</span>
    <div class="row g10"><div class="v4-ub ghost">Rad etish</div><div class="v4-ub">Qabul qilish</div></div>
  </div>

  <div class="v4-sec"><span class="v4-h2">Bugungi reja</span><span class="v4-link">Kalendar</span></div>
  <div class="row g10">{ag}</div>

  <div class="v4-sec"><span class="v4-h2">Yangi so'rovlar</span><span class="v4-link">7 ta</span></div>
  <div class="v4-chips">{ch}</div>
  <div class="col g10">{rq}</div>

  <div class="v4-level">
    <div class="v4-tile-ic" style="background:#FFFFFF">{ic("award", 22, "#6D28D9", 2)}</div>
    <div class="col g8 f1">
      <div class="row jb"><span class="v4-name">Super advokat sari</span><span class="v4-name" style="color:#6D28D9">4/6</span></div>
      <div class="v4-prog" style="background:#FFFFFF"><i style="width:66%;background:#6D28D9"></i></div>
      <span class="v4-tile-s" style="color:#5B4B8A">Yana 2 ta yakunlangan buyurtma kerak</span>
    </div>
  </div>
</div>
{v4_tabbar(PRO_TABS, {1: "7", 4: "3"})}
</div>'''

V4_CSS = """
.v4{background:#F4F5FB;font-family:'Plus Jakarta Sans',sans-serif;color:#1A1D3A}
.v4-hero{height:330px;background:linear-gradient(150deg,#0057F2 0%,#3B5BFF 55%,#7C4DFF 100%);border-radius:0 0 36px 36px;position:relative}
.v4-header{height:60px;padding:0 20px;display:flex;align-items:center;justify-content:space-between}
.v4-logo{width:40px;height:40px;border-radius:13px;background:#FFFFFF;display:flex;align-items:center;justify-content:center}
.v4-brand{font-size:16px;line-height:20px;font-weight:800;color:#FFFFFF}
.v4-cap{font-size:12px;line-height:16px;font-weight:600;color:rgba(255,255,255,.72)}
.v4-iconbtn{width:42px;height:42px;border-radius:14px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);display:flex;align-items:center;justify-content:center;position:relative}
.v4-dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:4px;background:#FFB020;border:2px solid #3B5BFF}
.v4-online{height:32px;padding:0 12px;border-radius:16px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.24);color:#FFFFFF;font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px}
.v4-online i{width:8px;height:8px;border-radius:4px;background:#4ADE80}
.v4-hero-in{padding:12px 20px 0;display:flex;flex-direction:column;gap:8px}
.v4-h1{font-size:28px;line-height:34px;font-weight:800;color:#FFFFFF;letter-spacing:-.6px}
.v4-hsub{font-size:14px;line-height:20px;font-weight:500;color:rgba(255,255,255,.8)}
.v4-up{height:24px;padding:0 8px;border-radius:12px;background:#4ADE80;color:#064E3B;font-size:12px;font-weight:800;display:flex;align-items:center}
.v4-ask{margin-top:10px;height:60px;border-radius:20px;background:#FFFFFF;padding:0 16px 0 8px;display:flex;align-items:center;gap:12px;box-shadow:0 12px 30px rgba(26,29,58,.18)}
.v4-ask-ic{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,#0057F2,#7C4DFF);display:flex;align-items:center;justify-content:center}
.v4-ask-t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:15px;font-weight:500;color:#7A80A0}
.v4-body{padding:20px 20px 130px;display:flex;flex-direction:column;gap:16px;position:relative}
.v4-tiles{display:flex;flex-wrap:wrap;gap:12px}
.v4-tile{width:169px;height:124px;border-radius:24px;padding:14px;display:flex;flex-direction:column;justify-content:space-between}
.v4-tile-ic{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.v4-tile-t{font-size:16px;line-height:20px;font-weight:800}
.v4-tile-s{font-size:12px;line-height:16px;font-weight:600}
.v4-sec{display:flex;justify-content:space-between;align-items:center;margin-top:6px}
.v4-h2{font-size:18px;line-height:24px;font-weight:800;letter-spacing:-.3px}
.v4-link{font-size:13px;font-weight:700;color:#0057F2}
.v4-cats{display:flex;justify-content:space-between}
.v4-cat{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12px;font-weight:700}
.v4-cat-ic{width:60px;height:60px;border-radius:30px;display:flex;align-items:center;justify-content:center}
.v4-card{background:#FFFFFF;border-radius:24px;padding:16px;display:flex;flex-direction:column;gap:12px;box-shadow:0 6px 20px rgba(26,29,58,.06)}
.v4-badge2{height:26px;padding:0 10px;border-radius:13px;background:#ECE7FF;color:#6D28D9;font-size:12px;font-weight:800;display:flex;align-items:center}
.v4-card-t{font-size:17px;line-height:24px;font-weight:800;letter-spacing:-.2px}
.v4-prog{height:8px;border-radius:4px;background:#EEF0F7;overflow:hidden}
.v4-prog i{display:block;height:8px;border-radius:4px;background:linear-gradient(90deg,#0057F2,#7C4DFF)}
.v4-av{width:40px;height:40px;border-radius:20px;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center}
.v4-name{font-size:14px;line-height:20px;font-weight:700}
.v4-cta{height:40px;padding:0 14px;border-radius:14px;background:#0057F2;color:#FFFFFF;font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px}
.v4-promo{border-radius:24px;padding:18px;background:linear-gradient(135deg,#7C4DFF 0%,#4F2BD9 100%);display:flex;gap:12px;align-items:center;overflow:hidden}
.v4-promo-k{font-size:11px;font-weight:800;letter-spacing:1.2px;color:rgba(255,255,255,.72)}
.v4-promo-t{font-size:17px;line-height:22px;font-weight:800;color:#FFFFFF}
.v4-promo-b{align-self:flex-start;margin-top:4px;height:36px;padding:0 14px;border-radius:12px;background:#FFFFFF;color:#4F2BD9;font-size:13px;font-weight:800;display:flex;align-items:center;gap:6px}
.v4-promo-art{width:92px;height:92px;border-radius:30px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;transform:rotate(-8deg)}
.v4-tabbar{position:absolute;left:20px;right:20px;bottom:30px;height:66px;border-radius:24px;background:#FFFFFF;padding:0 8px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 12px 32px rgba(26,29,58,.14)}
.v4-tab{height:48px;min-width:48px;border-radius:16px;display:flex;align-items:center;justify-content:center;gap:6px}
.v4-tab.on{background:#0057F2;padding:0 14px;color:#FFFFFF;font-size:13px;font-weight:800}
.v4-ai{width:50px;height:50px;border-radius:17px;background:linear-gradient(135deg,#0057F2,#7C4DFF);display:flex;align-items:center;justify-content:center}
.v4-badge{position:absolute;top:-6px;right:-8px;min-width:18px;height:18px;padding:0 5px;border-radius:9px;background:#E11D48;color:#FFFFFF;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #FFFFFF}
.v4-stats{background:#FFFFFF;border-radius:24px;padding:16px 8px;display:flex;box-shadow:0 12px 30px rgba(26,29,58,.10)}
.v4-st{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px}
.v4-st-ic{width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center}
.v4-st-v{font-size:18px;line-height:22px;font-weight:800}
.v4-st-sep{width:1px;background:#EEF0F7}
.v4-urgent{border-radius:24px;padding:16px;background:linear-gradient(135deg,#FF7A45 0%,#F43F5E 100%);display:flex;flex-direction:column;gap:8px;box-shadow:0 12px 28px rgba(244,63,94,.28)}
.v4-urgent-k{height:26px;padding:0 10px;border-radius:13px;background:rgba(26,29,58,.18);color:#FFFFFF;font-size:12px;font-weight:800;display:flex;align-items:center;gap:5px}
.v4-ub{flex:1;height:46px;margin-top:6px;border-radius:14px;background:#FFFFFF;color:#E11D48;font-size:14px;font-weight:800;display:flex;align-items:center;justify-content:center}
.v4-ub.ghost{background:rgba(255,255,255,.18);color:#FFFFFF}
.v4-agc{flex:1;height:76px;border-radius:20px;padding:12px;display:flex;flex-direction:column;justify-content:space-between}
.v4-agc-t{font-size:13px;font-weight:800}
.v4-chips{display:flex;gap:8px;margin-top:-4px;margin-right:-20px;overflow:hidden}
.v4-chip{height:34px;padding:0 14px;border-radius:17px;background:#FFFFFF;border:1px solid #E6E8F2;font-size:13px;font-weight:700;color:#4A4F6E;display:flex;align-items:center;white-space:nowrap}
.v4-chip.on{background:#1A1D3A;border-color:#1A1D3A;color:#FFFFFF}
.v4-rq{background:#FFFFFF;border-radius:20px;padding:12px 14px 12px 12px;display:flex;align-items:center;gap:12px}
.v4-level{background:#ECE7FF;border-radius:24px;padding:16px;display:flex;gap:14px;align-items:flex-start}
"""

# ============================================================
# spec cards (design tokens) per variant
# ============================================================
SPECS = {
 "v1": {"name": "Aniq", "desc": "Toza, yorug', ishonchli. Oq kartalar, ingichka chegara, bitta asosiy ko'k rang. Ma'lumot zich, lekin tartibli.",
        "font": "Manrope (800 / 700 / 600 / 500)",
        "colors": [("Primary", "#0057F2"), ("Ink", "#0F1524"), ("Text 2", "#5B6478"), ("Muted", "#8A94A6"), ("Background", "#F6F7F9"), ("Surface", "#FFFFFF"), ("Border", "#E7EAF0"), ("Danger", "#E5484D"), ("Success", "#12A267"), ("Warning", "#C2410C")],
        "type": [("H1 · sarlavha", "28 / 34 · 800 · -0.6"), ("H2 · bo'lim", "18 / 24 · 800 · -0.3"), ("Karta sarlavha", "17 / 24 · 800"), ("Body", "15 / 22 · 500"), ("Caption", "13 / 18 · 500"), ("Tab label", "11 / 14 · 600–700")],
        "radius": [("Karta", "24"), ("Tile / row", "20"), ("Icon box", "14–16"), ("Button", "12–14"), ("Pill", "13 (h26)")],
        "comp": [("Frame", "390 × auto (min 844)"), ("Gutter", "20 · gap 12/16"), ("Header", "h60 · icon btn 44"), ("Tab bar", "h90 · AI 56 r20"), ("Button", "h48 / h40")]},
 "v2": {"name": "Tun", "desc": "Qorong'i, zamonaviy, premium. Bento tile'lar, katta raqamlar, suzuvchi pill tab bar. Kechasi ishlatishga qulay.",
        "font": "Inter Tight (700 / 600 / 500)",
        "colors": [("Primary", "#3D7BFF"), ("Primary soft", "#5B9BFF"), ("Background", "#050B1A"), ("Surface", "#0E1730"), ("Border", "#1C2848"), ("Text 2", "#7D8AAD"), ("SOS", "#FF5A5F"), ("Amber", "#FFB547"), ("Mint", "#34D399"), ("Violet", "#8B5CF6")],
        "type": [("Display", "38 / 44 · 700 · -1.4"), ("H1", "32 / 38 · 700 · -1"), ("H2", "19 / 24 · 700"), ("Tile title", "17 / 22 · 700"), ("Body", "15 / 20 · 600"), ("Caption", "13 / 18 · 500")],
        "radius": [("SOS tile", "28"), ("Karta / tile", "24"), ("Stat", "20"), ("Input / tab bar", "30 / 34 (pill)"), ("Icon btn", "21 (doira)")],
        "comp": [("Frame", "390 × auto (min 844)"), ("Gutter", "20 · gap 12/16"), ("Bento", "h232 · SOS w160"), ("Tab bar", "h68 · inset 16 · bottom 30"), ("Button", "h48 r24")]},
 "v3": {"name": "Klassik", "desc": "Muharrirlik (editorial) uslubi: issiq qog'oz fon, serif sarlavhalar, raqamlangan ro'yxatlar. Yuridik ishonch va jiddiylik.",
        "font": "Fraunces (sarlavha 500) + Inter (matn 600 / 400)",
        "colors": [("Ink", "#14161A"), ("Paper", "#F5F1EA"), ("Surface", "#FFFFFF"), ("Sand", "#E9E2D4"), ("Border", "#E2DCD0"), ("Text 2", "#5E5A52"), ("Muted", "#8C8679"), ("Accent", "#0057F2"), ("Alert", "#D6452F"), ("Success", "#2E8B57")],
        "type": [("H1 · Fraunces", "36 / 40 · 500 · -1"), ("H2 · Fraunces", "22 / 28 · 500"), ("KPI · Fraunces", "30 / 34 · 500"), ("Overline", "12 / 16 · 600 · +1.4 UPPER"), ("Body", "16 / 22 · 600"), ("Caption", "13 / 18 · 400")],
        "radius": [("Karta", "16"), ("Button", "23 (pill)"), ("Icon btn", "20 (doira)"), ("Progress", "2"), ("Ro'yxat", "0 · divider 1px")],
        "comp": [("Frame", "390 × auto (min 844)"), ("Gutter", "20 · gap 18"), ("List row", "py14 · divider #E2DCD0"), ("Tab bar", "h92 · active dot 4"), ("Button", "h46")]},
 "v4": {"name": "Yorqin", "desc": "Yorqin va do'stona: gradient hero, pastel tile'lar, yumaloq ikonkalar, suzuvchi tab bar. Yosh auditoriya uchun.",
        "font": "Plus Jakarta Sans (800 / 700 / 600 / 500)",
        "colors": [("Primary", "#0057F2"), ("Violet", "#7C4DFF"), ("Ink", "#1A1D3A"), ("Muted", "#7A80A0"), ("Background", "#F4F5FB"), ("Sky", "#DCEBFF"), ("Rose", "#FFE1E6"), ("Peach", "#FFE9D6"), ("Lilac", "#ECE7FF"), ("Mint", "#DDF7EC")],
        "type": [("H1 · hero", "28 / 34 · 800 · -0.6"), ("H2", "18 / 24 · 800"), ("Tile title", "16 / 20 · 800"), ("Body", "15 / 20 · 500"), ("Label", "14 / 20 · 700"), ("Caption", "12 / 16 · 600")],
        "radius": [("Hero (pastki)", "36"), ("Karta / tile", "24"), ("Ask input", "20"), ("Icon box / btn", "14"), ("Kategoriya", "30 (doira 60)")],
        "comp": [("Frame", "390 × auto (min 844)"), ("Hero", "h330 · gradient 150°"), ("Tile", "169 × 124"), ("Tab bar", "h66 r24 · inset 20"), ("Button", "h46 / h40")]},
}

def spec_card(key):
    s = SPECS[key]
    sw = "".join(f'<div class="sp-sw"><i style="background:{h}"></i><div class="col"><span class="sp-k">{n}</span><span class="sp-v">{h}</span></div></div>' for n, h in s["colors"])
    rows = lambda items: "".join(f'<div class="sp-r"><span class="sp-k">{a}</span><span class="sp-v">{b}</span></div>' for a, b in items)
    return f'''<div class="spec">
  <div class="col g6"><span class="sp-t">Dizayn tokenlari</span><span class="sp-d">{s["desc"]}</span></div>
  <div class="col g8"><span class="sp-h">Shrift</span><span class="sp-font">{s["font"]}</span></div>
  <div class="col g8"><span class="sp-h">Ranglar</span><div class="sp-sws">{sw}</div></div>
  <div class="col g4"><span class="sp-h">Tipografiya · size / line · weight · tracking</span>{rows(s["type"])}</div>
  <div class="col g4"><span class="sp-h">Border radius (px)</span>{rows(s["radius"])}</div>
  <div class="col g4"><span class="sp-h">O'lchamlar</span>{rows(s["comp"])}</div>
  <div class="col g4"><span class="sp-h">Ikonkalar</span><span class="sp-d">24×24 grid, stroke 1.6–2.2, round cap/join. Tab: 22–24px.</span></div>
</div>'''

BASE_CSS = """
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#E4E6EB}
body{font-family:'Inter',sans-serif;padding:72px;color:#111318;-webkit-font-smoothing:antialiased}
.board{display:flex;flex-direction:column;gap:120px;width:max-content}
.cover{display:flex;flex-direction:column;gap:12px;max-width:900px}
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
.sb{height:50px;padding:0 28px 0 36px;display:flex;align-items:center;justify-content:space-between}
.sb-time{font-family:-apple-system,'SF Pro Text','Inter',sans-serif;font-size:17px;font-weight:600}
.sb-r{display:flex;align-items:center;gap:6px}
.hi{position:absolute;left:128px;bottom:8px;width:134px;height:5px;border-radius:3px}
.row{display:flex}.col{display:flex;flex-direction:column}.f1{flex:1;min-width:0}.rel{position:relative;display:flex}
.ac{align-items:center}.as{align-items:flex-start}.jb{justify-content:space-between}
.g2{gap:2px}.g4{gap:4px}.g6{gap:6px}.g8{gap:8px}.g10{gap:10px}.g12{gap:12px}.g14{gap:14px}.g16{gap:16px}
svg{flex-shrink:0;display:block}
.spec{width:340px;background:#FFFFFF;border-radius:28px;padding:24px;display:flex;flex-direction:column;gap:22px;box-shadow:0 1px 0 rgba(17,19,24,.04)}
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

FONTS = ("https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Inter+Tight:wght@500;600;700"
         "&family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,400;1,9..144,500"
         "&family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap")

VARIANTS = [("v1", "01", "Aniq", "Clean light · Manrope", v1_client, v1_pro),
            ("v2", "02", "Tun", "Midnight dark · Inter Tight · bento", v2_client, v2_pro),
            ("v3", "03", "Klassik", "Editorial · Fraunces + Inter", v3_client, v3_pro),
            ("v4", "04", "Yorqin", "Gradient + pastel · Plus Jakarta Sans", v4_client, v4_pro)]

sections = []
for key, num, name, sub, fc, fp in VARIANTS:
    if ONLY and key != ONLY: continue
    sections.append(f'''<section class="variant" data-name="Variant {num} — {name}">
  <div class="vh"><span class="vh-n">{num}</span><span class="vh-t">{name}</span><span class="vh-s">{sub}</span></div>
  <div class="vrow">
    <div class="fr"><span class="fr-l">Mijoz · Home</span>{fc()}</div>
    <div class="fr"><span class="fr-l">Advokat / Worker · Home</span>{fp()}</div>
    {spec_card(key)}
  </div>
</section>''')

html = f'''<!doctype html>
<html lang="uz">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tezkor Himoya Home</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<style>{BASE_CSS}{V1_CSS}{V2_CSS}{V3_CSS}{V4_CSS}</style>
</head>
<body>
<div class="board">
  <div class="cover">
    <h1>Tezkor Himoya — Home ekran, 4 variant</h1>
    <p>Har bir variantda Mijoz va Advokat (worker) uchun Home ekrani hamda dizayn tokenlari: ranglar, tipografiya, border radius va o'lchamlar. Frame: 390 pt (iPhone 15/16), to'liq scroll balandligi. Logo va nom — hozirgidek.</p>
    <div class="cover-tags"><span>390 × 844+</span><span>8 ta ekran</span><span>Flex → Figma Auto Layout</span><span>SVG ikonkalar → vektor</span></div>
  </div>
  {"".join(sections)}
</div>
</body>
</html>'''

with open(OUT, "w", encoding="utf-8") as f:
    f.write(html)
print("wrote", OUT, len(html), "bytes")
