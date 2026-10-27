# PART 1 — LexGo Client Home Screen Redesign Brief

> Paste everything below this line into Claude Design as one prompt.

---

You are a senior mobile product designer. Design the **Home tab of the LexGo mobile app for the CLIENT role** (a regular person with a legal problem, not a lawyer). Produce **5 distinct design directions**, and for **each** direction deliver the same screen in **Light mode, Dark mode and Glass mode** — 15 full screens in total, plus the shared component specs listed at the end.

Think like a designer shipping to the App Store, not like someone making a mood board. Every decision must be justified by how a stressed person with a legal problem uses a phone with one hand.

## 1. What LexGo is

LexGo is an Uzbekistan legal-services app: an AI legal assistant, online legal services (documents, templates, consultations), a marketplace of advocates (advokat) and jurists (yurist), urgent "reach a lawyer now" requests, and a personal-advocate subscription. One backend is shared with a web portal. Primary language is **Uzbek (Latin script)**; Russian and English exist too. The brand colour family is **deep navy → brand blue → cyan**. The logo and the name "LexGo" stay; everything else is open.

The client's success story: *a legal need becomes a booked, paid, tracked service*. Everything on Home must serve that story.

## 2. The problem with the current Home

The current client Home works but is **wordy and unprioritised**:

- A tall dark gradient hero with greeting + headline + subtitle + a "describe your problem" field + three trust chips + a horizontal rail of six quick-action cards with illustrations. Too many sentences before the first useful tap.
- Below it: a promo banner for the lawyers marketplace, then "Your active requests", then a referral progress bar, then another dark "Need help? Ask AI" card at the very bottom (AI is advertised twice).
- Copy is long everywhere (full sentences where a 1–2 word label would do), and the important, personal things (the status of what the client already ordered) sit under marketing.

Your redesign must **cut words aggressively** and **reorder by client value**.

## 3. What must exist on Home (content inventory, not layout)

Keep these capabilities; you decide their shape and size. The ORDER below is the required priority order from top to bottom — the most needed things first, marketing last.

1. **Header row** — LexGo mark/name, notifications bell, avatar (Profile lives behind the avatar; there is NO Profile tab).
2. **Ask / describe the problem** — the single most important entry point. One field or one big action. Submitting opens the AI assistant with the text prefilled. A secondary path lets the client choose "answer by advocate" instead of AI (today this is a small "who should answer?" sheet). Make the primary path obvious; do not make the user read to find it.
3. **Active work status** — the client's open requests/orders/cases: status, who is handling it, next step, unread messages. If there is none, a compact, honest empty state (one line, one action), never a big illustration.
4. **Urgent help** — "Tezkor advokat" (reach an advocate now) and the SOS/traffic-accident consultation path. Must be reachable within one thumb tap but must not look like an alarm on a calm day.
5. **Quick actions** — the remaining entry points: Find a specialist, Document analysis (upload a file), Services/templates catalogue. Today these are six illustrated cards in a rail; you may reduce, regroup or turn into a grid. Six is too many for a rail; pick what a first-time client needs.
6. **Trust** — some reassurance (licensed advocates, response time, confidentiality) but as 2–3 tiny chips or a single line, not a section.
7. **Marketplace promo** (advocates/jurists) and **referral progress** (invite friends → discount) — allowed, but low, small, dismissible, and never above the status section.

Do **not** add a second "Ask AI" card at the bottom. AI has exactly two homes: the ask field at the top and the centre tab-bar button.

## 4. Bottom navigation — required

Design the tab bar explicitly in every direction and every mode.

- **5 slots, AI in the centre:** `Asosiy` (Home) · `Xizmatlar` (Services) · **AI** (centre, raised) · `Ishlarim` (My work) · `Xabarlar` (Messages, with an unread badge).
- The centre AI button is a **raised circular/pill button** that rises above the bar. It must be **a flat, clean mark** — a simple spark/star/"AI" glyph with a brand gradient or solid fill. **Do NOT design a 3D object, gem, crystal, orb, animated neuron network, particle ring or any "AI model" sculpture inside it.** Calm and exact, not flashy. A subtle press state is enough.
- Labels are short (one word), 11–12 pt, icons 24 pt, hit targets ≥ 44 pt, bar respects the home-indicator safe area.
- In Glass mode the bar is a translucent floating pane (iOS 26 "Liquid Glass" style: blur + bright hairline + soft shadow) over the scrolling content. In Light/Dark it is an opaque surface with a hairline divider. Show the active state clearly in all three.
- Show the Messages badge and the AI button in both rest and pressed states.

## 5. Mobile UX rules (non-negotiable)

- Canvas **393 × 852** (iPhone 15/16 Pro), safe areas drawn. Also show that the layout survives a 360 × 800 Android width (one extra frame per direction is enough, Light mode only).
- **One-hand use:** the primary action and the urgent action are in the bottom 60% of the first viewport. Nothing important hides behind a horizontal scroll alone.
- **First viewport = decision complete:** without scrolling, the client sees (a) the ask field, (b) status of their current request or a one-line empty state, (c) the urgent entry.
- Tap targets ≥ 44 × 44 pt; 16 pt screen gutter; 4 pt spacing grid; 8–12 pt inside a group, 20–28 pt between groups.
- Scrolling content passes under the tab bar; the last section has bottom padding for the bar.
- Loading = skeletons in place, not spinners. Empty states are one line + one button.
- Text contrast ≥ WCAG AA (4.5:1) in all three modes, including text on gradients and on glass.
- Reduce Motion / Reduce Transparency fallbacks: Glass mode must degrade to the Light/Dark solid surfaces without breaking layout.
- Copy: Uzbek Latin, **short**. Use this real copy (do not invent long sentences, no lorem ipsum):
  - Greeting: `Salom, Dilnoza` · Headline (max 4 words): `Qanday yordam kerak?`
  - Ask placeholder: `Muammoni yozing…` · Send: `Yuborish` · Alt: `Advokatdan so'rash`
  - Status section: `Faol so'rovlar` · row example: `Mehnat nizosi · Advokat ko'rib chiqmoqda · 2 yangi xabar` · `Barchasi`
  - Empty status: `Hali so'rov yo'q` + button `So'rov yuborish`
  - Urgent: `Tezkor advokat` · `Avtohalokat · maslahat`
  - Quick actions: `Mutaxassis topish` · `Hujjat tahlili` · `Shablonlar` · `Xizmatlar`
  - Trust chips: `Litsenziyali advokatlar` · `15 daqiqada javob` · `Maxfiy`
  - Promo: `Advokat va yuristlar` · CTA `Ko'rish` · Referral: `Do'stlarni taklif qiling` · `3/5 · 25% chegirma`
  - Tabs: `Asosiy` · `Xizmatlar` · `AI` · `Ishlarim` · `Xabarlar`

## 6. Visual system — specify, don't just draw

For **each direction** give an explicit token sheet:

- **Colour:** brand family stays navy/blue/cyan (e.g. navy `#0B1F45`, blue `#123A86`→`#0E7FD0`, cyan `#00CFE8` are the current anchors; you may tune them). Define: canvas, surface, surface-2, line/hairline, ink, ink-secondary, ink-tertiary, accent, accent-strong, soft tint, and the status pairs ok / warn / err (fill + text) — for **Light, Dark and Glass** separately. Reserve the gradient for one hero or one primary CTA, never both everywhere.
- **Glass mode definition:** a dim, slightly colour-tinted backdrop (a quiet navy/cyan field, NOT a loud aurora), frosted cards with a translucent fill + bright 1 px top hairline and no drop shadow, the tab bar and header as real blurred panes, text still ≥ AA. Give the exact fill alpha, blur radius, hairline colour. Glass must look premium and calm, not "childish" or neon.
- **Radius scale:** one scale for the whole screen, e.g. 10 (chips, icon tiles) · 14 (fields, inner tiles) · 20 (cards) · 28 (hero, sheets) · pill. Each direction may pick its own numbers but must use ≤ 4 radii consistently and state them.
- **Typography:** the app currently uses **Onest** for display (headline, section titles) and **Inter** for UI text. You may keep this pair or propose one alternative pair per direction (must be free/Google Fonts, must render Uzbek Latin with apostrophes `o' g'` cleanly). State the scale: display 28–32 / title 20–22 / section 17 / body 15 / small 13 / caption 11–12, with weights and line heights.
- **Elevation:** resting card, floating (sheet/tab bar), primary CTA. Three levels max.
- **Iconography:** one set (Feather/Lucide-style 1.5–2 px strokes), 24 pt in bar, 20 pt in rows.

## 7. The 5 directions (make them genuinely different)

Each direction is a different *answer to the same inventory*, not a recolour. Suggested starting points — you may rename but keep them this distinct:

1. **"Calm Desk"** — editorial, white/ink-first, minimal brand colour, strong type hierarchy, cards almost invisible (hairlines only). For people who distrust flashy apps.
2. **"Status First"** — the active-request card is the hero; the ask field sits directly under the header as a compact bar; dashboard-like density, clear progress states.
3. **"Ask Bar"** — the ask field is a large, pinned-feeling composer with the "AI / Advokat" switch built in; the rest is a tidy 2-column grid of actions; tab bar and composer visually related.
4. **"Soft Tiles"** — friendly, rounded (20–28 radii), tonal surfaces (Material 3 Expressive feel), large touch tiles, urgent tile in a warm tone; still calm.
5. **"Brand Gradient, Disciplined"** — keeps a short navy→cyan hero band (≤ 30% of first viewport) that holds only the greeting + ask field; everything else is neutral surfaces. The disciplined evolution of today's screen.

For every direction, deliver **Light, Dark, Glass** of the same layout (identical content and order across the three modes).

## 8. Deliverables, in this order

1. **Overview frame:** the 5 directions side by side (Light mode), with one sentence each on who it is for.
2. **Per direction (×5):** Light / Dark / Glass full screens at 393 × 852 with the tab bar; one 360-wide Android frame (Light); a token sheet (colours, radii, type, elevation); the tab bar + AI button as a separate component frame with rest / pressed / active / badge states; the ask field states (empty / typing / sent); the status row states (in review / waiting for payment / in progress / done) and the empty state.
3. **Rationale per direction (≤ 120 words):** why this order, where the thumb goes first, what you removed from the current screen and why.
4. **Recommendation:** which single direction you would ship and the two things you would A/B test.

## 9. Hard constraints checklist (verify before you finish)

- [ ] Ask field, current status, urgent entry all visible in the first viewport.
- [ ] No second AI card at the bottom; AI = ask field + centre tab button only.
- [ ] Centre AI button is flat/clean, no 3D model, gem, orb or animated network.
- [ ] Every label ≤ 3 words; no paragraph longer than one line in the first viewport.
- [ ] Uzbek copy from section 5 used verbatim; no placeholder text.
- [ ] Each direction: 3 modes, same layout; Glass has a stated solid fallback.
- [ ] Token sheet with real hex values, radii numbers, font sizes/weights per direction.
- [ ] Contrast ≥ 4.5:1 on all text, including on gradients and glass.
- [ ] Tap targets ≥ 44 pt; 16 pt gutters; safe areas respected; content scrolls under the bar.
- [ ] Marketing (promo, referral) is last and dismissible.

---

# PART 2 — Client Home: logic, states and backend data

> Part 2 of the same prompt. It tells the designer what is real data, what is conditional, and what each tap does. Everything below is taken from the shipped mobile app code, not invented.

## 0. Who sees Home

| Role | What Home is |
|---|---|
| **Guest** (not signed in) | Same page as a client. Personal blocks (active requests, referral) are replaced by one sign-in card. Bell and avatar open sign-in. Tabs `Ishlarim` and `Xabarlar` open sign-in when pressed. |
| **Client** (signed in) | Full page described below. |
| **Advokat / Yurist** | Never see this page; they land on their own "Ish maydoni" tab. Ignore for this design. |

Design both **guest** and **signed-in client** states of the page (guest only needs Light mode of one direction).

## 1. Section-by-section logic (top → bottom in the new priority order)

### 1.1 Header row
- Left: menu button (opens a side drawer with secondary links), greeting line `Assalomu alaykum` + the person's name. Name = `user.name` or `firstName + lastName`; guest sees `Mehmon`.
- Right, always the same four 40 pt round buttons as every other tab header: demo pill (only in demo accounts; can be omitted), **support headset** (opens a bottom sheet: operator chat, complaint, phone call with today's working hours, help hub), **bell** with an unread dot, **avatar** (opens Profile; there is no Profile tab).
- Data: `GET /notifications/unread-count` → dot on the bell if > 0. Avatar initials from the name.

### 1.2 Ask field (primary action)
- One text field. Typing + send (or keyboard "send") opens the **AI tab** with the text prefilled as `?q=`.
- Secondary: "Advokatdan so'rash" → today a bottom sheet "Kimdan maslahat olasiz?" offers **Advokat** (goes to Urgent advocate flow `/urgent`) or **AI** (goes to AI tab). You may replace the sheet with an inline segmented switch `AI | Advokat` in the field; the two destinations stay the same.
- Free-tier hint: the AI answers "within the free limit". The limit string comes from `GET /clients/me/entitlements` → `ai_limit` (e.g. `"5"` or `"unlimited"`); show it only as a tiny caption if at all.
- No data needed to render; the field is always enabled.

### 1.3 Active requests ("Faol so'rovlar")
- Source: `GET /cases` (the client's own cases). Shown rows = all cases **except** `status ∈ {completed, archived}`. Refetched every 30 s when the tab is open.
- Row fields (all strings, any may be empty):
  - `title` / `case_type` → row title (fallback: the case number)
  - `case_number` → small ID chip, e.g. `CASE-1042`
  - `stage` → grey subtitle (`request`, `matching`, `payment`, `work`, `done`)
  - `status` → coloured badge (Uzbek label from the status table below)
  - `next_action` → one line with an arrow, the thing the client must do now (e.g. "To'lovni tasdiqlang")
- Status colour rule (keep): green if status matches *done / closed / complete / resolved*; amber if *progress / review / wait / pending*; brand blue otherwise.
- Tap a row → the case/work detail. "Barchasi" → `Ishlarim` tab.
- States to design: **loading** (one 64 pt skeleton), **empty** (`Hali so'rov yo'q` + button `So'rov yuborish` that focuses the ask field), **1 row**, **3 rows** (cap the list at 3, rest behind "Barchasi").
- Unread chat messages per case are not in `/cases`; the global unread count for the `Xabarlar` tab badge comes from the secure-chat rooms (see 2.3). Do not show per-row unread counts unless you label them as optional.

### 1.4 Urgent help
- **Tezkor advokat** → `/urgent`: a paid "reach an advocate now" request. Catalogue of urgent services: `GET /urgent-advokat/catalog` (service name, price, response time). The client's own urgent requests: `GET /urgent-advokat/requests/me` (status `open_pool` → `claimed` → `in_progress` → `done`). If one is **open or claimed right now**, Home should surface it at the top of Active requests or as a slim live strip ("Advokat 3 daqiqada bog'lanadi"), not as a second card.
- **Avtohalokat · maslahat** → `/urgent/new?service=traffic_accident_consultation` (a preselected urgent service).
- **SOS** (`/sos`, `POST /sos`) exists for emergencies but is reached from the drawer; it may be a small text link under Urgent, not a red button.

### 1.5 Quick actions
Today six illustrated rail cards. Required destinations (order flexible, cut to 4 if needed):

| Label | Goes to | Notes |
|---|---|---|
| Mutaxassis topish | Lawyers marketplace (`/(tabs)/lawyers`) | List of verified advokat/yurist with price and rating |
| Hujjat tahlili | `/doc-analysis` | Upload PDF/DOCX/TXT, AI + advocate check |
| Shablonlar / Xizmatlar | `Xizmatlar` tab (`/services`) | Document templates and online services catalogue |
| Muammoni tavsiflash | the ask field | Redundant with 1.2; drop it |
| AI'dan so'rash | AI tab | Redundant with 1.2 and the centre tab; drop it |

No data needed. Icons only; no illustrations required.

### 1.6 Trust line
Static, three short chips: `Maxfiy` · `Bir necha daqiqada javob` · `Tasdiqlangan mutaxassislar`. One line, never a section.

### 1.7 Upsell banner ("nudge") — conditional
- Only for signed-in clients, hidden on chat/urgent/SOS screens. One of four messages is picked at random per session and can be dismissed (stays dismissed for the session):
  - `gift` → `/profile/gifts`
  - `pro` (crown) → `/subscription`, hidden if the client already has plan `lexgo-ai-pro`
  - `lite` (gem) → `/subscription`, hidden if the client has `lexgo-ai-lite` or `lexgo-ai-pro`
  - `lawyers` → `/lawyers`
- Data: `GET /subscription-plans` (list, has `id`, `slug`, prices) + `GET /clients/me/entitlements` → `active_subscriptions[].plan_id`, `has_active_subscription`, `ends_at`.
- Design it as **one** compact dismissible card, low on the page, warm tint, with an icon, a bold one-liner and a small CTA. It must never push the ask field or the status section down.

### 1.8 Lawyers promo — conditional
- Appears **2.2 s after** Home opens (fades in), hidden for **3 days** once closed or tapped. CTA → lawyers marketplace.
- No backend data. Keep it under the status section; it may merge with the `lawyers` nudge above into one slot.

### 1.9 Referral progress — conditional
- Source: `GET /referrals/me` →
  - `joined_count`, `invited_count`, `eligible_after` (default 5), `remaining_to_unlock`
  - `discount_percent` (e.g. 25), `discount_unlocked` (bool)
  - `code`, `link`, `qr_url` (used on the referral page, not on Home)
- Home shows: title `Do'stlarni taklif qiling`, progress bar `joined / eligible_after`, caption `3/5 · 25% chegirma` or, once unlocked, `25% chegirma faol`. Tap → `/profile/referral`.
- Hidden while loading or if the request fails. Lowest block on the page.

### 1.10 Removed
- The dark "Yordam kerakmi? → AI bilan suhbatlashish" card at the bottom. AI is already the ask field and the centre tab button.

## 2. Bottom tab bar logic

| Slot | Label | Route | Badge | Guest |
|---|---|---|---|---|
| 1 | Asosiy (today "Bosh sahifa") | Home | — | yes |
| 2 | Xizmatlar (today "Hujjatlar") | Services / templates catalogue | — | yes |
| 3 | **AI** (centre, raised) | AI chat | — | yes |
| 4 | Ishlarim (today "Ishlar") | My works: orders + cases | — | opens sign-in |
| 5 | Xabarlar | Secure chats | unread count | opens sign-in |

- 2.1 The AI tab hides the tab bar on its own screen (the chat composer sits on the bottom edge). Design the bar for Home only.
- 2.2 The AI button today is a Skia-drawn animated "neuron spark" with an optional 3D gem. **Replace with a flat glyph**; a 10 s idle animation is not wanted. Press = scale 0.96 + light haptic.
- 2.3 `Xabarlar` badge = number of unread secure-chat messages (client-side sum over chat rooms, kept live by a socket). Show `1`, `12`, `99+`.
- 2.4 Bell dot in the header = unread notifications (separate from chat).
- 2.5 Content scrolls under the bar; Home's last block has bottom padding ≈ bar height + 24.

## 3. Loading, errors, offline
- Session and entitlements are cached; Home renders immediately with the last known data, then refreshes.
- Each block fails independently: if `/cases` fails, show the empty state with a small "Qayta urinish" link; if `/referrals/me` or `/clients/me/entitlements` fails, the block is simply absent. Never block the whole page on one request.
- Offline: a thin banner under the header `Server bilan bog'lanib bo'lmadi. Internet aloqasini tekshirib, qayta urining.` (existing text; may be shortened); the ask field still accepts text and sends when back online.

## 4. Backend endpoints used by Home (summary)

| Endpoint | Used for | Key fields |
|---|---|---|
| session (cached login) | greeting, avatar, role | `name`, `first_name`, `last_name`, `phone`, `role` |
| `GET /notifications/unread-count` | bell dot | number |
| `GET /cases` | Active requests | `id`, `case_number`, `title`/`case_type`, `stage`, `status`, `next_action` |
| `GET /urgent-advokat/requests/me` | live urgent strip (optional) | `status`, `service`, `created_at` |
| `GET /urgent-advokat/catalog` | urgent services (on the urgent screen) | name, price, response time |
| `GET /clients/me/entitlements` | AI free limit, which nudge to hide | `ai_limit`, `has_active_subscription`, `active_subscriptions[].plan_id`, `ends_at` |
| `GET /subscription-plans` | plan slugs for the nudge rule | `id`, `slug` |
| `GET /referrals/me` | referral progress | `joined_count`, `invited_count`, `eligible_after`, `discount_percent`, `discount_unlocked` |
| secure-chat rooms (socket) | `Xabarlar` badge | unread sum |

Base URL: `https://lexgo.api.cognilabs.org`. Responses are JSON; many fields are optional, so every block must tolerate an empty string.

## 5. Status labels (Uzbek) for the request rows
Use these exact strings for the badge; the raw key is what the backend sends.

| key | label |
|---|---|
| `new` | Yangi |
| `pending` | Kutilmoqda |
| `matching` / `seller_selection` | Ijrochi tanlash / Buyurtma qabul qilindi |
| `awaiting_payment` / `pending_payment` / `payment_required` | To'lov kutilmoqda |
| `paid` | To'langan |
| `accepted` | Qabul qilindi |
| `in_progress` / `started` | Jarayonda / Ish boshlandi |
| `lawyer_review` | Advokat ko'rib chiqmoqda |
| `waiting_info` / `waiting_docs` | Ma'lumot kutilmoqda / Hujjatlar kutilmoqda |
| `result_ready` / `file_ready` | Natija tayyor / Hujjat tayyor |
| `client_confirmation` | Tasdiqlashingiz kutilmoqda |
| `completed` | Yakunlangan (hidden from Home) |
| `archived` | Arxivlangan (hidden from Home) |
| `cancelled` / `declined` / `rejected` | Bekor qilindi / Rad etildi / Rad etilgan |
| `open_pool` / `claimed` (urgent) | Bo'sh navbatda / Olingan |

## 6. Sample data for the mockups (realistic, use as-is)

```json
{
  "user": { "name": "Dilnoza Karimova", "phone": "+998 90 123 45 67" },
  "unread_notifications": 2,
  "unread_chats": 3,
  "cases": [
    { "case_number": "CASE-1042", "title": "Mehnat nizosi", "stage": "work", "status": "lawyer_review", "next_action": "Hujjatlarni yuklang" },
    { "case_number": "CASE-1039", "title": "Ijara shartnomasi", "stage": "payment", "status": "awaiting_payment", "next_action": "To'lovni tasdiqlang" },
    { "case_number": "CASE-1021", "title": "Avtohalokat", "stage": "done", "status": "completed", "next_action": "" }
  ],
  "urgent_active": { "status": "claimed", "service": "Avtohalokat · maslahat", "eta_min": 3 },
  "entitlements": { "ai_limit": "5", "has_active_subscription": false, "active_subscriptions": [] },
  "referral": { "joined_count": 3, "invited_count": 5, "eligible_after": 5, "discount_percent": 25, "discount_unlocked": false }
}
```

Note: `CASE-1021` is `completed`, so it must **not** appear in Active requests. The urgent request is `claimed`, so a live strip is appropriate.

---

## Short version for Figma AI (≤ 2000 characters)

```text
LexGo, an Uzbek legal-services app. Design the CLIENT Home tab (iPhone 393×852) in 5 distinct directions, each in Light, Dark and Glass mode plus the tab bar.

Order top→bottom (useful first, marketing last):
1 Header: LexGo mark, bell, avatar (no Profile tab).
2 Ask field, primary action: "Muammoni yozing…" → AI; alt "Advokatdan so'rash".
3 "Faol so'rovlar": status rows ("Mehnat nizosi · Advokat ko'rib chiqmoqda · 2 yangi xabar"); empty = "Hali so'rov yo'q" + "So'rov yuborish".
4 Urgent: "Tezkor advokat", "Avtohalokat · maslahat"; one tap, calm.
5 Grid: Mutaxassis topish, Hujjat tahlili, Shablonlar, Xizmatlar.
6 Trust chips: Litsenziyali advokatlar · 15 daqiqada javob · Maxfiy.
7 Dismissible promo "Advokat va yuristlar", referral "3/5 · 25% chegirma".
No extra AI card; AI = ask field + centre tab only.

Tab bar: Asosiy · Xizmatlar · AI (centre, raised circle, flat spark glyph on brand gradient, NO 3D gem/orb/animation) · Ishlarim · Xabarlar (badge). Labels 12pt, icons 24pt, targets ≥44pt. Glass: blurred floating pane + hairline; Light/Dark: opaque. Show active/pressed.

UX: ask, status, urgent above the fold; actions in lower 60% (one hand); 16pt gutter, 4pt grid; labels ≤3 words; contrast ≥4.5:1 on gradient and glass; content scrolls under bar.

Tokens per direction (real values): navy #0B1F45 → blue #0E7FD0 → cyan #00CFE8; canvas/surface/line/ink/accent/ok/warn/err per mode; ≤4 radii (10/14/20/28 + pill); Onest display + Inter UI (alt pair allowed), 28/20/17/15/13/11; 3 elevations. Glass = dim navy-tinted backdrop, frosted cards (translucent fill, 1px top hairline, no shadow), solid fallback.

Directions: 1 Calm Desk (ink-first, hairline cards) · 2 Status First (status card is hero) · 3 Ask Bar (big composer, AI/Advokat switch, 2-col grid) · 4 Soft Tiles (tonal, 20–28 radii) · 5 Disciplined Gradient (navy→cyan band ≤30%, "Salom, Dilnoza" + ask; rest neutral).

Deliver: overview, then per direction 3 modes, tokens, tab bar states, rationale, one pick.
```
