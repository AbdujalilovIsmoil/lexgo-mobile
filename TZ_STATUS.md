# LexGo mobile — TZ bajarilish holati (living checklist)

Manba: `TZ.md` (canonical). Bu fayl TZ bo'limlari bo'yicha holatni ko'rsatadi. Statuslar: **Bajarildi** · **Qisman** · **Yo'q** · **Backendda yo'q**.
Har bir work package o'z batafsil hisobotini `tz-status/<PKG>.md` ga yozadi; shu fayl umumiy jadval va qarorlar.
Oxirgi yangilanish: 2026-10-10 (Phase 1 audit + foundation). Quyidagi "Holat" ustuni auditdan keyingi **boshlang'ich** holat; paketlar tugagach yangilanadi.

## 0. Qarorlar (owner UI qarori va TZ ziddiyati)
| # | Qaror |
|---|-------|
| D1 | Client/advokat bottom bar'da **AI markaziy tugma saqlandi** (owner qarori). TZ §44 ning 5 tabi 4 tab + AI shaklida: Client = Bosh sahifa / Xizmatlar / **AI** / Ishlar / Xabarlar; **Profil** — har bir tab sarlavhasidagi avatar (`TabPage`/`HeaderActions`) orqali. Advokat/yurist = Ish maydoni / So'rovlar / **AI** / Mijozlar / Xabarlar. Call-center = TZ bo'yicha aynan Leadlar / Support / Mijozlar / Uchrashuvlar / Profil (AI markaziy tugmasiz). Admin/staff = Boshqaruv / Xabarlar / AI / Xabarnoma / Profil (permission asosidagi hub). |
| D2 | iOS "liquid glass" bar va Android yassi bar dizayni o'zgarmadi; faqat tab ro'yxati/yorliqlari/badge TZ ga moslandi (`src/widgets/tab-bar/tabConfig.ts`). |
| D3 | Push: backendda qurilma tokenini ro'yxatdan o'tkazish endpointi **yo'q** (TZ §46 da ham yo'q) → masofaviy push **Backendda yo'q**. Local notification (foreground/realtime + background task) bilan qoplanadi. |
| D4 | Realtime: bitta umumiy `/ws/users/me` ulanish (`src/shared/realtime`, core `SessionBoundary` boshqaradi), backoff 1/2/4/8/16/30 s, reconnectdan keyin REST sync, event ID dedupe. |
| D5 | Fayl preview: PDF — lokal native modul `modules/pdf-pages` (PDFKit / PdfRenderer), rasm — zoom viewer, audio/video — expo-audio/expo-video, Office — iOS WKWebView, Android "boshqa ilovada ochish". |
| D6 | Role almashtirish/logout: `SessionBoundary` user/role o'zgarganda react-query keshini tozalaydi va `registerSessionReset` cleanerlarini ishga tushiradi; socket yangi token bilan qayta ulanadi. |
| D7 | Staff `Boshqaruv` hub saqlandi (permission asosida dinamik); TZ'dagi "drawer" — modul almashtirgich sifatida ADM paketida. |

## 1. Bo'limlar bo'yicha holat
| TZ § | Mavzu | Holat | Qayerda / izoh |
|------|-------|-------|----------------|
| 1 | Texnik konfiguratsiya, headerlar | Bajarildi | `shared/config/env.ts`, `shared/api/headers.ts` (Accept-Language, X-Request-ID, Bearer). Release HTTP/cert tekshiruvi §43 da. |
| 2 | Arxitektura servislari | Qisman | ApiClient/TokenRefresh (`shared/api/http.ts`), RealtimeManager (`shared/realtime`), FileTransfer (`shared/lib/download`), PermissionGate (`RoleGate`/`AdminGate`/`Can`). PushRouter/DeepLinkRouter/NetworkMonitor/AnalyticsClient — INFRA paketi. |
| 3 | Rollar va ruxsatlar | Qisman | `entities/access` (`useAccess`, `RoleGate`). Role-based tab/hub bor; har ekranda permission-first tekshiruv paketlar bo'yicha. |
| 4 | Auth/session/TOTP | Qisman | Login(+428/2FA), register(client), OTP, forgot, refresh single-flight, sessions, TOTP setup/enable/disable bor. Yo'q: rolega xos register profili, biometrik vault, refresh xatolarini ajratish. → AUTH |
| 5 | Startup va navigatsiya | Qisman | Cold start hydrate + `/auth/me` + socket. Role shell (tabConfig). Account status/onboarding gating, deep-link — AUTH/INFRA. |
| 6 | Umumiy API qoidalari | Qisman | Pagination/xato parser (detail string/object) bor; status flaglariga tayanish paketlarda. |
| 7 | Client dashboard | Qisman | Home bor (statik tezkor bloklar). Haqiqiy counterlar + filtered list — CLIENT |
| 8 | AI yuridik chat | Qisman | `entities/chat`, `/chats` tarix. WS stream/reconcile, limit server javobidan — AI |
| 9 | AI Instructor V2 | Yo'q | AI paketi |
| 10 | Support (client) | Yo'q (admin tomoni bor) | SUP paketi |
| 11 | Xizmatlar/hujjat katalogi | Qisman | `entities/service`, services browser. Passport, document-fields/template — DOC1 |
| 12 | Qo'lda to'ldirish | Yo'q | DOC1 |
| 13 | AI bilan hujjat | Yo'q | DOC1 |
| 14 | Navbatchi advokat bilan hujjat | Qisman | review-existing handoff bor; service-flow/duplicate block/files+voice — DOC1 |
| 15 | Mening hujjatlarim / ishlarim | Yo'q | DOC2 / CLIENT |
| 16 | Hujjat tahlili | Qisman | quote/file/text/handoff bor; 10+ sahifa to'lov oqimi — DOC1 |
| 17 | Advokat hujjat queue va editor | Yo'q | ADV1 (OnlyOffice WebView) |
| 18 | Marketplace (client) | Qisman | directory, filter, detail, order flow bor; AI search, orders cancel/complete — MKT |
| 19 | Marketplace seller | Yo'q | SEL |
| 20 | Reklama | Yo'q (admin ads bor) | SEL |
| 21 | Tezkor advokat (client) | Yo'q | URG |
| 22 | Call-center urgent boshqaruvi | Qisman | `entities/admin-callcenter` urgent queue bor; to'liq oqim — URG/CC |
| 23 | Secure chat | Qisman | `/manage/chats`, room (staff shell); client/advokat "Xabarlar" tabi — MSG |
| 24 | Call va meeting | Qisman | LiveKit call room + incoming watcher bor; video/audio, extension, recording, transfer — MSG (device sinov cheklangan) |
| 25 | Rating va complaint | Yo'q (admin reviews bor) | PAY |
| 26 | Subscription/entitlement | Qisman | plans, telegram purchase, entitlements; auto-renew — PAY |
| 27 | Payments | Qisman | order payment; list/receipt/verify/split — PAY |
| 28 | Notification va push | Qisman | list/read/prefs/detail sheet bor; push Backendda yo'q (D3) — INFRA |
| 29 | Fayl va preview | Bajarildi (infra) | `shared/ui/preview`, `shared/lib/download`; ishlatish paketlarda |
| 30 | Workspace storage | Yo'q | ADV2 |
| 31 | Seller onboarding | Yo'q | SEL |
| 32 | Organization owner | Yo'q | ORG |
| 33 | Call-center support assist | Qisman | `entities/admin-support` assist API bor; client tasdiq oqimi — SUP/CC |
| 34 | CRM va leadlar | Bajarildi (admin) | `/manage/pipeline` (kanban). Call-center tab ichiga ulash — CC |
| 35 | Internal HRM | Bajarildi (admin) | `/manage/internal/*`. Gap audit — ADM |
| 36 | Studio | Bajarildi (admin) | `/manage/studio/*`. Gap audit — ADM |
| 37 | Realtime arxitektura | Qisman | User socket, ReconnectingSocket, secure-chat/call socketlari. AI chat WS — AI |
| 38 | Local cache/offline | Yo'q | INFRA (expo-sqlite) |
| 39 | Performance | Qisman | Pagination/debounce bor; cancel/ETag/thumbnail — paketlar + INFRA |
| 40 | Security checklist | Qisman | Tokenlar SecureStore. Screenshot himoya, biometrik, logout cache — AUTH/INFRA, yakuniy tekshiruv O |
| 41 | Analytics eventlari | Yo'q | INFRA |
| 42 | Acceptance testlar | Yo'q | O (pastda jadval) |
| 43 | Release checklist | Yo'q | O (pastda jadval) |
| 44 | Ekranlar xaritasi | Qisman | Bar/tablar tayyor (D1); sahifalar paketlar tomonidan |
| 45 | Jamoa qoidalari | — | Hamma paketga majburiy |
| 46/47 | API inventari/modellar | — | Paketlar o'z guruhlarini tekshiradi |

## 2. Work packagelar
A nav (lead) · B AUTH · C CLIENT · D AI · E SUP · F DOC1/DOC2 · G ADV1/ADV2/SEL · H MKT · I URG · J ORG · K PAY · L INFRA · M CC · N ADM · O QA (lead).
Hisobotlar: `tz-status/<PKG>.md`.

## 3. §42 Acceptance testlar (natija: PASS = qurilmada/API'da ko'rildi · CONTRACT = faqat kod/shartnoma o'qildi · N/T = bu muhitda sinab bo'lmaydi · FAIL)
| § | Test | Natija | Dalil / izoh |
|---|------|--------|--------------|
| 42.1 | register Telegram OTP bilan | — | |
| 42.1 | noto'g'ri va expired OTP | — | |
| 42.1 | daily limit | — | |
| 42.1 | login Telegram challenge | — | |
| 42.1 | TOTP login | — | |
| 42.1 | refresh race | — | |
| 42.1 | revoked session | — | |
| 42.1 | logout | — | |
| 42.2 | qo'lda hujjat | — | |
| 42.2 | AI hujjat | — | |
| 42.2 | advokat hujjat request | — | |
| 42.2 | duplicate request block | — | |
| 42.2 | 10+ sahifa analysis payment | — | |
| 42.2 | marketplace purchase | — | |
| 42.2 | urgent video/audio/chat | — | |
| 42.2 | group second opinion eligibility | — | |
| 42.2 | support AI va operator | — | |
| 42.2 | rating/complaint 15 daqiqa | — | |
| 42.2 | plan entitlement | — | |
| 42.2 | notification deep-link | — | |
| 42.3 | onboarding pending/approved | — | |
| 42.3 | xizmat va narx ceiling | — | |
| 42.3 | document claim race | — | |
| 42.3 | uch editor source | — | |
| 42.3 | save/finalize | — | |
| 42.3 | transfer | — | |
| 42.3 | marketplace order | — | |
| 42.3 | secure chat/file/voice | — | |
| 42.3 | audio call camera yoqilishi | — | |
| 42.3 | meeting pause/extend/recording | — | |
| 42.3 | promotion checkout | — | |
| 42.4 | operatorga faqat kerakli menyu | — | |
| 42.4 | ticket realtime kelishi | — | |
| 42.4 | claim race | — | |
| 42.4 | transfer va close | — | |
| 42.4 | client nomidan preview | — | |
| 42.4 | client realtime confirm | — | |
| 42.4 | urgent group meeting | — | |
| 42.4 | complaint redo | — | |
| 42.4 | lead kanban move/filter/export | — | |
| 42.5 | boshqa org data isolation | — | |
| 42.5 | member add | — | |
| 42.5 | workload | — | |
| 42.5 | member services | — | |
| 42.5 | assignment | — | |
| 42.5 | owner analytics/export | — | |
| 42.6 | permission bo'yicha menu | — | |
| 42.6 | approval | — | |
| 42.6 | legal/catalog/plan edit | — | |
| 42.6 | employee/org tree | — | |
| 42.6 | task/KPI/attendance/payroll | — | |
| 42.6 | Studio draft→publish→rollback→archive | — | |
| 42.6 | realtime monitoring | — | |
| 42.6 | date-filtered Excel | — | |

## 4. §43 Release checklist
| Band | Natija | Izoh |
|------|--------|------|
| production base URL | — | |
| debug log o'chiq emas (console.* yo'q) | — | |
| certificate validation yoqilgan | — | |
| crash reporting PII filter | — | |
| push environment production | Backendda yo'q | D3 |
| universal/app links | — | |
| privacy permission descriptions | — | |
| camera/microphone/file permissions | — | |
| background call configuration | — | |
| secure storage migration | — | |
| database migration | — | |
| minimum OS test | — | |
| 360/390/414 px layout test | — | |
| slow network va airplane mode | — | |
| token expiry | — | |
| WebSocket reconnect | — | |
| upload/download interruption | — | |
| accessibility va dynamic text | — | |
| Uzbek Cyrillic/Latin va Russian uzun matnlar | — | |
