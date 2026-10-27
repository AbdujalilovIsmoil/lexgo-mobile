# LexGo — Client Home Screen Redesign Brief

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
