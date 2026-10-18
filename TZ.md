# LexGo Mobile: to'liq ishlab chiqish va API integratsiya qo'llanmasi

Sana: 2026-10-10  
Holat: canonical mobile specification  
Backend: `https://lexgo.api.cognilabs.org`  
API inventari: production kodidan olingan 535 path va 630 HTTP operatsiya

## 0. Hujjat maqsadi

Bu hujjat LexGo mobil ilovasini noldan hozirgi backend imkoniyatlarigacha ishlab chiqish uchun yagona texnik manba hisoblanadi.

Hujjat quyidagilarni belgilaydi:

- har bir role qaysi modul va amallarni ko'rishi;
- login, OTP, TOTP, session va token oqimi;
- client, advokat, yurist, tashkilot, call-center, sales va admin ekranlari;
- hujjat, marketplace, tezkor advokat, support, chat, call va payment oqimlari;
- AI Instructor, Studio va Internal HRM integratsiyasi;
- WebSocket, push notification, deep-link va cache qoidalari;
- xavfsizlik, xatolar va acceptance testlar;
- production backenddagi barcha HTTP endpointlar inventari.

Mobile ilova endpoint mavjudligini menyu ko'rsatish uchun ishlatmaydi. Menyu va actionlar `role`, `assigned_roles`, `permissions`, account status va resource response'dagi `can_*` flaglar bo'yicha boshqariladi.

## 1. Asosiy texnik konfiguratsiya

### 1.1 Muhitlar

```text
Production API: https://lexgo.api.cognilabs.org
REST prefix: yo'q
WebSocket: wss://lexgo.api.cognilabs.org
Default locale: uz
Timezone: Asia/Tashkent
Money: UZS, integer
Date: YYYY-MM-DD
Datetime: ISO-8601, timezone bilan
```

API URL kod ichida tarqoq hardcode qilinmaydi. Bitta environment konfiguratsiyasidan olinadi.

### 1.2 Majburiy headerlar

```http
Authorization: Bearer <access_token>
Accept: application/json
Content-Type: application/json
Accept-Language: uz
X-Request-ID: <client-generated-uuid>
```

Fayl upload uchun `Content-Type`ni qo'lda qo'ymang. HTTP client `multipart/form-data; boundary=...` ni o'zi yaratadi.

### 1.3 Mobile platform talablari

- access token secure storage'da saqlanadi;
- refresh token oddiy preferences yoki loglarga yozilmaydi;
- certificate va hostname tekshiruvi o'chirilmaydi;
- release build HTTP trafficga ruxsat bermaydi;
- telefon, token, OTP, chat matni va fayl URL logga chiqarilmaydi;
- screenshot himoyasi faqat maxfiy ekranlarda platform imkoniyatiga qarab yoqiladi;
- biometrika server auth o'rnini bosmaydi, faqat lokal token vaultni ochadi.

## 2. Mobile arxitekturasi

Tavsiya etiladigan qatlamlar:

```text
UI / Screen
State / ViewModel
Use case
Repository
REST + WebSocket + Push adapters
Secure storage + local database + file cache
```

Majburiy shared servislar:

- `AuthSessionManager`
- `ApiClient`
- `TokenRefreshCoordinator`
- `RealtimeManager`
- `PushRouter`
- `FileTransferManager`
- `PermissionGate`
- `DeepLinkRouter`
- `NetworkMonitor`
- `AnalyticsClient`

Bir paytda kelgan bir nechta `401` uchun faqat bitta refresh request ishlashi kerak. Qolgan requestlar shu natijani kutadi. Refresh muvaffaqiyatsiz bo'lsa session bir marta tozalanadi va login ochiladi.

## 3. Rollar va ruxsatlar

### 3.1 Backend role nomlari

Asosiy account rolelari:

- `client`
- `advokat`
- `yurist`
- `advokat_tashkiloti`
- `admin`
- `manager`
- `call_center`
- `sales`

Qo'shimcha assigned rolelar:

- `superadmin`
- `moderator`
- `finance`
- `quality_control`
- `sales_head`
- `sales_operator`
- `call_center_lawyer`
- `b2b_manager`
- `marketing`
- `content_manager`
- `ceo_viewer`
- `executive`
- `provider`
- `organization_owner`

### 3.2 Permission-first qoida

Mobile quyidagi tartibda qaror qiladi:

1. User login qilganmi.
2. Account `active` holatdami.
3. Zarur onboarding yoki verification tugaganmi.
4. `permissions` ichida modul uchun permission bormi.
5. Resource response'da action uchun `can_*` true ekanmi.
6. Subscription entitlement talab qilinsa, entitlement faolmi.

UI yashirishi xavfsizlik chegarasi emas. Backend qaytargan `403` har doim yakuniy qaror hisoblanadi.

### 3.3 Client

Client ko'radi:

- dashboard;
- AI yuridik chat;
- AI platform instruktor;
- xizmatlar va hujjat katalogi;
- hujjat konstruktori va tahlili;
- `Mening hujjatlarim`;
- `Mening ishlarim`;
- marketplace;
- tezkor advokat;
- secure chat va call;
- support;
- tariflar, payment va cheklar;
- notificationlar;
- profil, oila a'zolari va payment methods;
- roziliklar, referral va giftlar.

Client ko'rmaydi:

- advokat ish pooli;
- call-center queue;
- admin, Studio va Internal HRM;
- boshqa userlarning order, chat yoki fayllari.

### 3.4 Advokat va yurist

Advokat/yurist ko'radi:

- professional profil va verification;
- o'z xizmatlari va availability;
- mijozlardan kelgan hujjat ishlari;
- o'zi olgan urgent ishlar;
- marketplace orderlari;
- secure chat, audio/video call va meetinglar;
- mijozlar, cases, calendar va workspace;
- professional statistika;
- profil/xizmat promotionlari;
- tashkilot a'zosi bo'lsa organization konteksti.

`call_center_lawyer` qo'shimcha ravishda ochiq hujjat va urgent pooldan ish olishi mumkin. Oddiy outsource advokat faqat o'ziga tayinlangan yoki marketplace orqali sotib olingan ishlarni ko'radi.

### 3.5 Advokat tashkiloti va organization owner

Ko'radi:

- tashkilot dashboardi;
- a'zolar;
- workload;
- a'zolarning xizmatlari;
- tashkilotga tegishli ishlar;
- taqsimlash va monitoring;
- organization scope'dagi meeting, document va clientlar;
- ruxsat bo'lsa ichki exportlar.

Owner boshqa tashkilot ma'lumotini ko'rmaydi.

### 3.6 Call-center operator

Call-center operator uchun asosiy menyu:

- sotuv voronkasi va leadlar;
- mijoz qidirish va mijoz kartasi;
- support ticketlar;
- support chat va operator call;
- mijoz nomidan assist flow;
- uchrashuvlar;
- notification yuborish;
- o'z call loglari.

Ko'rsatilmaydi:

- urgent advokat ishini advokat sifatida olish;
- hujjat editori;
- marketplace seller monitoring;
- tashqi advokat/yuristning shaxsiy ish va chatlari;
- advokat cabineti.

`call_center_lawyer` alohida role. Uni `call_center` operator bilan aralashtirmang.

### 3.7 Sales

Sales role ko'radi:

- leadlar;
- sales funnel;
- mijoz bilan aloqa tarixi;
- order holatlari;
- notificationlar;
- sales uchun ruxsat etilgan export va analytics.

Sales hujjat edit qilmaydi va advokat ishini olmaydi.

### 3.8 Admin, manager va maxsus admin rolelar

Mobile/tablet admin panel permission bo'yicha yig'iladi:

- user va register requestlar;
- seller verification;
- katalog, xizmat va template;
- subscription plan va entitlement;
- payment, refund va reconciliation;
- marketplace monitoring;
- promotion moderation;
- complaint va quality;
- legal content va consents;
- notification;
- CRM va dashboard;
- Studio;
- Internal HRM;
- audit va security eventlar;
- Excel export.

`superadmin` barcha admin permissionlarga ega. Boshqa admin rolelarga faqat berilgan bo'limlar ko'rsatiladi.

### 3.9 Internal employee overlay

`InternalEmployee` login userga bog'langan alohida ichki profil. Tashqi marketplace profili bilan aralashtirilmaydi.

Ichki xodim ruxsatiga qarab ko'radi:

- mening profilim;
- bugungi vazifalar;
- topshiriqlar;
- approvallar;
- KPI;
- davomat;
- ichki xabarlar;
- tashkilot tuzilmasi;
- xodimlar;
- ish vaqti;
- payroll;
- CEO analytics.

### 3.10 Studio access overlay

Studio role emas, access grant va permission orqali ochiladi. User faqat unga berilgan konstruktorlarni ko'radi. Review/publish/archive actionlari alohida permission bilan boshqariladi.

## 4. Auth va session

### 4.1 Register

Oqim:

1. `POST /auth/register/start`
2. Telegram orqali bir martalik OTP olinadi.
3. `POST /auth/register/verify`
4. Ism, familiya, otasining ismi va role-specific profil to'ldiriladi.
5. Token olinsa authenticated shell ochiladi.

API response OTP kodni hech qachon qaytarmaydi. OTP ekranida server bergan cooldown va block holati ko'rsatiladi.

### 4.2 Login

1. `POST /auth/login`
2. Agar access/refresh kelsa login tugagan.
3. Agar 2FA challenge kelsa `POST /auth/login/2fa` ishlatiladi.
4. TOTP yoqilgan user uchun authenticator kodi yuboriladi.
5. Telegram OTP va TOTP bir accountda parallel fallback sifatida ishlatilmaydi; backend challenge turi yakuniy.

### 4.3 Token lifecycle

- access token har requestda yuboriladi;
- refresh `POST /auth/refresh` orqali;
- logout `POST /auth/logout`;
- device sessionlar `GET /auth/sessions`;
- session revoke `DELETE /auth/sessions/{session_id}`;
- user `GET /auth/me`.

### 4.4 TOTP

- setup: `POST /auth/2fa/totp/setup`;
- QR va secret serverdan olinadi;
- enable: `POST /auth/2fa/totp/enable`;
- verify: `POST /auth/2fa/verify`;
- disable: `DELETE /auth/2fa`.

Secret screenshot yoki analyticsga yuborilmaydi. Enable bo'lmaguncha setup tugagan deb hisoblanmaydi.

### 4.5 Password reset

- `POST /auth/password/forgot`
- `POST /auth/password/reset`

Reset challenge, expiry va attempt xatolari server matni bilan ko'rsatiladi.

## 5. App startup va navigation

Cold start:

1. Secure storage tokenini o'qish.
2. Token bo'lmasa public auth shell.
3. Token bo'lsa `GET /auth/me`.
4. `role`, `assigned_roles`, `permissions`, account status va onboarding holatini cache qilish.
5. Notification preferences va unread countni olish.
6. `/ws/users/me` ni ulash.
7. Role shellni ochish.

Role almashtirish faqat backend userga bir nechta context berganda ishlaydi. Client tomonidan role stringni o'zgartirish taqiqlanadi.

## 6. Umumiy API qoidalari

### 6.1 Pagination

List endpointlarda `limit`, `offset`, kerak bo'lsa `cursor` ishlatiladi. `has_more=false` bo'lmaguncha infinite scroll davom etadi.

Mobile bir requestda barcha recordlarni olishga urinmaydi. Default 20, maksimal backend limitidan oshmasin.

### 6.2 Statuslar

Statusni client o'zi taxmin qilmaydi. Backend response'dagi status va action flaglarga tayanadi.

UI umumiy guruhlari:

- `draft`: foydalanuvchi hali yubormagan;
- `pending`, `awaiting_payment`, `submitted`: navbatda;
- `open`, `available`: olish mumkin;
- `claimed`, `assigned`, `in_progress`: ijroda;
- `in_review`, `lawyer_review`: tekshiruvda;
- `completed`, `fulfilled`, `done`: yakunlangan;
- `cancelled`, `rejected`, `expired`, `archived`: yopilgan.

Backend qaytarmagan transition tugmasi ko'rsatilmaydi.

### 6.3 Public ish ID

UI UUID o'rniga response'dagi `work_id`, `public_id`, `display_id` yoki domain IDni ko'rsatadi. UUID faqat route va API uchun ishlatiladi.

### 6.4 Xatolar

- `400`: request noto'g'ri;
- `401`: session eskirgan;
- `402`: payment yoki entitlement kerak;
- `403`: role/permission/ownership yo'q;
- `404`: resource topilmadi yoki yashirilgan;
- `409`: state conflict, duplicate yoki boshqa user olib bo'lgan;
- `413`: fayl juda katta;
- `422`: validation;
- `429`: rate limit;
- `500`: server xatosi;
- `503`: provider vaqtincha mavjud emas.

`detail` string yoki object bo'lishi mumkin. Mobile parser ikkisini ham qo'llashi kerak.

## 7. Client dashboard

Dashboard quick actionlari:

- AI'dan so'rash;
- hujjat topish/tayyorlash;
- hujjat tahlili;
- advokatga tezkor bog'lanish;
- marketplace;
- support;
- mening ishlarim;
- mening hujjatlarim;
- tariflar.

Dashboard counter bosilganda tegishli filtered list ochiladi. Statik demo son ko'rsatilmaydi.

## 8. AI yuridik chat

Asosiy endpointlar:

- `POST /clients/{client_id}/chats`
- `GET /clients/{client_id}/chats`
- `GET /clients/{client_id}/chats/{chat_id}`
- `POST /clients/{client_id}/chats/{chat_id}/messages`
- `WS /ws/clients/{client_id}/chats/{chat_id}`

Chat list oxirgi activity bo'yicha kamayish tartibida chiqadi. Stream fragmentlar bitta assistant messagega yig'iladi. Disconnectdan keyin chat detail qayta olinib, serverdagi yakuniy holat bilan reconcile qilinadi.

Guest va free limit server response'dan olinadi. Mobile limit sonini hardcode qilmaydi.

## 9. AI Platform Instructor V2

AI Instructor yuridik maslahat emas. U ilova ichida foydalanuvchini kerakli ekran va actionga olib boradi.

Asosiy endpointlar:

- `GET /ai/instructor/contract`
- `POST /ai/instructor/chat`
- `POST /ai/instructor/runtime`
- `POST /ai/instructor/events`
- `GET /ai/instructor/session/{session_id}`
- `POST /ai/instructor/actions/preview`
- `POST /ai/instructor/actions/confirm`

Mobile har sahifada stable target registry beradi:

```json
{
  "current_path": "/mobile/client/subscriptions",
  "visible_targets": [
    "screen:subscriptions",
    "plan:lexgo-ai-pro",
    "button:purchase-plan"
  ]
}
```

Actionlar:

- `navigate`
- `scroll_to`
- `highlight`
- `tooltip`
- `open_modal`
- `prefill`
- `preview_action`
- `request_confirmation`

Instructor payment, consent, delete, purchase va boshqa xavfli amalni usersiz yakunlamaydi. Avval preview, keyin native confirm, undan so'ng confirm endpoint ishlatiladi.

## 10. Support

Client oqimi:

1. Support AI reglament bo'yicha javob beradi.
2. Javob topilmasa operatorga o'tishni taklif qiladi.
3. `POST /support/tickets` ticket ochadi.
4. `GET /support/tickets/me` list.
5. `GET /support/tickets/{ticket_id}` detail.
6. Message `POST /support/tickets/{ticket_id}/messages`.
7. History `GET /support/tickets/{ticket_id}/messages`.
8. Zarur bo'lsa `POST /support/tickets/{ticket_id}/reopen`.

Operator AI bilan oldingi suhbat kontekstini ko'radi. Operator ticketni oladi, boshqa operatorga o'tkazadi yoki yakunlaydi.

Operator client nomidan quyidagilarni preview qilishi mumkin:

- subscription;
- hujjatni advokatga yuborish;
- marketplace purchase;
- urgent advokat request.

Operator paymentni client o'rniga tasdiqlamaydi. Clientga realtime payment request keladi va Telegram inline tasdiq ishlaydi.

Support callni faqat operator boshlaydi: `POST /call-center/support/tickets/{ticket_id}/calls`.

## 11. Xizmatlar va hujjatlar katalogi

Katalog:

- `GET /service-categories`
- `GET /services`
- `GET /services/search`
- `GET /services/{service_id}/passport`

List response yengil bo'lishi kerak. Field, template matni va binary fayl faqat detail endpointdan olinadi.

Service detail oqimi:

1. Kategoriya.
2. Subkategoriya.
3. Xizmat.
4. Passport/detail.
5. Foydalanuvchi usul tanlaydi: qo'lda, AI yoki navbatchi advokat.

Hujjat fieldlari:

- `GET /services/{service_id}/document-fields`

Template metadata:

- `GET /services/{service_id}/document-template`

Original manba:

- `GET /services/{service_id}/document-template/source-file`

Toza client ko'rinishi:

- `GET /services/{service_id}/document-template/clean-source-file`

Mobile fieldlarni `order`, section va backend qaytargan tartibda chizadi. Field label, type, required, options, validation va placeholderni o'zgartirmaydi.

## 12. Hujjatni qo'lda to'ldirish

1. Field schema olish.
2. Section bo'yicha wizard qurish.
3. Javoblarni lokal draftda saqlash.
4. `POST /services/{service_id}/document-preview` bilan preview.
5. `POST /services/{service_id}/document-generate` bilan yakuniy hujjat.
6. Server qaytargan faylni preview/download qilish.

Template formatini saqlash backend vazifasi. Mobile yangi DOCX/PDF yaratmaydi.

## 13. AI bilan hujjat tayyorlash

- savollar: `POST /services/{service_id}/document-ai/questions`;
- generate: `POST /services/{service_id}/document-ai/generate`.

AI savollari dynamic. Mobile faqat schema renderer qiladi. Natija serverdagi original template asosida qaytadi.

## 14. Navbatchi advokat bilan hujjat

Client advokat tanlamaydi. Request call-center lawyer poolga tushadi.

- oddiy request: `POST /services/{service_id}/document-lawyer/request`;
- file/voice bilan: `POST /services/{service_id}/document-lawyer/request-with-files`;
- statuslar: `GET /document-requests/service-flow`;
- detail: `GET /document-requests/{request_id}`.

Bir hujjat bo'yicha ochiq request mavjud bo'lsa takroriy request yuborilmaydi. Client konstruktorni ishlatishni tanlasa ham mavjud advokat request yakunlanmaguncha yangi request ochmaydi.

## 15. Mening hujjatlarim va Mening ishlarim

Bu ikki bo'lim aralashtirilmaydi.

`Mening hujjatlarim`:

- draft/template/generated/final document;
- versionlar;
- preview va download;
- field answers;
- hujjat statusi.

`Mening ishlarim`:

- advokat yoki xizmat bilan bog'liq biznes jarayon;
- `GET /clients/me/works`;
- `GET /clients/me/works/{work_id}`;
- assignee, timeline, chat, call, payment, complaint va rating.

## 16. Hujjat tahlili

Mobile file'ni multipart yuboradi. Sahifa sonini client taxmin qilmaydi.

- quote: `POST /ai/document-analysis/quote`;
- upload/analysis: `POST /ai/document-analysis/file`;
- boshqa text flow: `POST /ai/document-analysis`.

10 sahifagacha bazaviy qoida serverdan olinadi. 10 sahifadan oshsa server qo'shimcha to'lov quote qaytaradi. Telegram inline tasdiqdan oldin advokatga ish yuborilmaydi.

Advokat ishni olgach client bergan file editor source sifatida tanlanadi.

## 17. Advokat hujjat queue va editor

Call-center lawyer:

- pool: `GET /call-center/document-requests/open`;
- claim: `POST /call-center/document-requests/{record_id}/claim`;
- transfer: `POST /call-center/document-requests/{record_id}/transfer`.

Advokat:

- list: `GET /lawyers/me/document-requests`;
- detail: `GET /lawyers/me/document-requests/{record_id}`;
- source variantlari: `GET /lawyers/me/document-requests/{record_id}/editor/sources`;
- source tanlash: `POST /lawyers/me/document-requests/{record_id}/editor/source`;
- o'z file'ini yuklash: `POST /lawyers/me/document-requests/{record_id}/editor/source-upload`;
- editor config: `GET /lawyers/me/document-requests/{record_id}/editor`;
- draft: `PUT /lawyers/me/document-requests/{record_id}/editor/draft`;
- finalize: `POST /lawyers/me/document-requests/{record_id}/editor/finalize`.

Editor oldidan uchta variant:

1. Advokat o'z file'ini yuklaydi.
2. Mijoz bergan file bilan ishlaydi.
3. AI tayyorlagan draftni ochadi.

Mobile OnlyOffice config'ni o'zgartirmaydi. `document_server_url`, token, document URL va callback server response'dan olinadi. Finalize faqat save tasdiqlangandan keyin ishlatiladi.

## 18. Marketplace

Client:

- filter meta: `GET /marketplace/meta`;
- list: `GET /marketplace/lawyers`;
- AI search: `POST /marketplace/ai-search`;
- profile: `GET /marketplace/lawyers/{lawyer_user_id}`;
- services: `GET /marketplace/lawyers/{lawyer_user_id}/services`;
- purchase: `POST /marketplace/lawyers/{lawyer_user_id}/services/{service_id}/purchase-request`;
- orders: `GET /marketplace/me/orders`;
- cancel: `POST /marketplace/me/orders/{order_id}/cancel`;
- complete: `POST /marketplace/me/orders/{order_id}/complete`.

Marketplace list faqat tasdiqlangan, faol va sotib olish mumkin bo'lgan sellerlarni chiqaradi. Telefon public listda ko'rsatilmaydi. Narxsiz service `price_asc` boshiga chiqmasligi kerak.

Asosiy display ID `ADV-*`. Ichki UUID, payment va order ID debug UI'da clientga ko'rsatilmaydi.

Purchase himoyasi:

- amount clientdan olinmaydi;
- seller o'z xizmatini sotib olmaydi;
- duplicate pending order bloklanadi;
- unpaid order seller ish queue'siga tushmaydi;
- faqat owner seller order statusini o'zgartiradi.

## 19. Marketplace seller

Seller profili:

- `GET/PUT /lawyers/me`;
- xizmatlar `GET/PUT /lawyers/me/services`;
- boshqaruv `GET/POST /lawyers/me/services/manage`;
- update/delete/status tegishli service endpointlari;
- availability `GET/PUT /lawyers/me/availability`.

Seller narxni admin belgilagan maksimal narxdan oshira olmaydi. Hudud, staj, maxsus soha staji, rating va mijoz bahosi asosidagi ruxsat etilgan ceiling backenddan olinadi.

## 20. Marketplace reklama

Reklama turlari:

- bannerda profil;
- marketplace listda profil boost;
- alohida xizmat boost.

Endpointlar:

- `GET /promotions/packages`;
- `GET /promotions/me`;
- `GET /promotions/analytics`;
- `GET /promotions/active`;
- `POST /promotions/banner-assets`;
- `POST /promotions/checkout`;
- `POST /promotions/events`;
- service uchun `POST /lawyers/me/services/{service_id}/promotion-checkout`.

Checkoutdan oldin mobile placement preview ko'rsatadi. Payment Telegram inline tasdiqdan so'ng realtime yangilanadi.

## 21. Tezkor advokat

Katalog: `GET /urgent-advokat/catalog`.

Asosiy variantlar:

- oddiy video konsultatsiya;
- express audio call;
- chat konsultatsiya;
- ikkinchi fikr, yakka advokat;
- ikkinchi fikr, advokatlar guruhi;
- YTX/avtoavariya konsultatsiyasi.

Request: `POST /urgent-advokat/requests`.

Client list: `GET /urgent-advokat/requests/me`.

Client detail: `GET /urgent-advokat/requests/{record_id}`.

Yakka second opinion uchun oldingi LexGo xizmati shart emas. Guruh second opinion uchun client oldin LexGo orqali advokat/yurist xizmatidan foydalangan bo'lishi kerak.

Express oqimda yo'nalishga mos, hozir band bo'lmagan navbatchi advokatga darhol audio call yuboriladi. Hudud optional.

## 22. Call-center urgent boshqaruvi

- queue: `GET /call-center/urgent-advokat/requests`;
- detail: `GET /call-center/urgent-advokat/requests/{record_id}`;
- candidates: request va umumiy candidates endpointlari;
- claim: `POST .../claim`;
- transfer: `POST .../transfer`;
- group: `POST .../assign-group`;
- meeting: `POST .../meeting`;
- status: `PATCH .../status`;
- complete/cancel: tegishli POST endpointlar.

Guruh second opinion video bo'lsa operator yo'nalishlarga mos 3-7 advokat tanlaydi va vaqt belgilaydi. Chat bo'lsa group secure chat ochiladi.

## 23. Secure chat

Endpointlar:

- `POST /secure-chats`
- `GET /secure-chats`
- `GET /secure-chats/{room_id}`
- `GET/POST /secure-chats/{room_id}/messages`
- `POST /secure-chats/{room_id}/messages/upload`
- `GET /secure-chats/{room_id}/messages/{message_id}/file`
- `PATCH /secure-chats/{room_id}/settings`
- `DELETE /secure-chats/{room_id}`

Chat funksiyalari:

- text;
- emoji;
- reply;
- copy;
- edit/delete faqat server ruxsat bersa;
- file;
- voice message;
- sender name/avatar/role;
- sent/read holati;
- local optimistic state;
- unread counter;
- oxirgi xabar bo'yicha sort.

Group chatni client yakunlamaydi. Guruhdagi advokat vakolat bo'lsa `POST /urgent-advokat/requests/{record_id}/chat/complete` orqali yopadi.

## 24. Call va meeting

Asosiy provider LiveKit. Mobile call uchun backend bergan join tokenni ishlatadi.

Oqim:

1. Call session yaratish.
2. `GET .../join-token`.
3. LiveKit roomga ulanish.
4. `POST .../join`.
5. Participant state update.
6. `POST .../leave` yoki `POST .../end`.

Audio call video callning alohida backend turi emas. Audio sifatida boshlanganda camera o'chiq bo'ladi. Istalgan participant camera yoqsa session video sifatida davom etadi va yakuniy analytics video usage'ni qayd qiladi.

Network adaptation avtomatik:

- simulcast;
- dynacast;
- adaptive stream;
- networkga qarab bitrate/resolution pasayishi;
- audio priority;
- reconnection.

Userga qo'lda sifat tanlash majburiy qilinmaydi.

### 24.1 15 daqiqalik meeting

- default 15 daqiqa;
- advokat bir marta bepul 3 daqiqagacha uzaytirishi mumkin;
- paid extensionda advokat minut kiritadi;
- narx backend/admin qiymatidan hisoblanadi;
- payment request vaqtida meeting pause bo'ladi;
- 5 daqiqada payment javobi bo'lmasa request eskiradi;
- tasdiqlansa vaqt qo'shiladi va resume mumkin.

### 24.2 Recording

Client recording request yuboradi. Advokat approve qilmaguncha recording boshlanmaydi.

### 24.3 Transfer

Advokat aktiv ish/callni boshqa mos advokatga transfer qilishi mumkin. Transfer paytida meeting pause qilinadi va yangi assignee realtime notification oladi.

## 25. Rating va complaint

Ish `completed` bo'lgandan keyin clientda 15 daqiqalik rating/complaint oynasi ochiladi.

- rating majburiy bo'lmagan izoh bilan;
- complaint ratingdan alohida biznes obyekt;
- 15 daqiqadan keyin ikkalasi ham yopiladi;
- rating seller reytingiga ta'sir qiladi;
- complaint call-center quality queuega tushadi.

Operator complaint, ish va berilgan hujjatni ko'radi. Asosli bo'lsa shu advokatga bepul redo beradi; asossiz bo'lsa clientga izoh bilan yopadi.

## 26. Subscription va entitlement

- planlar: `GET /subscription-plans`;
- detail: `GET /subscription-plans/{plan_id}`;
- purchase: `POST /subscription-plans/{plan_id}/purchase`;
- Telegram approval: `POST /subscription-plans/{plan_id}/telegram-purchase-request`;
- auto renew: `PATCH /subscriptions/{subscription_id}/auto-renew`;
- client huquqlari: `GET /clients/me/entitlements`.

Plan kartasi backend qaytargan featurelarni ko'rsatadi. Mobile plan nomiga qarab permission taxmin qilmaydi.

## 27. Payments

- create `POST /payments`;
- list `GET /payments`;
- receipt `GET /payments/{payment_id}/receipt`;
- verify receipt `GET /payments/{payment_id}/receipt/verify`;
- split `GET /payments/{payment_id}/split`.

Telegram inline test flowda:

1. Backend pending payment/request yaratadi.
2. Client `pending_confirmation` ko'radi.
3. Telegram approve/cancel bosiladi.
4. `/ws/users/me` orqali status keladi.
5. Mobile detailni qayta oladi.
6. Approved bo'lsa keyingi qadamga o'tadi.

Mobile Telegram javobini taxmin qilib lokal statusni paid qilmaydi.

## 28. Notification va push

REST:

- `GET /notifications`
- `GET /notifications/categories`
- `GET /notifications/unread-count`
- `POST /notifications/{notification_id}/read`
- `POST /notifications/read-all`
- `GET/PUT /notifications/preferences`

Realtime: `WS /ws/users/me`.

Notification payload quyidagilarni olib kelishi kerak:

- `id`
- `type`
- `title`
- `body`
- `created_at`
- `read_at`
- `entity_type`
- `entity_id`
- `deep_link`
- `metadata`

Push bosilganda role va ownership tekshirilib deep-link ochiladi. Ruxsat yo'q yoki resource yopilgan bo'lsa xavfsiz fallback listga qaytiladi.

## 29. Fayl va preview

Preview strategiyasi:

- PDF: native PDF viewer;
- image: image viewer;
- DOCX/DOC: backend inline URL yoki approved renderer;
- XLSX/XLS: server preview bo'lsa preview, bo'lmasa secure download;
- audio: streaming player;
- noma'lum format: download/open-with.

Authenticated download uchun browserga oddiy URL uzatish o'rniga HTTP client token bilan faylni app cache'ga yuklaydi. File nomi `Content-Disposition`dan olinadi va path traversal belgilaridan tozalanadi.

## 30. Workspace storage

Advokat/yurist uchun admin tasdiqidan keyin:

- folder yaratish;
- file upload/download;
- rename/move/delete;
- starred folder/file;
- folder va file size;
- quota ko'rsatish.

Default quota 1 GB. Mobile limitni hardcode qilmaydi; server quota response'dan oladi. Kelajakda tarif bilan kattalashishi mumkin.

## 31. Seller onboarding

Onboarding bosqichlari:

- shaxsiy ma'lumotlar;
- role va professional tur;
- litsenziya/diplom;
- tajriba va yo'nalishlar;
- hudud;
- tashkilot;
- hujjatlar;
- Telegram/TOTP security;
- admin review.

Pending seller marketplace'da public chiqmaydi va service sotmaydi.

## 32. Organization owner

Asosiy endpointlar:

- `POST/GET /organizations`
- `POST/GET /organizations/{organization_id}/members`
- `GET /organizations/{organization_id}/owner/dashboard`
- `GET /organizations/{organization_id}/owner/workload`
- member service manage endpointlari.

Dashboardda member, active work, overdue, completed, revenue va workload ko'rsatiladi. Owner qaysi advokat nima ish qilayotganini detailga o'tib ko'ra oladi.

## 33. Call-center support assist

Operator ticket ichida aynan ticket egasi nomidan ishlaydi.

Endpointlar:

- context: `GET /call-center/support/tickets/{ticket_id}/assist/context`;
- subscription preview/checkout;
- document lawyer request;
- marketplace purchase;
- urgent advokat request.

Har assist actionda:

1. Client context tekshiriladi.
2. Operator variant tanlaydi.
3. Client ekraniga realtime preview keladi.
4. Client tasdiqlaydi.
5. Zarur bo'lsa Telegram payment approval.
6. Backend actionni yakunlaydi.
7. Ikkala tomonda status realtime yangilanadi.

## 34. CRM va leadlar

Call-center:

- kanban;
- configurable column order;
- lead create/detail/update;
- move;
- timeline;
- date/region/operator/status filter;
- Excel export.

Kanban optimistik ko'chirilishi mumkin, lekin `409/422` bo'lsa oldingi column qaytariladi.

## 35. Internal HRM

### 35.1 Men

- `GET /internal/me/profile`
- `GET /internal/me/approvals`
- `POST /internal/approvals/{approval_id}/decision`
- `GET /internal/me/today`
- `GET /internal/me/tasks`
- `GET /internal/me/kpis`
- `GET /internal/me/attendance`
- `GET /internal/me/messages`
- `POST /internal/messages`

### 35.2 Tashkilot va xodimlar

- positions;
- org units;
- org board `include=people`;
- employees;
- assignments;
- employee 360.

Mobile org chart daraxt ko'rinishida, zoom/pan va detail sheet bilan chiqadi.

### 35.3 Ijro

- task yaratish/list;
- status;
- mas'ullar;
- checklist;
- jamoa;
- deadline;
- comments;
- approval.

### 35.4 Vaqt, KPI va payroll

- schedule;
- attendance event/day;
- KPI metrics;
- payroll entry va summary;
- admin analytics va Excel export.

Internal HRM tashqi advokat yoki client app menyusiga chiqmaydi.

## 36. Studio

Studio mobil telefonda review va monitoring uchun to'liq, murakkab konstruktor edit uchun tablet/desktopga optimallashtiriladi.

Oqim:

1. `GET /studio/constructors`
2. `GET /studio/constructors/{code}`
3. reference data olish
4. draft yaratish
5. validate/preview
6. save
7. submit
8. configurable 1-10 bosqich approval
9. publish
10. runtime tizimga qo'llash
11. rollback/archive.

Asosiy imkoniyatlar:

- dynamic schema form;
- editor yoki file upload;
- version;
- comment;
- approval route;
- realtime monitoring;
- heartbeat;
- online user, obyekt, ishlagan vaqt va save count;
- Excel export;
- publish va rollback.

Admin tasdiqlamaguncha konstruktor mahsuloti production runtimega chiqmaydi. Approval route oxirida admin bo'lishi optional va admin tomonidan sozlanadi.

## 37. Realtime arxitektura

### 37.1 User channel

`WS /ws/users/me`

Ishlatiladi:

- notification;
- payment confirmation;
- document status;
- marketplace order;
- urgent request;
- support ticket;
- incoming call;
- assignment/transfer;
- completed/rating window.

### 37.2 Secure chat

`WS /ws/secure-chats/{room_id}`

### 37.3 Call signaling

`WS /ws/secure-chats/{room_id}/calls/{call_id}`

### 37.4 Internal HRM

`WS /internal/ws/{channel}`

### 37.5 AI chat

`WS /ws/clients/{client_id}/chats/{chat_id}`

### 37.6 Reconnect

- exponential backoff: 1s, 2s, 4s, 8s, maksimum 30s;
- foregroundga qaytganda reconnect;
- token yangilanganda socketni yangi token bilan ulash;
- event ID bo'yicha dedupe;
- reconnectdan keyin REST sync;
- ping/pong;
- backgroundda OS policyga rioya qilish.

Realtime mavjud joyda 1-5 sekundlik polling taqiqlanadi. Fallback polling faqat socket uzoq vaqt tiklanmasa va ekran aktiv bo'lsa ishlatiladi.

## 38. Local cache va offline

Cache qilinadi:

- user/permissions;
- katalog summary;
- plan summary;
- chat list va oxirgi message;
- notification list;
- draft form answers;
- file metadata.

Cache qilinmaydi yoki encrypted bo'ladi:

- OTP/TOTP secret;
- to'liq payment rekvizitlari;
- access/refresh token oddiy DBda;
- confidential file content;
- admin sensitive exports.

Offline yozuv queue faqat idempotent draft/message amallarda ishlatiladi. Payment, claim, complete, approve, delete va transfer offline queuega qo'yilmaydi.

## 39. Performance

- listlar pagination;
- search debounce 350-500 ms;
- image thumbnail;
- file download progress/cancel;
- katta JSONni main threadda parse qilmaslik;
- list/detail response ajratish;
- active ekranga kerak bo'lmagan requestni cancel qilish;
- ETag/If-None-Match bo'lsa ishlatish;
- WebSocketni bitta shared connection manager boshqarishi;
- response modelni release buildda log qilmaslik.

## 40. Security checklist

- token secure storage;
- refresh race himoyasi;
- role/permission gate;
- ownershipni backend tekshiradi;
- public phone yashirin;
- file MIME, extension va size tekshiruvi;
- URL scheme allowlist;
- OnlyOffice token/log himoyasi;
- OTP client response'da yo'q;
- TOTP secret yashirin;
- screenshot va clipboard policy;
- deep-link resource authorization;
- payment amount backenddan;
- duplicate request idempotency;
- logoutda local sensitive cache tozalanadi.

## 41. Analytics eventlari

PII yubormasdan:

- screen view;
- action started/completed/failed;
- API latency bucket;
- WebSocket reconnect;
- call quality bucket;
- file upload size bucket;
- funnel step;
- deep-link result;
- crash breadcrumb.

Telefon, FIO, message, document body, OTP, token yoki file URL analyticsga yuborilmaydi.

## 42. Acceptance testlar

### 42.1 Auth

- register Telegram OTP bilan;
- noto'g'ri va expired OTP;
- daily limit;
- login Telegram challenge;
- TOTP login;
- refresh race;
- revoked session;
- logout.

### 42.2 Client

- qo'lda hujjat;
- AI hujjat;
- advokat hujjat request;
- duplicate request block;
- 10+ sahifa analysis payment;
- marketplace purchase;
- urgent video/audio/chat;
- group second opinion eligibility;
- support AI va operator;
- rating/complaint 15 daqiqa;
- plan entitlement;
- notification deep-link.

### 42.3 Advokat/yurist

- onboarding pending/approved;
- xizmat va narx ceiling;
- document claim race;
- uch editor source;
- save/finalize;
- transfer;
- marketplace order;
- secure chat/file/voice;
- audio call camera yoqilishi;
- meeting pause/extend/recording;
- promotion checkout.

### 42.4 Call-center

- operatorga faqat kerakli menyu;
- ticket realtime kelishi;
- claim race;
- transfer va close;
- client nomidan preview;
- client realtime confirm;
- urgent group meeting;
- complaint redo;
- lead kanban move/filter/export.

### 42.5 Organization

- boshqa org data isolation;
- member add;
- workload;
- member services;
- assignment;
- owner analytics/export.

### 42.6 Admin/Internal/Studio

- permission bo'yicha menu;
- approval;
- legal/catalog/plan edit;
- employee/org tree;
- task/KPI/attendance/payroll;
- Studio draft/validate/submit/multi-step approval/publish/rollback/archive;
- realtime monitoring;
- date-filtered Excel.

## 43. Release checklist

- production base URL;
- debug log o'chiq emas;
- certificate validation yoqilgan;
- crash reporting PII filter;
- push environment production;
- universal/app links;
- privacy permission descriptions;
- camera/microphone/file permissions;
- background call configuration;
- secure storage migration;
- database migration;
- minimum OS test;
- 360/390/414 px layout test;
- slow network va airplane mode;
- token expiry;
- WebSocket reconnect;
- upload/download interruption;
- accessibility va dynamic text;
- Uzbek Cyrillic/Latin va Russian uzun matnlar.

## 44. Mobile ekranlar xaritasi

### Client bottom navigation

1. Bosh sahifa
2. Xizmatlar
3. Ishlar
4. Xabarlar
5. Profil

Global actionlar: AI Instructor, notification, incoming call.

### Advokat/yurist bottom navigation

1. Ish maydoni
2. So'rovlar
3. Mijozlar
4. Xabarlar
5. Profil

### Call-center bottom navigation

1. Leadlar
2. Support
3. Mijozlar
4. Uchrashuvlar
5. Profil

### Admin/tablet navigation

Permission asosida dynamic drawer. Telefonda katta jadval va editorlar responsive detail/listga ajratiladi.

## 45. Mobile jamoa uchun yakuniy qoidalar

1. Backend status va flaglari yakuniy truth.
2. Role nomini hardcode qilish bilan cheklanmay, permission ishlatish.
3. List va detail response'larni aralashtirmaslik.
4. Realtime mavjud joyda agressiv polling qilmaslik.
5. Paymentni clientda paid qilmaslik.
6. UUIDni userga ko'rsatmaslik.
7. File URLni public deb hisoblamaslik.
8. Client va seller ma'lumotlarini boshqa role cache'iga aralashtirmaslik.
9. Logout va role context o'zgarishida query/cache/socketlarni reset qilish.
10. Endpoint inventari mavjudligi access berilganini anglatmaydi.

## 46. Production HTTP API inventari

Quyidagi bo'lim production kodidan avtomatik chiqarilgan. Har bir route uchun aniq request/response contractni backend OpenAPI schema va endpoint detail response bilan tekshiring. Role access yuqoridagi permission qoidalariga bo'ysunadi.

<!-- GENERATED_API_INDEX_START -->

### 46.1 Academy

- `GET /academy/courses` - List Academy Courses. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /academy/courses` - Create Academy Course. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.
- `GET /academy/courses/catalog` - Academy Course Catalog. Body: `-`. Response: `200: application/json: array[object]`.

### 46.2 Admin

- `GET /admin/ai/support/reglaments` - List Ai Support Reglaments. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/ai/support/reglaments` - Create Ai Support Reglament. Body: `application/json: object`. Response: `201: application/json: object`.
- `GET /admin/ai/support/reglaments/gaps` - List Ai Support Reglament Gaps. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/ai/support/reglaments/upload` - Upload Ai Support Reglament. Body: `multipart/form-data: Body_upload_ai_support_reglament`. Response: `201: application/json: object`.
- `PATCH /admin/ai/support/reglaments/{reglament_id}` - Update Ai Support Reglament. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /admin/audit-trail` - Admin Audit Trail. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/bootstrap-superadmin` - Bootstrap Superadmin. Body: `application/json: BootstrapSuperadminRequest`. Response: `200: application/json: RoleOut`.
- `POST /admin/calendar/holidays` - Create Business Holiday. Body: `application/json: BusinessHolidayCreate`. Response: `201: application/json: object`.
- `DELETE /admin/calendar/holidays/{day}` - Delete Business Holiday. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/calls` - Admin Call History. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/calls/{call_id}` - Admin Call Detail Endpoint. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/clients/{client_user_id}/360` - Admin Client 360. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/complaints` - Admin Complaints. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `GET /admin/complaints/export.xlsx` - Admin Complaints Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/compliance/readiness` - Admin Compliance Readiness. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/dashboard` - Admin Dashboard. Body: `-`. Response: `200: application/json: DashboardOut`.
- `GET /admin/dashboard/drilldown` - Admin Dashboard Drilldown. Body: `-`. Response: `200: application/json: DashboardDrilldownOut`.
- `GET /admin/dashboard/export.xlsx` - Admin Dashboard Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/document-templates` - Admin List Document Templates. Body: `-`. Response: `200: application/json: array[DocumentTemplateListOut]`.
- `POST /admin/document-templates` - Create Document Template. Body: `application/json: DocumentTemplateCreate`. Response: `200: application/json: DocumentTemplateOut`.
- `GET /admin/document-templates/export.xlsx` - Admin Document Templates Export. Body: `-`. Response: `200: application/json: -`.
- `POST /admin/document-templates/import-docx` - Import Document Template Docx. Body: `multipart/form-data: Body_import_document_template_docx`. Response: `201: application/json: DocumentTemplateOut`.
- `POST /admin/document-templates/import-zip` - Import Document Templates Zip. Body: `multipart/form-data: Body_import_document_templates_zip`. Response: `200: application/json: object`.
- `POST /admin/document-templates/preview` - Preview Document Template. Body: `application/json: object`. Response: `200: application/json: object`.
- `DELETE /admin/document-templates/{template_id}` - Delete Document Template. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/document-templates/{template_id}` - Admin Get Document Template. Body: `-`. Response: `200: application/json: DocumentTemplateOut`.
- `PATCH /admin/document-templates/{template_id}` - Update Document Template. Body: `application/json: DocumentTemplateUpdate`. Response: `200: application/json: DocumentTemplateOut`.
- `GET /admin/e2e/readiness` - Admin E2E Readiness. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/lawyer-proof-documents/{document_id}/file` - Get Admin Lawyer Proof Document File. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/lawyers/export.xlsx` - Admin Lawyers Export. Body: `-`. Response: `200: application/json: -`.
- `POST /admin/lawyers/{lawyer_user_id}/verify` - Verify Lawyer. Body: `-`. Response: `200: application/json: LawyerProfileOut`.
- `GET /admin/leads` - List Leads. Body: `-`. Response: `200: application/json: array[LeadOut]`.
- `POST /admin/leads` - Admin Create Lead. Body: `application/json: LeadCreate`. Response: `200: application/json: LeadOut`.
- `POST /admin/leads/cleanup-demo` - Admin Cleanup Demo Leads. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/leads/kanban` - Admin Lead Kanban. Body: `-`. Response: `200: application/json: LeadKanbanOut`.
- `GET /admin/leads/kanban/columns` - Admin Lead Kanban Columns. Body: `-`. Response: `200: application/json: array[LeadKanbanColumn]`.
- `PUT /admin/leads/kanban/columns` - Admin Update Lead Kanban Columns. Body: `application/json: array[LeadKanbanColumnUpdate]`. Response: `200: application/json: array[LeadKanbanColumn]`.
- `DELETE /admin/leads/kanban/columns/{key}` - Admin Delete Lead Kanban Column. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/leads/kanban/export.xlsx` - Admin Lead Kanban Export. Body: `-`. Response: `200: application/json: -`.
- `DELETE /admin/leads/{lead_id}` - Admin Delete Lead. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/leads/{lead_id}` - Admin Update Lead. Body: `application/json: LeadUpdate`. Response: `200: application/json: LeadOut`.
- `PATCH /admin/leads/{lead_id}/move` - Admin Move Lead Kanban. Body: `application/json: LeadKanbanMove`. Response: `200: application/json: LeadKanbanMoveOut`.
- `POST /admin/leads/{lead_id}/re-engage` - Admin Reengage Lead. Body: `application/json: LeadReengageRequest`. Response: `200: application/json: LeadOut`.
- `GET /admin/leads/{lead_id}/timeline` - Admin Lead Timeline. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `GET /admin/legal/consents` - Admin Legal Consents. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /admin/legal/consents` - Create Admin Legal Consent. Body: `application/json: ConsentDocumentCreate`. Response: `200: application/json: object`.
- `DELETE /admin/legal/consents/{consent_id}` - Delete Admin Legal Consent. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/legal/consents/{consent_id}` - Update Admin Legal Consent. Body: `application/json: ConsentDocumentUpdate`. Response: `200: application/json: object`.
- `PUT /admin/legal/consents/{consent_id}` - Update Admin Legal Consent. Body: `application/json: ConsentDocumentUpdate`. Response: `200: application/json: object`.
- `GET /admin/legal/user-consents` - Admin User Consents. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/marketplace/orders` - Admin Marketplace Orders. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/marketplace/orders/export.xlsx` - Admin Marketplace Orders Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/marketplace/orders/{order_id}` - Admin Marketplace Order Detail. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/marketplace/overview` - Admin Marketplace Overview. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/marketplace/sellers` - Admin Marketplace Sellers. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/marketplace/sellers/export.xlsx` - Admin Marketplace Sellers Export. Body: `-`. Response: `200: application/json: -`.
- `POST /admin/notifications` - Create Notification. Body: `application/json: NotificationCreate`. Response: `200: application/json: NotificationOut`.
- `GET /admin/payments/export.xlsx` - Admin Payments Export. Body: `-`. Response: `200: application/json: -`.
- `POST /admin/payments/{payment_id}/mark-paid` - Mark Payment Paid. Body: `-`. Response: `200: application/json: PaymentOut`.
- `GET /admin/payouts` - Admin Payouts. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/payouts/export.xlsx` - Admin Payouts Export. Body: `-`. Response: `200: application/json: -`.
- `PATCH /admin/payouts/{payout_id}` - Admin Update Payout. Body: `application/json: PayoutStatusUpdate`. Response: `200: application/json: object`.
- `GET /admin/permission-matrix` - Permission Matrix. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/permissions` - List Permissions. Body: `-`. Response: `200: application/json: array[PermissionOut]`.
- `GET /admin/platform/policies` - Admin Platform Policies. Body: `-`. Response: `200: application/json: object`.
- `PUT /admin/platform/policies/{section}` - Update Platform Policy. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /admin/platform/policies/{section}/history` - Platform Policy History. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/promotions/export.xlsx` - Admin Promotions Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/register-requests` - List Register Requests. Body: `-`. Response: `200: application/json: array[RegisterRequestOut]`.
- `GET /admin/register-requests/{request_id}` - Get Register Request Detail. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/register-requests/{request_id}/accept` - Accept Register Request. Body: `-`. Response: `200: application/json: RegisterRequestOut`.
- `POST /admin/register-requests/{request_id}/reject` - Reject Register Request. Body: `application/json: object | null`. Response: `200: application/json: RegisterRequestOut`.
- `GET /admin/reviews` - Admin Reviews. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/reviews/export.xlsx` - Admin Reviews Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/reviews/{review_id}` - Admin Review Detail. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/reviews/{review_id}/moderate` - Admin Moderate Review. Body: `application/json: ReviewModerationUpdate`. Response: `200: application/json: object`.
- `GET /admin/roles` - List Roles. Body: `-`. Response: `200: application/json: array[RoleOut]`.
- `POST /admin/roles` - Create Role. Body: `application/json: RoleCreate`. Response: `200: application/json: RoleOut`.
- `GET /admin/security-events` - Admin Security Events. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/seller-requests` - Unified Seller Requests. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/seller-requests/export.xlsx` - Admin Seller Requests Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/service-categories` - Admin List Service Categories. Body: `-`. Response: `200: application/json: array[ServiceCategoryOut]`.
- `POST /admin/service-categories` - Create Service Category. Body: `application/json: ServiceCategoryCreate`. Response: `200: application/json: ServiceCategoryOut`.
- `GET /admin/service-categories/export.xlsx` - Admin Service Categories Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/service-categories/{category_id}` - Admin Get Service Category. Body: `-`. Response: `200: application/json: ServiceCategoryOut`.
- `PATCH /admin/service-categories/{category_id}` - Update Service Category. Body: `application/json: object`. Response: `200: application/json: ServiceCategoryOut`.
- `PUT /admin/service-categories/{category_id}` - Update Service Category. Body: `application/json: object`. Response: `200: application/json: ServiceCategoryOut`.
- `GET /admin/service-packages` - Admin List Service Packages. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /admin/service-packages` - Admin Create Service Package. Body: `application/json: object`. Response: `201: application/json: object`.
- `POST /admin/service-packages/price-simulator` - Admin Package Price Simulator. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /admin/service-packages/{package_record_id}` - Admin Get Service Package. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/service-packages/{package_record_id}` - Admin Update Service Package. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /admin/service-packages/{package_record_id}/approve` - Admin Approve Service Package. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /admin/service-packages/{package_record_id}/clone` - Admin Clone Service Package. Body: `-`. Response: `201: application/json: object`.
- `POST /admin/service-packages/{package_record_id}/preview` - Admin Preview Service Package. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/service-packages/{package_record_id}/publish` - Admin Publish Service Package. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/service-packages/{package_record_id}/stop` - Admin Stop Service Package. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/service-packages/{package_record_id}/submit` - Admin Submit Service Package. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/services` - Admin List Services. Body: `-`. Response: `200: application/json: array[LegalServiceOut]`.
- `POST /admin/services` - Create Service. Body: `application/json: LegalServiceCreate`. Response: `200: application/json: LegalServiceOut`.
- `DELETE /admin/services/{service_id}` - Delete Service. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/services/{service_id}` - Update Service. Body: `application/json: object`. Response: `200: application/json: LegalServiceOut`.
- `PUT /admin/services/{service_id}` - Update Service. Body: `application/json: object`. Response: `200: application/json: LegalServiceOut`.
- `POST /admin/services/{service_id}/document-template` - Upload Service Document Template. Body: `multipart/form-data: Body_upload_service_document_template`. Response: `201: application/json: object`.
- `POST /admin/showcase-data/seed` - Seed Showcase Dashboard Data. Body: `-`. Response: `200: application/json: DemoDataSeedOut`.
- `GET /admin/studio/access` - Admin Studio Access. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/studio/access` - Admin Studio Grant Access. Body: `application/json: StudioAccessGrantCreate`. Response: `201: application/json: object`.
- `PATCH /admin/studio/access/{grant_id}` - Admin Studio Update Access. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /admin/studio/approval-routes` - Admin Studio Approval Routes. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/studio/approval-routes` - Admin Studio Upsert Approval Route. Body: `application/json: StudioApprovalRouteUpsert`. Response: `201: application/json: object`.
- `GET /admin/studio/approvals` - Admin Studio Approvals. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/studio/constructors/sync` - Admin Studio Sync Constructors. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/studio/export.xlsx` - Admin Studio Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/studio/monitoring` - Admin Studio Monitoring. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/studio/objects/{object_id}/publish` - Admin Studio Publish Object. Body: `application/json: StudioPublishPayload`. Response: `200: application/json: object`.
- `POST /admin/studio/objects/{object_id}/review` - Admin Studio Review Object. Body: `application/json: StudioReviewPayload`. Response: `200: application/json: object`.
- `POST /admin/studio/objects/{object_id}/rollback` - Admin Studio Rollback Object. Body: `application/json: StudioRollbackPayload`. Response: `200: application/json: object`.
- `GET /admin/studio/objects/{object_id}/versions/export.xlsx` - Admin Studio Versions Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/studio/releases` - Admin Studio Releases. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/studio/releases` - Admin Studio Create Release. Body: `application/json: StudioReleaseCreate`. Response: `201: application/json: object`.
- `POST /admin/studio/releases/{release_id}/publish` - Admin Studio Publish Release. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/studio/releases/{release_id}/validate` - Admin Studio Validate Release. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/studio/runtime` - Admin Studio Runtime. Body: `-`. Response: `200: application/json: object`.
- `POST /admin/subscription-plans` - Create Subscription Plan. Body: `application/json: SubscriptionPlanCreate`. Response: `200: application/json: SubscriptionPlanOut`.
- `GET /admin/subscription-plans/export.xlsx` - Admin Subscription Plans Export. Body: `-`. Response: `200: application/json: -`.
- `DELETE /admin/subscription-plans/{plan_id}` - Delete Subscription Plan. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/subscription-plans/{plan_id}` - Update Subscription Plan. Body: `application/json: object`. Response: `200: application/json: SubscriptionPlanOut`.
- `POST /admin/subscriptions/charge-due` - Charge Due Subscriptions. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/subscriptions/export.xlsx` - Admin User Subscriptions Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/system/export.xlsx` - Admin System Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/tasks` - Admin Tasks. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /admin/tasks/export.xlsx` - Admin Tasks Export. Body: `-`. Response: `200: application/json: -`.
- `GET /admin/users` - List Admin Users. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /admin/users/assign-role` - Assign User Role. Body: `application/json: AssignRoleRequest`. Response: `200: application/json: RoleOut`.
- `GET /admin/users/export.xlsx` - Admin Users Export. Body: `-`. Response: `200: application/json: -`.
- `DELETE /admin/users/{user_id}` - Soft Delete Admin User. Body: `-`. Response: `200: application/json: object`.
- `GET /admin/users/{user_id}` - Get Admin User. Body: `-`. Response: `200: application/json: object`.
- `PATCH /admin/users/{user_id}` - Update Admin User. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.3 Ads

- `GET /ads/products` - List Ads Products. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /ads/products` - Create Ads Product. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.
- `DELETE /ads/products/{product_id}` - Delete Ads Product. Body: `-`. Response: `200: application/json: object`.
- `PATCH /ads/products/{product_id}` - Update Ads Product. Body: `application/json: object`. Response: `200: application/json: MarketplaceRecordOut`.

### 46.4 Ai

- `POST /ai/assistant` - Ai Assistant. Body: `application/json: marketplace_schemas__AiAssistantRequest`. Response: `200: application/json: object`.
- `POST /ai/cases/{case_id}/tools` - Ai Case Tools. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/classify` - Ai Classify. Body: `application/json: AiClassifyRequest`. Response: `200: application/json: object`.
- `POST /ai/document-analysis` - Ai Document Analysis. Body: `application/json: AiDocumentAnalysisRequest`. Response: `200: application/json: object`.
- `POST /ai/document-analysis/file` - Ai Document Analysis File. Body: `multipart/form-data: Body_ai_document_analysis_file`. Response: `200: application/json: object`.
- `POST /ai/document-analysis/quote` - Ai Document Analysis Quote. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/feedback` - Ai Feedback. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/instructor/actions/confirm` - Ai Instructor Action Confirm V2. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/instructor/actions/preview` - Ai Instructor Action Preview V2. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/instructor/chat` - Ai Instructor Chat. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /ai/instructor/contract` - Ai Instructor Contract. Body: `-`. Response: `200: application/json: object`.
- `POST /ai/instructor/events` - Ai Instructor Events. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/instructor/runtime` - Ai Instructor Runtime. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /ai/instructor/session/{session_id}` - Ai Instructor Session. Body: `-`. Response: `200: application/json: object`.
- `GET /ai/legal-corpus` - Ai Legal Corpus. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /ai/platform-instructor` - Ai Platform Instructor. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/platform-instructor/actions/confirm` - Ai Platform Instructor Action Confirm. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /ai/platform-instructor/actions/preview` - Ai Platform Instructor Action Preview. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.5 Analytics

- `GET /analytics/ceo` - Ceo Analytics. Body: `-`. Response: `200: application/json: object`.
- `GET /analytics/ceo/export.xlsx` - Ceo Analytics Export. Body: `-`. Response: `200: application/json: -`.
- `GET /analytics/channels-attribution` - Channels Attribution. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /analytics/gifts` - Gift Analytics. Body: `-`. Response: `200: application/json: object`.
- `GET /analytics/revenue-trend` - Revenue Trend. Body: `-`. Response: `200: application/json: array[object]`.

### 46.6 Api

- `POST /api/ai/actions/execute` - Execute Ai Action. Body: `application/json: AiActionExecuteRequest`. Response: `200: application/json: object`.
- `POST /api/ai/assistant` - Ai Assistant. Body: `application/json: ai_assistant__AiAssistantRequest`. Response: `200: application/json: object`.
- `GET /api/ai/capabilities` - Ai Capabilities. Body: `-`. Response: `200: application/json: object`.
- `POST /api/ai/feedback` - Ai Feedback. Body: `application/json: AiFeedbackRequest`. Response: `200: application/json: object`.
- `GET /api/ai/health` - Ai Health. Body: `-`. Response: `200: application/json: object`.
- `GET /api/ai/pages` - Ai Pages. Body: `-`. Response: `200: application/json: object`.

### 46.7 Approvals

- `GET /approvals` - List Approvals. Body: `-`. Response: `200: application/json: array[ApprovalRequestOut]`.
- `POST /approvals` - Create Approval. Body: `application/json: ApprovalRequestCreate`. Response: `200: application/json: ApprovalRequestOut`.
- `GET /approvals/info` - Approvals Info. Body: `-`. Response: `200: application/json: object`.
- `POST /approvals/{approval_id}/admin-approve` - Admin Approve. Body: `-`. Response: `200: application/json: ApprovalRequestOut`.
- `POST /approvals/{approval_id}/manager-approve` - Manager Approve. Body: `-`. Response: `200: application/json: ApprovalRequestOut`.

### 46.8 Auth

- `DELETE /auth/2fa` - Disable Two Factor. Body: `-`. Response: `200: application/json: object`.
- `POST /auth/2fa/start` - Start Two Factor. Body: `-`. Response: `200: application/json: TwoFactorStartOut`.
- `POST /auth/2fa/totp/enable` - Enable Totp Two Factor. Body: `application/json: TotpEnableRequest`. Response: `200: application/json: object`.
- `POST /auth/2fa/totp/setup` - Setup Totp Two Factor. Body: `-`. Response: `200: application/json: TotpSetupOut`.
- `POST /auth/2fa/verify` - Verify Two Factor. Body: `application/json: TwoFactorVerifyRequest`. Response: `200: application/json: object`.
- `POST /auth/login` - Login. Body: `application/json: LoginRequest`. Response: `200: application/json: AuthResponse`.
- `POST /auth/login/2fa` - Login Two Factor. Body: `application/json: TwoFactorVerifyRequest`. Response: `200: application/json: AuthResponse`.
- `POST /auth/logout` - Logout. Body: `application/json: LogoutRequest`. Response: `200: application/json: object`.
- `GET /auth/me` - Me. Body: `-`. Response: `200: application/json: UserOut`.
- `POST /auth/password/forgot` - Forgot Password. Body: `application/json: PasswordForgotRequest`. Response: `200: application/json: TwoFactorStartOut`.
- `POST /auth/password/reset` - Reset Password. Body: `application/json: PasswordResetRequest`. Response: `200: application/json: object`.
- `POST /auth/refresh` - Refresh. Body: `application/json: RefreshRequest`. Response: `200: application/json: AuthResponse`.
- `POST /auth/register` - Register. Body: `application/json: RegisterRequest`. Response: `200: application/json: RegisterStartResponse`.
- `POST /auth/register/start` - Register Start. Body: `application/json: RegisterRequest`. Response: `200: application/json: RegisterStartResponse`.
- `POST /auth/register/verify` - Register Verify. Body: `application/json: RegisterVerifyRequest`. Response: `200: application/json: AuthResponse | RegisterApprovalPendingResponse`.
- `GET /auth/security-events` - Security Events. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /auth/sessions` - List Sessions. Body: `-`. Response: `200: application/json: array[SessionOut]`.
- `DELETE /auth/sessions/{session_id}` - Revoke Session. Body: `-`. Response: `200: application/json: object`.

### 46.9 B2B

- `GET /b2b/clients` - B2B Clients. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /b2b/clients` - Create B2B Client. Body: `application/json: object`. Response: `200: application/json: object`.
- `PATCH /b2b/clients/{client_id}` - Update B2B Client. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /b2b/clients/{client_id}/contract` - Create B2B Contract. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /b2b/clients/{client_id}/invoice` - Create B2B Invoice. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /b2b/clients/{client_id}/monthly-report` - B2B Monthly Report. Body: `-`. Response: `200: application/json: object`.
- `GET /b2b/clients/{client_id}/timeline` - B2B Client Timeline. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /b2b/pipeline` - B2B Pipeline. Body: `-`. Response: `200: application/json: object`.
- `GET /b2b/products` - List B2B Products. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /b2b/products` - Create B2B Product. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.
- `GET /b2b/tasks` - B2B Tasks. Body: `-`. Response: `200: application/json: array[object]`.

### 46.10 Calendar

- `GET /calendar/business-hours` - Calendar Business Hours. Body: `-`. Response: `200: application/json: object`.
- `POST /calendar/deadline-calculator` - Calendar Deadline Calculator. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.11 Calendar Events

- `GET /calendar-events` - List Calendar Events. Body: `-`. Response: `200: application/json: array[CalendarEventOut]`.
- `POST /calendar-events` - Create Calendar Event. Body: `application/json: CalendarEventCreate`. Response: `201: application/json: CalendarEventOut`.
- `DELETE /calendar-events/{event_id}` - Delete Calendar Event. Body: `-`. Response: `200: application/json: object`.
- `PATCH /calendar-events/{event_id}` - Update Calendar Event. Body: `application/json: CalendarEventUpdate`. Response: `200: application/json: CalendarEventOut`.
- `GET /calendar-events/{event_id}/ical` - Calendar Event Ical. Body: `-`. Response: `200: application/json: -`.
- `POST /calendar-events/{event_id}/reminders/cascade` - Create Calendar Reminder Cascade. Body: `-`. Response: `200: application/json: object`.

### 46.12 Call Center

- `GET /call-center/calls` - Call Center Calls. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /call-center/calls` - Call Center Log Call. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /call-center/clients/search` - Call Center Client Search. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /call-center/clients/{client_user_id}` - Call Center Client Card. Body: `-`. Response: `200: application/json: object`.
- `GET /call-center/document-requests/open` - List Callcenter Document Request Pool. Body: `-`. Response: `200: application/json: object`.
- `POST /call-center/document-requests/{record_id}/claim` - Claim Callcenter Document Request. Body: `-`. Response: `200: application/json: object`.
- `POST /call-center/document-requests/{record_id}/transfer` - Transfer Callcenter Document Request. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /call-center/leads` - Call Center List Leads. Body: `-`. Response: `200: application/json: array[LeadOut]`.
- `POST /call-center/leads` - Call Center Create Lead. Body: `application/json: LeadCreate`. Response: `200: application/json: LeadOut`.
- `GET /call-center/leads/kanban` - Call Center Lead Kanban. Body: `-`. Response: `200: application/json: LeadKanbanOut`.
- `GET /call-center/leads/kanban/columns` - Call Center Lead Kanban Columns. Body: `-`. Response: `200: application/json: array[LeadKanbanColumn]`.
- `PUT /call-center/leads/kanban/columns` - Call Center Update Lead Kanban Columns. Body: `application/json: array[LeadKanbanColumnUpdate]`. Response: `200: application/json: array[LeadKanbanColumn]`.
- `GET /call-center/leads/kanban/export.xlsx` - Call Center Lead Kanban Export. Body: `-`. Response: `200: application/json: -`.
- `GET /call-center/leads/{lead_id}` - Call Center Lead Detail. Body: `-`. Response: `200: application/json: LeadOut`.
- `PATCH /call-center/leads/{lead_id}` - Call Center Update Lead. Body: `application/json: LeadUpdate`. Response: `200: application/json: LeadOut`.
- `PATCH /call-center/leads/{lead_id}/move` - Call Center Move Lead Kanban. Body: `application/json: LeadKanbanMove`. Response: `200: application/json: LeadKanbanMoveOut`.
- `GET /call-center/leads/{lead_id}/timeline` - Call Center Lead Timeline. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `GET /call-center/quality-complaints` - List Callcenter Quality Complaints. Body: `-`. Response: `200: application/json: object`.
- `GET /call-center/quality-complaints/{complaint_id}` - Get Callcenter Quality Complaint. Body: `-`. Response: `200: application/json: object`.
- `POST /call-center/quality-complaints/{complaint_id}/resolve` - Resolve Callcenter Quality Complaint. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `GET /call-center/queue` - Call Center Queue. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /call-center/support/operators` - Callcenter Support Operators. Body: `-`. Response: `200: application/json: object`.
- `GET /call-center/support/tickets` - Callcenter Support Tickets. Body: `-`. Response: `200: application/json: object`.
- `GET /call-center/support/tickets/{ticket_id}/assist/context` - Get Support Assist Context. Body: `-`. Response: `200: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/assist/document-lawyer-request` - Create Support Assist Document Lawyer Request. Body: `application/json: object`. Response: `201: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/assist/marketplace-purchase-request` - Create Support Assist Marketplace Purchase. Body: `application/json: object`. Response: `201: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/assist/subscription-checkout` - Create Support Assist Subscription Checkout. Body: `application/json: object`. Response: `201: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/assist/subscription-preview` - Preview Support Assist Subscription. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/assist/urgent-advokat-request` - Create Support Assist Urgent Advokat Request. Body: `application/json: object`. Response: `201: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/calls` - Create Support Ticket Call. Body: `application/json: object | null`. Response: `201: application/json: CallSessionOut`.
- `POST /call-center/support/tickets/{ticket_id}/claim` - Claim Support Ticket. Body: `-`. Response: `200: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/close` - Close Support Ticket. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /call-center/support/tickets/{ticket_id}/transfer` - Transfer Support Ticket. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /call-center/urgent-advokat/candidates` - Urgent Advokat General Candidates. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /call-center/urgent-advokat/requests` - Callcenter Urgent Advokat Requests. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /call-center/urgent-advokat/requests/{record_id}` - Callcenter Urgent Advokat Request Detail. Body: `-`. Response: `200: application/json: object`.
- `POST /call-center/urgent-advokat/requests/{record_id}/assign-group` - Assign Urgent Second Opinion Group. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /call-center/urgent-advokat/requests/{record_id}/cancel` - Cancel Urgent Advokat Request. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `GET /call-center/urgent-advokat/requests/{record_id}/candidates` - Urgent Advokat Request Candidates. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /call-center/urgent-advokat/requests/{record_id}/claim` - Claim Urgent Advokat Request. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /call-center/urgent-advokat/requests/{record_id}/complete` - Complete Urgent Advokat Request. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /call-center/urgent-advokat/requests/{record_id}/meeting` - Create Urgent Advokat Meeting. Body: `application/json: object | null`. Response: `201: application/json: CallSessionOut`.
- `PATCH /call-center/urgent-advokat/requests/{record_id}/status` - Update Urgent Advokat Status. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /call-center/urgent-advokat/requests/{record_id}/transfer` - Transfer Urgent Advokat Request. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.13 Callcenter

- `GET /callcenter/document-requests/open` - List Callcenter Document Request Pool Alias. Body: `-`. Response: `200: application/json: object`.
- `POST /callcenter/document-requests/{record_id}/claim` - Claim Callcenter Document Request Alias. Body: `-`. Response: `200: application/json: object`.
- `POST /callcenter/document-requests/{record_id}/transfer` - Transfer Callcenter Document Request Alias. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.14 Calls

- `GET /calls/analytics` - Calls Analytics. Body: `-`. Response: `200: application/json: object`.
- `GET /calls/invited` - Invited Call Sessions. Body: `-`. Response: `200: application/json: array[object]`.
- `PATCH /calls/{call_id}` - Update Call Session. Body: `application/json: CallSessionUpdate`. Response: `200: application/json: CallSessionOut`.
- `POST /calls/{call_id}/pause` - Pause Call Session By Id. Body: `application/json: object | null`. Response: `200: application/json: CallSessionOut`.
- `POST /calls/{call_id}/resume` - Resume Call Session By Id. Body: `-`. Response: `200: application/json: CallSessionOut`.

### 46.15 Case Documents

- `GET /case-documents` - List Case Document Records. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /case-documents` - Create Case Document Record. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.

### 46.16 Cases

- `GET /cases` - List Cases. Body: `-`. Response: `200: application/json: array[LegalCaseOut]`.
- `POST /cases` - Create Case. Body: `application/json: LegalCaseCreate`. Response: `200: application/json: LegalCaseOut`.
- `GET /cases/{case_id}` - Get Case. Body: `-`. Response: `200: application/json: LegalCaseOut`.
- `PATCH /cases/{case_id}` - Update Case. Body: `application/json: LegalCaseUpdate`. Response: `200: application/json: LegalCaseOut`.
- `POST /cases/{case_id}/archive` - Archive Case. Body: `-`. Response: `200: application/json: LegalCaseOut`.
- `POST /cases/{case_id}/status` - Update Case Status. Body: `application/json: object`. Response: `200: application/json: LegalCaseOut`.
- `GET /cases/{case_id}/timeline` - Case Timeline. Body: `-`. Response: `200: application/json: array[object]`.

### 46.17 Clients

- `GET /clients/me` - Get Client Profile. Body: `-`. Response: `200: application/json: ClientProfileOut`.
- `PUT /clients/me` - Update Client Profile. Body: `application/json: ClientProfileUpdate`. Response: `200: application/json: ClientProfileOut`.
- `GET /clients/me/entitlements` - My Entitlements. Body: `-`. Response: `200: application/json: object`.
- `GET /clients/me/family-members` - List Family Members. Body: `-`. Response: `200: application/json: array[FamilyMemberOut]`.
- `POST /clients/me/family-members` - Create Family Member. Body: `application/json: FamilyMemberCreate`. Response: `201: application/json: FamilyMemberOut`.
- `DELETE /clients/me/family-members/{member_id}` - Delete Family Member. Body: `-`. Response: `200: application/json: object`.
- `PATCH /clients/me/family-members/{member_id}` - Update Family Member. Body: `application/json: FamilyMemberUpdate`. Response: `200: application/json: FamilyMemberOut`.
- `GET /clients/me/payment-methods` - List Payment Methods. Body: `-`. Response: `200: application/json: array[PaymentMethodOut]`.
- `POST /clients/me/payment-methods` - Create Payment Method. Body: `application/json: PaymentMethodCreate`. Response: `201: application/json: PaymentMethodOut`.
- `DELETE /clients/me/payment-methods/{method_id}` - Delete Payment Method. Body: `-`. Response: `200: application/json: object`.
- `GET /clients/me/works` - List My Client Works. Body: `-`. Response: `200: application/json: object`.
- `GET /clients/me/works/{work_id}` - Get My Client Work. Body: `-`. Response: `200: application/json: object`.
- `GET /clients/{client_id}/chats` - List Chats. Body: `-`. Response: `200: application/json: array[ChatSummaryOut]`.
- `POST /clients/{client_id}/chats` - Create Chat. Body: `application/json: ChatCreate`. Response: `200: application/json: ChatSummaryOut`.
- `GET /clients/{client_id}/chats/{chat_id}` - Get Chat. Body: `-`. Response: `200: application/json: ChatDetailOut`.
- `POST /clients/{client_id}/chats/{chat_id}/messages` - Send Message. Body: `application/json: MessageCreate`. Response: `200: application/json: MessageResponse`.

### 46.18 Complaints

- `GET /complaints` - List Complaints. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /complaints` - Create Complaint. Body: `application/json: ComplaintCreate`. Response: `200: application/json: MarketplaceRecordOut`.

### 46.19 Conflicts

- `POST /conflicts/check` - Check Conflict. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.20 Contracts

- `GET /contracts` - List Contracts. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /contracts/{contract_id}` - Get Contract. Body: `-`. Response: `200: application/json: object`.
- `GET /contracts/{contract_id}/download` - Download Contract. Body: `-`. Response: `200: application/json: -`.
- `GET /contracts/{contract_id}/file` - Inline Contract File. Body: `-`. Response: `200: application/json: -`.
- `POST /contracts/{contract_id}/signature/start` - Start Contract Signature. Body: `-`. Response: `200: application/json: object`.
- `POST /contracts/{contract_id}/signature/verify` - Verify Contract Signature. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /contracts/{contract_id}/verify` - Verify Contract Public. Body: `-`. Response: `200: application/json: object`.

### 46.21 Document Editor

- `POST /document-editor/onlyoffice/callback/{session_id}` - Onlyoffice Document Editor Callback. Body: `-`. Response: `200: application/json: object`.
- `GET /document-editor/sessions/{session_id}/file` - Get Public Document Editor File. Body: `-`. Response: `200: application/json: -`.

### 46.22 Document Lawyer Requests

- `GET /document-lawyer-requests/{record_id}/attachments/{attachment_id}/file` - Download Document Lawyer Attachment. Body: `-`. Response: `200: application/json: -`.

### 46.23 Document Requests

- `GET /document-requests` - List Document Requests. Body: `-`. Response: `200: application/json: DocumentRequestListOut`.
- `POST /document-requests` - Create Document Request. Body: `application/json: DocumentRequestCreate`. Response: `200: application/json: DocumentRequestOut`.
- `GET /document-requests/service-flow` - List Client Service Document Requests. Body: `-`. Response: `200: application/json: object`.
- `GET /document-requests/{request_id}` - Get Document Request. Body: `-`. Response: `200: application/json: DocumentRequestOut`.
- `PUT /document-requests/{request_id}/answers` - Update Document Answers. Body: `application/json: DocumentRequestUpdate`. Response: `200: application/json: DocumentRequestOut`.
- `POST /document-requests/{request_id}/calls/audio` - Create Document Request Client Audio Call. Body: `application/json: object | null`. Response: `201: application/json: CallSessionOut`.
- `GET /document-requests/{request_id}/chat` - Get Document Request Chat. Body: `-`. Response: `200: application/json: object`.
- `GET /document-requests/{request_id}/clean-template-file` - Download Document Request Clean Template. Body: `-`. Response: `200: application/json: -`.
- `GET /document-requests/{request_id}/docx` - Download Document Request Docx. Body: `-`. Response: `200: application/json: -`.
- `GET /document-requests/{request_id}/file` - Download Document Request File. Body: `-`. Response: `200: application/json: -`.
- `POST /document-requests/{request_id}/generate` - Generate Document Request. Body: `-`. Response: `200: application/json: DocumentRequestOut`.
- `POST /document-requests/{request_id}/lawyer-review` - Send Document Request To Lawyer Review. Body: `application/json: object | null`. Response: `201: application/json: object`.
- `POST /document-requests/{request_id}/payments` - Create Document Payment. Body: `application/json: PaymentCreate`. Response: `200: application/json: DocumentRequestOut`.
- `POST /document-requests/{request_id}/preview` - Preview Document Request. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /document-requests/{request_id}/rating` - Rate Document Request. Body: `application/json: ReviewCreate`. Response: `200: application/json: object`.
- `GET /document-requests/{request_id}/unlock-policy` - Document Request Unlock Policy. Body: `-`. Response: `200: application/json: object`.
- `GET /document-requests/{request_id}/versions` - Document Request Versions. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /document-requests/{request_id}/versions` - Create Document Request Version. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.24 Document Services

- `POST /document-services/custom-draft/request` - Create Custom Document From Scratch Request. Body: `multipart/form-data: Body_create_custom_document_from_scratch_request`. Response: `201: application/json: object`.
- `GET /document-services/request-document-types` - Document Service Request Document Types. Body: `-`. Response: `200: application/json: object`.
- `POST /document-services/review-existing/request` - Create Existing Document Review Request. Body: `multipart/form-data: Body_create_existing_document_review_request`. Response: `201: application/json: object`.

### 46.25 Document Templates

- `GET /document-templates` - List Document Templates. Body: `-`. Response: `200: application/json: array[DocumentTemplateOut]`.
- `GET /document-templates/{template_id}` - Get Document Template. Body: `-`. Response: `200: application/json: DocumentTemplateOut`.
- `GET /document-templates/{template_id}/clean-source-file` - Download Document Template Clean Source. Body: `-`. Response: `200: application/json: -`.
- `GET /document-templates/{template_id}/file` - Download Document Template. Body: `-`. Response: `200: application/json: -`.
- `POST /document-templates/{template_id}/render` - Render Document Template For Client. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /document-templates/{template_id}/source-file` - Download Document Template Source. Body: `-`. Response: `200: application/json: -`.

### 46.26 Gifts

- `GET /gifts` - List Gifts. Body: `-`. Response: `200: application/json: array[GiftOut]`.
- `POST /gifts` - Create Gift. Body: `application/json: GiftCreate`. Response: `201: application/json: GiftCreateOut`.
- `POST /gifts/{gift_code}/claim` - Claim Gift. Body: `-`. Response: `200: application/json: GiftClaimOut`.
- `GET /gifts/{gift_code}/qr` - Gift Qr. Body: `-`. Response: `200: application/json: -`.

### 46.27 Health

- `GET /health` - Health. Body: `-`. Response: `200: application/json: object`.

### 46.28 Identity

- `GET /identity/me` - My Identity Verifications. Body: `-`. Response: `200: application/json: array[IdentityVerifyOut]`.
- `POST /identity/start` - Start Identity Verification. Body: `application/json: IdentityStartRequest`. Response: `200: application/json: IdentityStartOut`.

### 46.29 Integrations

- `GET /integrations/status` - Integrations Status. Body: `-`. Response: `200: application/json: array[object]`.

### 46.30 Internal

- `GET /internal/analytics/dashboard` - Internal Dashboard. Body: `-`. Response: `200: application/json: object`.
- `GET /internal/analytics/export.xlsx` - Internal Analytics Export. Body: `-`. Response: `200: application/json: -`.
- `POST /internal/approvals/{approval_id}/decision` - Decide Approval. Body: `application/json: ApprovalDecisionIn`. Response: `200: application/json: object`.
- `GET /internal/employees` - List Employees. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/employees` - Create Employee. Body: `application/json: EmployeeIn`. Response: `200: application/json: object`.
- `POST /internal/employees/assignments` - Create Assignment. Body: `application/json: AssignmentIn`. Response: `200: application/json: object`.
- `PATCH /internal/employees/{employee_id}` - Update Employee. Body: `application/json: EmployeeIn`. Response: `200: application/json: object`.
- `GET /internal/employees/{employee_id}/360` - Employee 360. Body: `-`. Response: `200: application/json: object`.
- `GET /internal/execution/tasks` - List Work Items. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/execution/tasks` - Create Work Item. Body: `application/json: WorkItemIn`. Response: `200: application/json: object`.
- `POST /internal/execution/tasks/{task_id}/comments` - Add Work Item Comment. Body: `application/json: CommentIn`. Response: `200: application/json: object`.
- `PATCH /internal/execution/tasks/{task_id}/status` - Update Work Item Status. Body: `application/json: WorkItemStatusIn`. Response: `200: application/json: object`.
- `GET /internal/kpi/metrics` - List Kpi Metrics. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/kpi/metrics` - Create Kpi Metric. Body: `application/json: KpiIn`. Response: `200: application/json: object`.
- `GET /internal/me/approvals` - My Approvals. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /internal/me/attendance` - My Attendance. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /internal/me/kpis` - My Kpis. Body: `-`. Response: `200: application/json: object`.
- `GET /internal/me/messages` - My Messages. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /internal/me/profile` - My Internal Profile. Body: `-`. Response: `200: application/json: object`.
- `GET /internal/me/tasks` - My Tasks. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /internal/me/today` - My Today. Body: `-`. Response: `200: application/json: object`.
- `POST /internal/messages` - Send Internal Message. Body: `application/json: InternalMessageIn`. Response: `200: application/json: object`.
- `GET /internal/org/board` - Org Board. Body: `-`. Response: `200: application/json: object`.
- `GET /internal/org/positions` - List Positions. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/org/positions` - Create Position. Body: `application/json: PositionIn`. Response: `200: application/json: object`.
- `PATCH /internal/org/positions/{position_id}` - Update Position. Body: `application/json: PositionIn`. Response: `200: application/json: object`.
- `GET /internal/org/units` - List Org Units. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/org/units` - Create Org Unit. Body: `application/json: OrgUnitIn`. Response: `200: application/json: object`.
- `GET /internal/org/units/{unit_id}` - Get Org Unit. Body: `-`. Response: `200: application/json: object`.
- `PATCH /internal/org/units/{unit_id}` - Update Org Unit. Body: `application/json: OrgUnitIn`. Response: `200: application/json: object`.
- `GET /internal/payroll/entries` - List Payroll Entries. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/payroll/entries` - Create Payroll Entry. Body: `application/json: PayrollIn`. Response: `200: application/json: object`.
- `GET /internal/payroll/summary` - Payroll Summary. Body: `-`. Response: `200: application/json: object`.
- `GET /internal/time/attendance/days` - List Attendance Days. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/time/attendance/events` - Create Attendance Event. Body: `application/json: AttendanceEventIn`. Response: `200: application/json: object`.
- `GET /internal/time/schedules` - List Schedules. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /internal/time/schedules` - Create Schedule. Body: `application/json: ScheduleIn`. Response: `200: application/json: object`.

### 46.31 Lawyers

- `GET /lawyers` - List Lawyers. Body: `-`. Response: `200: application/json: array[LawyerProfileOut]`.
- `GET /lawyers/me` - Get My Lawyer Profile. Body: `-`. Response: `200: application/json: LawyerProfileOut`.
- `PUT /lawyers/me` - Upsert My Lawyer Profile. Body: `application/json: LawyerProfileUpsert`. Response: `200: application/json: LawyerProfileOut`.
- `GET /lawyers/me/availability` - My Seller Availability. Body: `-`. Response: `200: application/json: object`.
- `PUT /lawyers/me/availability` - Update Seller Availability. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /lawyers/me/cabinet` - My Lawyer Cabinet. Body: `-`. Response: `200: application/json: object`.
- `GET /lawyers/me/cases` - Lawyer Cases. Body: `-`. Response: `200: application/json: array[LegalCaseOut]`.
- `GET /lawyers/me/clients` - Lawyer Clients. Body: `-`. Response: `200: application/json: array[LawyerClientOut]`.
- `POST /lawyers/me/clients` - Create Lawyer Manual Client. Body: `application/json: object`. Response: `201: application/json: object`.
- `GET /lawyers/me/clients/{client_id}` - Lawyer Client Detail. Body: `-`. Response: `200: application/json: object`.
- `GET /lawyers/me/document-requests` - List My Document Lawyer Requests. Body: `-`. Response: `200: application/json: object`.
- `GET /lawyers/me/document-requests/{record_id}` - Get My Document Lawyer Request. Body: `-`. Response: `200: application/json: object`.
- `GET /lawyers/me/document-requests/{record_id}/editor` - Get Document Lawyer Editor. Body: `-`. Response: `200: application/json: object`.
- `PUT /lawyers/me/document-requests/{record_id}/editor/draft` - Save Document Lawyer Editor Draft. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `GET /lawyers/me/document-requests/{record_id}/editor/file` - Get Document Lawyer Editor File. Body: `-`. Response: `200: application/json: -`.
- `POST /lawyers/me/document-requests/{record_id}/editor/finalize` - Finalize Document Lawyer Editor. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /lawyers/me/document-requests/{record_id}/editor/source` - Select Document Lawyer Editor Source. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /lawyers/me/document-requests/{record_id}/editor/source-upload` - Upload Document Lawyer Editor Source. Body: `multipart/form-data: Body_upload_document_lawyer_editor_source`. Response: `200: application/json: object`.
- `GET /lawyers/me/document-requests/{record_id}/editor/sources` - List Document Lawyer Editor Sources. Body: `-`. Response: `200: application/json: object`.
- `POST /lawyers/me/document-requests/{record_id}/fulfill` - Fulfill My Document Lawyer Request. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /lawyers/me/document-requests/{record_id}/fulfill-file` - Fulfill My Document Lawyer Request File. Body: `multipart/form-data: Body_fulfill_my_document_lawyer_request_file`. Response: `200: application/json: object`.
- `POST /lawyers/me/document-requests/{record_id}/meeting` - Create Document Lawyer Meeting. Body: `application/json: object | null`. Response: `201: application/json: CallSessionOut`.
- `POST /lawyers/me/document-requests/{record_id}/transfer` - Transfer Document Lawyer Request. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /lawyers/me/services` - Get My Lawyer Services. Body: `-`. Response: `200: application/json: LawyerServiceSelectionOut`.
- `PUT /lawyers/me/services` - Set My Lawyer Services. Body: `application/json: LawyerServiceSelection`. Response: `200: application/json: LawyerServiceSelectionOut`.
- `GET /lawyers/me/services/manage` - List My Lawyer Services Manage. Body: `-`. Response: `200: application/json: object`.
- `POST /lawyers/me/services/manage` - Create My Lawyer Service Manage. Body: `application/json: LawyerServiceManageRequest`. Response: `201: application/json: object`.
- `DELETE /lawyers/me/services/{service_id}` - Delete My Lawyer Service. Body: `-`. Response: `200: application/json: object`.
- `PATCH /lawyers/me/services/{service_id}` - Update My Lawyer Service. Body: `application/json: LawyerServiceManageRequest`. Response: `200: application/json: object`.
- `POST /lawyers/me/services/{service_id}/promotion-checkout` - Promotion Checkout My Lawyer Service. Body: `application/json: PromotionCheckoutRequest`. Response: `200: application/json: object`.
- `PATCH /lawyers/me/services/{service_id}/status` - Update My Lawyer Service Status. Body: `application/json: LawyerServiceStatusUpdate`. Response: `200: application/json: object`.
- `GET /lawyers/me/stats` - Lawyer Stats. Body: `-`. Response: `200: application/json: LawyerStatsOut`.
- `POST /lawyers/me/verifications` - Create My Verification. Body: `application/json: SellerVerificationCreate`. Response: `200: application/json: SellerVerificationOut`.
- `GET /lawyers/{lawyer_user_id}/private-chat` - Get Private Chat With Lawyer. Body: `-`. Response: `200: application/json: SecureChatRoomOut`.
- `GET /lawyers/{lawyer_user_id}/services` - Get Lawyer Services. Body: `-`. Response: `200: application/json: LawyerServiceSelectionOut`.

### 46.32 Leads

- `POST /leads` - Create Lead. Body: `application/json: LeadCreate`. Response: `200: application/json: LeadOut`.

### 46.33 Legal

- `GET /legal/consents` - Legal Consents. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /legal/consents/me` - My Legal Consents. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /legal/consents/{consent_id}` - Legal Consent Detail. Body: `-`. Response: `200: application/json: object`.
- `POST /legal/consents/{consent_id}/accept` - Accept Legal Consent. Body: `-`. Response: `200: application/json: object`.

### 46.34 Legal Aid

- `GET /legal-aid/info` - Legal Aid Info. Body: `-`. Response: `200: application/json: object`.
- `GET /legal-aid/requests` - List Legal Aid Requests. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /legal-aid/requests` - Create Legal Aid Request. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.
- `GET /legal-aid/requests/{request_id}` - Get Legal Aid Request Detail. Body: `-`. Response: `200: application/json: object`.

### 46.35 Marketplace

- `POST /marketplace/ai-search` - Marketplace Ai Search. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /marketplace/lawyers` - List Marketplace Lawyers. Body: `-`. Response: `200: application/json: object`.
- `GET /marketplace/lawyers/{lawyer_user_id}` - Get Marketplace Lawyer. Body: `-`. Response: `200: application/json: object`.
- `GET /marketplace/lawyers/{lawyer_user_id}/services` - List Marketplace Lawyer Services. Body: `-`. Response: `200: application/json: object`.
- `POST /marketplace/lawyers/{lawyer_user_id}/services/{service_id}/purchase-request` - Create Marketplace Lawyer Purchase Request. Body: `application/json: object | null`. Response: `201: application/json: object`.
- `GET /marketplace/me/orders` - List My Marketplace Orders. Body: `-`. Response: `200: application/json: object`.
- `POST /marketplace/me/orders/{order_id}/cancel` - Cancel My Marketplace Order. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /marketplace/me/orders/{order_id}/complete` - Complete My Marketplace Order. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `GET /marketplace/meta` - Get Marketplace Meta. Body: `-`. Response: `200: application/json: object`.

### 46.36 Matching

- `GET /matching/candidates` - Matching Candidates. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /matching/me` - Matching Me. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /matching/orders/{order_id}/assign-next` - Assign Next Matching Candidate. Body: `-`. Response: `200: application/json: ServiceOrderOut`.
- `POST /matching/preview` - Matching Preview. Body: `application/json: object`. Response: `200: application/json: array[object]`.

### 46.37 Notifications

- `GET /notifications` - List Notifications. Body: `-`. Response: `200: application/json: array[NotificationInboxOut]`.
- `GET /notifications/categories` - Notification Categories. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /notifications/preferences` - Notification Preferences. Body: `-`. Response: `200: application/json: object`.
- `PUT /notifications/preferences` - Update Notification Preferences. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /notifications/read-all` - Mark All Notifications Read. Body: `-`. Response: `200: application/json: object`.
- `GET /notifications/unread-count` - Unread Notifications Count. Body: `-`. Response: `200: application/json: UnreadCountOut`.
- `POST /notifications/{notification_id}/read` - Mark Notification Read. Body: `-`. Response: `200: application/json: NotificationInboxOut`.

### 46.38 Orders

- `GET /orders` - List My Orders. Body: `-`. Response: `200: application/json: array[ServiceOrderOut]`.
- `POST /orders` - Create Order. Body: `application/json: ServiceOrderCreate`. Response: `200: application/json: ServiceOrderOut`.
- `POST /orders/{order_id}/accept` - Accept Order. Body: `-`. Response: `200: application/json: OrderActionOut`.
- `POST /orders/{order_id}/decline` - Decline Order. Body: `-`. Response: `200: application/json: OrderDeclineOut`.
- `GET /orders/{order_id}/milestones` - List Order Milestones. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /orders/{order_id}/milestones/{milestone_id}/mark-paid` - Mark Milestone Paid. Body: `-`. Response: `200: application/json: object`.
- `POST /orders/{order_id}/milestones/{milestone_id}/pay` - Create Milestone Payment. Body: `-`. Response: `200: application/json: object`.
- `POST /orders/{order_id}/milestones/{milestone_id}/release` - Release Milestone. Body: `-`. Response: `200: application/json: object`.
- `GET /orders/{order_id}/payment-policy` - Get Order Payment Policy. Body: `-`. Response: `200: application/json: object`.
- `PATCH /orders/{order_id}/status` - Update Order Status. Body: `application/json: OrderStatusUpdate`. Response: `200: application/json: ServiceOrderOut`.
- `GET /orders/{order_id}/status-history` - Order Status History. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.

### 46.39 Organizations

- `GET /organizations` - List Organizations. Body: `-`. Response: `200: application/json: array[OrganizationOut]`.
- `POST /organizations` - Create Organization. Body: `application/json: OrganizationCreate`. Response: `200: application/json: OrganizationOut`.
- `GET /organizations/{organization_id}/members` - List Organization Members. Body: `-`. Response: `200: application/json: array[OrganizationMemberOut]`.
- `POST /organizations/{organization_id}/members` - Add Organization Member. Body: `application/json: OrganizationMemberCreate`. Response: `200: application/json: OrganizationMemberOut`.
- `GET /organizations/{organization_id}/members/{member_user_id}/services/manage` - List Organization Member Services Manage. Body: `-`. Response: `200: application/json: object`.
- `POST /organizations/{organization_id}/members/{member_user_id}/services/manage` - Create Organization Member Service Manage. Body: `application/json: LawyerServiceManageRequest`. Response: `201: application/json: object`.
- `DELETE /organizations/{organization_id}/members/{member_user_id}/services/{service_id}` - Delete Organization Member Service. Body: `-`. Response: `200: application/json: object`.
- `PATCH /organizations/{organization_id}/members/{member_user_id}/services/{service_id}` - Update Organization Member Service. Body: `application/json: LawyerServiceManageRequest`. Response: `200: application/json: object`.
- `POST /organizations/{organization_id}/members/{member_user_id}/services/{service_id}/promotion-checkout` - Promotion Checkout Organization Member Service. Body: `application/json: PromotionCheckoutRequest`. Response: `200: application/json: object`.
- `PATCH /organizations/{organization_id}/members/{member_user_id}/services/{service_id}/status` - Update Organization Member Service Status. Body: `application/json: LawyerServiceStatusUpdate`. Response: `200: application/json: object`.
- `GET /organizations/{organization_id}/owner/dashboard` - Organization Owner Dashboard. Body: `-`. Response: `200: application/json: object`.
- `GET /organizations/{organization_id}/owner/workload` - Organization Owner Workload. Body: `-`. Response: `200: application/json: object`.

### 46.40 Payments

- `GET /payments` - List Payments. Body: `-`. Response: `200: application/json: array[PaymentHistoryOut]`.
- `POST /payments` - Create Payment. Body: `application/json: PaymentCreate`. Response: `200: application/json: PaymentOut`.
- `GET /payments/reconciliation` - Payment Reconciliation. Body: `-`. Response: `200: application/json: object`.
- `GET /payments/{payment_id}/receipt` - Payment Receipt. Body: `-`. Response: `200: application/json: -`.
- `GET /payments/{payment_id}/receipt/verify` - Verify Payment Receipt. Body: `-`. Response: `200: application/json: object`.
- `GET /payments/{payment_id}/split` - Payment Split. Body: `-`. Response: `200: application/json: PaymentSplitOut`.

### 46.41 Payouts

- `GET /payouts/me` - My Payouts. Body: `-`. Response: `200: application/json: array[object]`.

### 46.42 Platform

- `GET /platform/policies` - Public Platform Policies. Body: `-`. Response: `200: application/json: object`.

### 46.43 Pricing

- `GET /pricing/quote` - Pricing Quote. Body: `-`. Response: `200: application/json: object`.

### 46.44 Promotions

- `GET /promotions/active` - Active Promotions. Body: `-`. Response: `200: application/json: object`.
- `GET /promotions/analytics` - Promotion Analytics. Body: `-`. Response: `200: application/json: PromotionAnalyticsOut`.
- `POST /promotions/banner-assets` - Upload Promotion Banner Asset. Body: `multipart/form-data: Body_upload_promotion_banner_asset`. Response: `201: application/json: object`.
- `POST /promotions/checkout` - Promotion Checkout. Body: `application/json: PromotionCheckoutRequest`. Response: `200: application/json: object`.
- `POST /promotions/events` - Create Promotion Event. Body: `application/json: PromotionEventCreate`. Response: `201: application/json: object`.
- `GET /promotions/me` - Promotion Status. Body: `-`. Response: `200: application/json: PromotionStatusOut`.
- `GET /promotions/packages` - Promotion Packages. Body: `-`. Response: `200: application/json: object`.

### 46.45 Quality

- `GET /quality/overview` - Quality Overview. Body: `-`. Response: `200: application/json: object`.

### 46.46 Referrals

- `GET /referrals/me` - My Referrals. Body: `-`. Response: `200: application/json: object`.
- `GET /referrals/{code}/qr` - Referral Qr. Body: `-`. Response: `200: application/json: -`.

### 46.47 Refund Requests

- `GET /refund-requests` - List Refund Requests. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /refund-requests` - Create Refund Request. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.

### 46.48 Replacement Requests

- `GET /replacement-requests` - List Replacement Requests. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /replacement-requests` - Create Replacement Request. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.
- `GET /replacement-requests/me` - List My Replacement Requests. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `GET /replacement-requests/{replacement_id}/history` - Replacement History. Body: `-`. Response: `200: application/json: array[object]`.

### 46.49 Retention

- `GET /retention/overview` - Retention Overview. Body: `-`. Response: `200: application/json: object`.
- `GET /retention/queue` - Retention Queue. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /retention/queue` - Create Retention Task. Body: `application/json: object`. Response: `200: application/json: object`.

### 46.50 Reviews

- `POST /reviews` - Create Review. Body: `application/json: ReviewCreate`. Response: `200: application/json: object`.
- `GET /reviews/me` - My Reviews. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /reviews/pending` - Pending Reviews. Body: `-`. Response: `200: application/json: array[object]`.

### 46.51 Secure Chats

- `GET /secure-chats` - List Secure Chats. Body: `-`. Response: `200: application/json: array[SecureChatRoomOut]`.
- `POST /secure-chats` - Create Secure Chat. Body: `application/json: SecureChatRoomCreate`. Response: `200: application/json: SecureChatRoomOut`.
- `DELETE /secure-chats/{room_id}` - Archive Secure Chat. Body: `-`. Response: `200: application/json: SecureChatRoomOut`.
- `GET /secure-chats/{room_id}` - Get Secure Chat Room. Body: `-`. Response: `200: application/json: SecureChatRoomOut`.
- `GET /secure-chats/{room_id}/calls` - List Call Sessions. Body: `-`. Response: `200: application/json: array[CallSessionOut]`.
- `POST /secure-chats/{room_id}/calls` - Create Call Session. Body: `application/json: CallSessionCreate`. Response: `201: application/json: CallSessionOut`.
- `GET /secure-chats/{room_id}/calls/{call_id}` - Get Call Session. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/end` - End Call Session. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `PATCH /secure-chats/{room_id}/calls/{call_id}/extension-payment-request` - Answer Call Paid Extension. Body: `application/json: object | null`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/extension-payment-request` - Request Call Paid Extension. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /secure-chats/{room_id}/calls/{call_id}/free-extend` - Extend Call Once For Free. Body: `application/json: object | null`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/join` - Join Call Session. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `GET /secure-chats/{room_id}/calls/{call_id}/join-token` - Get Call Join Token. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/leave` - Leave Call Session. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/participants` - Add Call Participant Endpoint. Body: `application/json: CallParticipantCreate`. Response: `200: application/json: CallSessionOut`.
- `PATCH /secure-chats/{room_id}/calls/{call_id}/participants/{participant_user_id}` - Update Call Participant Endpoint. Body: `application/json: CallParticipantUpdate`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/pause` - Pause Call Session. Body: `application/json: object | null`. Response: `200: application/json: CallSessionOut`.
- `PATCH /secure-chats/{room_id}/calls/{call_id}/recording-permission` - Update Call Recording Permission. Body: `application/json: RecordingPermissionUpdate`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/recording-request` - Request Call Recording. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/recording/start` - Start Call Recording. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/calls/{call_id}/resume` - Resume Call Session. Body: `-`. Response: `200: application/json: CallSessionOut`.
- `POST /secure-chats/{room_id}/content-reveal/approve` - Approve Secure Chat Content Reveal. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /secure-chats/{room_id}/content-reveal/request` - Request Secure Chat Content Reveal. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /secure-chats/{room_id}/content-reveal/status` - Secure Chat Content Reveal Status. Body: `-`. Response: `200: application/json: object`.
- `GET /secure-chats/{room_id}/messages` - List Secure Messages. Body: `-`. Response: `200: application/json: array[SecureChatMessageOut]`.
- `POST /secure-chats/{room_id}/messages` - Create Secure Message. Body: `application/json: SecureChatMessageCreate`. Response: `200: application/json: SecureChatMessageOut`.
- `POST /secure-chats/{room_id}/messages/upload` - Upload Secure Chat Message. Body: `multipart/form-data: Body_upload_secure_chat_message`. Response: `201: application/json: SecureChatMessageOut`.
- `GET /secure-chats/{room_id}/messages/{message_id}/file` - Download Secure Chat Message File. Body: `-`. Response: `200: application/json: -`.
- `PATCH /secure-chats/{room_id}/settings` - Update Secure Chat Settings. Body: `application/json: ChatSettingsUpdate`. Response: `200: application/json: SecureChatRoomOut`.
- `POST /secure-chats/{room_id}/zoom` - Create Zoom Meeting. Body: `-`. Response: `200: application/json: ZoomMeetingOut`.

### 46.52 Seller

- `GET /seller/me/cabinet` - My Seller Cabinet. Body: `-`. Response: `200: application/json: object`.

### 46.53 Seller Onboarding

- `GET /seller-onboarding` - List Seller Onboarding. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /seller-onboarding` - Create Seller Onboarding. Body: `application/json: MarketplaceRecordCreate`. Response: `200: application/json: MarketplaceRecordOut`.
- `POST /seller-onboarding/documents` - Upload Seller Onboarding Document. Body: `multipart/form-data: Body_upload_seller_onboarding_document`. Response: `201: application/json: MarketplaceRecordOut`.
- `GET /seller-onboarding/progress` - Seller Onboarding Progress. Body: `-`. Response: `200: application/json: object`.
- `POST /seller-onboarding/submit` - Submit Seller Onboarding. Body: `-`. Response: `200: application/json: MarketplaceRecordOut`.

### 46.54 Service Categories

- `GET /service-categories` - List Service Categories. Body: `-`. Response: `200: application/json: array[ServiceCategoryOut]`.

### 46.55 Service Packages

- `GET /service-packages` - List Service Packages. Body: `-`. Response: `200: application/json: array[LegalServicePackageOut]`.
- `POST /service-packages/proposals` - Seller Propose Service Package. Body: `application/json: object`. Response: `201: application/json: object`.

### 46.56 Services

- `GET /services` - List Services. Body: `-`. Response: `200: application/json: array[LegalServiceListOut | LegalServiceOut]`.
- `GET /services/search` - Search Services. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /services/{service_id}/document-ai/generate` - Service Document Ai Generate. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /services/{service_id}/document-ai/questions` - Service Document Ai Questions. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `GET /services/{service_id}/document-fields` - Get Service Document Fields. Body: `-`. Response: `200: application/json: object`.
- `POST /services/{service_id}/document-generate` - Generate Service Document. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /services/{service_id}/document-lawyer/request` - Create Service Document Lawyer Request. Body: `application/json: object | null`. Response: `201: application/json: object`.
- `POST /services/{service_id}/document-lawyer/request-with-files` - Create Service Document Lawyer Request With Files. Body: `multipart/form-data: Body_create_service_document_lawyer_request_with_files`. Response: `201: application/json: object`.
- `GET /services/{service_id}/document-lawyers` - List Service Document Lawyers. Body: `-`. Response: `200: application/json: object`.
- `POST /services/{service_id}/document-preview` - Preview Service Document. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /services/{service_id}/document-requests` - Create Service Document Request. Body: `application/json: object | null`. Response: `201: application/json: DocumentRequestOut`.
- `GET /services/{service_id}/document-template` - Get Service Document Template. Body: `-`. Response: `200: application/json: object`.
- `GET /services/{service_id}/document-template/clean-source-file` - Download Service Document Template Clean Source. Body: `-`. Response: `200: application/json: -`.
- `GET /services/{service_id}/document-template/source-file` - Download Service Document Template Source. Body: `-`. Response: `200: application/json: -`.
- `GET /services/{service_id}/passport` - Get Service Passport. Body: `-`. Response: `200: application/json: object`.

### 46.57 Sos

- `POST /sos` - Create Sos. Body: `application/json: SosCreate`. Response: `200: application/json: object`.
- `PATCH /sos/{sos_id}` - Update Sos Status. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /sos/{sos_id}/route` - Route Sos. Body: `-`. Response: `200: application/json: object`.

### 46.58 Studio

- `POST /studio/activity/heartbeat` - Studio Activity Heartbeat. Body: `application/json: StudioActivityHeartbeatPayload`. Response: `200: application/json: object`.
- `POST /studio/activity/{session_id}/end` - Studio Activity End. Body: `-`. Response: `200: application/json: object`.
- `GET /studio/constructors` - Studio Constructors. Body: `-`. Response: `200: application/json: object`.
- `GET /studio/constructors/{code}` - Studio Constructor Detail. Body: `-`. Response: `200: application/json: object`.
- `POST /studio/constructors/{code}/preview` - Studio Constructor Preview. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /studio/constructors/{code}/validate` - Studio Constructor Validate. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /studio/objects` - Studio Objects. Body: `-`. Response: `200: application/json: object`.
- `POST /studio/objects` - Studio Create Object. Body: `application/json: StudioObjectCreate`. Response: `201: application/json: object`.
- `GET /studio/objects/summary` - Studio Objects Summary. Body: `-`. Response: `200: application/json: object`.
- `GET /studio/objects/{object_id}` - Studio Object Detail. Body: `-`. Response: `200: application/json: object`.
- `POST /studio/objects/{object_id}/archive` - Studio Archive Object. Body: `-`. Response: `200: application/json: object`.
- `GET /studio/objects/{object_id}/comments` - Studio Comments. Body: `-`. Response: `200: application/json: object`.
- `POST /studio/objects/{object_id}/comments` - Studio Add Comment. Body: `application/json: StudioCommentCreate`. Response: `201: application/json: object`.
- `POST /studio/objects/{object_id}/file` - Studio Upload Object File. Body: `multipart/form-data: Body_studio_upload_object_file`. Response: `200: application/json: object`.
- `POST /studio/objects/{object_id}/save` - Studio Save Object. Body: `application/json: StudioObjectSave`. Response: `200: application/json: object`.
- `POST /studio/objects/{object_id}/submit` - Studio Submit Object. Body: `-`. Response: `200: application/json: object`.
- `GET /studio/reference/{key}` - Studio Reference. Body: `-`. Response: `200: application/json: object`.
- `GET /studio/versions/{version_id}/file` - Studio Version File. Body: `-`. Response: `200: application/json: -`.

### 46.59 Subscription Plans

- `GET /subscription-plans` - List Subscription Plans. Body: `-`. Response: `200: application/json: array[SubscriptionPlanOut]`.
- `GET /subscription-plans/{plan_id}` - Get Subscription Plan. Body: `-`. Response: `200: application/json: SubscriptionPlanOut`.
- `POST /subscription-plans/{plan_id}/purchase` - Purchase Subscription Plan. Body: `application/json: SubscriptionPurchaseRequest`. Response: `200: application/json: SubscriptionPurchaseOut`.
- `POST /subscription-plans/{plan_id}/telegram-purchase-request` - Request Subscription Plan Telegram Approval. Body: `application/json: object | null`. Response: `200: application/json: object`.

### 46.60 Subscriptions

- `PATCH /subscriptions/{subscription_id}/auto-renew` - Update Subscription Auto Renew. Body: `application/json: SubscriptionAutoRenewUpdate`. Response: `200: application/json: object`.

### 46.61 Support

- `GET /support/meta` - Support Meta. Body: `-`. Response: `200: application/json: object`.
- `POST /support/tickets` - Create Support Ticket. Body: `application/json: object`. Response: `201: application/json: object`.
- `GET /support/tickets/me` - My Support Tickets. Body: `-`. Response: `200: application/json: object`.
- `GET /support/tickets/{ticket_id}` - Get Support Ticket. Body: `-`. Response: `200: application/json: object`.
- `GET /support/tickets/{ticket_id}/messages` - List Support Ticket Messages. Body: `-`. Response: `200: application/json: object`.
- `POST /support/tickets/{ticket_id}/messages` - Create Support Ticket Message. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /support/tickets/{ticket_id}/reopen` - Reopen Support Ticket. Body: `application/json: object | null`. Response: `200: application/json: object`.

### 46.62 Tasks

- `POST /tasks` - Create Task. Body: `application/json: object`. Response: `200: application/json: object`.
- `GET /tasks/me` - My Tasks. Body: `-`. Response: `200: application/json: array[object]`.
- `DELETE /tasks/{task_id}` - Delete Task. Body: `-`. Response: `200: application/json: object`.
- `GET /tasks/{task_id}` - Get Task. Body: `-`. Response: `200: application/json: object`.
- `PATCH /tasks/{task_id}` - Update Task. Body: `application/json: TaskUpdate`. Response: `200: application/json: object`.
- `PATCH /tasks/{task_id}/status` - Update Task Status. Body: `application/json: TaskStatusUpdate`. Response: `200: application/json: object`.

### 46.63 Telegram

- `POST /telegram/link/start` - Telegram Link Start. Body: `-`. Response: `200: application/json: object`.

### 46.64 Upsell

- `GET /upsell/offers` - List Upsell Offers. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /upsell/offers` - Create Upsell Offer. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /upsell/offers/{offer_id}/purchase` - Purchase Upsell Offer. Body: `application/json: PaymentCreate`. Response: `200: application/json: PaymentOut`.

### 46.65 Urgent Advokat

- `GET /urgent-advokat/catalog` - Urgent Advokat Catalog. Body: `-`. Response: `200: application/json: object`.
- `POST /urgent-advokat/requests` - Create Urgent Advokat Request. Body: `application/json: object`. Response: `201: application/json: object`.
- `GET /urgent-advokat/requests/assigned` - Assigned Urgent Advokat Requests. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /urgent-advokat/requests/me` - My Urgent Advokat Requests. Body: `-`. Response: `200: application/json: array[object]`.
- `GET /urgent-advokat/requests/{record_id}` - Urgent Advokat Request Detail. Body: `-`. Response: `200: application/json: object`.
- `POST /urgent-advokat/requests/{record_id}/chat/complete` - Complete Urgent Advokat Group Chat. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `POST /urgent-advokat/requests/{record_id}/rating` - Rate Urgent Advokat Request. Body: `application/json: ReviewCreate`. Response: `200: application/json: object`.

### 46.66 Users

- `GET /users/me/activity` - My Activity. Body: `-`. Response: `200: application/json: object`.
- `GET /users/search` - Search Users. Body: `-`. Response: `200: application/json: array[object]`.

### 46.67 Warranty

- `GET /warranty/claims` - Warranty Claims. Body: `-`. Response: `200: application/json: array[MarketplaceRecordOut]`.
- `POST /warranty/claims` - Create Warranty Claim. Body: `application/json: WarrantyClaimCreate`. Response: `200: application/json: MarketplaceRecordOut`.

### 46.68 Workflow

- `GET /workflow/info` - Workflow Info. Body: `-`. Response: `200: application/json: object`.
- `GET /workflow/rules` - Workflow Rules. Body: `-`. Response: `200: application/json: array[object]`.
- `POST /workflow/rules` - Create Workflow Rule. Body: `application/json: object`. Response: `200: application/json: object`.
- `PATCH /workflow/rules/{rule_id}` - Update Workflow Rule. Body: `application/json: object`. Response: `200: application/json: object`.
- `POST /workflow/rules/{rule_id}/run` - Run Workflow Rule. Body: `application/json: object | null`. Response: `200: application/json: object`.
- `GET /workflow/runs` - Workflow Runs. Body: `-`. Response: `200: application/json: array[object]`.

### 46.69 Workspace

- `GET /workspace/document-requests` - List Workspace Document Requests. Body: `-`. Response: `200: application/json: object`.
- `POST /workspace/document-requests` - Create Workspace Document Request. Body: `application/json: WorkspaceDocumentRequestCreate`. Response: `201: application/json: WorkspaceDocumentRequestOut`.
- `POST /workspace/document-requests/{request_id}/fulfill` - Fulfill Workspace Document Request. Body: `multipart/form-data: Body_fulfill_workspace_document_request`. Response: `200: application/json: WorkspaceDocumentRequestOut`.
- `GET /workspace/files` - List Workspace Files. Body: `-`. Response: `200: application/json: array[WorkspaceFileOut]`.
- `POST /workspace/files` - Create Workspace File. Body: `-`. Response: `201: application/json: WorkspaceFileOut`.
- `GET /workspace/files/storage/{stored_name}` - Download Workspace File. Body: `-`. Response: `200: application/json: -`.
- `POST /workspace/files/upload` - Upload Workspace File. Body: `multipart/form-data: Body_upload_workspace_file`. Response: `201: application/json: WorkspaceFileOut`.
- `DELETE /workspace/files/{file_id}` - Delete Workspace File. Body: `-`. Response: `200: application/json: object`.
- `PATCH /workspace/files/{file_id}` - Update Workspace File. Body: `application/json: WorkspaceFileUpdate`. Response: `200: application/json: WorkspaceFileOut`.
- `GET /workspace/files/{file_id}/comments` - List Workspace File Comments. Body: `-`. Response: `200: application/json: array[WorkspaceFileCommentOut]`.
- `POST /workspace/files/{file_id}/comments` - Create Workspace File Comment. Body: `application/json: WorkspaceFileCommentCreate`. Response: `201: application/json: WorkspaceFileCommentOut`.
- `POST /workspace/files/{file_id}/signed-url` - Workspace File Signed Url. Body: `-`. Response: `200: application/json: object`.
- `GET /workspace/files/{file_id}/versions` - List Workspace File Versions. Body: `-`. Response: `200: application/json: array[WorkspaceFileVersionOut]`.
- `POST /workspace/files/{file_id}/versions` - Create Workspace File Version. Body: `application/json: WorkspaceFileVersionCreate`. Response: `201: application/json: WorkspaceFileVersionOut`.
- `GET /workspace/folders` - List Workspace Folders. Body: `-`. Response: `200: application/json: array[WorkspaceFolderOut]`.
- `POST /workspace/folders` - Create Workspace Folder. Body: `application/json: WorkspaceFolderCreate`. Response: `201: application/json: WorkspaceFolderOut`.
- `DELETE /workspace/folders/{folder_id}` - Delete Workspace Folder. Body: `-`. Response: `200: application/json: object`.
- `PATCH /workspace/folders/{folder_id}` - Update Workspace Folder. Body: `application/json: WorkspaceFolderUpdate`. Response: `200: application/json: WorkspaceFolderOut`.
- `GET /workspace/quota` - Get Workspace Quota. Body: `-`. Response: `200: application/json: object`.
- `GET /workspace/tree` - Get Workspace Tree. Body: `-`. Response: `200: application/json: object`.

<!-- GENERATED_API_INDEX_END -->

## 47. Request va response model inventari

Quyidagi model ta'riflari production OpenAPI component schemalaridan avtomatik chiqarilgan. `required` belgisi bo'lmagan field nullable degani emas; aniq nullable holat type ichidagi `null` orqali ko'rsatiladi.

<!-- GENERATED_SCHEMA_INDEX_START -->

### 47.1 `AiActionExecuteRequest`

- `request_id`: `string`; required.
- `action_id`: `string`; required.
- `confirmed`: `boolean`; optional. default=False.
- `payload`: `object`; optional.

### 47.2 `AiClassifyRequest`

- `text`: `string`; required.

### 47.3 `AiCurrentPage`

- `route`: `string`; optional. default=''.
- `page_id`: `string`; optional. default=''.
- `title`: `string`; optional. default=''.
- `context`: `object`; optional.

### 47.4 `AiDocumentAnalysisRequest`

- `text`: `string`; required.

### 47.5 `AiFeedbackRequest`

- `request_id`: `string`; required.
- `rating`: `integer`; required. minimum=1.0; maximum=5.0.
- `comment`: `string`; optional. default=''.
- `useful`: `boolean | null`; optional.

### 47.6 `ApprovalDecisionIn`

- `decision`: `string`; required.
- `comment`: `string`; optional. default=''.

### 47.7 `ApprovalRequestCreate`

- `request_type`: `string`; required.
- `target_type`: `string`; required.
- `target_id`: `string`; required.
- `reason`: `string`; optional. default=''.
- `payload`: `object`; optional.

### 47.8 `ApprovalRequestOut`

- `request_type`: `string`; required.
- `target_type`: `string`; required.
- `target_id`: `string`; required.
- `reason`: `string`; optional. default=''.
- `payload`: `object`; optional.
- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `status`: `string`; required.
- `created_by_user_id`: `string | null`; required.
- `admin_approved_by_user_id`: `string | null`; required.
- `manager_approved_by_user_id`: `string | null`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.9 `AssignRoleRequest`

- `user_id`: `string`; required.
- `role_id`: `string`; required.

### 47.10 `AssignmentIn`

- `employee_id`: `string`; required.
- `org_unit_id`: `string | null`; optional.
- `position_id`: `string | null`; optional.
- `manager_employee_id`: `string | null`; optional.
- `employment_type`: `string`; optional. default='full_time'.
- `rate`: `integer`; optional. default=100.
- `salary_amount`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.
- `status`: `string`; optional. default='active'.
- `effective_from`: `string(date-time) | null`; optional.
- `effective_to`: `string(date-time) | null`; optional.
- `meta`: `object`; optional.

### 47.11 `AttendanceEventIn`

- `employee_id`: `string | null`; optional.
- `event_type`: `string`; required.
- `source`: `string`; optional. default='manual'.
- `event_at`: `string(date-time) | null`; optional.
- `note`: `string`; optional. default=''.
- `meta`: `object`; optional.

### 47.12 `AuthResponse`

- `access_token`: `string`; required.
- `refresh_token`: `string | null`; optional.
- `token_type`: `string`; optional. default='bearer'.
- `user`: `UserOut`; required.

### 47.13 `Body_ai_document_analysis_file`

- `file`: `string(binary)`; required.
- `lawyer_review`: `boolean`; optional. default=False.
- `urgency`: `string`; optional. default='normal'.

### 47.14 `Body_create_custom_document_from_scratch_request`

- `need`: `string`; required.
- `title`: `string`; optional. default='0 dan hujjat tayyorlash'.
- `language`: `string`; optional. default='uz'.
- `requested_document_type`: `string`; optional. default=''.
- `files`: `array[string(binary)] | null`; optional.
- `voice_files`: `array[string(binary)] | null`; optional.

### 47.15 `Body_create_existing_document_review_request`

- `need`: `string`; required.
- `title`: `string`; optional. default='Mavjud hujjatni tekshirtirish'.
- `language`: `string`; optional. default='uz'.
- `page_count`: `integer`; optional. default=0.
- `urgency`: `string`; optional. default='normal'.
- `main_file`: `string(binary)`; required.
- `files`: `array[string(binary)] | null`; optional.
- `voice_files`: `array[string(binary)] | null`; optional.

### 47.16 `Body_create_service_document_lawyer_request_with_files`

- `need`: `string`; required.
- `title`: `string`; optional. default=''.
- `language`: `string`; optional. default='uz'.
- `answers_json`: `string`; optional. default='{}'.
- `editor_mode`: `string`; optional. default='lawyer_editor'.
- `extra_instructions`: `string`; optional. default=''.
- `requested_document_type`: `string`; optional. default=''.
- `page_count`: `integer`; optional. default=0.
- `urgency`: `string`; optional. default='normal'.
- `files`: `array[string(binary)] | null`; optional.
- `voice_files`: `array[string(binary)] | null`; optional.

### 47.17 `Body_fulfill_my_document_lawyer_request_file`

- `file`: `string(binary)`; required.
- `notes`: `string`; optional. default=''.

### 47.18 `Body_fulfill_workspace_document_request`

- `file`: `string(binary) | null`; optional.
- `file_id`: `string | null`; optional.

### 47.19 `Body_import_document_template_docx`

- `slug`: `string`; required.
- `title`: `string`; required.
- `category`: `string`; optional. default='contract'.
- `language`: `string`; optional. default='uz-latn'.
- `visibility`: `string`; optional. default='staff'.
- `price`: `integer`; optional. default=0.
- `file`: `string(binary)`; required.

### 47.20 `Body_import_document_templates_zip`

- `category`: `string`; optional. default='contract'.
- `language`: `string`; optional. default='uz-latn'.
- `visibility`: `string`; optional. default='staff'.
- `file`: `string(binary)`; required.

### 47.21 `Body_studio_upload_object_file`

- `file`: `string(binary)`; required.

### 47.22 `Body_upload_ai_support_reglament`

- `title`: `string`; required.
- `category`: `string`; optional. default='general'.
- `version`: `string`; optional. default='1.0'.
- `file`: `string(binary)`; required.

### 47.23 `Body_upload_document_lawyer_editor_source`

- `file`: `string(binary)`; required.
- `note`: `string`; optional. default=''.

### 47.24 `Body_upload_promotion_banner_asset`

- `file`: `string(binary)`; required.

### 47.25 `Body_upload_secure_chat_message`

- `message_type`: `string`; optional. default='file'.
- `content`: `string`; optional. default=''.
- `reply_to_message_id`: `string`; optional. default=''.
- `file`: `string(binary)`; required.

### 47.26 `Body_upload_seller_onboarding_document`

- `file`: `string(binary)`; required.
- `document_type`: `string`; optional. default='qualification'.

### 47.27 `Body_upload_service_document_template`

- `slug`: `string`; required.
- `title`: `string`; required.
- `category`: `string`; optional. default='service_document'.
- `language`: `string`; optional. default='uz-latn'.
- `visibility`: `string`; optional. default='client'.
- `price`: `integer`; optional. default=0.
- `is_active`: `boolean`; optional. default=True.
- `file`: `string(binary)`; required.

### 47.28 `Body_upload_workspace_file`

- `folder_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `file`: `string(binary)`; required.

### 47.29 `BootstrapSuperadminRequest`

- `phone`: `string`; required.
- `bootstrap_key`: `string`; required.

### 47.30 `BusinessHolidayCreate`

- `day`: `string(date)`; required.
- `title`: `string`; required. minLength=2; maxLength=255.

### 47.31 `CalendarEventCreate`

- `type`: `string`; required.
- `title`: `string`; required.
- `case_id`: `string | null`; optional.
- `starts_at`: `string(date-time)`; required.
- `ends_at`: `string(date-time) | null`; optional.
- `location`: `string`; optional. default=''.
- `reminder_minutes_before`: `integer | null`; optional.

### 47.32 `CalendarEventOut`

- `type`: `string`; required.
- `title`: `string`; required.
- `case_id`: `string | null`; optional.
- `starts_at`: `string(date-time)`; required.
- `ends_at`: `string(date-time) | null`; optional.
- `location`: `string`; optional. default=''.
- `reminder_minutes_before`: `integer | null`; optional.
- `id`: `string`; required.
- `status`: `string`; required.
- `reminder_scheduled`: `boolean`; optional. default=False.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.33 `CalendarEventUpdate`

- `type`: `string | null`; optional.
- `title`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `starts_at`: `string(date-time) | null`; optional.
- `ends_at`: `string(date-time) | null`; optional.
- `location`: `string | null`; optional.
- `reminder_minutes_before`: `integer | null`; optional.
- `status`: `string | null`; optional.

### 47.34 `CallParticipantCreate`

- `user_id`: `string`; required.
- `role`: `string`; optional. default='participant'.

### 47.35 `CallParticipantOut`

- `user_id`: `string`; required.
- `name`: `string`; optional. default=''.
- `role`: `string`; required.
- `status`: `string`; required.
- `mic_enabled`: `boolean`; optional. default=True.
- `camera_enabled`: `boolean`; optional. default=True.
- `screen_enabled`: `boolean`; optional. default=False.
- `joined_at`: `string(date-time) | null`; optional.
- `left_at`: `string(date-time) | null`; optional.
- `invited_by_user_id`: `string | null`; optional.
- `livekit_enforced`: `boolean`; optional. default=False.
- `enforce_actions`: `array[object]`; optional.

### 47.36 `CallParticipantUpdate`

- `status`: `string | null`; optional.
- `role`: `string | null`; optional.
- `mic_enabled`: `boolean | null`; optional.
- `camera_enabled`: `boolean | null`; optional.
- `screen_enabled`: `boolean | null`; optional.

### 47.37 `CallSessionCreate`

- `call_type`: `string`; optional. default='video'.
- `title`: `string`; optional. default=''.
- `max_duration_minutes`: `integer`; optional. default=60.
- `participant_user_ids`: `array[string]`; optional.

### 47.38 `CallSessionOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `room_id`: `string`; required.
- `caller_user_id`: `string`; required.
- `call_type`: `string`; required.
- `title`: `string`; required.
- `status`: `string`; required.
- `join_url`: `string`; required.
- `provider`: `string`; optional. default='livekit'.
- `livekit_url`: `string`; optional. default=''.
- `livekit_room`: `string`; optional. default=''.
- `livekit_token`: `string`; optional. default=''.
- `turn_domain`: `string`; optional. default=''.
- `max_duration_minutes`: `integer`; optional. default=60.
- `auto_end_at`: `string(date-time) | null`; optional.
- `remaining_seconds`: `integer`; optional. default=0.
- `paused`: `boolean`; optional. default=False.
- `pause_expires_at`: `string(date-time) | null`; optional.
- `paused_remaining_seconds`: `integer`; optional. default=0.
- `free_extension_used`: `boolean`; optional. default=False.
- `free_extension_available`: `boolean`; optional. default=False.
- `free_extension_max_minutes`: `integer`; optional. default=3.
- `paid_extension_price_per_minute`: `integer`; optional. default=2000.
- `pending_extension_request`: `object | null`; optional.
- `document_request_id`: `string | null`; optional.
- `document_lawyer_record_id`: `string | null`; optional.
- `client_call_usage`: `object | null`; optional.
- `participants`: `array[CallParticipantOut]`; optional.
- `permissions`: `map[string, boolean]`; optional.
- `recording_status`: `string`; optional. default='off'.
- `recording_requested_by_user_id`: `string | null`; optional.
- `recording_allowed_by_user_id`: `string | null`; optional.
- `recording_started_by_user_id`: `string | null`; optional.
- `participant_count`: `integer`; optional. default=0.
- `min_participants_required`: `boolean`; optional. default=False.
- `can_start_now`: `boolean`; optional. default=True.
- `connection_hints`: `object`; optional.
- `quality_policy`: `object`; optional.
- `livekit_enforced`: `boolean`; optional. default=False.
- `enforce_actions`: `array[object]`; optional.
- `started_at`: `string(date-time)`; required.
- `ended_at`: `string(date-time) | null`; optional.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.39 `CallSessionUpdate`

- `status`: `string | null`; optional.
- `ended_at`: `string(date-time) | null`; optional.

### 47.40 `ChatCreate`

- `title`: `string | null`; optional.

### 47.41 `ChatDetailOut`

- `id`: `string`; required.
- `client_id`: `string`; required.
- `title`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.
- `messages`: `array[MessageOut]`; required.
- `contracts`: `array[ContractCreatedOut]`; optional.

### 47.42 `ChatSettingsUpdate`

- `auto_delete_hours`: `integer`; optional. default=0.

### 47.43 `ChatSummaryOut`

- `id`: `string`; required.
- `client_id`: `string`; required.
- `title`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.
- `last_message`: `MessageOut | null`; optional.

### 47.44 `ClientProfileOut`

- `name`: `string`; required.
- `phone`: `string`; required.
- `email`: `string`; optional. default=''.
- `avatar_url`: `string`; optional. default=''.
- `subscription`: `object | null`; optional.

### 47.45 `ClientProfileUpdate`

- `name`: `string | null`; optional.
- `email`: `string | null`; optional.
- `avatar_url`: `string | null`; optional.

### 47.46 `CommentIn`

- `body`: `string`; required. minLength=1.
- `attachments`: `array[object]`; optional.

### 47.47 `ComplaintCreate`

- `category`: `string`; required.
- `subject`: `string`; required.
- `description`: `string`; required.
- `case_id`: `string | null`; optional.

### 47.48 `ConsentDocumentCreate`

- `slug`: `string`; required. minLength=2; maxLength=120.
- `version`: `string`; required. minLength=1; maxLength=40.
- `title`: `string`; required. minLength=2; maxLength=255.
- `body`: `string`; required. minLength=2.
- `title_json`: `map[string, string]`; optional.
- `body_json`: `map[string, string]`; optional.
- `is_active`: `boolean`; optional. default=True.
- `requires_reaccept`: `boolean`; optional. default=False.

### 47.49 `ConsentDocumentUpdate`

- `slug`: `string | null`; optional.
- `version`: `string | null`; optional.
- `title`: `string | null`; optional.
- `body`: `string | null`; optional.
- `title_json`: `map[string, string] | null`; optional.
- `body_json`: `map[string, string] | null`; optional.
- `is_active`: `boolean | null`; optional.
- `requires_reaccept`: `boolean | null`; optional.

### 47.50 `ContractCreatedOut`

- `id`: `string`; required.
- `contract_type`: `string`; required.
- `status`: `string`; required.
- `download_url`: `string`; required.
- `inline_url`: `string`; required.
- `file_name`: `string`; required.
- `mime_type`: `string`; required.
- `file_base64`: `string`; required.

### 47.51 `DashboardDrilldownOut`

- `metric`: `string`; required.
- `total`: `integer`; required.
- `items`: `array[object]`; optional.

### 47.52 `DashboardOut`

- `totals`: `map[string, integer]`; required.
- `payments`: `map[string, integer]`; required.
- `orders`: `map[string, integer]`; required.
- `leads`: `map[string, integer]`; required.
- `sellers`: `map[string, integer]`; required.
- `charts`: `map[string, array[object]]`; required.
- `lists`: `map[string, array[object]]`; optional.

### 47.53 `DemoDataSeedOut`

- `templates`: `integer`; required.
- `ads_products`: `integer`; required.
- `message`: `string`; required.

### 47.54 `DocumentRequestCreate`

- `template_id`: `string | null`; optional.
- `order_id`: `string | null`; optional.
- `document_type`: `string`; optional. default='contract'.
- `title`: `string`; required.
- `questionnaire`: `array[object]`; optional.
- `answers`: `object`; optional.
- `price`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.

### 47.55 `DocumentRequestListItemOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `template_id`: `string | null`; required.
- `document_type`: `string`; optional. default=''.
- `mode`: `string`; optional. default='manual'.
- `title`: `string`; required.
- `status`: `string`; required.
- `status_label`: `string`; optional. default=''.
- `price`: `integer`; required.
- `price_tiyin`: `integer`; optional. default=0.
- `currency`: `string`; required.
- `requested_document_type`: `string`; optional. default=''.
- `requested_document_type_is_custom`: `boolean`; optional. default=False.
- `lawyer_request_active`: `boolean`; optional. default=False.
- `can_send_lawyer_request`: `boolean`; optional. default=True.
- `created_at`: `string(date-time)`; required.

### 47.56 `DocumentRequestListOut`

- `items`: `array[DocumentRequestListItemOut]`; required.

### 47.57 `DocumentRequestOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `client_user_id`: `string | null`; required.
- `template_id`: `string | null`; required.
- `order_id`: `string | null`; required.
- `payment_id`: `string | null`; required.
- `contract_id`: `string | null`; required.
- `document_type`: `string`; required.
- `title`: `string`; required.
- `status`: `string`; required.
- `status_label`: `string`; optional. default=''.
- `questionnaire`: `array[object]`; required.
- `answers`: `object`; required.
- `price`: `integer`; required.
- `price_tiyin`: `integer`; optional. default=0.
- `currency`: `string`; required.
- `payment_status`: `string`; optional. default='paid'.
- `paid`: `boolean`; optional. default=True.
- `requires_payment`: `boolean`; optional. default=False.
- `payment_gate`: `object | null`; optional.
- `payment_required`: `boolean`; optional. default=False.
- `page_count`: `integer`; optional. default=0.
- `auto_confirm_payment`: `boolean`; optional. default=False.
- `mode`: `string`; optional. default='manual'.
- `assigned_lawyer`: `object | null`; optional.
- `lawyer_request`: `object | null`; optional.
- `lawyer_request_active`: `boolean`; optional. default=False.
- `can_send_lawyer_request`: `boolean`; optional. default=True.
- `lawyer_request_block_reason`: `string`; optional. default=''.
- `constructor_action`: `object | null`; optional.
- `requested_document_type`: `string`; optional. default=''.
- `requested_document_type_is_custom`: `boolean`; optional. default=False.
- `contract_file`: `object | null`; optional.
- `rating_deadline_at`: `string(date-time) | null`; optional.
- `rating_available`: `boolean`; optional. default=False.
- `rating_submitted`: `boolean`; optional. default=False.
- `rating`: `object | null`; optional.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.58 `DocumentRequestUpdate`

- `answers`: `object`; optional.

### 47.59 `DocumentTemplateCreate`

- `slug`: `string`; required.
- `title`: `string`; required.
- `category`: `string`; optional. default='contract'.
- `language`: `string`; optional. default='uz-latn'.
- `description`: `string`; optional. default=''.
- `fields`: `array[object]`; optional.
- `template_text`: `string`; required.
- `price`: `integer`; optional. default=0.
- `visibility`: `string`; optional. default='staff'.
- `is_active`: `boolean`; optional. default=True.

### 47.60 `DocumentTemplateListOut`

- `id`: `string`; required.
- `slug`: `string`; required.
- `title`: `string`; required.
- `category`: `string`; required.
- `language`: `string`; required.
- `description`: `string`; optional. default=''.
- `price`: `integer`; optional. default=0.
- `visibility`: `string`; required.
- `is_active`: `boolean`; required.
- `fields_count`: `integer`; optional. default=0.
- `template_text_length`: `integer`; optional. default=0.
- `source_file_name`: `string`; optional. default=''.
- `source_file_mime_type`: `string`; optional. default=''.
- `has_source_file`: `boolean`; optional. default=False.
- `source_file_url`: `string`; optional. default=''.
- `detail_url`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.61 `DocumentTemplateOut`

- `slug`: `string`; required.
- `title`: `string`; required.
- `category`: `string`; optional. default='contract'.
- `language`: `string`; optional. default='uz-latn'.
- `description`: `string`; optional. default=''.
- `fields`: `array[object]`; optional.
- `template_text`: `string`; required.
- `price`: `integer`; optional. default=0.
- `visibility`: `string`; optional. default='staff'.
- `is_active`: `boolean`; optional. default=True.
- `id`: `string`; required.
- `source_file_name`: `string`; optional. default=''.
- `source_file_mime_type`: `string`; optional. default=''.
- `has_source_file`: `boolean`; optional. default=False.
- `source_file_url`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.62 `DocumentTemplateUpdate`

- `slug`: `string | null`; optional.
- `title`: `string | null`; optional.
- `category`: `string | null`; optional.
- `language`: `string | null`; optional.
- `description`: `string | null`; optional.
- `fields`: `array[object] | null`; optional.
- `template_text`: `string | null`; optional.
- `price`: `integer | null`; optional.
- `visibility`: `string | null`; optional.
- `is_active`: `boolean | null`; optional.

### 47.63 `EmployeeIn`

- `user_id`: `string | null`; optional.
- `employee_code`: `string`; optional. default=''.
- `first_name`: `string`; optional. default=''.
- `last_name`: `string`; optional. default=''.
- `middle_name`: `string`; optional. default=''.
- `display_name`: `string`; required. minLength=2; maxLength=255.
- `phone`: `string`; optional. default=''.
- `email`: `string`; optional. default=''.
- `region`: `string`; optional. default=''.
- `employment_status`: `string`; optional. default='active'.
- `hire_date`: `string(date-time) | null`; optional.
- `profile`: `object`; optional.

### 47.64 `FamilyMemberCreate`

- `name`: `string`; required.
- `phone`: `string`; required.
- `relation`: `string`; optional. default=''.
- `shared_access`: `boolean`; optional. default=False.

### 47.65 `FamilyMemberOut`

- `name`: `string`; required.
- `phone`: `string`; required.
- `relation`: `string`; optional. default=''.
- `shared_access`: `boolean`; optional. default=False.
- `id`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.66 `FamilyMemberUpdate`

- `name`: `string | null`; optional.
- `phone`: `string | null`; optional.
- `relation`: `string | null`; optional.
- `shared_access`: `boolean | null`; optional.

### 47.67 `GiftClaimOut`

- `id`: `string`; required.
- `status`: `string`; required.
- `gift_code`: `string`; required.
- `subscription_id`: `string | null`; optional.
- `plan_id`: `string | null`; optional.
- `starts_at`: `string(date-time) | null`; optional.
- `ends_at`: `string(date-time) | null`; optional.

### 47.68 `GiftCreate`

- `plan_id`: `string | null`; optional.
- `plan_slug`: `string | null`; optional.
- `service_id`: `string | null`; optional.
- `recipient_phone`: `string`; optional. default=''.
- `recipient_hint`: `string`; optional. default=''.
- `term_months`: `integer`; optional. default=6.
- `duration_months`: `integer | null`; optional.
- `message`: `string`; optional. default=''.
- `provider`: `string`; optional. default='demo_payme'.

### 47.69 `GiftCreateOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `status`: `string`; required.
- `gift_code`: `string`; required.
- `share_url`: `string`; optional. default=''.
- `qr_url`: `string`; optional. default=''.
- `payment`: `PaymentOut`; required.

### 47.70 `GiftOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `direction`: `string`; required.
- `recipient_phone`: `string`; required.
- `plan_name`: `string`; optional. default=''.
- `service_name`: `string`; optional. default=''.
- `term_months`: `integer`; required.
- `share_url`: `string`; optional. default=''.
- `qr_url`: `string`; optional. default=''.
- `claimed_by_user_id`: `string | null`; optional.
- `status`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.71 `HTTPValidationError`

- `detail`: `array[ValidationError]`; optional.

### 47.72 `IdentityStartOut`

- `provider`: `string`; required.
- `status`: `string`; required.
- `auth_url`: `string`; required.
- `state`: `string`; required.
- `demo_code`: `string | null`; optional.

### 47.73 `IdentityStartRequest`

- `provider`: `string`; optional. default='oneid'.
- `redirect_uri`: `string`; optional. default=''.
- `purpose`: `string`; optional. default='login'.

### 47.74 `IdentityVerifyOut`

- `provider`: `string`; required.
- `status`: `string`; required.
- `verified`: `boolean`; required.
- `pinfl`: `string`; optional. default=''.
- `passport`: `string`; optional. default=''.
- `full_name`: `string`; optional. default=''.
- `user_id`: `string`; required.
- `verified_at`: `string(date-time)`; required.

### 47.75 `InternalMessageIn`

- `recipient_user_id`: `string | null`; optional.
- `thread_type`: `string`; optional. default='direct'.
- `thread_id`: `string | null`; optional.
- `body`: `string`; required. minLength=1.
- `attachments`: `array[object]`; optional.

### 47.76 `KpiIn`

- `employee_id`: `string`; required.
- `period`: `string`; required.
- `metric_code`: `string`; required.
- `title`: `string`; required.
- `target_value`: `integer`; optional. default=0.
- `actual_value`: `integer`; optional. default=0.
- `score`: `integer`; optional. default=0.
- `weight`: `integer`; optional. default=100.
- `source`: `string`; optional. default='manual'.
- `status`: `string`; optional. default='active'.
- `meta`: `object`; optional.

### 47.77 `LawyerClientOut`

- `id`: `string`; required.
- `name`: `string`; required.
- `phone`: `string`; required.
- `cases_count`: `integer`; required.
- `orders_count`: `integer`; optional. default=0.
- `active_case_ids`: `array[string]`; optional.
- `has_conflict`: `boolean`; optional. default=False.
- `last_active_at`: `string(date-time) | null`; optional.

### 47.78 `LawyerProfileOut`

- `seller_type`: `string`; optional. default='advokat'.
- `region`: `string`; optional. default=''.
- `district`: `string`; optional. default=''.
- `license_number`: `string`; optional. default=''.
- `bar_association`: `string`; optional. default=''.
- `advocate_structure`: `string`; optional. default=''.
- `organization_name`: `string`; optional. default=''.
- `experience_years`: `integer`; optional. default=0; minimum=0.0.
- `lawyer_experience_years`: `integer`; optional. default=0; minimum=0.0.
- `specializations`: `array[string]`; optional.
- `languages`: `array[string]`; optional.
- `bio`: `string`; optional. default=''.
- `education`: `string`; optional. default=''.
- `total_cases`: `integer`; optional. default=0; minimum=0.0.
- `wins_count`: `integer`; optional. default=0; minimum=0.0.
- `partial_wins_count`: `integer`; optional. default=0; minimum=0.0.
- `base_hourly_price`: `integer`; optional. default=0; minimum=0.0.
- `id`: `string`; required.
- `user_id`: `string`; required.
- `public_id`: `string`; required.
- `lawyer_name`: `string`; required.
- `phone`: `string`; required.
- `verification_status`: `string`; required.
- `rating`: `integer`; required.
- `reviews_count`: `integer`; required.
- `success_rate`: `integer`; required.
- `is_verified`: `boolean`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.79 `LawyerProfileUpsert`

- `seller_type`: `string`; optional. default='advokat'.
- `region`: `string`; optional. default=''.
- `district`: `string`; optional. default=''.
- `license_number`: `string`; optional. default=''.
- `bar_association`: `string`; optional. default=''.
- `advocate_structure`: `string`; optional. default=''.
- `organization_name`: `string`; optional. default=''.
- `experience_years`: `integer`; optional. default=0; minimum=0.0.
- `lawyer_experience_years`: `integer`; optional. default=0; minimum=0.0.
- `specializations`: `array[string]`; optional.
- `languages`: `array[string]`; optional.
- `bio`: `string`; optional. default=''.
- `education`: `string`; optional. default=''.
- `total_cases`: `integer`; optional. default=0; minimum=0.0.
- `wins_count`: `integer`; optional. default=0; minimum=0.0.
- `partial_wins_count`: `integer`; optional. default=0; minimum=0.0.
- `base_hourly_price`: `integer`; optional. default=0; minimum=0.0.

### 47.80 `LawyerServiceManageRequest`

- `service_id`: `string`; optional. default=''.
- `selected_price`: `integer`; optional. default=0; minimum=0.0.
- `experience_note`: `string`; optional. default=''.
- `status`: `string`; optional. default='active'.

### 47.81 `LawyerServiceSelection`

- `service_ids`: `array[string]`; optional.
- `selected_prices`: `map[string, integer]`; optional.

### 47.82 `LawyerServiceSelectionOut`

- `lawyer_user_id`: `string`; required.
- `services`: `array[LegalServiceOut]`; required.

### 47.83 `LawyerServiceStatusUpdate`

- `status`: `string`; optional. default='active'.

### 47.84 `LawyerStatsOut`

- `workload`: `object`; required.
- `finance`: `object`; required.
- `performance`: `object`; required.

### 47.85 `LeadCreate`

- `client_user_id`: `string | null`; optional.
- `source`: `string`; optional. default='web'.
- `category`: `string`; optional. default=''.
- `region`: `string`; optional. default=''.
- `urgency`: `string`; optional. default=''.
- `details`: `object`; optional.
- `assigned_operator_user_id`: `string | null`; optional.

### 47.86 `LeadKanbanCard`

- `lead`: `LeadOut`; required.
- `position`: `integer`; required.
- `moved_at`: `string(date-time) | null`; optional.
- `moved_by_user_id`: `string | null`; optional.

### 47.87 `LeadKanbanColumn`

- `key`: `string`; required.
- `title`: `string`; required.
- `color`: `string`; optional. default='#64748b'.
- `order`: `integer`; optional. default=0.
- `is_final`: `boolean`; optional. default=False.

### 47.88 `LeadKanbanColumnOut`

- `key`: `string`; required.
- `title`: `string`; required.
- `color`: `string`; optional. default='#64748b'.
- `order`: `integer`; optional. default=0.
- `is_final`: `boolean`; optional. default=False.
- `leads`: `array[LeadKanbanCard]`; optional.
- `count`: `integer`; optional. default=0.

### 47.89 `LeadKanbanColumnUpdate`

- `key`: `string`; required.
- `title`: `string`; required.
- `color`: `string`; optional. default='#64748b'.
- `order`: `integer`; optional. default=0.
- `is_final`: `boolean`; optional. default=False.

### 47.90 `LeadKanbanMove`

- `column_key`: `string`; required.
- `position`: `integer`; optional. default=0; minimum=0.0.

### 47.91 `LeadKanbanMoveOut`

- `lead`: `LeadOut`; required.
- `kanban`: `object`; required.

### 47.92 `LeadKanbanOut`

- `columns`: `array[LeadKanbanColumnOut]`; required.
- `total_count`: `integer`; required.

### 47.93 `LeadOut`

- `client_user_id`: `string | null`; optional.
- `source`: `string`; optional. default='web'.
- `category`: `string`; optional. default=''.
- `region`: `string`; optional. default=''.
- `urgency`: `string`; optional. default=''.
- `details`: `object`; optional.
- `assigned_operator_user_id`: `string | null`; optional.
- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `score`: `string`; required.
- `status`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.94 `LeadReengageRequest`

- `reason`: `string`; optional. default=''.
- `callback_in_days`: `integer`; optional. default=3.

### 47.95 `LeadUpdate`

- `client_user_id`: `string | null`; optional.
- `source`: `string | null`; optional.
- `category`: `string | null`; optional.
- `region`: `string | null`; optional.
- `urgency`: `string | null`; optional.
- `score`: `string | null`; optional.
- `status`: `string | null`; optional.
- `details`: `object | null`; optional.
- `assigned_operator_user_id`: `string | null`; optional.

### 47.96 `LegalCaseCreate`

- `order_id`: `string | null`; optional.
- `lawyer_user_id`: `string | null`; optional.
- `case_type`: `string`; optional. default='general'.
- `stage`: `string`; optional. default='new'.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.
- `next_action`: `string`; optional. default=''.
- `deadline_at`: `string(date-time) | null`; optional.

### 47.97 `LegalCaseOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `case_number`: `string`; required.
- `client_user_id`: `string | null`; required.
- `lawyer_user_id`: `string | null`; required.
- `order_id`: `string | null`; required.
- `case_type`: `string`; required.
- `stage`: `string`; required.
- `status`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; required.
- `next_action`: `string`; required.
- `deadline_at`: `string(date-time) | null`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.98 `LegalCaseUpdate`

- `lawyer_user_id`: `string | null`; optional.
- `case_type`: `string | null`; optional.
- `stage`: `string | null`; optional.
- `status`: `string | null`; optional.
- `title`: `string | null`; optional.
- `description`: `string | null`; optional.
- `next_action`: `string | null`; optional.
- `deadline_at`: `string(date-time) | null`; optional.

### 47.99 `LegalServiceCreate`

- `category_id`: `string`; required.
- `slug`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.
- `base_price`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.
- `delivery_minutes`: `integer`; optional. default=60.
- `document_template_id`: `string | null`; optional.
- `is_active`: `boolean`; optional. default=True.

### 47.100 `LegalServiceListOut`

- `id`: `string`; required.
- `category_id`: `string`; required.
- `category_title`: `string | null`; optional.
- `slug`: `string`; required.
- `title`: `string`; required.
- `subcategory`: `string | null`; optional.
- `base_price`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.
- `delivery_minutes`: `integer`; optional. default=60.
- `document_template_id`: `string | null`; optional.
- `catalog_code`: `string | null`; optional.
- `executor_type`: `string | null`; optional.
- `advokat_required`: `boolean`; optional. default=False.
- `pricing_tier`: `string | null`; optional.
- `standard_price`: `integer | null`; optional.
- `ai_category`: `string | null`; optional.
- `has_document_template`: `boolean`; optional. default=False.
- `is_active`: `boolean`; optional. default=True.

### 47.101 `LegalServiceOut`

- `category_id`: `string`; required.
- `slug`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.
- `base_price`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.
- `delivery_minutes`: `integer`; optional. default=60.
- `document_template_id`: `string | null`; optional.
- `is_active`: `boolean`; optional. default=True.
- `id`: `string`; required.
- `category_title`: `string | null`; optional.
- `catalog_code`: `string | null`; optional.
- `title_uz_cyrl`: `string | null`; optional.
- `title_uz_latn`: `string | null`; optional.
- `title_ru`: `string | null`; optional.
- `subcategory`: `string | null`; optional.
- `executor_type`: `string | null`; optional.
- `advokat_required`: `boolean`; optional. default=False.
- `pricing_tier`: `string | null`; optional.
- `standard_price`: `integer | null`; optional.
- `refund_code`: `string | null`; optional.
- `sla_code`: `string | null`; optional.
- `ai_category`: `string | null`; optional.
- `created_at`: `string(date-time)`; required.

### 47.102 `LegalServicePackageOut`

- `id`: `string`; required.
- `package_code`: `string`; required.
- `slug`: `string`; required.
- `title`: `string`; required.
- `related_service_codes`: `string`; required.
- `category_title`: `string`; required.
- `tariff`: `string`; required.
- `price`: `integer`; required.
- `price_tiyin`: `integer`; optional. default=0.
- `duration`: `string`; required.
- `result`: `string`; required.
- `included`: `array[string]`; required.
- `excluded`: `array[string]`; required.
- `is_active`: `boolean`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.103 `LoginRequest`

- `phone`: `string`; required. minLength=7; maxLength=32.
- `password`: `string`; required. minLength=6; maxLength=128.

### 47.104 `LogoutRequest`

- `refresh_token`: `string | null`; optional.

### 47.105 `MarketplaceRecordCreate`

- `record_type`: `string`; optional. default=''.
- `title`: `string`; required.
- `status`: `string`; optional. default='active'.
- `owner_user_id`: `string | null`; optional.
- `price`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.
- `payload`: `object`; optional.

### 47.106 `MarketplaceRecordOut`

- `record_type`: `string`; optional. default=''.
- `title`: `string`; required.
- `status`: `string`; optional. default='active'.
- `owner_user_id`: `string | null`; optional.
- `price`: `integer`; optional. default=0.
- `currency`: `string`; optional. default='UZS'.
- `payload`: `object`; optional.
- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `module`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.107 `MessageCreate`

- `content`: `string`; required. minLength=1; maxLength=10000.

### 47.108 `MessageOut`

- `id`: `string`; required.
- `role`: `MessageRole`; required.
- `content`: `string`; required.
- `sources`: `array[SourceOut]`; optional.
- `created_at`: `string(date-time)`; required.

### 47.109 `MessageResponse`

- `chat`: `ChatSummaryOut`; required.
- `user_message`: `MessageOut`; required.
- `assistant_message`: `MessageOut`; required.
- `contracts`: `array[ContractCreatedOut]`; optional.
- `limit_status`: `object | null`; optional.

### 47.110 `MessageRole`

- Qiymatlar: `user`, `assistant`, `tool`, `system`

### 47.111 `NotificationCreate`

- `user_id`: `string`; required.
- `channel`: `string`; optional. default='push'.
- `title`: `string`; required.
- `body`: `string`; required.
- `category`: `string`; optional. default='system'.
- `audience_role`: `string`; optional. default=''.

### 47.112 `NotificationInboxOut`

- `id`: `string`; required.
- `title`: `string`; required.
- `body`: `string`; required.
- `kind`: `string`; optional. default='system'.
- `read`: `boolean`; optional. default=False.
- `data`: `object`; optional.
- `meta`: `object`; optional.
- `category`: `string`; optional. default='system'.
- `audience_role`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.

### 47.113 `NotificationOut`

- `user_id`: `string`; required.
- `channel`: `string`; optional. default='push'.
- `title`: `string`; required.
- `body`: `string`; required.
- `category`: `string`; optional. default='system'.
- `audience_role`: `string`; optional. default=''.
- `id`: `string`; required.
- `status`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.114 `OrderActionOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `client_user_id`: `string | null`; required.
- `service_id`: `string`; required.
- `package_id`: `string | null`; optional.
- `lawyer_user_id`: `string | null`; required.
- `status`: `string`; required.
- `payment_status`: `string`; required.
- `contact_unlocked`: `boolean`; required.
- `source`: `string`; required.
- `details`: `object`; required.
- `price`: `integer`; required.
- `price_tiyin`: `integer`; optional. default=0.
- `currency`: `string`; required.
- `service_title`: `string`; optional. default=''.
- `lawyer_name`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.
- `case`: `LegalCaseOut | null`; optional.

### 47.115 `OrderDeclineOut`

- `id`: `string`; required.
- `status`: `string`; optional. default='declined'.

### 47.116 `OrderStatusUpdate`

- `status`: `string`; required.
- `stage`: `string | null`; optional.
- `note`: `string`; optional. default=''.

### 47.117 `OrgUnitIn`

- `code`: `string`; required. minLength=2; maxLength=80.
- `name`: `string`; required. minLength=2; maxLength=255.
- `unit_type`: `string`; optional. default='department'; maxLength=80.
- `parent_id`: `string | null`; optional.
- `head_employee_id`: `string | null`; optional.
- `status`: `string`; optional. default='active'.
- `order_index`: `integer`; optional. default=0.
- `meta`: `object`; optional.

### 47.118 `OrganizationCreate`

- `organization_type`: `string`; optional. default='advokat_tashkiloti'.
- `name`: `string`; required. minLength=2; maxLength=255.
- `phone`: `string`; optional. default=''.
- `inn`: `string`; optional. default=''.
- `region`: `string`; optional. default=''.
- `address`: `string`; optional. default=''.

### 47.119 `OrganizationMemberCreate`

- `user_id`: `string`; required.
- `role_id`: `string | null`; optional.
- `title`: `string`; optional. default=''.

### 47.120 `OrganizationMemberOut`

- `user_id`: `string`; required.
- `role_id`: `string | null`; optional.
- `title`: `string`; optional. default=''.
- `id`: `string`; required.
- `organization_id`: `string`; required.
- `status`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.121 `OrganizationOut`

- `organization_type`: `string`; optional. default='advokat_tashkiloti'.
- `name`: `string`; required. minLength=2; maxLength=255.
- `phone`: `string`; optional. default=''.
- `inn`: `string`; optional. default=''.
- `region`: `string`; optional. default=''.
- `address`: `string`; optional. default=''.
- `id`: `string`; required.
- `owner_user_id`: `string`; required.
- `verification_status`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.122 `PasswordForgotRequest`

- `phone`: `string`; required. minLength=7; maxLength=32.

### 47.123 `PasswordResetRequest`

- `verification_id`: `string`; required.
- `code`: `string`; required. minLength=4; maxLength=12.
- `password`: `string`; required. minLength=6; maxLength=128.

### 47.124 `PaymentCreate`

- `order_id`: `string | null`; optional.
- `target_type`: `string`; optional. default='order'.
- `target_id`: `string | null`; optional.
- `provider`: `string`; optional. default='manual'.
- `amount`: `integer`; optional. default=0; minimum=0.0.
- `currency`: `string`; optional. default='UZS'.
- `provider_payload`: `object`; optional.

### 47.125 `PaymentHistoryOut`

- `id`: `string`; required.
- `amount`: `integer`; required.
- `currency`: `string`; required.
- `status`: `string`; required.
- `method`: `string`; required.
- `kind`: `string`; required.
- `description`: `string`; required.
- `order_id`: `string | null`; optional.
- `created_at`: `string(date-time)`; required.
- `receipt_url`: `string | null`; optional.

### 47.126 `PaymentMethodCreate`

- `brand`: `string`; optional. default='uzcard'.
- `last4`: `string`; required. minLength=4; maxLength=4.
- `expires`: `string`; optional. default=''.
- `is_default`: `boolean`; optional. default=False.

### 47.127 `PaymentMethodOut`

- `brand`: `string`; optional. default='uzcard'.
- `last4`: `string`; required. minLength=4; maxLength=4.
- `expires`: `string`; optional. default=''.
- `is_default`: `boolean`; optional. default=False.
- `id`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.128 `PaymentOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `user_id`: `string | null`; required.
- `order_id`: `string | null`; required.
- `target_type`: `string`; required.
- `target_id`: `string | null`; required.
- `provider`: `string`; required.
- `status`: `string`; required.
- `amount`: `integer`; required.
- `amount_tiyin`: `integer`; optional. default=0.
- `paid_amount`: `integer`; required.
- `paid_amount_tiyin`: `integer`; optional. default=0.
- `currency`: `string`; required.
- `payment_url`: `string`; required.
- `provider_payload`: `object`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.129 `PaymentSplitOut`

- `payment_id`: `string`; required.
- `gross_amount`: `integer`; required.
- `platform_fee`: `integer`; required.
- `seller_share`: `integer`; required.
- `provider_fee`: `integer`; required.
- `currency`: `string`; optional. default='UZS'.

### 47.130 `PayoutStatusUpdate`

- `status`: `string`; required.
- `note`: `string`; optional. default=''.

### 47.131 `PayrollIn`

- `employee_id`: `string`; required.
- `period`: `string`; required.
- `entry_type`: `string`; required.
- `title`: `string`; required.
- `amount`: `integer`; required.
- `currency`: `string`; optional. default='UZS'.
- `status`: `string`; optional. default='draft'.
- `paid_at`: `string(date-time) | null`; optional.
- `meta`: `object`; optional.

### 47.132 `PermissionOut`

- `code`: `string`; required.
- `title`: `string`; required.

### 47.133 `PositionIn`

- `code`: `string`; required. minLength=2; maxLength=80.
- `title`: `string`; required. minLength=2; maxLength=255.
- `category`: `string`; optional. default=''.
- `grade`: `string`; optional. default=''.
- `default_role_code`: `string`; optional. default=''.
- `description`: `string`; optional. default=''.
- `requirements`: `object`; optional.
- `status`: `string`; optional. default='active'.

### 47.134 `PromotionAnalyticsOut`

- `impressions`: `integer`; required.
- `search_appearances`: `integer`; required.
- `profile_clicks`: `integer`; required.
- `contact_requests`: `integer`; required.
- `series`: `array[object]`; required.
- `filters`: `object`; optional.

### 47.135 `PromotionCheckoutRequest`

- `package_id`: `string`; required.
- `days`: `integer | null`; optional.
- `provider`: `string`; optional. default='telegram_manual'.
- `service_id`: `string | null`; optional.
- `target_user_id`: `string | null`; optional.
- `organization_id`: `string | null`; optional.
- `placement`: `string | null`; optional.
- `banner_image_url`: `string`; optional. default=''.
- `banner_file_url`: `string`; optional. default=''.
- `banner_title`: `string`; optional. default=''.
- `banner_subtitle`: `string`; optional. default=''.
- `banner_cta_label`: `string`; optional. default=''.
- `banner_cta_url`: `string`; optional. default=''.
- `preview_context`: `object`; optional.
- `idempotency_key`: `string`; optional. default=''; maxLength=128.

### 47.136 `PromotionEventCreate`

- `promotion_id`: `string`; required.
- `event_type`: `string`; required.
- `source`: `string`; optional. default='marketplace'.
- `session_key`: `string`; optional. default=''; maxLength=128.
- `idempotency_key`: `string`; optional. default=''; maxLength=128.
- `metadata`: `object`; optional.

### 47.137 `PromotionStatusOut`

- `active`: `boolean`; required.
- `package_id`: `string | null`; optional.
- `days_left`: `integer`; optional. default=0.
- `ends_at`: `string(date-time) | null`; optional.
- `count`: `integer`; optional. default=0.
- `items`: `array[object]`; optional.
- `by_placement`: `map[string, array[object]]`; optional.

### 47.138 `RecordingPermissionUpdate`

- `allowed`: `boolean`; required.
- `reason`: `string`; optional. default=''.

### 47.139 `RefreshRequest`

- `refresh_token`: `string`; required. minLength=20.

### 47.140 `RegisterApprovalPendingResponse`

- `request_id`: `string`; required.
- `verification_id`: `string`; required.
- `status`: `string`; required.
- `role`: `UserRole`; required.
- `phone`: `string`; required.
- `name`: `string`; required.
- `message`: `string`; required.

### 47.141 `RegisterRequest`

- `role`: `UserRole`; required.
- `name`: `string`; required. minLength=2; maxLength=255.
- `first_name`: `string`; optional. default=''.
- `last_name`: `string`; optional. default=''.
- `middle_name`: `string`; optional. default=''.
- `region`: `string`; optional. default=''; maxLength=120.
- `phone`: `string`; required. minLength=7; maxLength=32.
- `password`: `string`; required. minLength=6; maxLength=128.
- `referral_code`: `string`; optional. default=''; maxLength=32.

### 47.142 `RegisterRequestOut`

- `id`: `string`; required.
- `verification_id`: `string`; required.
- `status`: `string`; required.
- `role`: `string`; required.
- `name`: `string`; required.
- `first_name`: `string`; optional. default=''.
- `last_name`: `string`; optional. default=''.
- `middle_name`: `string`; optional. default=''.
- `phone`: `string`; required.
- `region`: `string`; optional. default=''.
- `user_id`: `string | null`; optional.
- `payload`: `object`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.143 `RegisterStartResponse`

- `verification_id`: `string`; required.
- `phone`: `string`; required.
- `region`: `string`; optional. default=''.
- `expires_at`: `string(date-time)`; required.
- `telegram_bot_link`: `string | null`; optional.
- `message`: `string`; required.

### 47.144 `RegisterVerifyRequest`

- `verification_id`: `string`; required.
- `code`: `string`; required. minLength=4; maxLength=12.

### 47.145 `ReviewCreate`

- `case_id`: `string | null`; optional.
- `lawyer_user_id`: `string | null`; optional.
- `rating`: `integer`; required. minimum=1.0; maximum=5.0.
- `comment`: `string`; optional. default=''.

### 47.146 `ReviewModerationUpdate`

- `status`: `string`; required.
- `note`: `string`; optional. default=''.

### 47.147 `RoleCreate`

- `name`: `string`; required. minLength=2; maxLength=120.
- `title`: `string`; required. minLength=2; maxLength=255.
- `description`: `string`; optional. default=''.
- `permissions`: `array[string]`; optional.

### 47.148 `RoleOut`

- `id`: `string`; required.
- `name`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; required.
- `permissions`: `array[string]`; required.
- `created_at`: `string(date-time)`; required.

### 47.149 `ScheduleIn`

- `title`: `string`; required. minLength=2; maxLength=255.
- `employee_id`: `string | null`; optional.
- `org_unit_id`: `string | null`; optional.
- `schedule_type`: `string`; optional. default='weekly'.
- `timezone`: `string`; optional. default='Asia/Tashkent'.
- `weekly`: `array[object]`; optional.
- `status`: `string`; optional. default='active'.
- `effective_from`: `string(date-time) | null`; optional.
- `effective_to`: `string(date-time) | null`; optional.

### 47.150 `SecureChatMessageCreate`

- `message_type`: `string`; optional. default='text'.
- `content`: `string`; optional. default=''.
- `meta`: `object`; optional.

### 47.151 `SecureChatMessageOut`

- `message_type`: `string`; optional. default='text'.
- `content`: `string`; optional. default=''.
- `meta`: `object`; optional.
- `id`: `string`; required.
- `room_id`: `string`; required.
- `sender_user_id`: `string`; required.
- `sender`: `object | null`; optional.
- `reply_to_message_id`: `string | null`; optional.
- `reply_to`: `object | null`; optional.
- `filtered_content`: `string`; required.
- `is_blocked`: `boolean`; required.
- `block_reason`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.152 `SecureChatRoomCreate`

- `order_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `client_user_id`: `string | null`; optional.
- `seller_user_id`: `string | null`; optional.

### 47.153 `SecureChatRoomOut`

- `order_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `client_user_id`: `string | null`; optional.
- `seller_user_id`: `string | null`; optional.
- `id`: `string`; required.
- `status`: `string`; required.
- `auto_delete_hours`: `integer`; optional. default=0.
- `archived_until`: `string(date-time) | null`; optional.
- `last_message`: `object | null`; optional.
- `last_message_at`: `string(date-time) | null`; optional.
- `unread_count`: `integer`; optional. default=0.
- `has_unread`: `boolean`; optional. default=False.
- `last_read_at`: `string(date-time) | null`; optional.
- `participants`: `array[object]`; optional.
- `participant_count`: `integer`; optional. default=0.
- `urgent_advokat_request_ids`: `array[string]`; optional.
- `document_lawyer_request_ids`: `array[string]`; optional.
- `active_record_id`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.154 `SellerVerificationCreate`

- `check_type`: `string`; required.
- `status`: `string`; optional. default='pending'.
- `provider`: `string`; optional. default='manual'.
- `payload`: `object`; optional.

### 47.155 `SellerVerificationOut`

- `check_type`: `string`; required.
- `status`: `string`; optional. default='pending'.
- `provider`: `string`; optional. default='manual'.
- `payload`: `object`; optional.
- `id`: `string`; required.
- `lawyer_profile_id`: `string`; required.
- `reviewer_user_id`: `string | null`; required.
- `reviewed_at`: `string(date-time) | null`; required.
- `created_at`: `string(date-time)`; required.

### 47.156 `ServiceCategoryCreate`

- `slug`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.

### 47.157 `ServiceCategoryOut`

- `slug`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.
- `id`: `string`; required.
- `is_active`: `boolean`; optional. default=True.
- `subcategories`: `array[object]`; optional.
- `subcategories_count`: `integer`; optional. default=0.
- `services_count`: `integer`; optional. default=0.
- `created_at`: `string(date-time)`; required.

### 47.158 `ServiceOrderCreate`

- `service_id`: `string`; required.
- `package_id`: `string | null`; optional.
- `lawyer_user_id`: `string | null`; optional.
- `source`: `string`; optional. default='ai'.
- `details`: `object`; optional.

### 47.159 `ServiceOrderOut`

- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `client_user_id`: `string | null`; required.
- `service_id`: `string`; required.
- `package_id`: `string | null`; optional.
- `lawyer_user_id`: `string | null`; required.
- `status`: `string`; required.
- `payment_status`: `string`; required.
- `contact_unlocked`: `boolean`; required.
- `source`: `string`; required.
- `details`: `object`; required.
- `price`: `integer`; required.
- `price_tiyin`: `integer`; optional. default=0.
- `currency`: `string`; required.
- `service_title`: `string`; optional. default=''.
- `lawyer_name`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.160 `SessionOut`

- `id`: `string`; required.
- `device_label`: `string`; optional. default=''.
- `ip`: `string`; optional. default=''.
- `status`: `string`; required.
- `expires_at`: `string(date-time)`; required.
- `last_used_at`: `string(date-time)`; required.
- `created_at`: `string(date-time)`; required.

### 47.161 `SosCreate`

- `category`: `string`; optional. default='urgent'.
- `description`: `string`; required.
- `phone`: `string | null`; optional.
- `latitude`: `number | null`; optional.
- `longitude`: `number | null`; optional.
- `region`: `string`; optional. default='tashkent'.
- `voice_file_id`: `string | null`; optional.

### 47.162 `SourceOut`

- `title`: `string`; required.
- `url`: `string`; required.
- `snippet`: `string | null`; optional.

### 47.163 `StudioAccessGrantCreate`

- `user_id`: `string`; required.
- `constructor_code`: `string`; optional. default='\*'.
- `role`: `string`; optional. default='studio_editor'.
- `roles`: `array[string]`; optional.
- `constructor_codes`: `array[string]`; optional.
- `is_active`: `boolean`; optional. default=True.
- `expires_at`: `string(date-time) | null`; optional.

### 47.164 `StudioActivityHeartbeatPayload`

- `session_id`: `string | null`; optional.
- `constructor_code`: `string`; required. minLength=2; maxLength=40.
- `object_id`: `string | null`; optional.
- `version_id`: `string | null`; optional.
- `save_count_delta`: `integer`; optional. default=0.
- `meta`: `object`; optional.

### 47.165 `StudioApprovalRouteUpsert`

- `constructor_code`: `string`; required. minLength=2; maxLength=40.
- `title`: `string`; required. minLength=2; maxLength=255.
- `steps`: `array[object]`; optional.
- `final_action`: `string`; optional. default='approve'.
- `allow_self_approval`: `boolean`; optional. default=False.
- `change_request_restart`: `string`; optional. default='current'.
- `deadline_hours`: `integer`; optional. default=24; minimum=1.0; maximum=8760.0.
- `reminders`: `array[object]`; optional.
- `status`: `string`; optional. default='active'.

### 47.166 `StudioCommentCreate`

- `comment`: `string`; required. minLength=1; maxLength=4000.

### 47.167 `StudioObjectCreate`

- `constructor_code`: `string`; required. minLength=2; maxLength=40.
- `title`: `string`; required. minLength=2; maxLength=255.
- `payload`: `object`; optional.
- `assigned_user_id`: `string | null`; optional.
- `work_plan_id`: `string | null`; optional.
- `runtime_target_type`: `string`; optional. default=''.
- `runtime_target_id`: `string`; optional. default=''.
- `version`: `string`; optional. default='1.0'.

### 47.168 `StudioObjectSave`

- `title`: `string | null`; optional.
- `payload`: `object`; optional.
- `summary`: `string`; optional. default=''.
- `version`: `string | null`; optional.
- `expected_lock_version`: `integer | null`; optional.

### 47.169 `StudioPublishPayload`

- `force`: `boolean`; optional. default=False.
- `note`: `string`; optional. default=''.

### 47.170 `StudioReleaseCreate`

- `title`: `string`; required. minLength=2; maxLength=255.
- `description`: `string`; optional. default=''.
- `environment`: `string`; optional. default='production'.
- `object_ids`: `array[string]`; required.

### 47.171 `StudioReviewPayload`

- `decision`: `string`; required.
- `comment`: `string`; optional. default=''.

### 47.172 `StudioRollbackPayload`

- `version_id`: `string`; required.
- `note`: `string`; optional. default=''.

### 47.173 `SubscriptionAutoRenewUpdate`

- `auto_renew`: `boolean`; required.
- `payment_method_id`: `string | null`; optional.
- `provider_customer_id`: `string | null`; optional.

### 47.174 `SubscriptionPlanCreate`

- `slug`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.
- `monthly_price`: `integer`; optional. default=0.
- `audience`: `string`; optional. default=''.
- `six_month_price`: `integer`; optional. default=0.
- `yearly_price`: `integer`; optional. default=0.
- `prepaid_yearly_price`: `integer`; optional. default=0.
- `benefits`: `array[string]`; optional.
- `is_giftable`: `boolean`; optional. default=False.
- `is_active`: `boolean`; optional. default=True.
- `sort_order`: `integer`; optional. default=0.
- `name`: `map[string, string]`; optional.
- `features`: `map[string, array[string]]`; optional.
- `functions`: `array[object]`; optional.
- `billing_type`: `string`; optional. default='subscription'.
- `allowed_billing_periods`: `array[string]`; optional.
- `allowed_gift_durations`: `array[integer]`; optional.
- `target_roles`: `array[string]`; optional.
- `auto_charge_provider`: `string`; optional. default='atmos'.

### 47.175 `SubscriptionPlanOut`

- `slug`: `string`; required.
- `title`: `string`; required.
- `description`: `string`; optional. default=''.
- `monthly_price`: `integer`; optional. default=0.
- `audience`: `string`; optional. default=''.
- `six_month_price`: `integer`; optional. default=0.
- `yearly_price`: `integer`; optional. default=0.
- `prepaid_yearly_price`: `integer`; optional. default=0.
- `benefits`: `array[string]`; optional.
- `is_giftable`: `boolean`; optional. default=False.
- `is_active`: `boolean`; optional. default=True.
- `sort_order`: `integer`; optional. default=0.
- `name`: `map[string, string]`; optional.
- `features`: `map[string, array[string]]`; optional.
- `functions`: `array[object]`; optional.
- `billing_type`: `string`; optional. default='subscription'.
- `allowed_billing_periods`: `array[string]`; optional.
- `allowed_gift_durations`: `array[integer]`; optional.
- `target_roles`: `array[string]`; optional.
- `auto_charge_provider`: `string`; optional. default='atmos'.
- `id`: `string`; required.
- `monthly_price_tiyin`: `integer`; optional. default=0.
- `six_month_price_tiyin`: `integer`; optional. default=0.
- `yearly_price_tiyin`: `integer`; optional. default=0.
- `prepaid_yearly_price_tiyin`: `integer`; optional. default=0.
- `entitlements`: `object`; optional.
- `created_at`: `string(date-time)`; required.

### 47.176 `SubscriptionPurchaseOut`

- `work_id`: `string`; optional. default=''.
- `payment`: `PaymentOut`; required.
- `subscription_id`: `string`; required.
- `status`: `string`; required.
- `next_billing_at`: `string(date-time) | null`; optional.

### 47.177 `SubscriptionPurchaseRequest`

- `billing_period`: `string`; optional. default='monthly'.
- `provider`: `string`; optional. default='atmos'.
- `currency`: `string`; optional. default='UZS'.
- `auto_renew`: `boolean`; optional. default=True.
- `payment_method_id`: `string | null`; optional.
- `provider_customer_id`: `string | null`; optional.
- `family_members`: `array[object]`; optional.
- `provider_payload`: `object`; optional.

### 47.178 `TaskStatusUpdate`

- `status`: `string`; required.

### 47.179 `TaskUpdate`

- `title`: `string | null`; optional.
- `status`: `string | null`; optional.
- `priority`: `string | null`; optional.
- `due_date`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `case_title`: `string | null`; optional.
- `checklist`: `array[object] | null`; optional.
- `description`: `string | null`; optional.
- `assignee_user_id`: `string | null`; optional.

### 47.180 `TotpEnableRequest`

- `setup_id`: `string`; required.
- `code`: `string`; required. minLength=6; maxLength=6.

### 47.181 `TotpSetupOut`

- `setup_id`: `string`; required.
- `secret`: `string`; required.
- `otpauth_url`: `string`; required.
- `qr_code`: `string`; required.
- `expires_at`: `string(date-time)`; required.
- `method`: `string`; optional. default='totp'.

### 47.182 `TwoFactorStartOut`

- `verification_id`: `string`; required.
- `phone`: `string`; required.
- `expires_at`: `string(date-time)`; required.
- `purpose`: `string`; required.
- `message`: `string`; required.

### 47.183 `TwoFactorVerifyRequest`

- `verification_id`: `string`; required.
- `code`: `string`; required. minLength=4; maxLength=12.

### 47.184 `UnreadCountOut`

- `count`: `integer`; required.

### 47.185 `UserOut`

- `id`: `string`; required.
- `lexgo_id`: `string`; optional. default=''.
- `role`: `UserRole`; required.
- `name`: `string`; required.
- `first_name`: `string`; optional. default=''.
- `last_name`: `string`; optional. default=''.
- `middle_name`: `string`; optional. default=''.
- `phone`: `string`; required.
- `region`: `string`; optional. default=''.
- `referral_code`: `string`; optional. default=''.
- `referred_by_user_id`: `string | null`; optional.
- `account_status`: `string`; optional. default='active'.
- `roles`: `array[string]`; optional.
- `permissions`: `array[string]`; optional.
- `phone_verified`: `boolean`; optional. default=False.
- `two_factor_enabled`: `boolean`; optional. default=False.
- `two_factor_method`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.

### 47.186 `UserRole`

- Qiymatlar: `client`, `yurist`, `advokat`, `advokat_tashkiloti`, `admin`, `manager`, `call_center`, `sales`

### 47.187 `ValidationError`

- `loc`: `array[string | integer]`; required.
- `msg`: `string`; required.
- `type`: `string`; required.

### 47.188 `WarrantyClaimCreate`

- `case_id`: `string | null`; optional.
- `reason`: `string`; required.
- `kind`: `string`; optional. default='replacement'.

### 47.189 `WorkItemIn`

- `title`: `string`; required. minLength=2; maxLength=255.
- `description`: `string`; optional. default=''.
- `project`: `string`; optional. default=''.
- `responsible_employee_id`: `string | null`; optional.
- `org_unit_id`: `string | null`; optional.
- `priority`: `string`; optional. default='normal'.
- `deadline_at`: `string(date-time) | null`; optional.
- `checklist`: `array[object]`; optional.
- `participants`: `array[object]`; optional.
- `attachments`: `array[object]`; optional.
- `meta`: `object`; optional.

### 47.190 `WorkItemStatusIn`

- `status`: `string`; required.
- `comment`: `string`; optional. default=''.
- `checklist`: `array[object] | null`; optional.

### 47.191 `WorkspaceDocumentRequestCreate`

- `client_user_id`: `string`; required.
- `title`: `string`; required.
- `folder_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `message`: `string`; optional. default=''.

### 47.192 `WorkspaceDocumentRequestOut`

- `id`: `string`; required.
- `client_user_id`: `string`; required.
- `requested_by_user_id`: `string`; required.
- `requested_by_name`: `string`; optional. default=''.
- `title`: `string`; required.
- `folder_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `message`: `string`; optional. default=''.
- `status`: `string`; required.
- `file`: `object | null`; optional.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.193 `WorkspaceFileCommentCreate`

- `text`: `string`; required.

### 47.194 `WorkspaceFileCommentOut`

- `id`: `string`; required.
- `file_id`: `string`; required.
- `text`: `string`; required.
- `author_user_id`: `string`; required.
- `author_name`: `string`; optional. default=''.
- `created_at`: `string(date-time)`; required.

### 47.195 `WorkspaceFileOut`

- `folder_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `file_name`: `string`; required.
- `file_url`: `string`; optional. default=''.
- `mime_type`: `string`; optional. default='application/octet-stream'.
- `size`: `integer`; optional. default=0.
- `starred`: `boolean`; optional. default=False.
- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `owner_user_id`: `string`; required.
- `download_url`: `string`; optional. default=''.
- `extension`: `string`; optional. default=''.
- `scan`: `object`; optional.
- `status`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.196 `WorkspaceFileUpdate`

- `folder_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `file_name`: `string | null`; optional.
- `starred`: `boolean | null`; optional.
- `status`: `string | null`; optional.

### 47.197 `WorkspaceFileVersionCreate`

- `file_name`: `string | null`; optional.
- `file_url`: `string`; optional. default=''.
- `mime_type`: `string`; optional. default='application/octet-stream'.
- `size`: `integer`; optional. default=0.
- `note`: `string`; optional. default=''.

### 47.198 `WorkspaceFileVersionOut`

- `id`: `string`; required.
- `file_id`: `string`; required.
- `version`: `integer`; required.
- `file_name`: `string`; required.
- `file_url`: `string`; required.
- `download_url`: `string`; optional. default=''.
- `mime_type`: `string`; required.
- `size`: `integer`; required.
- `note`: `string`; optional. default=''.
- `created_by_user_id`: `string`; required.
- `created_at`: `string(date-time)`; required.

### 47.199 `WorkspaceFolderCreate`

- `name`: `string`; required.
- `parent_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `starred`: `boolean`; optional. default=False.

### 47.200 `WorkspaceFolderOut`

- `name`: `string`; required.
- `parent_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `starred`: `boolean`; optional. default=False.
- `id`: `string`; required.
- `work_id`: `string`; optional. default=''.
- `owner_user_id`: `string`; required.
- `size`: `integer`; optional. default=0.
- `file_count`: `integer`; optional. default=0.
- `folder_count`: `integer`; optional. default=0.
- `status`: `string`; required.
- `created_at`: `string(date-time)`; required.
- `updated_at`: `string(date-time)`; required.

### 47.201 `WorkspaceFolderUpdate`

- `name`: `string | null`; optional.
- `parent_id`: `string | null`; optional.
- `case_id`: `string | null`; optional.
- `starred`: `boolean | null`; optional.
- `status`: `string | null`; optional.

### 47.202 `ZoomMeetingOut`

- `join_url`: `string`; required.
- `start_url`: `string`; required.
- `meeting_id`: `string`; required.
- `provider`: `string`; optional. default='livekit'.
- `livekit_url`: `string`; optional. default=''.
- `livekit_room`: `string`; optional. default=''.
- `livekit_token`: `string`; optional. default=''.
- `connection_hints`: `object`; optional.
- `quality_policy`: `object`; optional.

### 47.203 `ai_assistant__AiAssistantRequest`

- `message`: `string`; required.
- `session_id`: `string`; required.
- `current_page`: `AiCurrentPage`; optional.
- `locale`: `string`; optional. default='uz'.
- `client_time`: `string`; optional. default=''.
- `request_id`: `string`; optional.

### 47.204 `marketplace_schemas__AiAssistantRequest`

- `prompt`: `string`; required.
- `context`: `object`; optional.

<!-- GENERATED_SCHEMA_INDEX_END -->

## 48. Hujjatni yangilash qoidasi

Backendga yangi endpoint, role, permission, status yoki realtime event qo'shilsa:

1. Shu canonical fayl yangilanadi.
2. API inventari production kodidan qayta generatsiya qilinadi.
3. Mobile contract testlar yangilanadi.
4. Eski endpoint deprecated bo'lsa migration sanasi yoziladi.
5. Release note mobile jamoaga yuboriladi.

Bu faylga zid bo'lgan eski mobil hujjatda yangi sana yoki production contract bo'lmasa, ushbu fayl ustun hisoblanadi.