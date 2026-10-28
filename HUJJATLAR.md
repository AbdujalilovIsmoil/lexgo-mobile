# Hujjatlar tab — design prompt and spec

## 1. Short prompt (paste where there is a 2000-character limit)

```text
LexGo (Uzbek legal app). Design the client "Xizmatlar" tab: a catalogue of ~1,000 ready legal document templates. Same 5 directions, Light/Dark/Glass, tokens and tab bar as Home. iPhone 393×852.

Goal: find a document fast, see price and time, start. Search is the hero.

Layout, top→bottom:
1 Header "Xizmatlar" + bell + avatar.
2 Pinned search "Hujjat nomini yozing…" with filter button; line "23 ta natija (989 tadan)".
3 Chips with counts: Hammasi · Fuqarolik 412 · Iqtisodiy 298 · Ma'muriy 171 · Jinoiy 108. Selected chip in its colour (blue, green, amber, red).
4 Two small pills: "AI ga yozish" · "Tezkor yordam".
5 List of 10 rows + "Yana ko'rsatish". Row: category-coloured paper glyph · 2-line title · "Fuqarolik · ≈5 daqiqa · 45 000 so'm" (or "Bepul") · chevron. No description.
6 Last outlined row "+ Yangi hujjatga buyurtma" → sheet with 3 options, one locked ("Tarif talab qilinadi").

States: no match ("Hech narsa topilmadi" + "Qidiruvni tozalash"), empty category, loading skeletons, offline. Filter sheet "Filtrlar": Yo'nalish and Til radio lists, button "Natijalarni ko'rsatish · 23".

Sample rows: Ijara shartnomasi (turar joy) · ≈5 daqiqa · 45 000 so'm; Mehnat shartnomasini bekor qilish arizasi · ≈3 daqiqa · Bepul; Yetkazib berish shartnomasi · ≈7 daqiqa · 60 000 so'm.

Rules: search + chips + 3 rows visible without scrolling; 16pt gutter; targets ≥44pt; labels ≤3 words; contrast ≥4.5:1; content scrolls under the bar.
```

---

# FULL BRIEF — "Hujjatlar" tab (Services / documents catalogue)

> The second slot of the bottom bar. Design it in the **same 5 directions and 3 modes** as Home, so the two tabs read as one app. Same tokens, same tab bar, same header buttons. Everything below is taken from the shipped app (the structure in §3 is already implemented in the app as of 2026-10-28; the design should refine it, not reinvent it).

## 1. What this tab is

A catalogue of about **1,000 ready legal document templates** (contracts, claims, applications, powers of attorney) that the client can **fill in themselves**, **have a duty advocate prepare**, or **download blank**. Above the list sit two other ways in: _describe the problem to AI_ and _urgent help_. Below the list: _order a document written from scratch_.

The client's job on this tab: **find the right document fast**, understand what it costs and how long it takes, and start. Search is the hero; categories are the second lever; everything else is secondary.

## 2. Current problems

- Title `Huquqiy hujjatlar` + a two-line lead sentence before anything useful. Cut the lead.
- Two tall gradient "AI / urgent" cards (148 pt) sit above the search field and push the catalogue below the fold.
- Rows are heavy: paper icon, 3-line title, 2-line description, category, minutes, language, price, chevron. Too much per row; the list scans slowly.
- Filters live only behind a button; the four categories are invisible until the sheet opens.

## 3. Required structure (top → bottom)

1. **Header** — identical to Home (menu, greeting, support, bell, avatar). Page title `Hujjatlar` (same word as the tab), no subtitle.
2. **Search field, pinned** — placeholder `Hujjat nomini yozing…`, `search` return key, clear button when typing, filter button with a dot when a filter is active. It stays at the top while the list scrolls. Below it a one-line live count: `23 ta natija (989 tadan)`.
3. **Category chips, horizontal, one row** — `Hammasi` · `Fuqarolik` · `Iqtisodiy` · `Ma'muriy` · `Jinoiy`, each with its count. One tap filters; the selected chip uses the category colour. Language (`O'zbek lotin` · `O'zbek kirill` · `Ruscha`) stays in the filter sheet, shown only when more than one language exists.
4. **Compact "other ways" row** — two small pills or a 2-up card row, max 64 pt tall: `AI ga yozish` (→ AI intake) and `Tezkor yordam` (→ SOS / urgent). Not a hero. Optional: may collapse into one line `Mos hujjat topilmadimi? → AI ga yozing`.
5. **The catalogue list** — 10 rows, then `Yana ko'rsatish` (or infinite scroll). Row content, strictly in this order:
   - small category-coloured document glyph (keep the paper sheet idea; 40×50 is enough; a paperclip mark if a DOCX source exists)
   - **title, max 2 lines** (`Ijara shartnomasi (turar joy)`)
   - meta line: category dot + name · `≈ 5 daqiqa` · price `45 000 so'm` or `Bepul`
   - chevron
   - Description is dropped from the row (it is on the template page).
   - Category colours: civil = brand blue, economic = green, administrative = amber, criminal = red, other = grey. Use them only for the glyph and the dot; rows stay neutral.
6. **Footer** — one dashed/outlined row `Yangi hujjatga buyurtma` (+ icon). Opens a sheet with three options: `0 dan hujjat tayyorlash`, `Hujjatimni tekshirtirish`, `Sun'iy intellekt tahlili`; an option outside the client's plan shows a lock and a one-line reason.

## 4. Behaviour and states

- Search is client-side over all loaded rows, debounced 300 ms; changing search, category or language restarts the window at the first 10 rows.
- **States to draw:** default (list) · typing with results · **no match** (`Hech narsa topilmadi`, `«ijara» bo'yicha natija yo'q`, button `Qidiruvni tozalash`) · **empty category** (`Bu yo'nalishda hujjat yo'q`, `Yo'nalishni tozalash`) · **loading** (3 skeleton rows under the pinned search) · **offline** (`Internetga ulanib bo'lmadi`, `Aloqa tiklangach ro'yxat yuklanadi.`) · **loading more** (`Boshqa hujjatlar yuklanmoqda…`).
- **Filter sheet:** bottom sheet `Filtrlar`, two radio lists (`Yo'nalish` with counts, `Til`), pinned bar with a reset icon button and the gradient button `Natijalarni ko'rsatish · 23`. Active filters appear as removable chips under the search field.
- **Pull to refresh** on the list.
- **Advocate mode:** when the tab is opened from an advocate's profile (`?lawyer=`), a banner `Faqat <Ism> xizmatlari` with an `×` replaces the chips row, and the list is narrowed to what that advocate sells. Draw one frame of this.
- **Tapping a row** opens the template page (not part of this brief, but design its action block since it is the natural next frame): title, category, language, a document preview (`Hujjat ko'rinishi`, yellow highlights = fields to fill, `To'liq ko'rish`), and three actions: **`O'zim to'ldiraman`** (primary, `Savollarga javob bering, hujjat tayyor bo'ladi`), `Navbatchi advokat bilan tayyorlash` (`Advokatni siz tanlamaysiz: so'rov navbatchilarga tushadi`), `Toza shablonni yuklab olish` (`Maydonlarsiz bo'sh DOCX fayl`). A locked action shows `Tarif talab qilinadi` + `Tarifni tanlash`.
- Guest: the catalogue is fully browsable; the three template actions ask to sign in (`Davom etish uchun hisobingizga kiring`).

## 5. Backend data

| Endpoint                                     | Used for                                                           | Key fields                                                                                                                                                                                                                                                              |
| -------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /document-template-categories`          | chips and filter sheet                                             | `key` (`legal-doc-civil` …), `title`, `templates_count`, `languages[]`                                                                                                                                                                                                  |
| `GET /document-templates?category=<key>`     | the list (server filters by category only)                         | `id`, `name`, `category`, `language` (`uz-latn`, `uz-cyrl`, `ru`, `en`), `description`, `fields` (count → minutes: `max(2, round(fields × 0.3))`, rounded to 5 above 10), `sections`, `price` (UZS, 0 = free), `source_file` / `has_source` (DOCX exists), `updated_at` |
| `GET /document-templates/{id}`               | template page                                                      | the row + `template_text` (preview)                                                                                                                                                                                                                                     |
| `GET /services?catalog_only=false&limit=500` | which templates are tied to a paid service (few)                   | `document_template_id`, `id`, `is_active`                                                                                                                                                                                                                               |
| `GET /document-service-settings/runtime`     | which "new document" modes are on                                  | `lawyer`, `review`, `analysis` flags                                                                                                                                                                                                                                    |
| `GET /clients/me/entitlements`               | locks on fill / download / new-document options                    | `manual_documents.manual_document_templates`, `template_download`, `manual_document_fill`, `has_active_subscription`                                                                                                                                                    |
| `GET /document-requests`                     | the client's own ordered documents (shown in `Ishlarim`, not here) | `status`, `title`                                                                                                                                                                                                                                                       |

## 6. Sample data for the mockups

```json
{
  "categories": [
    {
      "key": "legal-doc-civil",
      "title": "Fuqarolik",
      "templates_count": 412,
      "languages": ["uz-latn", "uz-cyrl", "ru"]
    },
    {
      "key": "legal-doc-economic",
      "title": "Iqtisodiy",
      "templates_count": 298,
      "languages": ["uz-latn", "ru"]
    },
    {
      "key": "legal-doc-administrative",
      "title": "Ma'muriy",
      "templates_count": 171,
      "languages": ["uz-latn"]
    },
    {
      "key": "legal-doc-criminal",
      "title": "Jinoiy",
      "templates_count": 108,
      "languages": ["uz-latn", "uz-cyrl"]
    }
  ],
  "templates": [
    {
      "name": "Ijara shartnomasi (turar joy)",
      "category": "legal-doc-civil",
      "language": "uz-latn",
      "fields": 18,
      "price": 45000,
      "has_source": true
    },
    {
      "name": "Mehnat shartnomasini bekor qilish to'g'risida ariza",
      "category": "legal-doc-civil",
      "language": "uz-latn",
      "fields": 9,
      "price": 0,
      "has_source": true
    },
    {
      "name": "Yetkazib berish shartnomasi",
      "category": "legal-doc-economic",
      "language": "ru",
      "fields": 24,
      "price": 60000,
      "has_source": false
    },
    {
      "name": "Ma'muriy jarima ustidan shikoyat",
      "category": "legal-doc-administrative",
      "language": "uz-latn",
      "fields": 7,
      "price": 0,
      "has_source": true
    },
    {
      "name": "Jinoyat ishi bo'yicha da'vo arizasi",
      "category": "legal-doc-criminal",
      "language": "uz-cyrl",
      "fields": 14,
      "price": 30000,
      "has_source": true
    }
  ],
  "total": 989
}
```

Minutes for the rows above: 18 fields → `≈ 5 daqiqa`, 9 → `≈ 3 daqiqa`, 24 → `≈ 7 daqiqa`, 7 → `≈ 2 daqiqa`, 14 → `≈ 4 daqiqa`.

## 7. Checklist for this tab

- [ ] Search is the first thing under the header and stays pinned while scrolling.
- [ ] Four category chips visible without opening the filter sheet, with counts.
- [ ] First viewport shows search + chips + at least 3 document rows (no 148 pt hero cards above the list).
- [ ] Row = glyph, 2-line title, one meta line, chevron. No description in the row.
- [ ] Category colour only on the glyph and the dot; rows neutral in all three modes.
- [ ] All 6 list states drawn; filter sheet drawn with the pinned `Natijalarni ko'rsatish · N` bar.
- [ ] `Yangi hujjatga buyurtma` is the last row, outlined, with its 3-option sheet (one option locked).
- [ ] Same tab bar, header, tokens and type scale as Home in every direction and mode.
