# LexGo: loyiha maqsadi, rollar va rollararo mantiq

Sana: 2026-10-10  
Holat: tahliliy ma'lumotnoma (mobil jamoa uchun "nima uchun va kim uchun")  
Til: o'zbek (lotin)  
Hujjat turi: faqat o'qish uchun tahlil; hech qanday kod o'zgartirilmagan.

## 0. Bu hujjat haqida

**Maqsad.** Mobil ilovani qurishdan oldin LexGo'ning *nima uchun mavjudligini*, *kim bilan ishlashini*, *qanday pul ishlashini* va *rollar bir-biriga ishni qanday topshirishini* bir joyda ko'rsatish. Texnik shartnoma (endpoint, header, token) uchun `mobile/TZ.md` o'qiladi; bu hujjat uni to'ldiradi.

**Manbalar** (kanonik - TZ, qolganlari tasdiqlash uchun):

| Belgi | Manba |
|---|---|
| **TZ** | `mobile/TZ.md` - 48 bo'lim, 535 path / 630 operatsiya; §0-45 qo'lda yozilgan, §46-47 avtomatik inventar |
| **Veb** | `law-main` (Next.js): `lib/auth.tsx`, `components/admin/AdminShell.tsx`, `components/portal/*`, `lib/services/*`, `messages/uz.json` va rol portallari |
| **Jonli** | staging backend (faqat GET): `/admin/roles`, `/admin/permissions`, `/admin/permission-matrix`, `/admin/platform/policies`, `/subscription-plans`, `/urgent-advokat/catalog`, `/promotions/packages`, ro'yxat endpointlari; 4 test akkaunt (superadmin, admin, sales_operator, client) bilan 403/200 tekshiruvi |
| **Mobil** | `mobile/app/**`, `mobile/src/**` (kod holati 2026-10-10) |

**Belgilar.** `TZ §x` - TZ bo'limi; prefikssiz `§x` (masalan `§9.3`) - shu hujjatning o'z bo'limi. **(taxmin)** - TZ/kod/backend'da yozilmagan, men xulosa qilgan joy. Tokenlar, parollar va UUID'lar hujjatga kiritilmagan; ID sifatida `work_id` prefikslari (`ADV-`, `SPT-`...) ishlatiladi.

**Cheklov.** Yozish amallari (to'lov, tasdiq, claim, publish) jonli backend'da sinalmagan, shu sabab ular TZ va veb kodiga tayanadi. Rollarning faqat to'rt turi (superadmin, admin, sales_operator, client) jonli tekshirildi; advokat, yurist, call-center yuristi akkauntlari Telegram OTP talab qilgani uchun jonli tekshirilmadi.

## Qisqa xulosa

1. **LexGo nima:** AI + onlayn xizmatlar + advokatlar marketplace'i + "Shaxsiy advokat" obunasi + call-center xizmat qatlami. Uch tomon: mijoz, sotuvchi (advokat/yurist/tashkilot), platforma xodimlari (§1).
2. **Pul qanday keladi:** marketplace komissiyasi 18% (+provayder 1%); client obunalari 149 000 / 349 000 so'm/oy; tezkor advokat 80 000-250 000 so'm; hujjat tekshiruvi 149 000 dan; reklama 149 000-399 000; AI tariflari 49 000 / 99 000; B2B; sovg'a obuna; referral (§2).
3. **Rollar:** backend'da 8 ta asosiy rol, ~14 ta biriktirilgan rol, 35 ta permission kodi, 2 ta overlay (ichki HRM xodimi, Studio grant). Qaror qoidasi: *permission-first*. Staff akkauntlarining API `role` maydoni `client` bo'lib qaytadi, haqiqiy rollar `roles[]` da (§4).
4. **Asosiy rollararo oqimlar:** navbatchi advokat hujjati (client -> call-center pool -> advokat/editor -> baho -> sifat nazorati); marketplace buyurtma (client -> Telegram to'lov -> seller -> bosqichlar -> payout); tezkor advokat (client -> operator -> advokat/uchrashuv); support (client -> AI -> operator -> assist); seller onboarding (ariza -> 4 bandli admin tekshiruvi) (§6).
5. **Mobil holat:** admin/staff paneli (30 modul, HRM, chat, LiveKit, xavfsizlik) tayyor; client oqimlari qisman (hujjat uch usuli, tezkor advokat, support, baho, "Ishlar/Xabarlar" yo'q); advokat/yurist, tashkilot egasi va call-center qobiqlari yo'q; push, deep link, offline kesh, OnlyOffice yo'q (§8).
6. **Eng muhim ziddiyatlar:** (a) biriktirilgan staff rollari 2FA'siz kiradi; (b) ikkita marketplace xarid yo'li; (c) bildirishnoma payload'i TZ bilan mos emas; (d) `call_center_lawyer`, tashkilot egasi, sales va maxsus rollar uchun navigatsiya yo'q; (e) payout muddati/referral foizi/tarif narxlari manbalar orasida farq qiladi; (f) TZ inventaridagi ~25 modul uchun oqim yozilmagan (§9).

## Mundarija

1. [Loyiha maqsadi va qiymat taklifi](#1-loyiha-maqsadi-va-qiymat-taklifi)
   - 1.1 LexGo nima · 1.2 Hal qilinadigan muammolar · 1.3 Qiymat taklifi · 1.4 Ishonch va kafolat mexanizmlari
2. [Biznes model va pul oqimlari](#2-biznes-model-va-pul-oqimlari)
   - 2.1 Daromad manbalari · 2.2 Buyurtma to'lov siyosati · 2.3 Payout · 2.4 To'lov usullari · 2.5 Referral, gift
3. [Modullar xaritasi](#3-modullar-xaritasi)
   - 3.1 Modullar ro'yxati · 3.2 TZ'da oqimi yo'q modullar
4. [Rollar](#4-rollar)
   - 4.0 Rol modeli va jamlama jadval · 4.1 Client · 4.2 Advokat · 4.3 Yurist · 4.4 Advokat tashkiloti / egasi · 4.5 Call-center operatori · 4.6 Call-center yuristi · 4.7 Sales (sales, sales_operator, sales_head) · 4.8 Admin · 4.9 Superadmin · 4.10 Manager · 4.11 Finance · 4.12 Quality control · 4.13 Moderator · 4.14 B2B menejer · 4.15 Marketing · 4.16 Content manager · 4.17 CEO viewer · 4.18 Executive · 4.19 Provider · 4.20 Ichki xodim (HRM) · 4.21 Studio
5. [Role x modul / permission matritsasi](#5-role-x-modul--permission-matritsasi)
   - 5.1 Rol -> permission · 5.2 Staff x admin modullar · 5.3 Foydalanuvchi modullari · 5.4 Permission -> nima ochadi · 5.5 Jonli tasdiqlash
6. [Rollararo oqimlar va status mashinalari](#6-rollararo-oqimlar-va-status-mashinalari)
   - 6.1 Client onboarding · 6.2 AI · 6.3 Hujjat (navbatchi advokat) · 6.4 Hujjat tahlili · 6.5 Marketplace buyurtma · 6.6 Tezkor advokat · 6.7 Support · 6.8 Baho va sifat · 6.9 Seller onboarding · 6.10 Tashkilot · 6.11 CRM · 6.12 Reklama · 6.13 Qo'ng'iroq · 6.14 Refund / almashtirish · 6.15 Obuna, gift, referral · 6.16 Studio · 6.17 HRM · 6.18 Realtime hodisalar · 6.19 Status mashinalari
7. [Realtime, bildirishnoma va xavfsizlik](#7-realtime-bildirishnoma-va-xavfsizlik-qoidalari-qisqa)
8. [Mobil ilova: maqsad va hozirgi holat](#8-mobil-ilova-maqsad-va-hozirgi-holat)
9. [Ziddiyatlar, bo'shliqlar va ochiq savollar](#9-ziddiyatlar-bo-shliqlar-va-ochiq-savollar)


## 1. Loyiha maqsadi va qiymat taklifi

### 1.1 LexGo nima

LexGo - O'zbekistonda yuridik xizmatni "bir necha tegishda" olish uchun qurilgan **yuridik xizmatlar ekotizimi**. Veb-saytning o'zi uni shunday ta'riflaydi: "sun'iy intellekt, onlayn xizmatlar, advokatlar marketplace va shaxsiy advokat obunasi" (web `messages/uz.json` -> `footer.about`; bosh sahifa sarlavhasi: "Yuridik yordam endi bir necha tegishda"). Platforma bitta backend (`https://lexgo.api.cognilabs.org`) ustida ishlaydigan veb-sayt (Next.js), mobil ilova (Expo) va ichki xodimlar paneli (admin, HRM, Studio) dan iborat (TZ §0).

LexGo bir vaqtning o'zida **uch tomonli bozor**:

1. **Mijoz (client)** - fuqaro, YaTT yoki yuridik shaxs; yuridik muammosi bor, lekin to'g'ri advokatni, narxni va natijaga kafolatni bilmaydi.
2. **Taklif tomoni (seller)** - advokat, yurist va advokat tashkilotlari; yangi mijoz va ish yuritish tizimi (ish, kalendar, hujjat, chat) kerak.
3. **Platforma xodimlari** - call-center (navbatchi operator va navbatchi yurist), sotuv, sifat nazorati, moliya, admin: marketplace'ni "qo'l bilan" ishlatib turadigan, mijozga yordam beradigan va xavfni boshqaradigan qatlam.

### 1.2 Hal qilinadigan muammolar (web `home.problem`)

| # | Mijoz og'rig'i | LexGo javobi |
|---|---|---|
| 1 | To'g'ri advokatni topa olmaslik | AI qidiruv + marketplace filtrlari (hudud, soha, reyting, narx), tasdiqlangan profillar, "Tavsiya etiladi" boost |
| 2 | Narx "qorong'u quti" | Xizmat narxi oldindan ko'rinadi, narxni LexGo belgilaydi (seller narxi admin belgilagan oraliqda), komissiya narx ichida |
| 3 | Advokat yo'qolib qolsa kafolat yo'q | LexGo Warranty: to'lov platforma ichida, bosqichli (milestone) to'lov, escrow, advokatni almashtirish, shikoyat va bepul qayta ishlash |
| 4 | Hujjat, to'lov, sud sanasi, xabarlar tarqoq | Bitta ilovada: hujjat konstruktori, "Mening ishlarim", secure chat/call, kalendar, to'lov cheklari |

### 1.3 Qiymat taklifi (kim uchun nima)

**Mijoz uchun:** (a) AI'dan tezkor bepul javob (dastlabki 5 so'rov), (b) hujjatni 5 daqiqada tayyorlash (qo'lda / AI bilan / navbatchi advokat bilan), (c) tayyor hujjatni advokatga tekshirtirish (60 daqiqagacha SLA), (d) tezkor advokat (video, audio, chat, ikkinchi fikr, YTX) 24/7, (e) marketplace'da tasdiqlangan advokat/yurist tanlash va xavfsiz xarid, (f) "Shaxsiy advokat" obunasi: cheksiz 30 daqiqalik konsultatsiya, hujjat tekshiruvi, 200+ shablon, oila a'zolari qamrovi (TZ §26; `/subscription-plans`).

**Advokat/yurist uchun:** yangi mijoz oqimi, komissiya faqat bajarilgan buyurtmadan (18%, oldindan to'lov yo'q), ish yuritish tizimi (Case Command Center, kalendar, conflict check, workspace 1 GB+ saqlash, AI yordamchi), reklama/boost orqali ko'rinish, payout (haftalik) - web `forLawyers`.

**Tashkilot uchun:** a'zolar, ularning xizmatlari, yuklama (workload) va daromadni bitta paneldan boshqarish (TZ §32).

**Platforma uchun:** komissiya, obuna, tezkor xizmat, reklama, B2B va hujjat xizmatlaridan daromad; call-center va sotuv orqali "qo'l bilan" konversiya; sifat nazorati orqali brend ishonchi.

### 1.4 Ishonch va kafolat mexanizmlari

- **To'lov faqat platforma ichida.** Kontaktlar (telefon, shaxsiy chat) to'lov/avansdan keyin ochiladi (`contact_unlocked`); chatdagi tashqi kontaktlar AI orqali bloklanadi (web `warranty.rules`). Public ro'yxatda telefon ko'rsatilmaydi (TZ §18).
- **Bosqichli to'lov.** Buyurtma: avans 10% -> kontakt ochiladi; qolgan 90% bosqichlar bo'yicha (`payment.mode = per_milestone`); mijoz "Ishni tasdiqlash" bosganda bosqich puli sotuvchiga o'tadi (web `portal.payment.milestones`; backend `/admin/platform/policies`).
- **Tekshirilgan sotuvchi (Verified badge).** 4 qadam: telefon OTP, shaxs va kasbiy hujjatlar (litsenziya, diplom, selfie) moderator tomonidan ko'rib chiqiladi, yo'nalish/staj/hudud tekshiruvi, qoidalarga rozilik. Tasdiqlanmagan seller marketplace'da chiqmaydi va xizmat sota olmaydi (TZ §18, §31).
- **Reyting va shikoyat.** Ish `completed` bo'lgach clientda 15 daqiqalik baho/shikoyat oynasi ochiladi (TZ §25); asosli shikoyat -> advokat bepul qayta ishlaydi (call-center sifat navbati); 1-2 yulduzli baho shikoyatga olib boradi (web `portal.client.rate`).
- **Almashtirish va qaytarish.** Mijoz advokat almashtirishni so'rashi mumkin, menejer 24 soat ichida javob beradi; qaytarish (refund) va almashtirish "4 ko'z" (admin + menejer) tasdig'ini talab qiladi (`/approvals/info`).
- **AI yuridik qaror emas.** "Yakuniy huquqiy qaror advokatda qoladi"; har AI xizmatning yonida advokat varianti bor; PII (telefon, PINFL, pasport) AI'ga yuborishdan oldin maskalanadi (web `faq`, `chatPage.piiNote`).
- **Secure chat.** Shifrlangan; o'chirilgan chat 1 oy arxivlanadi (web `secureChat.archiveNote`).

## 2. Biznes model va pul oqimlari

> Raqamlar uch manbadan: **(B)** jonli staging backend (`GET /subscription-plans`, `/admin/platform/policies`, `/urgent-advokat/catalog`, `/promotions/packages`), **(W)** veb kodi/matnlari, **(T)** TZ. Backend qiymatlari admin tomonidan o'zgartirilishi mumkin - mobil ilova ularni hardcode qilmasligi shart (TZ §8, §30).

### 2.1 Daromad manbalari

| # | Manba | Kim to'laydi | Qancha / qoida | Manba |
|---|---|---|---|---|
| 1 | **Marketplace komissiyasi** | Seller (narx ichiga kiritilgan) | Platforma ulushi **18%**, provayder (to'lov tizimi) to'lovi **1%**, qolgani seller ulushi. Haqiqiy payout namunasi: yalpi 10 000 -> platforma 1 800, provayder 100, seller 8 100. Komissiya mijozga ko'rsatilmaydi. Referral zinasi: asosiy 18%, 5 ta taklif qilingan seller -> 16%, 10 -> 15%, 20 -> 13% (web `ReferralProgress.tsx`) | B, W |
| 2 | **"Shaxsiy advokat" obunasi** | Client | Standard **149 000**/oy; Premium **349 000**/oy. 6 oylik -5% (Standard 849 300; Premium 1 989 300), yillik -10% (1 609 200; 3 769 200), oldindan to'lanadigan yillik yana -10% (1 448 280; 3 392 280). Standard: cheksiz 30 daqiqalik konsultatsiya, hujjat tekshiruvi 10 sahifagacha, 200+ shablon, qo'shimcha xizmatlarga 25% chegirma, LexGo.AI'ga 10% chegirma, jinoiy-ma'muriy sohada tezkor advokat 25% chegirma, turmush o'rtoq qamrovi. Premium: 25 sahifagacha tekshiruv, har 3 oyda 1 soatlik biznes konsultatsiya (6 oydan keyin), oyiga 1 ta mualliflik huquqi ro'yxati, istalgan sohada tezkor advokat -25%, ota-ona/turmush o'rtoq/farzandlar qamrovi | B |
| 3 | **Sovg'a obunasi (gift)** | Sovg'a beruvchi | Reja `shaxsiy-advokat-gift`; 3/6/12 oy oldindan to'lov; havola + QR; muddat qabul qiluvchi ro'yxatdan o'tganda boshlanadi (TZ §3.3 giftlar; `/gifts`) | B, W |
| 4 | **LexGo.AI tariflari** | Client / seller | Free: oyiga 5 AI so'rov + 1 hujjat tahlili; Lite **49 000**/oy (100 so'rov, 5 tahlil, eksport); Pro **99 000**/oy (1000 fair-use so'rov, 20 tahlil, 50 sahifagacha fayl tahlili, sud amaliyoti qidiruvi, PDF/DOCX eksport); "jismoniy shaxs" cheksiz AI tarifi 45 000/oy, uning faol seller uchun 50% chegirmali varianti 22 500/oy | B |
| 5 | **Tezkor advokat (urgent)** | Client | Katalog: oddiy videokonsultatsiya **150 000**; express video **220 000**; YTX konsultatsiyasi **180 000**; chat **80 000**; ikkinchi fikr yakka: video **250 000** / chat **150 000**; guruh (2-7 advokat): video **200 000** / chat **120 000** *har bir advokat uchun*. Uchrashuv standarti 30 daqiqa, bepul uzaytirish 1 marta 3 daqiqa, pullik uzaytirish **2 000 so'm/daqiqa** | B |
| 6 | **Hujjat tahlili / advokat tekshiruvi** | Client | Siyosat: 1-10 bet **149 000**, 11-20 bet **299 000**, 21-30 bet **499 000**, har qo'shimcha bet **15 000**, shoshilinch **+50%**, yozma xulosa **99 000**. Obuna doirasidagi bepul sahifalar (10/25) dan oshsa server qo'shimcha to'lov "quote" qaytaradi va Telegram inline tasdig'ini kutadi (TZ §16) | B, T |
| 7 | **Hujjat konstruktori** | Client | Obunasiz: oyiga 3 ta bepul yuklab olish, keyin hujjat boshiga 19 000; "to'ldirishda yordam" 399 000 (veb kodida hardcode); obunada cheksiz (web `portal.client.documents.downloadPolicy`) | W |
| 8 | **Reklama / promotion** | Seller | 7 kunlik profil boost **149 000**; 14 kunlik "Featured profile" **249 000**; 7 kunlik xizmat boost (qidiruvda yuqori) **199 000**; 7 kunlik marketplace banner **399 000**. Boost faqat ko'rinishga ta'sir qiladi, huquqiy natijaga emas (TZ §20; `/promotions/packages`) | B |
| 9 | **Maxfiy (pullik) chat** | Client | Buyurtmasiz shaxsiy chat 10 000 so'm (veb `checkout.ts`) | W |
| 10 | **B2B** | Biznes mijoz | Veb matnida: Start 2 900 000/oy, Growth 6 400 000/oy, Enterprise kelishuv bo'yicha; ayni paytda backend'da yashirin "biznes-abonent-*" rejalari (3.5 mln / 6 mln / 12 mln oyiga). `GET /b2b/products` hozir bo'sh. B2B menejer shartnoma, hisob-faktura, oylik hisobot yuritadi | W, B |
| 11 | **Akademiya** | Yurist/talaba | Kurslar `/academy/courses/catalog` dan (hozir 2 ta kurs; narxlar backend'da) | B |
| 12 | **Upsell** | Client | `/upsell/offers` mavjud, hozir bo'sh (taxmin: buyurtma ustiga qo'shimcha xizmat taklifi) | B |

### 2.2 Buyurtma to'lov siyosati (jonli `payment`/`order` siyosati)

- `platform_commission_percent = 18`, `provider_fee_percent = 1`, `mode = per_milestone`, `refund_review_business_days = 3`, takroriy webhook idempotentligi yoqilgan.
- `advance_percent = 10`, `final_percent = 90`; mijoz tasdiqlash oynasi **30 daqiqa**, seller javob muddati **30 ish daqiqasi**.
- Seller narx oralig'i: bazaviy narxning **70-100%**; ustama koeffitsientlar: staj 0-2 yil +0%, 3-5 yil +10%, 6-10 yil +15%, 11+ yil +20%; hudud koeffitsienti Toshkent 1.15, Samarqand 1.05, masofaviy 0.9; "seller premium" +20% (muvaffaqiyat >=85%, >=20 ish, >=50 g'alaba, reyting 5, >=20 sharh); mijoz reytingi premiumi +10% (>=4.8 va >=10 sharh); sohadagi tasdiqlangan staj (>=5 yil) +30% (TZ §19 "ceiling backenddan olinadi").
- Yurist (`seller_type=yurist`) `criminal-*` va `administrative-*` xizmatlarini sota olmaydi ("advokat_required"), advokat va tashkilot cheklanmaydi (`GET /admin/permission-matrix` -> `seller_rules`).

### 2.3 Payout (sotuvchiga pul chiqarish)

- Har to'lov `PaymentSplit` ga bo'linadi: `gross_amount`, `platform_fee`, `provider_fee`, `seller_share` (`GET /payments/{id}/split`).
- Payout statuslari: `calculated` (hisoblangan) -> `queued` (navbatda) -> `processing` -> `paid` (to'langan); chekka holatlar: `held` (ushlab turilgan), `failed`, `cancelled`. Moliya/admin `PATCH /admin/payouts/{id}` bilan holatni o'zgartiradi ("To'langan deb belgilash").
- Veb jadvali: haftasiga bir marta (payshanba), minimal **100 000 so'm**; minimaldan kam bo'lsa keyingi haftaga o'tadi, oy oxirida qoldiq to'liq to'lanadi (web `SellerPayouts.tsx`). Marketing matni esa "48 soat" deydi - ziddiyat (§9.5).
- Seller ko'radi: `GET /payouts/me`.

### 2.4 To'lov usullari (hozirgi holat)

Staging'da to'lov **Telegram inline tasdig'i** orqali (TZ §27): backend `pending` to'lov/so'rov yaratadi -> client Telegram botida "tasdiqlash/bekor" bosadi -> `/ws/users/me` orqali status keladi. Provayderlar: `manual`, `telegram_manual` (reklama), `demo_payme`, avtomatik yechish uchun `atmos` (obuna). Mobil ilova to'lovni hech qachon o'zi `paid` qilmaydi (TZ §45.5).

### 2.5 Referral, gift va chegirmalar

- Referral: har user'da `referral_code` va havola/QR; 5 ta taklif qilingan do'st obuna olsa chegirma ochiladi (`eligible_after = 5`, `applies_to = [subscription, order_commission]`). Seller uchun referral komissiyani pasaytiradi (yuqoridagi zina). Chegirma foizi matnda 5%, kodda fallback 25% - ziddiyat (§9.5).
- Faol seller'lar uchun LexGo.AI tariflarida 50% chegirma (veb matni; jonli reja `lexgo-ai-yurist-advokat-seller` 22 500/oy).

## 3. Modullar xaritasi

Mahsulot 6 qatlamdan iborat; ular bir-biriga quyidagicha ulanadi:

```text
[Kirish]    Landing/AI -> Register/Login (Telegram OTP, TOTP) -> Consent -> Entitlement (obuna)
               |
[Mijoz]     AI chat · AI Instructor · Katalog (xizmat/hujjat) · Hujjat konstruktori · Hujjat tahlili
               |                |                      |
[Ish]       Navbatchi advokat   Marketplace            Tezkor advokat / SOS
            (document-lawyer)   (purchase-request,     (urgent-advokat)
               |                 orders, milestones)         |
[Ijrochi]   Call-center pool -> Advokat/Yurist (editor, chat, call, meeting) <- Tashkilot (workload)
               |                       |                     |
[Pul]       To'lov (Telegram tasdiq) -> Split -> Payout -> Moliya / Refund / Approvals (4 ko'z)
               |
[Sifat]     Rating (15 daqiqa) · Shikoyat · Qayta ishlash · Warranty · Review moderatsiya
               |
[Boshqaruv] CRM (lead, voronka) · Support · Admin · Studio (konfiguratsiya) · Internal HRM · Analitika (CEO)
```

### 3.1 Modullar ro'yxati (TZ bo'limi bilan)

| Modul | Maqsad | TZ | Asosiy API guruhi |
|---|---|---|---|
| Auth/Session | Register (Telegram OTP), login, 2FA (Telegram OTP yoki TOTP), sessiyalar, parol tiklash | §4 | `/auth/*` |
| AI yuridik chat | Maslahat, bepul limit, stream | §8 | `/clients/{id}/chats`, WS |
| AI Platform Instructor | Ilova ichida yo'l ko'rsatish (navigate, highlight, prefill, preview/confirm) | §9 | `/ai/instructor/*` |
| Support | AI reglament -> operator ticket -> assist -> call | §10, §33 | `/support/*`, `/call-center/support/*` |
| Katalog va hujjat | Kategoriya -> xizmat -> passport; field schema; template | §11 | `/service-categories`, `/services/*` |
| Hujjat (qo'lda/AI/advokat) | Preview/generate; AI savollar; navbatchi advokatga so'rov | §12-14 | `/services/{id}/document-*`, `/document-requests/*` |
| Mening hujjatlarim / Mening ishlarim | Hujjat arxivi (alohida) va yuridik jarayonlar (alohida) | §15 | `/document-requests`, `/clients/me/works` |
| Hujjat tahlili | Fayl yuklash, sahifa quote, to'lov | §16 | `/ai/document-analysis/*` |
| Advokat hujjat queue/editor | Pool, claim, OnlyOffice, finalize | §17 | `/call-center/document-requests/*`, `/lawyers/me/document-requests/*` |
| Marketplace (client) | Qidiruv, profil, purchase-request, orderlar | §18 | `/marketplace/*` |
| Marketplace (seller) | Profil, xizmatlar, availability, narx ceiling, orderlar | §19, §31 | `/lawyers/me*`, `/orders/*`, `/seller-onboarding/*` |
| Reklama | Banner/boost, checkout, analitika | §20 | `/promotions/*` |
| Tezkor advokat | 6 xizmat turi; call-center boshqaruvi | §21-22 | `/urgent-advokat/*`, `/call-center/urgent-advokat/*` |
| Secure chat/Call/Meeting | Matn/fayl/ovoz, LiveKit, pause/extend/recording/transfer | §23-24 | `/secure-chats/*`, `/calls/*` |
| Rating/Complaint | 15 daqiqalik oyna, sifat navbati, redo | §25 | `/reviews`, `/complaints`, `/call-center/quality-complaints/*` |
| Obuna/entitlement | Tariflar, sotib olish, avto-yangilash | §26 | `/subscription-plans/*`, `/clients/me/entitlements` |
| To'lov | Create/list/receipt/split | §27 | `/payments/*` |
| Bildirishnoma/Push | Inbox, preferences, WS | §28 | `/notifications/*`, `/ws/users/me` |
| Fayl/Workspace | Preview, advokat saqlash maydoni | §29-30 | `/workspace/*` |
| Tashkilot | A'zolar, workload, a'zo xizmatlari | §32 | `/organizations/*` |
| CRM/Leadlar | Kanban, timeline, export | §34 | `/admin/leads/*`, `/call-center/leads/*` |
| Internal HRM | Vazifa, KPI, davomat, payroll, org board | §35 | `/internal/*` |
| Studio | No-code konfiguratsiya konstruktorlari + approval + publish | §36 | `/studio/*`, `/admin/studio/*` |
| Admin | Foydalanuvchi, katalog, tarif, to'lov, moderatsiya, audit | §3.8 | `/admin/*` |

### 3.2 Inventarda bor, lekin TZ'da oqimi yozilmagan modullar

TZ §46 inventarida bo'lib, §0-45 da hech qanday ekran/oqim/rol qoidasi berilmagan guruhlar (har birida nechta endpoint TZ matnida eslatilgan: 0 ta): **Academy, Gifts, Referrals, Warranty, Legal Aid, SOS, Cases, Calendar/Calendar Events, Contracts (imzo), Orders (seller accept/decline, milestone), Payouts, Refund/Replacement Requests, Reviews, Quality, Identity, Seller Onboarding (endpointlari), B2B, Approvals, Workflow, Retention, Matching, Upsell, Conflicts, Tasks, Case Documents, Complaints, Workspace endpointlari (faqat §30 matni bor)**. Ular veb'da mavjud va jonli backend'da javob beradi - mobil jamoa bu modullar uchun TZ'ga qo'shimcha bo'lim so'rashi kerak (§9.2).

## 4. Rollar

### 4.0 Rol modeli: nimani nimadan farqlash kerak

LexGo'da "rol" to'rt xil narsani anglatadi; mobil ilova ularni aralashtirmasligi kerak (TZ §3.1-3.2, §3.9-3.10):

| Tushuncha | Qaerdan keladi | Qiymatlar | Izoh |
|---|---|---|---|
| **Asosiy (primary) rol** | `/auth/me` -> `role`, `UserRole` enum (TZ §47.186) | `client, yurist, advokat, advokat_tashkiloti, admin, manager, call_center, sales` | Faqat 8 ta qiymat. Ro'yxatdan o'tish (`RegisterRequest.role`) ham shu enum. Veb UI'da bu 3 ga qisqaradi: `client`, `lawyer` (=yurist), `advocate` (=advokat va advokat_tashkiloti); qolgan hamma staff roli UI'da `client` bo'lib ko'rinadi (`fromBackendRole`) |
| **Biriktirilgan (assigned) rollar** | `/auth/me` -> `roles[]`; `POST /admin/users/assign-role` | `superadmin, moderator, finance, quality_control, sales_head, sales_operator, call_center_lawyer, b2b_manager, marketing, content_manager, ceo_viewer, executive, provider, organization_owner` (+ asosiy rollarning o'zi) | Jonli staging'da `superadmin/admin/sales_operator` test akkauntlarining `role` maydoni `client`, rollari `roles[]` ichida. Ya'ni "admin" bo'lish uchun asosiy rol emas, biriktirilgan rol ham yetarli |
| **Permission kodlari** | `/auth/me` -> `permissions[]` (rollardan yig'iladi); `GET /admin/permission-matrix` | 35 ta kod (§5) | UI qarorining asosiy manbasi (TZ §3.2); `403` yakuniy hakam |
| **Overlay'lar** | alohida jadval/grant | `InternalEmployee` (HRM), Studio access grant (`studio_editor/_reviewer/_publisher/_admin`) | Rol emas; foydalanuvchiga qo'shimcha ochiladi (TZ §3.9-3.10) |

Jonli backend `GET /admin/roles` 23 ta yozuv qaytaradi: `admin, advokat, advokat_tashkiloti, b2b_manager, call_center, call_center_lawyer, ceo_viewer, content_manager, executive, finance, manager, marketing, moderator, organization_owner, provider, quality_control, sales, sales_head, sales_operator, super_admin, superadmin, yurist` va qoldiq `TEST`. **`client` roli matritsada yo'q** (clientda permission yo'q, `permissions=[]`). `super_admin` va `superadmin` bir xil 35 ta permission'li dublikat (§9.1).

**Akkaunt holati:** `account_status` (`active`, seller uchun tasdiqgacha `pending`). Seller tasdiqlanmaguncha cheklangan kabinet beriladi. Mobil ilova hozir `account_status` ni UI qarorida ishlatmaydi (§8).

**Majburiy 2FA:** `yurist, advokat, advokat_tashkiloti, admin, superadmin, manager, call_center, sales` va `call_center*`/`sales*` prefiksli rollar - login'da 2FA challenge (Telegram OTP yoki TOTP), 2FA'ni o'chirib bo'lmaydi. Client uchun ixtiyoriy (TZ §4.2, web `lib/auth.tsx`). Veb ro'yxatida `finance, quality_control, moderator, b2b_manager, marketing, content_manager, ceo_viewer, executive, provider` yo'q (§9.1).

**Sessiya bo'sh turish oynasi (veb):** admin/superadmin/manager - 2 soat; qolganlar - 8 soat.

**Mehmon (guest):** token yo'q. Ko'radi: landing, katalog, marketplace ro'yxati, AI chat (anonim id bilan, kunlik va umumiy limit: 2 savol/24 soat, jami 5 - veb izohi), tariflar. Hech narsa sotib ola olmaydi.


**Rollar jamlama jadvali** (permission soni - jonli `GET /admin/roles`; "Qobiq" - TZ §44 da belgilangan pastki navigatsiya):

| Rol | Turi | # perm | Qanday olinadi | Asosiy vazifa | TZ §44 qobig'i | Majburiy 2FA (veb) |
|---|---|:-:|---|---|---|:-:|
| `client` | asosiy | 0 | o'zi ro'yxatdan o'tadi | xizmat oluvchi | Client | yo'q |
| `advokat` | asosiy | 4 | o'zi + admin tasdig'i | marketplace sotuvchisi, hujjat ijrochisi | Advokat/yurist | ha |
| `yurist` | asosiy | 4 | o'zi + admin tasdig'i | sotuvchi (advokat-only xizmatlarsiz) | Advokat/yurist | ha |
| `advokat_tashkiloti` / `organization_owner` | asosiy / biriktirilgan | 5 | admin / tashkilot yaratish | a'zolar va yuklamani boshqarish | yo'q (§9.3) | ha |
| `provider` | biriktirilgan | 4 | admin | aniq emas (taxmin: tashqi ijrochi) | yo'q | yo'q |
| `call_center` | asosiy | 7 | admin | support, assist, urgent koordinatsiyasi, lead | Call-center | ha |
| `call_center_lawyer` | biriktirilgan | 6 | admin | navbatchi yurist: hujjat/urgent ijrochisi | yo'q | ha (prefiks) |
| `sales` | asosiy | 4 | admin | lead va sotuv | yo'q | ha |
| `sales_operator` | biriktirilgan | 4 | admin | lead operatori | yo'q | ha (prefiks) |
| `sales_head` | biriktirilgan | 3 | admin | sotuv rahbari, paket tasdig'i | yo'q | ha (prefiks) |
| `admin` | asosiy / biriktirilgan | 29 | superadmin | katalog, tasdiq, moderatsiya, siyosat | Admin (drawer) | ha |
| `superadmin` | biriktirilgan | 35 | bootstrap | rollar, hamma narsa | Admin (drawer) | ha |
| `manager` | asosiy | 16 | admin | 4 ko'z tasdig'i, operatsiya, HRM qismi | Admin (drawer) | ha |
| `finance` | biriktirilgan | 3 | admin | payout, refund | Admin (drawer) | yo'q |
| `quality_control` | biriktirilgan | 3 | admin | sifat, nizo | Admin (drawer) | yo'q |
| `moderator` | biriktirilgan | 2 | admin | sharh va profil moderatsiyasi | Admin (drawer) | yo'q |
| `b2b_manager` | biriktirilgan | 3 | admin | korporativ mijozlar | Admin (drawer) | yo'q |
| `marketing` | biriktirilgan | 2 | admin | reklama, lead | Admin (drawer) | yo'q |
| `content_manager` | biriktirilgan | 2 | admin | katalog va shablonlar | Admin (drawer) | yo'q |
| `ceo_viewer` | biriktirilgan | 4 | admin | rahbariyat ko'rinishi | Admin (drawer) | yo'q |
| `executive` | biriktirilgan | 5 | admin | rahbar tasdiqlovchi (taxmin) | Admin (drawer) | yo'q |
| Ichki xodim (`InternalEmployee`) | overlay | `internal_*` | HR yozuvi / kod | vazifa, davomat, KPI | HRM bo'limi | - |
| Studio (`studio_*`) | overlay (grant) | - | admin grant | konfiguratsiya nashri | Studio bo'limi | - |

---

### 4.1 Client (mijoz)

**Kim.** Fuqaro, YaTT yoki yuridik shaxs - yuridik xizmat oluvchi (veb `finder.forWhom`). Backend: `role=client`, `roles=[]`, `permissions=[]`. Hech qanday staff huquqi yo'q; hamma narsani **ownership** (faqat o'z yozuvlari) va **entitlement** (obuna huquqlari) cheklaydi.

**Qanday kiradi.** (TZ §4, §5)
1. `POST /auth/register/start` (telefon, parol, ism, hudud, ixtiyoriy `referral_code`) -> Telegram bot orqali 6 xonali OTP (javobda kod yo'q; amal qilish ~2 daqiqa, qayta yuborish 60 s, 3 ta xato kod -> telefon 15 daqiqaga bloklanadi - veb izohi; server cooldown/block holatini qaytaradi).
2. `POST /auth/register/verify` -> darhol token (client uchun tasdiqlash kutilmaydi). Ro'yxatdan o'tishda huquqiy roziliklar (shartlar, maxfiylik, disclaimer) qabul qilinadi; hujjat yangi versiyasi chiqsa `ConsentGate` qayta qabul qildiradi.
3. Login: `POST /auth/login`; 2FA yoqilgan bo'lsa challenge (`428`) -> `POST /auth/login/2fa` (Telegram yoki TOTP).
4. Cold start: `GET /auth/me` -> permissions/status -> `/ws/users/me` -> shell.

**Kunlik ish.** Muammoni AI'ga yozadi yoki xizmat katalogidan hujjat tanlaydi; hujjatni o'zi to'ldiradi / AI bilan / navbatchi advokatga topshiradi; kerak bo'lsa tezkor advokatga video/audio/chat so'rov yuboradi yoki marketplace'dan advokat tanlab buyurtma beradi; ish davomida chat/qo'ng'iroq qiladi; yakunda baho/shikoyat qoldiradi; tarif va to'lovlarni boshqaradi.

**Ekranlar (TZ §44):** pastki navigatsiya - **Bosh sahifa, Xizmatlar, Ishlar, Xabarlar, Profil**; global: AI Instructor, bildirishnoma, kiruvchi qo'ng'iroq. Veb sidebar'idagi bo'limlar (mobil uchun modul ro'yxati): Boshqaruv paneli, SOS, Tezkor Advokat, Huquqiy hujjatlar (katalog), Mening hujjatlarim, Advokat va yuristlar, Mening ishlarim, Xabarlar, Bildirishnomalar, AI, Muammo tahlili (intake), Akademiya, Paketlar (bosqichli), Xizmat buyurtmalarim, Mos advokatlar, Tariflar, To'lovlar, Sovg'alar, Referral, Baholash va sharhlar, Kafolat (warranty), Shikoyatlar, Yordam markazi, Profil; qo'shimcha: Hujjat tahlili.

**Imkoniyatlar (modul -> amal -> asosiy API):**

| Modul | Nima qila oladi | API |
|---|---|---|
| Dashboard | Tezkor amallar, "Mening ishlarim" hisoblagichlari (bosilganda filtrlangan ro'yxat) | `/clients/me/works` |
| AI yuridik chat | Chat yaratish/yuborish, stream; mehmon va bepul limit serverdan | `/clients/{id}/chats*`, WS |
| AI Instructor | Ilova ichida yo'l ko'rsatish; xavfli amal (to'lov, rozilik, o'chirish) faqat preview -> native confirm -> confirm | `/ai/instructor/*` |
| Katalog/hujjat | Kategoriya -> xizmat -> passport; 3 usul: qo'lda, AI, navbatchi advokat | `/services/*`, `/document-requests/*` |
| Mening hujjatlarim | Hujjat arxivi: versiyalar, preview, download, javoblar, status (alohida bo'lim!) | `/document-requests*` |
| Mening ishlarim | Yuridik jarayonlar: tabs `all, urgent_advokat, document_lawyer_work, quality_complaint, service_order, legal_case`; assignee, timeline, chat, call, payment, complaint, rating | `/clients/me/works*` |
| Hujjat tahlili | Fayl yuklash, sahifa bo'yicha quote, to'lovdan keyin advokatga yuborish | `/ai/document-analysis/*` |
| Marketplace | Qidiruv (AI-search), profil, xizmatlar, `purchase-request`, mening orderlarim, cancel/complete | `/marketplace/*` |
| Tezkor advokat | 6 xizmat turi, so'rov yaratish/kuzatish, reyting; SOS | `/urgent-advokat/*`, `/sos` |
| Secure chat/call | Matn, fayl (<=25 MB), ovoz, reply; qo'ng'iroqqa qo'shilish; yozib olishni so'rash | `/secure-chats/*` |
| Support | AI reglament -> operator ticket; reopen; operator "assist" taklifini tasdiqlash | `/support/*` |
| Obuna/to'lov | Tarif sotib olish (Telegram tasdiq), avto-yangilash, to'lovlar, chek, split | `/subscription-plans/*`, `/payments/*` |
| Profil | Profil, oila a'zolari, to'lov usullari, roziliklar, sessiyalar, 2FA, bildirishnoma sozlamalari | `/clients/me*`, `/auth/*` |
| Boshqalar | Referral (kod/QR), sovg'a yaratish/qabul, akademiya, kafolat da'vosi, shikoyat, qaytarish/almashtirish so'rovi | `/referrals`, `/gifts`, `/academy`, `/warranty`, `/complaints`, `/refund-requests`, `/replacement-requests` |

**Cheklovlar.**
- Advokat ish pooli, call-center queue, admin, Studio, HRM ko'rinmaydi; boshqa userning order/chat/fayli ko'rinmaydi (TZ §3.3).
- Navbatchi advokat hujjati: client advokat **tanlamaydi**; bir hujjat uchun ochiq so'rov bo'lsa yangisi yuborilmaydi (`can_send_lawyer_request=false`, sababi `lawyer_request_block_reason`) (TZ §14).
- Hujjat uchun advokat bilan audio qo'ng'iroq: hujjat boshiga ko'pi bilan 3 marta (veb, `429`).
- Guruh "ikkinchi fikr" - oldin LexGo orqali advokat/yurist xizmatidan foydalangan bo'lish shart (`402 previous_lexgo_advokat_service_required`); yakka ikkinchi fikr - shart emas (TZ §21).
- Buyurtma holatini client faqat `completed` yoki `cancelled` ga o'tkaza oladi; bekor qilish faqat `new, waiting_info, waiting_docs, waiting_payment, seller_selection` dan (veb `orderStatus.ts`). Takroriy faol order -> `409 marketplace_order_already_active`.
- Narx clientdan olinmaydi (amount faqat backend); to'lovni client "paid" qila olmaydi (Telegram tasdig'i) (TZ §27).
- Baho/shikoyat oynasi ish `completed` bo'lgandan keyin **15 daqiqa**; keyin yopiladi (TZ §25).
- Sotuvchi telefoni public ro'yxatda va to'lovdan oldin ko'rsatilmaydi; chatda tashqi kontakt/havola maskalanadi (`platform_contact_blocked`).

**Permission/flaglar.** Permission yo'q. Qarorlar: `account_status=active`, `GET /clients/me/entitlements` (`has_active_subscription`, `ai_limit`, `manual_documents.*`, oila a'zolari), resource `can_*` (`can_send_lawyer_request`, `rating_available`, `can_claim`...), `402` (payment/entitlement kerak).

**Pul oqimi.** To'laydi: obuna (149 000 / 349 000 oy), AI tarif, tezkor advokat (80 000-250 000; guruhda har advokatga), hujjat tahlili (149 000+), marketplace xizmati (siyosat: avans 10% + bosqichlar; amalda Telegram tasdig'i bilan to'liq summa ham uchraydi - §9.2), reklama emas (seller to'laydi). Oladi: referral chegirmasi (5 ta obunachi do'st -> chegirma), sovg'a obuna, qaytarish (refund; 3 ish kuni ko'rib chiqish, admin+menejer tasdig'i). Chek: `GET /payments/{id}/receipt` (+ `/receipt/verify` - chekni tekshirish, taxmin).

**Bildirishnomalar (kuzatilgan hodisalar):** `document_request_file_ready`, `document_lawyer_request_claimed / _ready`, `document_review_payment_required`, `ai_document_ready`, `order_created`, `marketplace_purchase_approved`, `urgent_advokat.request_claimed / group_scheduled / meeting_created / completed / transferred / cancelled`, `support.ticket_claimed / _message / _closed`, `quality_complaint.resolved / rework_started`, `meeting_invite` (kiruvchi qo'ng'iroq), `secure_chat_message`, `subscription.purchase_request_created`; kanallar: in-app, push, Telegram, SMS, email.

**Boshqa rollar bilan.** Call-center operatori (support, assist, urgent navbat) - sizning nomingizdan *preview* yaratadi, siz tasdiqlaysiz; advokat/yurist - hujjat va buyurtma ijrochisi; sifat nazorati - shikoyatni ko'rib chiqadi; admin/moliya - refund/payout.

---

### 4.2 Advokat

**Kim.** Litsenziyali advokat (sotuvchi). Veb UI'da `advocate` portal. Backend `role=advokat`; rolning 4 ta permission'i: `cases.manage, documents.manage, meetings.manage, orders.manage` - **hech biri admin sahifasini ochmaydi** (`ADMIN_PERMISSIONS` ro'yxatida emas). `seller_type=advokat`: barcha ruxsat etilgan katalog xizmatlarini sota oladi.

**Qanday kiradi.** (TZ §31; veb `RegisterFlow`)
1. Register 5 bosqichli: shaxsiy (rasm, selfie), professional (litsenziya raqami va skani, advokat/yurist staji, advokatlik tuzilmasi: byuro/firma/hay'at, advokatlar palatasi), ekspertiza (amaliyot yo'nalishlari, hududlar, tillar, ish statistikasi), narx (soatlik, tavsiya oralig'i 300 000-800 000), tasdiq (har huquqiy hujjatga rozilik).
2. OTP (Telegram) -> `account_status=pending`; **majburiy 2FA** (login'da `428` challenge).
3. Onboarding checklist (`GET /seller-onboarding/progress`): profil, identifikatsiya (MyID/OneID; advokat va yurist uchun majburiy), hujjatlar (PDF/JPG/PNG <=15 MB), xizmatlar, narx; `POST /seller-onboarding/submit` (kam qadam bo'lsa `422`).
4. Admin/moderator ko'rib chiqadi (~24 soat): 4 bandli tekshiruv (telefon tasdiqlangan, shaxs tekshirilgan, professional profil tekshirilgan, qoidalar qabul qilingan); `accept`/`reject` (`/admin/register-requests/{id}/...`).
5. Tasdiqdan oldin: cheklangan kabinet (faqat dashboard, profil, tarif, bildirishnoma, support). Pending seller marketplace'da chiqmaydi va xizmat sota olmaydi (TZ §31).

**Kunlik ish.** Yangi buyurtma taklifini 30 ish daqiqasi ichida qabul/rad qiladi; mijoz bilan chat/qo'ng'iroq; hujjat so'rovlarini oladi va OnlyOffice'da tahrirlaydi; tezkor ishlarga qo'shiladi (call-center tayinlasa); kalendar, vazifalar, mijozlar bazasi va ishlar (case) bilan ishlaydi; workspace'da fayl saqlaydi; xizmat narxi/availability'ni sozlaydi; reklama sotib oladi; payoutni kuzatadi.

**Ekranlar.** TZ §44: **Ish maydoni, So'rovlar, Mijozlar, Xabarlar, Profil**. Veb sidebar (21 bo'lim): Boshqaruv paneli, Imkoniyatlar (ochiq buyurtmalar), Xizmat buyurtmalari, Mening ishlarim (cases), Tezkor ishlar, Hujjat so'rovlari, Kalendar, Mijozlar, Xizmatlarim, Vazifalar (kanban), Xabarlar, Uchrashuvlar, Bildirishnomalar, Tashkilot, Fayllar (workspace), AI yordamchi, Profil, Referal, Targ'ibot (promotion), Tariflar, Yordam markazi. "Imkoniyatlar" va "Xabarlar" `GET /lawyers/me/cabinet` -> `available_actions` (`accept_orders`, `secure_chat`, `calls`) ga bog'liq.

**Imkoniyatlar.**
- *Buyurtmalar:* `GET /orders`, `POST /orders/{id}/accept`, `POST /orders/{id}/decline` (9 ta sabab: `conflict_of_interest, not_my_specialization, busy, region_far, price_mismatch, documents_insufficient, prior_dispute, sick_or_vacation, other` - `other` uchun izoh majburiy); bosqich/status `PATCH /orders/{id}/status`; milestone `release`. `complete_url`/`cancel_url` faqat backend bersa ko'rsatiladi.
- *Hujjat:* pool (`GET /call-center/document-requests/open`) -> `claim` (race: ikkinchisiga `409`) -> `GET /lawyers/me/document-requests/{id}` -> editor (3 manba: o'z fayli / mijoz fayli / AI draft) -> `PUT .../editor/draft` -> `POST .../editor/finalize` (faqat save tasdiqlangandan keyin); `transfer`, `meeting` (15 daqiqa), eski usul `fulfill-file`. OnlyOffice konfiguratsiyasini (`document_server_url`, token, callback) mobil o'zgartirmaydi (TZ §17).
- *Tezkor:* `GET /urgent-advokat/requests/assigned` (faqat o'qish; boshqaruv call-center'da), qo'ng'iroq kartasiga qo'shilish, guruh chatni `chat/complete` bilan yopish (vakolat bo'lsa); mijoz telefoni tashqi advokatdan yashiriladi.
- *Qo'ng'iroq/meeting:* bir marta bepul 3 daqiqagacha uzaytirish, pullik uzaytirish (daqiqa kiritadi, narx 2 000 so'm/daq backend'dan), yozib olishga ruxsat berish/rad etish, ishtirokchini boshqa advokatga transfer (meeting pause qilinadi).
- *Xizmatlar:* `GET/PUT /lawyers/me/services`, `.../manage` (CRUD, status `active/paused/inactive`), narx tavsiya oralig'ida (70-100% va staj/hudud ustamalari), xizmat faqat faol + narxli + tasdiqlangan seller bo'lsa ko'rinadi; `availability` (hafta kunlari, Du-Sha 09:00-19:00 Asia/Tashkent, javob muddatlari: qo'lda 30, avtomatik 15, SOS 5 daqiqa); "ta'til" rejimi (hozir faqat brauzerda - backend saqlamaydi).
- *Mijozlar/ishlar/kalendar:* `GET/POST /lawyers/me/clients` (qo'lda mijoz: ism, telefon, PINFL, kompaniya), `/conflicts/check`, `/lawyers/me/cases`, `/calendar-events` (+iCal, eslatma kaskadi), `/calendar/deadline-calculator`, `/tasks/me`.
- *Workspace:* papka/fayl, yulduzcha, versiya, izoh, imzolangan URL (15 daqiqa), kvota; tasdiqdan keyin; default 1 GB (TZ §30), server kvotasini qaytaradi (platforma siyosatida 2048 MB - §9.4).
- *Reklama:* `GET /promotions/packages`, `POST /promotions/checkout` (provider `telegram_manual`), statistika; xizmat bo'yicha `promotion-checkout`.
- *Pul:* `GET /payouts/me`, payment split.

**Cheklovlar.** Pending seller sota olmaydi; narx admin belgilagan ceiling'dan oshmaydi; o'z xizmatini o'zi sotib ololmaydi; hujjat pool'ida faqat o'ziga ruxsat berilgan yozuvlar (TZ §3.4: "oddiy outsource advokat faqat o'ziga tayinlangan yoki marketplace orqali sotib olingan ishlarni ko'radi" - lekin veb "Yangi so'rovlar" pool tabini hamma advokatga ko'rsatadi, §9.2); 30 daqiqa ichida javob bermasa mijozga boshqa advokatlar taklif qilinadi va seller balli tushadi (3 ta javobsiz buyurtma/30 kun yoki javob <90% -> reyting pasayadi); boshqa tashkilot ma'lumotini ko'rmaydi; call-center vazifalarini (queue, support) bajarmaydi.

**Permissionlar.** `cases.manage, documents.manage, meetings.manage, orders.manage` (tafsiloti §5). Qo'shimcha: `seller_type`, `verification_status` (`pending/approved|verified/rejected`), `GET /lawyers/me/cabinet.available_actions`.

**Pul oqimi.** Komissiya **18%** (+provayder 1%) faqat bajarilgan buyurtmadan; daromad = to'lov - 18% - 1%. Payout haftasiga bir marta (payshanba), minimal 100 000 so'm; `GET /payouts/me`. Xarajat: AI tarifi (Lite 49 000, Pro 99 000; faol seller uchun 50% chegirma), reklama (149 000-399 000). Referral: 5/10/20 ta taklif qilingan seller -> komissiya 16/15/13%. Super-advokat holati har oyning 1-sanasida qayta hisoblanadi (reyting >4.5, javob >90%, staj >=3 yil, >=10 bajarilgan buyurtma).

**Bildirishnomalar.** `order_created`/yangi buyurtma + `marketplace_order_paid`, `document_request.pool_created / claimed / completed / editor_saved`, `document_lawyer_request_sent`, `urgent_advokat.*`, `meeting_invite` (qo'ng'iroq), `secure_chat_message`, `quality_complaint.created / rework_started` (qayta ishlash), `promotion.checkout_approved / _rejected`, verifikatsiya natijasi.

**Boshqa rollar bilan.** Client (mijoz), call-center (pool, tezkor tayinlash, transfer), admin/moderator (tasdiqlash), sifat nazorati (shikoyat -> bepul redo), moliya (payout), tashkilot egasi (agar a'zo bo'lsa).

---

### 4.3 Yurist

**Kim.** Advokat maqomiga ega bo'lmagan huquqshunos (sotuvchi). Backend `role=yurist`, advokat bilan **bir xil 4 ta permission**. Veb UI'da `lawyer` portal.

**Advokatdan farqi.**
- Ro'yxatdan o'tish bir bosqichli (ism, hudud, staj; xizmat tanlash keyin).
- `advokat_required` xizmatlarni sota olmaydi: `criminal-*` va `administrative-*` prefiksli xizmatlar rad etiladi (`seller_rules`); sud vakilligi va jinoyat himoyasi "Faqat advokat" deb belgilangan.
- Nav'da "Imkoniyatlar" va "Tashkilot" yo'q; qo'shimcha "Ishlar bozori", "Hujjatlar" (shablon yuklab olish), "Xavfsiz chat", "AI chat". Pending yurist ham xizmat tanlay oladi (eski picker).
- "Super advokat" va ustuvor qidiruv (`advocate` badge) advokatga xos; yurist uchun tasdiqlangan badge bor, lekin "advokat" ustuvorligi yo'q (taxmin - veb matnidan: `register.accountTypes.advocate` "qidiruvda ustuvorlik").
- Pul qoidalari (18% komissiya, payout, AI tarif chegirmasi, reklama) advokat bilan bir xil; "Shaxsiy advokat Standard" tarifining `target_roles` ro'yxatiga `yurist` ham kiritilgan (jonli plan: `client, yurist, advokat`) - yurist o'zi uchun ham obuna ololadi (taxmin: shaxsiy foydalanish).
- Qolgan modullar (hujjat queue/editor, workspace, kalendar, mijozlar, tezkor ishlar, qo'ng'iroq) advokat bilan bir komponentlar - backend hujjat so'rovlarida rolga qarab ajratmaydi.

**TZ'da ular bitta guruh:** "Advokat/yurist" (TZ §3.4, §44). Mobil qobiq bitta bo'lishi, farq esa xizmat katalogi va `seller_type` bo'yicha filtrda bo'lishi mumkin.

---

### 4.4 Advokat tashkiloti (`advokat_tashkiloti`) va tashkilot egasi (`organization_owner`)

**Kim.** Advokat byurosi/firmasi/hay'ati. Tashkilot (`Organization`: `name, phone, STIR (inn), region, address`, `owner_user_id`, `verification_status`) va a'zolar (`OrganizationMember`: `user_id, role_id, title, status`) dan iborat. Egasi - `role=advokat_tashkiloti` yoki biriktirilgan `organization_owner` roli. Ikkala rolning permission to'plami bir xil: advokatniki + `organizations.manage` (5 ta).

**Qanday kiradi.** Veb ro'yxatdan o'tishda faqat 3 tur bor (client, yurist, advokat); `advokat_tashkiloti` self-register UI'da yo'q, lekin `UserRole` enum va admin `seller-requests` statistikasida bor (§9.2). Tashkilot yaratish: `POST /organizations` (tur `advokat_tashkiloti`); `verification_status`: `pending -> verified | rejected` (admin). A'zo qo'shish: `POST /organizations/{id}/members` (`user_id` + lavozim). Majburiy 2FA.

**Kunlik ish.** Tashkilot dashboardida a'zolar, faol ishlar, kechikkan, bajarilgan, daromad va yuklamani kuzatadi; kim nima ish qilayotganini detailga kirib ko'radi; a'zolarning xizmat va narxlarini boshqaradi; ishlarni qayta taqsimlaydi; a'zo xizmatlariga reklama (promotion) sotib oladi (`organization_id` bilan).

**Ekranlar.** TZ'da alohida bottom navigation berilmagan (§44 - yo'q; §9.3). Veb: advokat portali ichida "Tashkilot": ro'yxat -> Boshqaruv paneli (5 hisoblagich: a'zolar, tasdiqlangan, faol buyurtma, faol case, tezkor so'rov; a'zolar jadvali: ism, rol, tur, hudud, verifikatsiya, reyting, yuklama; tablar: buyurtmalar/ishlar/tezkor), Workload (`GET .../owner/workload`, sahifalanadi, filtr: a'zo va status `pending, in_progress, paid, completed, cancelled`), A'zo sahifasi (xizmatlar va yuklama).

**Imkoniyatlar.** `GET/POST /organizations`, `GET/POST /organizations/{id}/members`, `GET .../owner/dashboard`, `GET .../owner/workload`, a'zo xizmatlari: `GET/POST .../members/{uid}/services/manage`, `PATCH/DELETE .../services/{sid}`, `PATCH .../status`, `POST .../promotion-checkout`. Egasi o'zi ham advokat sifatida ishlay oladi (advokatning hamma imkoniyati).

**Cheklovlar.** Boshqa tashkilot ma'lumotini ko'rmaydi (data isolation, TZ §32, §42.5); `403` -> "forbidden", `404/405` -> "tez orada" holati (web `OrgBlocked`). Veb kodida oddiy advokat ham "Tashkilot" bo'limini ko'radi va tashkilot yarata oladi - UI'da cheklov topilmadi.

**Pul.** Tashkilot darajasida alohida payout/billing UI topilmadi; daromad (`revenue`) dashboard hisoblagichi; komissiya a'zo orderlari bo'yicha odatdagidek 18% (taxmin).

**Bildirishnomalar.** A'zolarnikiga o'xshash (order, urgent, document, chat); tashkilot tasdig'i natijasi.

**Mobil holat.** Hozir yo'q (§8.4).


---

### 4.5 Call-center operatori (`call_center`, veb nomi "Navbatchi operator")

**Kim.** Platformaning "qo'l bilan" xizmat qatlami: support ticketlar, mijozga yordam, leadlar va tezkor advokat navbatini boshqaradi. **Advokat emas** - yuridik ishni o'zi bajarmaydi (TZ §3.6). Backend primary rol `call_center`; permission'lar (7): `callcenter.access, leads.manage, notifications.manage, orders.manage, meetings.manage, cases.manage, documents.manage`.

**Qanday kiradi.** Admin tomonidan yaratiladi/rol biriktiriladi (self-register yo'q); majburiy 2FA; veb'da login'dan keyin to'g'ridan-to'g'ri `/admin` konsoliga tushadi (`hasAdminAccess`: `leads.manage`/`callcenter.access` bor), "Navbatchi operator" belgisi bilan. Sessiya bo'sh turish oynasi 8 soat.

**Kunlik ish.** Smenada: (1) navbatni (`/call-center/queue`) SLA bo'yicha tozalaydi - lead, buyurtma, tezkor so'rov; (2) support ticketlarni oladi/uzatadi/yopadi, kerak bo'lsa client nomidan assist amalini preview qiladi yoki operator qo'ng'irog'ini boshlaydi; (3) tezkor advokat so'rovlarini claim qiladi, mos advokat(lar)ni tayinlaydi, uchrashuv ochadi, yakunlaydi; (4) sifat shikoyatlarini hal qiladi; (5) leadlarni kanbanda yuritadi, call log yozadi.

**Ekranlar (TZ §44):** **Leadlar, Support, Mijozlar, Uchrashuvlar, Profil**. Veb mosligi: "Navbatchi xizmat" (`/admin/call-center`: Navbat, Tezkor Advokat, Sifat shikoyatlari, Lead doskasi, Mijoz qidirish, Call log), "Operator chatlari" (support), "Uchrashuvlar". Qo'shimcha (permission bo'yicha): Sotuv voronkasi (`leads.manage`), Marketplace monitoring (`orders.manage`), Qo'ng'iroq tahlili/Ushlab qolish, Bildirishnoma yuborish (`notifications.manage`).

**Imkoniyatlar.**
- *Navbat:* SLA (lead/order 60 daq, tezkor so'rov 15 daq), `sla_breached` birinchi; buyurtma uchun "keyingi sellerga tayinlash" `POST /matching/orders/{id}/assign-next` (`orders.manage`); lead holatini `contacted/qualified/proposal/won/lost` ga ko'chirish.
- *Support:* `claim` (race: `409`), `transfer` (sabab majburiy, `GET /call-center/support/operators`), `close` (resolution), reopen kuzatish; operator AI bilan oldingi suhbatni ko'radi; `POST .../calls` (audio/video, default 30 daq) - qo'ng'iroqni **faqat operator** boshlaydi (TZ §10).
- *Assist (client nomidan):* `GET .../assist/context`; `subscription-preview/-checkout`, `document-lawyer-request`, `marketplace-purchase-request`, `urgent-advokat-request` - client ekraniga realtime preview keladi, client tasdiqlaydi, kerak bo'lsa Telegram to'lov tasdig'i; operator to'lovni client o'rniga tasdiqlay olmaydi (TZ §10, §33).
- *Tezkor advokat:* `claim` (private chat ochiladi, client xabardor qilinadi), `candidates`, `assign-group` (>=2, 2-7 advokat; `lawyer_count_below_minimum` bekor qilib bo'lmaydi, `lawyer_count_mismatch`/`lawyer_direction_mismatch` override mumkin), `meeting` (30 daqiqalik LiveKit), `status` (faqat `lifecycle.next_statuses`), `complete` (xulosa), `cancel` (sabab clientga ko'rinadi), `transfer`.
- *Sifat shikoyati:* `resolve` - `rework_required` (shu advokatga bepul redo), `rejected` (clientga izoh), `resolved`; izoh majburiy.
- *Mijoz:* `GET /call-center/clients/search`, mijoz kartasi; call log `POST /call-center/calls` (yo'nalish kiruvchi/chiquvchi; natija `answered, no_answer, busy, callback, wrong_number`).
- *Lead:* kanban, ko'chirish (lost ustuniga o'tishda sabab: `price, solved_self, competitor, no_answer, no_service, spam`), Excel eksport.
- *Hujjat pool:* `/call-center/document-requests/open` endpointi `admin` va `superadmin` uchun 200 qaytardi (operator akkaunti bilan tekshirilmadi); ishni advokat sifatida olish TZ bo'yicha `call_center_lawyer` ga tegishli (§4.6).

**Cheklovlar.** Urgent/hujjat ishini advokat sifatida olmaydi, hujjat editori yo'q, marketplace seller monitoringi yo'q, tashqi advokat/yuristning shaxsiy ish va chatlarini ko'rmaydi, advokat kabineti yo'q (TZ §3.6). `users.manage` yo'q -> mijoz 360 kartasi `403` qaytarishi mumkin (veb kod izohi; operator uchun muammo - §9.3). Lead tayinlash (`PATCH /admin/leads/{id}`) `leads.manage` ga bog'liq, operatorlar ro'yxati (`GET /admin/users`) `users.manage` talab qiladi. Roles, payouts, audit, services kabi admin bo'limlari yo'q.

**Pul.** To'lov qabul qilmaydi/tasdiqlamaydi; faqat preview va so'rov yaratadi. Maosh/KPI - ichki HRM (agar `InternalEmployee` bo'lsa).

**Bildirishnomalar.** `support.ticket_created / _transferred_to_you / _message`, `urgent_advokat.*` (yangi so'rov, `open_pool`), `document_request.pool_created`, `quality_complaint.created`, yangi lead, `meeting_invite`, `support.assist_*` (client tasdig'i).

**Boshqa rollar bilan.** Client (support, assist), `call_center_lawyer` (hujjat/urgent ijrochisi), advokat/yurist (tayinlash, transfer), sales (lead), admin (supervisor: admin va manager `isSupportSupervisor` - boshqa operator ticketini "kuzatuv rejimida" ko'radi).

---

### 4.6 Call-center yuristi (`call_center_lawyer`, veb nomi "Navbatchi yurist")

**Kim.** Call-center ichidagi navbatchi huquqshunos - ochiq hujjat va tezkor (urgent) poollardan ish oladigan **ijrochi** (TZ §3.4). `call_center` operator bilan **aralashtirilmaydi** (TZ §3.6). Permission'lar (6): `callcenter.access, cases.manage, documents.manage, meetings.manage, orders.manage, templates.manage` (leads va notifications yo'q).

**Qanday kiradi.** Admin biriktiradi (`assign-role`); majburiy 2FA (prefiks `call_center`). Odatda foydalanuvchining asosiy backend roli `yurist`/`advokat` bo'lishi mumkin (taxmin: mobil audit shuni ko'rsatadi: `useTabRole` bunday foydalanuvchiga seller qobig'ini beradi - §8.4).

**Kunlik ish.** Navbatchi pooldan hujjat so'rovini `claim` qiladi -> editor -> `finalize`; urgent poolda o'ziga tayinlanganda mijoz bilan video/audio/chat; hujjat bo'yicha 15 daqiqalik meeting; transfer.

**Ekranlar.** TZ §44'da alohida navigatsiya yo'q (§9.3). Taxmin: ikki qobiq birlashmasi - advokatning "So'rovlar/Xabarlar" + call-center "Uchrashuvlar". Veb'da: AdminShell (callcenter.access orqali) - Navbatchi xizmat, Uchrashuvlar, Operator chatlari, Marketplace monitoring (`orders.manage`), Hujjat namunalari (`templates.manage`); advokat portaliga ham kira oladi (AdminShell pastida "portalga qaytish").

**Imkoniyatlar.** Hujjat: `GET /call-center/document-requests/open`, `claim`, `transfer`, `/lawyers/me/document-requests/*` (editor, draft, finalize, meeting); urgent: `GET /urgent-advokat/requests/assigned`; secure chat/call; support navbatiga ham `callcenter.access` bilan kira oladi (supportda `isCallCenterUser`: ha). Hujjat shablonlarini boshqarish (`templates.manage`).

**Cheklovlar.** `leads.manage` yo'q -> sotuv voronkasi/kanban, qo'ng'iroq tahlili yo'q; `notifications.manage` yo'q -> bildirishnoma yuborolmaydi. TZ: oddiy outsource advokatdan farqi - ochiq poolga kirish.

**Pul.** Komissiya/payout haqida TZ'da gap yo'q (taxmin: ichki xodim - maosh/KPI, HRM orqali; §9.3).

**Bildirishnomalar.** `document_request.pool_created / claimed`, `document_lawyer_request_sent`, `urgent_advokat.*`, `meeting_invite`, `secure_chat_message`, `quality_complaint.rework_started`.

---

### 4.7 Sales: `sales`, `sales_operator`, `sales_head`

**Kim.** Sotuv bo'limi: leadlarni qayta ishlaydi, mijoz bilan aloqa tarixini yuritadi, voronkani boshqaradi (TZ §3.7). `sales` - asosiy backend roli (`UserRole`), `sales_operator` va `sales_head` - biriktirilgan rollar.

| Rol | Permission'lar | Izoh |
|---|---|---|
| `sales` | `leads.manage, notifications.manage, orders.manage, sales.access` | asosiy rol; majburiy 2FA |
| `sales_operator` | `leads.manage, notifications.manage, orders.manage, sales.access` | `sales` bilan bir xil to'plam; majburiy 2FA (prefiks `sales`) |
| `sales_head` | `leads.manage, packages.approve, sales.access` | rahbar: xizmat paketlarini tasdiqlash (`packages.approve`); `notifications`/`orders` yo'q |

**Qanday kiradi.** Admin yaratadi/rol biriktiradi. **Eslatma:** jonli staging'da `sales_operator` test akkaunti 2FA'siz kirdi (asosiy `role=client`) - §9.1.

**Kunlik ish.** Leadlarni (veb forma, `POST /leads`; call-center; B2B so'rov) oladi -> bog'lanadi -> kvalifikatsiya -> taklif -> yutuq/yo'qotish; call log; eslatma vazifa (`POST /tasks`); ushlab qolish (win-back) navbati; mijoz holatlari (order) ni ko'rish; mijozlarga bildirishnoma yuborish.

**Ekranlar.** TZ §44'da sales uchun navigatsiya yo'q (§9.3). Veb (permission bo'yicha): Sotuv voronkasi (`leads.manage`: kanban + jadval, auto-assign `round_robin`/`least_loaded` hududni hisobga olib), Navbatchi xizmat (faqat Lead doskasi + mijoz qidirish; navbat/tezkor/shikoyat/call log faqat call-center xodimiga), Uchrashuvlar, Qo'ng'iroq tahlili, Ushlab qolish, Marketplace monitoring (`orders.manage`; `sales_head` da yo'q), Bildirishnomalar (`notifications.manage`; `sales_head` da yo'q). B2B sahifasi `b2b.manage` kerak - sales rollarida yo'q.

**Imkoniyatlar.** `GET/POST /admin/leads`, `kanban`, `PATCH .../move`, `re-engage`, `timeline`, ustunlar sozlash (`PUT /admin/leads/kanban/columns` - ustun qo'shish/nomi/rangi; final ustunni o'chirib bo'lmaydi), Excel eksport (`kanban/export.xlsx`), `POST /call-center/calls`, `POST /tasks`, `POST /admin/notifications`. Jonli tekshiruv (`sales_operator`): `/admin/leads`, `/admin/marketplace/orders`, `/admin/calls`, `/call-center/leads`, `/call-center/urgent-advokat/requests` - 200; `/admin/dashboard`, `/admin/users`, `/call-center/queue`, `/call-center/support/tickets`, `/internal/*`, `/admin/complaints` - 403.

**Cheklovlar.** Hujjat edit qilmaydi, advokat ishini olmaydi (TZ §3.7); operatorlar ro'yxatiga (`users.manage`) kira olmaydi -> lead tayinlash UI faqat o'qish; `sales.access` kodi veb nav'ida ishlatilmaydi.

**Pul.** To'lov oqimiga aralashmaydi; samaradorlik (konversiya, CAC, LTV) CEO analitikasida; sotuv bonusi - HRM payroll `sales_bonus` yozuvi (agar xodim bo'lsa).

**Bildirishnomalar.** Yangi lead (auto-assign), tayinlangan lead, eslatma vazifa, `meeting_invite`.

---

### 4.8 Admin (`admin`)

**Kim.** Platforma ma'muri. Asosiy rol `admin` (yoki biriktirilgan). 29 ta permission - superadmin'dan farqi: `roles.manage, callcenter.access, sales.access, payout.approve, audit.export, chat.open_for_dispute` **yo'q**. Jonli tekshiruv: `/admin/roles`, `/admin/permissions` - 403; `/call-center/queue`, `/call-center/support/tickets`, `/call-center/calls` - 403; qolgan admin endpointlar - 200.

**Qanday kiradi.** Superadmin yaratadi (`assign-role`); majburiy 2FA (staging'da test admin 2FA'siz kirdi); sessiya oynasi 2 soat.

**Kunlik ish.** Seller arizalarini ko'rib chiqadi, xizmat/tarif/shablon katalogini yuritadi, reklama mahsulotlari, siyosatlar, huquqiy hujjatlar versiyalari, payout "to'langan" belgilash, 4 ko'zli tasdiqlar (admin tomoni), foydalanuvchi boshqaruvi, bildirishnoma yuborish, audit va xavfsizlik hodisalari.

**Ekranlar.** TZ §44: permission asosida dinamik drawer (planshet); mobil "Boshqaruv" hub. Veb guruhlar: Boshqaruv (Umumiy, CEO), Mijozlar va sotuv, Katalog va buyurtmalar, Konstruktorlar (Studio), Sotuvchilar, To'lov va moliya, Yordam va huquq, Tizim. Permission bilan ochiladigan bo'limlar: §5.2 matritsasi. Faqat to'liq admin (permission'siz) bo'limlar: Umumiy dashboard, CEO paneli, Integratsiyalar, Platforma qoidalari (policies), AI reglamentlari, Test OTP (faqat staging).

**Imkoniyatlar (qisqa).** Foydalanuvchilar (`GET/PATCH/DELETE /admin/users`, `assign-role`, 360 client), register/seller arizalar (`accept/reject`), reviews moderatsiya, servislar/kategoriyalar/paketlar CRUD, hujjat shablonlari (DOCX import, ZIP), tarif CRUD, reklama mahsulotlari, promotion eksport, marketplace buyurtma/seller monitoring (faqat o'qish), payout holati, `mark-paid`, legal consents (nashr va qayta rozilik), platforma siyosatlari (tarixi bilan), biznes kalendar (bayramlar), AI support reglamentlari (versiyali), Studio (butun kirish), HRM (hammasi), integratsiyalar holati, audit-trail (hash-zanjir, CSV), Excel eksportlar.

**Cheklovlar.** Rol/permission boshqarolmaydi (`roles.manage` faqat superadmin); call-center navbati/support operator chatlariga kira olmaydi (`callcenter.access` yo'q) - veb nav'da ham; payoutni "approve" qilish (`payout.approve`) yo'q (§9.1); veb'da admin uchun bypass faqat "perm'siz" bo'limlarda, perm'li bo'limlar uchun kod kerak.

**Pul.** Pul harakatini boshqaradi (payout, refund tasdig'i, `mark-paid`, tarif narxlari, komissiya siyosati), o'zi to'lamaydi/olmaydi.

**Bildirishnomalar.** `notifications.manage` bilan yuboradi; oladi: yangi seller arizasi, approvals (admin bosqichi), xavfsizlik anomaliyalari (taxmin).

---

### 4.9 Superadmin (`superadmin`)

**Kim.** Tizim egasi; 35 ta permission'ning hammasi; veb va mobil kodda hamma tekshiruvni chetlab o'tadi (`isSuper`). Backend'da ikkita nom bor: `superadmin` va `super_admin` (bir xil to'plam - §9.1).

**Qanday kiradi.** Birinchi superadmin - bir martalik `POST /admin/bootstrap-superadmin` (telefon + `bootstrap_key`; sidebar'da yo'q, URL orqali). Keyin `assign-role`. 2FA majburiy (staging'da test akkaunt 2FA'siz).

**Qo'shimcha imkoniyatlari.** Rollar va ruxsatlar boshqaruvi (`GET/POST /admin/roles`, `GET /admin/permissions`, `permission-matrix`, `POST /admin/users/assign-role`), `chat.open_for_dispute`, `audit.export`, `payout.approve`, `callcenter.access` (support operator chatlari, call-center navbati), `sales.access`; platforma-miqyosidagi qo'ng'iroq tarixi (`GET /admin/calls`), Studio butun huquqi, demo ma'lumot ("seed", test OTP - faqat staging).

**Cheklovlar.** Backend `403` hamma uchun yakuniy; superadmin ham operator support chatlari uchun `callcenter.access` ga muhtoj (unda bor).

---

### 4.10 Manager (`manager`)

**Kim.** Operatsion menejer; asosiy backend roli (`UserRole`). 16 ta permission: `approvals.manage, cases.manage, documents.manage, internal_analytics.view, internal_execution.manage, internal_kpi.manage, internal_time.manage, lawyers.verify, leads.manage, legal_aid.manage, meetings.manage, orders.manage, packages.approve, payments.manage, refunds.manage, replacements.manage`.

**Roli.** Four-eyes tasdiqning ikkinchi qo'li: refund va advokat almashtirish `admin-approve` + `manager-approve` talab qiladi (`/approvals/info`); mijoz advokat almashtirishni so'raganda menejer 24 soat ichida javob beradi (veb matni). Support supervisor (admin kabi `isSupportSupervisor`). Ichki HRM'da faqat `internal_execution, internal_time, internal_kpi, internal_analytics.view` (`MANAGER_INTERNAL`), jamoa vazifa/davomat/KPI.

**Ekranlar (veb nav):** Sotuv voronkasi, Navbatchi xizmat, Uchrashuvlar, Qo'ng'iroq tahlili, Marketplace monitoring, Sharh moderatsiyasi (`lawyers.verify`), Payoutlar (`payments.manage`), Tasdiqlashlar, Yuridik yordam (`legal_aid.manage`), Internal HRM.

**Cheklovlar.** `users.manage` yo'q (register arizalar, audit, huquqiy hujjatlar yo'q); `callcenter.access` yo'q (operator chatlari yo'q); `roles.manage` yo'q; Studio faqat grant bilan. Sessiya oynasi 2 soat. Majburiy 2FA.

**Pul.** Refund/replacement va payoutni tasdiqlash zanjirida; `packages.approve` (xizmat paketlarini tasdiqlash, `/admin/service-packages/{id}/approve`).

**Bildirishnomalar.** Tasdiq so'rovlari (taxmin), almashtirish so'rovlari, SLA buzilishlari.

---

### 4.11 Finance (`finance`)

**Kim.** Moliya xodimi. Permission'lar (3): `payments.manage, payout.approve, refunds.manage`. **Faqat shu rolda (superadmin'dan tashqari) `payout.approve` bor.**

**Ishi.** Payout hisob-kitobi (`calculated -> queued -> processing -> paid`; `held/failed/cancelled`), reconciliation (yalpi, platforma ulushi, provayder to'lovi, seller ulushi), `mark-paid`, to'lovlar eksporti (`/admin/payments/export.xlsx`), refund bo'yicha qaror.

**Ekranlar (veb).** Faqat "Payoutlar" (`payments.manage`); "Tasdiqlashlar" yo'q (`approvals.manage` rolda yo'q), refund UI veb'da topilmadi (§9.3).

**Cheklovlar.** Mijoz/seller/katalog bo'limlari yo'q. Veb'dagi majburiy 2FA ro'yxatida yo'q.

**Pul.** Platforma pul oqimining operatori: seller ulushini o'tkazish (haftalik payshanba, min 100 000), qaytarishlar (3 ish kuni ko'rib chiqish).

---

### 4.12 Quality control (`quality_control`)

**Kim.** Sifat nazorati. Permission'lar (3): `approvals.manage, cases.manage, chat.open_for_dispute`.

**Ishi (TZ).** Shikoyat va sifat navbati: shikoyat, ish va berilgan hujjatni ko'radi; asosli bo'lsa advokatga bepul redo, asossiz bo'lsa izoh bilan yopadi (TZ §25); nizo chatini ochish (`chat.open_for_dispute`); sifat ko'rsatkichlari `GET /quality/overview` (o'rtacha reyting, javob SLA %, shikoyat ulushi, flagged).

**Veb bilan farq.** Veb'da faqat "Tasdiqlashlar" ochiladi; sifat shikoyatlari navbati `callcenter.access` talab qiladi (rolda yo'q) va `/admin/quality` sahifasi mavjud emas; `chat.open_for_dispute` uchun UI topilmadi -> rolning asosiy ishi UI'da bajarib bo'lmaydi (§9.3).

---

### 4.13 Moderator (`moderator`)

**Kim.** Kontent/profil moderatori. Permission'lar (2): `documents.manage, lawyers.verify`.

**Ishi.** Sharh moderatsiyasi (`GET /admin/reviews`, `PATCH .../moderate` `approved|rejected`; statuslar `pending/approved/rejected`), seller verifikatsiyasi (`POST /admin/lawyers/{id}/verify`; vebda UI yo'q), isbot hujjatlarni ko'rish (`/admin/lawyer-proof-documents/{id}/file`).

**Cheklov.** Register arizalarni qabul/rad etish `users.manage` talab qiladi - moderatorda yo'q, garchi veb matni "moderatorlar hujjatlarni qo'lda ko'rib chiqadi" desa-da (§9.3).

---

### 4.14 B2B menejer (`b2b_manager`)

Permission'lar (3): `b2b.manage, leads.manage, orders.manage`. Ishi: korporativ mijozlar (`GET/POST/PATCH /b2b/clients`), bosqichlar `discovered -> contacted -> meeting -> diagnostics -> proposal -> negotiation -> contract -> active -> renewal` (yoki `lost`), shartnoma, hisob-faktura (QQS 12%), oylik hisobot (PDF), SLA, `/b2b/pipeline`, `/b2b/tasks`, `/b2b/products`; leadlar va marketplace monitoring ham ochiq. `b2b.manage` `ADMIN_PERMISSIONS` da emas: faqat `leads.manage` tufayli admin konsoliga kiradi.

---

### 4.15 Marketing (`marketing`)

Permission'lar (2): `ads.manage, leads.manage`. Ishi: reklama mahsulotlari (`/ads/products` CRUD, yumshoq o'chirish; turlar banner/featured/promotion/boost/ad/sponsored), promotion paketlari eksporti, leadlar va voronka, kanallar attributsiyasi (`/analytics/channels-attribution`). Veb'da roli bilan bog'liq alohida mantiq yo'q (faqat badge).

---

### 4.16 Content manager (`content_manager`)

Permission'lar (2): `services.manage, templates.manage`. Ishi: xizmatlar va kategoriyalar katalogi, hujjat shablonlari (DOCX import `{{field}}`, ZIP; import qilingan shablon faol emas - draft), Studio'da kontent konstruktorlari (Studio grant bilan: K02, K05, K06, K19...). Veb nav: Xizmatlar katalogi, Hujjat namunalari.

---

### 4.17 CEO viewer (`ceo_viewer`)

Permission'lar (4): `leads.manage, orders.manage, payments.manage, users.manage`. Nomi "ko'ruvchi" bo'lsa-da, `*.manage` kodlari yozish huquqini ham beradi (§9.3). Veb'da CEO paneli (`/admin/ceo`) va Umumiy dashboard permission'siz bo'lim - faqat admin/superadmin'ga ochiq, shu sababli ceo_viewer o'z panelini veb'da ocha olmaydi (faqat badge "CEO"). Backend `GET /analytics/ceo` (daromad, MRR/ARR, ARPU, GMV, take rate, CAC, LTV, NPS, MAU/DAU, gift KPI) ruxsati ceo_viewer uchun tekshirilmagan. Veb'da ochiladigan bo'limlar: sotuv voronkasi, navbatchi xizmat, uchrashuvlar, qo'ng'iroq tahlili, marketplace monitoring, register arizalar, payoutlar, audit va huquqiy hujjatlar (B2B va Umumiy/CEO ochilmaydi).

---

### 4.18 Executive (`executive`)

Permission'lar (5): `approvals.manage, cases.manage, organizations.manage, payments.manage, users.manage`. Veb kodida va matnlarida **umuman tilga olinmagan**; TZ §3.1 da biriktirilgan rol sifatida ro'yxatda. Taxmin: rahbariyat darajasidagi tasdiqlovchi (4 ko'z, to'lov, foydalanuvchilar, tashkilotlar). Ochiladigan veb bo'limlari: Payoutlar, Tasdiqlashlar, Register arizalar, Audit, Huquqiy hujjatlar.

---

### 4.19 Provider (`provider`)

Permission'lar (4): advokat/yurist bilan bir xil (`cases, documents, meetings, orders`). TZ §3.1 da qo'shimcha biriktirilgan rol, boshqa ta'rif yo'q; veb'da tilga olinmagan. Taxmin: tashqi xizmat ko'rsatuvchi (provider) - sotuvchi turi; mobil uchun advokat/yurist qobig'i bilan bir xil ishlashi mumkin. **Ochiq savol** (§9.3).

---

### 4.20 Ichki xodim overlay'i (`InternalEmployee`, Internal HRM)

**Kim.** Login userga bog'langan alohida ichki profil (tashqi marketplace profilidan ajratilgan) (TZ §3.9).

**Kirish qoidasi (`hasInternalAccess`).** Rol `admin, superadmin, manager, employee, internal_employee, internal_staff, staff, hr` yoki `internal_*` prefiksli rol, yoki 7 ta `internal_*` permission'dan biri. Jonli matritsada `employee/hr/internal_*` rollari **mavjud emas** - ichki xodim rollari yoki permission'lari qanday beriladi, aniq emas (§9.3).

| Modul | Talab | Asosiy amallar |
|---|---|---|
| Men: profil, bugun, vazifalar, davomat (o'qish), approvallar, xabarlar | faqat kirish | `GET /internal/me/*`; approval qarori `POST /internal/approvals/{id}/decision` (`approved/rejected` + izoh); `POST /internal/messages` |
| Xodimlar | `internal_hr.manage` | ro'yxat, yaratish, tahrirlash, 360, tayinlash (bo'lim + lavozim + maosh) |
| Tashkilot tuzilmasi | `internal_org.manage` | board (daraxt, zoom/pan), birliklar va lavozimlar CRUD |
| Ijro | `internal_execution.manage` | vazifa yaratish (sarlavha <=160, tavsif <=1000, muddat, ustuvorlik), status: `new, accepted, in_progress, in_review, done, returned, paused, cancelled`, izoh (<=2000), checklist, mas'ullar |
| Vaqt | `internal_time.manage` | jadval (hafta kunlari, boshlanish/tugash), davomat hodisalari `check_in, check_out, break_start, break_end`, kunlik davomat |
| KPI | `internal_kpi.manage` | metrikalar (manba: execution, attendance, sales, manual; target, actual, weight) |
| Payroll | `internal_payroll.manage` | yozuv turlari `salary, kpi_bonus, sales_bonus, one_time_bonus, penalty, advance, deduction, adjustment`; yangi yozuv `draft` holatida; xulosa (summary) |
| Analitika | `internal_analytics.view` | dashboard, Excel eksport |

Realtime: `WS /internal/ws/{channel}` (vazifa kanali `task:{id}`), `internal.*` hodisalari. **Cheklov:** veb'da oddiy xodim o'z davomatini belgilash tugmalari `internal_time.manage` talab qiladigan sahifada (o'z `me/attendance` sahifasi faqat o'qish) - oddiy xodim check-in qila olmaydi (§9.3). Internal HRM tashqi advokat/client menyusiga chiqmaydi (TZ §35).

---

### 4.21 Studio access overlay (Studio rollari)

**Kim.** Studio - platformaning no-code **konfiguratsiya konsoli**: 61 ta "konstruktor" (jonli `GET /studio/constructors`) 9 toifada - marketplace (33: kategoriya, xizmat, paket, narx qoidalari, savolnoma, hujjat shabloni, oferta, jarayon/status, checklist, SLA va kalendar, sifat/reyting/sanksiya, reklama paketlari, ranking, sotuvchi eligibility va narx chegarasi, sharh siyosati, shikoyat yechimi...), security (6), operations (10: feature flag, scheduled jobs, biznes kalendar, data retention, eksport, dashboard, ID va status reyestrlari...), communications (3: qo'ng'iroq texnik profili, konsultatsiya siyosati, bildirishnoma hodisalari), integrations (3), finance (2: to'lov operatsiyalari, komissiya va payout), subscriptions (1), support (1), crm (1), documents (1). Ya'ni kataloglar, narx/SLA/komissiya qoidalari kod chiqarmasdan o'zgartiriladi; `runtime_target` orqali jonli tizimga qo'llanadi.

**Kirish.** Rol emas, **access grant**: `studio_editor` (tahrir), `studio_reviewer` (ko'rib chiqish), `studio_publisher` (nashr/arxiv), `studio_admin` (hammasi). Grant foydalanuvchi + rollar + ixtiyoriy `constructor_codes` (qamrov, `*` = hammasi) + `expires_at`. `admin/superadmin` doim to'liq huquqli. `GET /studio/constructors` -> `user_roles` (jonli: client `[]`, sales_operator `[sales_operator]` - bo'sh ro'yxat qaytaradi).

**Ish oqimi (TZ §36).** konstruktorni tanlash -> reference data -> draft yaratish -> validate/preview -> save (versiya) -> submit -> approval route (sozlanadigan bosqichlar) -> publish -> runtime -> rollback/archive. Obyekt statuslari: `draft, submitted, in_review, changes_requested, approved, published, archived`; tahrir `submitted/in_review/archived` da qulflanadi; nashr faqat `approved` dan; qaror `approve | changes_requested | reject` (oxirgi ikkisida izoh majburiy). Approval route: `steps[{role,title}]`, `final_action`, `allow_self_approval=false`, `deadline_hours` (24 default), eslatmalar. Monitoring: heartbeat har 25 s, "online" = so'nggi 90 s; sessiya, saqlashlar, ishlagan vaqt; Excel eksport.

**Cheklovlar.** Admin tasdiqlamaguncha mahsulot production runtime'ga chiqmaydi (TZ §36). Telefonda review va monitoring to'liq, murakkab konstruktor tahriri planshet/desktop uchun. TZ "1-10 bosqich" deydi, veb UI esa 6 bosqichgacha cheklaydi (§9.6).

## 5. Role x modul / permission matritsasi

> Manbalar: (1) jonli `GET /admin/roles` + `/admin/permission-matrix` (superadmin tokeni bilan, faqat o'qish); (2) veb `lib/auth.tsx` va `components/admin/AdminShell.tsx` qoidalari (mobil `entities/access/model/modules.ts` ularni 1:1 ko'chirgan); (3) TZ §3, §44; (4) 4 ta test akkauntning (superadmin, admin, sales_operator, client) GET so'rovlariga haqiqiy javoblari (5.5). Belgilar: **●** to'liq, **◐** cheklangan/qisman, **·** yo'q, **g** - faqat access grant bilan.

### 5.1 Rol -> permission kodlari (jonli backend)

`adv/yur/prov` = `advokat`, `yurist`, `provider` (uchalasi bir xil to'plam). `tashkilot*` = `advokat_tashkiloti` = `organization_owner` (bir xil). `super` = `superadmin` = `super_admin`. `CC` = `call_center`, `CCL` = `call_center_lawyer`. `client` roli matritsada yo'q: permission'i bo'sh.

| Permission kodi | adv/yur/prov | tashkilot* | CC | CCL | sales | s_op | s_head | b2b | mkt | cont | mod | QC | fin | mgr | exec | ceo_v | admin | super |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `academy.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `ads.manage` | · | · | · | · | · | · | · | · | ● | · | · | · | · | · | · | · | ● | ● |
| `approvals.manage` | · | · | · | · | · | · | · | · | · | · | · | ● | · | ● | ● | · | ● | ● |
| `audit.export` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● |
| `b2b.manage` | · | · | · | · | · | · | · | ● | · | · | · | · | · | · | · | · | ● | ● |
| `callcenter.access` | · | · | ● | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | ● |
| `cases.manage` | ● | ● | ● | ● | · | · | · | · | · | · | · | ● | · | ● | ● | · | ● | ● |
| `chat.open_for_dispute` | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | · | · | · | ● |
| `documents.manage` | ● | ● | ● | ● | · | · | · | · | · | · | ● | · | · | ● | · | · | ● | ● |
| `internal_analytics.view` | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `internal_execution.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `internal_hr.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `internal_kpi.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `internal_org.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `internal_payroll.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `internal_time.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `lawyers.verify` | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | · | · | ● | ● |
| `leads.manage` | · | · | ● | · | ● | ● | ● | ● | ● | · | · | · | · | ● | · | ● | ● | ● |
| `legal_aid.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `meetings.manage` | ● | ● | ● | ● | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `notifications.manage` | · | · | ● | · | ● | ● | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `orders.manage` | ● | ● | ● | ● | ● | ● | · | ● | · | · | · | · | · | ● | · | ● | ● | ● |
| `organizations.manage` | · | ● | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | ● | ● |
| `packages.approve` | · | · | · | · | · | · | ● | · | · | · | · | · | · | ● | · | · | ● | ● |
| `packages.create` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `payments.manage` | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● | ● | ● | ● | ● |
| `payout.approve` | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | · | · | ● |
| `refunds.manage` | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● | · | · | ● | ● |
| `replacements.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| `roles.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● |
| `sales.access` | · | · | · | · | ● | ● | ● | · | · | · | · | · | · | · | · | · | · | ● |
| `services.manage` | · | · | · | · | · | · | · | · | · | ● | · | · | · | · | · | · | ● | ● |
| `subscriptions.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| `templates.manage` | · | · | · | ● | · | · | · | · | · | ● | · | · | · | · | · | · | ● | ● |
| `users.manage` | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● | ● | ● |
| **Jami** | 4 | 5 | 7 | 6 | 4 | 4 | 3 | 3 | 2 | 2 | 2 | 3 | 3 | 16 | 5 | 4 | 29 | 35 |

`TEST` roli (`academy.manage, approvals.manage, b2b.manage, packages.create`) - qoldiq/test yozuvi (§9.1).

Eslatma: `admin` da yo'q kodlar - `roles.manage, callcenter.access, sales.access, payout.approve, audit.export, chat.open_for_dispute`. Faqat `finance` va `superadmin` da `payout.approve` bor. `sales.access`, `academy.manage`, `packages.*`, `refunds.manage`, `replacements.manage`, `documents.manage`, `cases.manage`, `audit.export`, `chat.open_for_dispute`, `organizations.manage` uchun veb admin nav'ida bevosita bo'lim yo'q (backend endpoint'larida ishlatilishi mumkin, tekshirilmagan).

### 5.2 Staff rollari x admin/boshqaruv modullari

Qoida (veb `canSee`, mobil `visible`): bo'limda permission ko'rsatilgan bo'lsa - shu kod (yoki ro'yxatdan biri) kerak, superadmin hammasini ko'radi; permission'siz bo'lim - faqat `admin`/`superadmin`. Umuman admin konsoliga kirish (`hasAdminAccess`): `admin`/`superadmin` roli yoki 13 ta `ADMIN_PERMISSIONS` dan kamida bittasi (`leads.manage, services.manage, subscriptions.manage, templates.manage, ads.manage, users.manage, lawyers.verify, approvals.manage, legal_aid.manage, notifications.manage, roles.manage, payments.manage, callcenter.access`); `orders/meetings/organizations/b2b.manage` o'zi admin kirishini bermaydi - sotuvchilarda ham bor. Shu sababli `advokat, yurist, provider, tashkilot` admin konsoliga kira olmaydi.

| Admin moduli (mobil `manage/<kalit>`) | CC | CCL | sales | s_op | s_head | b2b | mkt | cont | mod | QC | fin | mgr | exec | ceo_v | admin | super |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| dash - Umumiy dashboard | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| ceo - CEO paneli | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| pipeline - Sotuv voronkasi | ● | · | ● | ● | ● | ● | ● | · | · | · | · | ● | · | ● | ● | ● |
| callcenter - Navbatchi xizmat | ● | ● | ● | ● | ● | ● | ● | · | · | · | · | ● | · | ● | ● | ● |
| meetings - Uchrashuvlar | ● | ● | ● | ● | ● | ● | ● | · | · | · | · | ● | · | ● | ● | ● |
| callAnalytics, retention | ● | · | ● | ● | ● | ● | ● | · | · | · | · | ● | · | ● | ● | ● |
| b2b - B2B mijozlar | · | · | · | · | · | ● | · | · | · | · | · | · | · | · | ● | ● |
| marketplace - monitoring | ● | ● | ● | ● | · | ● | · | · | · | · | · | ● | · | ● | ● | ● |
| services - Xizmatlar katalogi | · | · | · | · | · | · | · | ● | · | · | · | · | · | · | ● | ● |
| plans - Paket tariflar | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| templates - Hujjat namunalari | · | ● | · | · | · | · | · | ● | · | · | · | · | · | · | ● | ● |
| ads - Reklama mahsulotlari | · | · | · | · | · | · | ● | · | · | · | · | · | · | · | ● | ● |
| registerRequests | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● | ● | ● |
| reviews - sharh moderatsiyasi | · | · | · | · | · | · | · | · | ● | · | · | ● | · | · | ● | ● |
| payouts | · | · | · | · | · | · | · | · | · | · | ● | ● | ● | ● | ● | ● |
| approvals - 4 ko'z | · | · | · | · | · | · | · | · | · | ● | · | ● | ● | · | ● | ● |
| support - operator chatlari | ● | ● | · | · | · | · | · | · | · | · | · | · | · | · | · | ● |
| legalAid - Yuridik yordam | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| notifications - yuborish | ● | · | ● | ● | · | · | · | · | · | · | · | · | · | · | ● | ● |
| roles - Rollar va ruxsatlar | · | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● |
| audit, legal (hujjatlar) | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● | ● | ● |
| integrations, policies, aiReglaments, testOtps | · | · | · | · | · | · | · | · | · | · | · | · | · | · | ● | ● |
| internal - HRM | · | · | · | · | · | · | · | · | · | · | · | ● | · | · | ● | ● |
| studio (access grant bo'lsa) | g | g | g | g | g | g | g | g | g | g | g | g | g | g | ● | ● |

Izohlar:
- "Navbatchi xizmat" sahifasining ichki bo'limlari (navbat, tezkor pool, sifat shikoyatlari, call log) faqat `isCallCenterUser` (kod `callcenter.access` yoki `call_center`/`call_center_lawyer` roli) uchun; sales rollari faqat Lead doskasi va mijoz qidirishni ko'radi.
- "Support" (operator chatlari) `callcenter.access` talab qiladi - `admin` rolida bu kod yo'q, shuning uchun admin operator ticketlarini ochmaydi (jonli: `/call-center/support/tickets` -> 403).
- `studio`: `g` = Studio kirishi `studio_*` access grant bilan; `admin`/`superadmin` doim.
- `internal`: `manager` faqat ijro/vaqt/KPI/analitika qismlarini (`MANAGER_INTERNAL`) ko'radi; `admin`/`superadmin` hammasini. Boshqa rollar `internal_*` kodlari yoki `employee/hr/internal_*` rollari bilan.
- Veb nav'ida yo'q, lekin `ADMIN_PERMISSIONS` ga kiruvchi `roles.manage` faqat superadmin'da.
- Mobil hub shu qoidalarning nusxasi; farqi: mobil `chats` modulini barcha kirgan foydalanuvchiga ochadi.

### 5.3 Foydalanuvchi modullari x asosiy rollar (TZ §3, §44)

| Modul | Mehmon | Client | Advokat / Yurist | Tashkilot egasi | Call-center operator | Call-center yurist | Sales | Admin | Super |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| AI yuridik chat | ◐ limit | ● | ● (AI yordamchi) | ● | ◐ | ◐ | ◐ | ◐ | ◐ |
| AI Instructor | · | ● | ● | ● | ● | ● | ● | ● | ● |
| Hujjat katalogi / konstruktor (qo'lda, AI) | ◐ ko'rish | ● | ◐ shablon | ◐ | · | ◐ | · | ● boshqarish | ● |
| Navbatchi advokatga hujjat so'rovi yuborish | · | ● | · | · | ◐ client nomidan | · | · | · | · |
| Hujjat pool + claim | · | · | ◐ (veb tab bor; TZ: faqat tayinlangan) | ◐ | · | ● | · | ◐ o'qish | ● |
| Hujjat editor (OnlyOffice) | · | · | ● | ● | · | ● | · | · | · |
| Hujjat tahlili (AI + advokat) | · | ● | ◐ | ◐ | · | · | · | · | · |
| Mening hujjatlarim / Mening ishlarim | · | ● | ◐ (mijoz ishlari boshqa ekranda) | ◐ | · | · | · | · | · |
| Marketplace: xarid qilish | ◐ ko'rish | ● | · (o'z xizmatini olmaydi) | · | ◐ assist | · | · | · | · |
| Marketplace: sotuvchi (xizmat, narx, buyurtma, availability) | · | · | ● | ● (a'zolari bilan) | · | · | · | · | · |
| Marketplace monitoring (admin) | · | · | · | · | ● | ● | ● | ● | ● |
| Tezkor advokat: so'rov yuborish, SOS | · | ● | · | · | ◐ assist | · | · | · | · |
| Tezkor advokat: navbat boshqaruvi | · | · | ◐ tayinlangan (o'qish) | ◐ | ● | ◐ ijrochi | · | ◐ | ● |
| Secure chat | · | ● | ● | ● | ● | ● | ● | ● | ● |
| Qo'ng'iroq boshlash / meeting yaratish (`meetings.manage`) | · | ◐ (hujjat audio, <=3) | ● | ● | ● | ● | · | ● | ● |
| Kiruvchi qo'ng'iroqni qabul qilish | · | ● | ● | ● | ● | ● | ● | ● | ● |
| Support: ticket ochish | · | ● | ● | ● | · | · | · | · | · |
| Support: operator konsoli | · | · | · | · | ● | ● | · | · | ● |
| Rating / shikoyat qoldirish | · | ● | · | · | · | · | · | · | · |
| Shikoyat hal qilish (sifat navbati) | · | · | ◐ redo bajaradi | ◐ | ● | ◐ | · | ◐ | ● |
| CRM lead / voronka | · | · | · | · | ● | · | ● | ● | ● |
| Obuna / entitlement sotib olish | · | ● | ◐ (AI tariflar) | ◐ | · | · | · | · | · |
| To'lov tarixi, chek | · | ● | ◐ payout | ◐ | · | · | · | ● | ● |
| Workspace saqlash | · | · | ● | ● | · | ◐ (asosiy rol yurist/advokat bo'lsa) | · | · | · |
| Kalendar, mijozlar bazasi, ishlar (cases) | · | · | ● | ● | · | ◐ | · | · | · |
| Seller onboarding / verifikatsiya | · | · | ● | ● | · | · | · | ● ko'rib chiqish | ● |
| Reklama (promotion) sotib olish | · | · | ● | ● | · | · | · | · | · |
| Tashkilot dashboardi / workload | · | · | · | ● | · | · | · | ◐ | ◐ |
| Referral / gift / akademiya / kafolat | · | ● | ◐ referral, akademiya | ◐ | · | · | · | · | · |
| Admin "Boshqaruv" hub | · | · | · | · | ◐ | ◐ | ◐ | ● | ● |
| Internal HRM | · | · | · | · | g | g | · | ● | ● |
| Studio | · | · | · | · | g | g | g | ● | ● |

Izoh: "AI yuridik chat" va "AI Instructor" qatorlarida staff ustunlari (taxmin) - TZ §3.8 staff uchun AI chatni alohida tilga olmaydi, lekin veb AdminShell'da AI yordamchi va mobil staff tab-barida AI tabi bor. Hujjat pool qatorida Admin ustuni: `GET /call-center/document-requests/open` jonli 200 qaytardi.

### 5.4 Permission kodi -> nima ochadi (veb/mobil)

| Kod | Nima ochadi | Izoh |
|---|---|---|
| `leads.manage` | Sotuv voronkasi, Navbatchi xizmat (lead doskasi), Uchrashuvlar, Qo'ng'iroq tahlili, Ushlab qolish; `/admin/leads*` | admin konsoliga kirish kodi; `GET /admin/calls` (platforma tarixi) |
| `callcenter.access` | Navbat, tezkor pool, sifat shikoyati, call log, **operator chatlari (support)**, qo'ng'iroq loglari | `isCallCenterUser`; support navbati aynan shu kodni tekshiradi |
| `meetings.manage` | Qo'ng'iroq/meeting boshlash (`canMakeCalls`) | sotuvchilarda ham bor; qabul qilish/qo'shilish hammaga ochiq |
| `orders.manage` | Marketplace monitoring; `POST /matching/orders/{id}/assign-next` | sotuvchilarda ham bor -> o'zi admin kirishini bermaydi |
| `services.manage` / `templates.manage` / `subscriptions.manage` / `ads.manage` | Katalog / shablonlar / tariflar / reklama mahsulotlari | content_manager, marketing, admin |
| `users.manage` | Register arizalar, audit-trail, huquqiy hujjatlar; `GET /admin/users` | operatorlar ro'yxati, mijoz 360 kartasi |
| `lawyers.verify` | Sharh moderatsiyasi; seller `verify` endpointi | moderator, manager |
| `approvals.manage` | Tasdiqlashlar (4 ko'z) | quality_control, manager, executive |
| `payments.manage` | Payoutlar, reconciliation | `payout.approve` alohida (finance/super) |
| `notifications.manage` | Bildirishnoma yuborish | sales, call_center |
| `legal_aid.manage` | Yuridik yordam | manager, admin |
| `roles.manage` | Rollar va ruxsatlar | faqat superadmin |
| `b2b.manage` | B2B mijozlar | b2b_manager, admin |
| `cases.manage`, `documents.manage` | Sotuvchi/ichki ish va hujjat endpointlari (case, editor) | veb nav'da bo'lim yo'q |
| `organizations.manage` | Tashkilot egasi funksiyalari | sotuvchi/tashkilot egasi; admin kirishini bermaydi |
| `internal_hr / _org / _execution / _time / _payroll / _kpi .manage`, `internal_analytics.view` | HRM modullari (§4.20) | `manager` faqat execution/time/kpi/analytics |
| `packages.create`, `packages.approve` | Xizmat paketi yaratish/tasdiqlash (`/admin/service-packages/*`) | sales_head, manager, admin; veb nav'da bo'lim yo'q |
| `refunds.manage`, `replacements.manage` | Qaytarish / advokat almashtirish so'rovlari (4 ko'z) | finance, manager, admin; refund UI veb'da yo'q |
| `payout.approve` | Payoutni tasdiqlash | finance, superadmin |
| `sales.access` | Sotuv ish maydoni (maqsadi aniq emas) | veb nav'da ishlatilmaydi (§9.3) |
| `chat.open_for_dispute` | Nizo chatini ochish | quality_control, superadmin; UI topilmadi |
| `academy.manage`, `audit.export` | Akademiya boshqaruvi, audit eksport | admin/super |

### 5.5 Jonli tasdiqlash (GET -> HTTP holat)

| Endpoint | superadmin | admin | sales_operator | client |
|---|:-:|:-:|:-:|:-:|
| `/admin/dashboard`, `/admin/users`, `/admin/payouts`, `/admin/register-requests`, `/admin/audit-trail`, `/admin/complaints`, `/admin/reviews`, `/admin/services`, `/admin/studio/access`, `/analytics/ceo`, `/internal/*`, `/approvals`, `/b2b/pipeline`, `/payments/reconciliation` | 200 | 200 | 403 | 403 |
| `/admin/roles`, `/admin/permissions` | 200 | **403** | 403 | 403 |
| `/call-center/queue`, `/call-center/support/tickets`, `/call-center/calls` | 200 | **403** | 403 | 403 |
| `/call-center/document-requests/open`, `/call-center/quality-complaints` | 200 | 200 | 403 | 403 |
| `/admin/leads`, `/admin/marketplace/orders`, `/admin/calls`, `/call-center/leads`, `/call-center/urgent-advokat/requests` | 200 | 200 | 200 | 403 |
| `/legal-aid/requests` | 200 | 200 | 403 | 403 |
| `/clients/me/works`, `/clients/me/entitlements`, `/support/tickets/me`, `/secure-chats`, `/notifications`, `/orders`, `/cases`, `/marketplace/me/orders`, `/referrals/me`, `/payouts/me`, `/urgent-advokat/requests/assigned` | 200 | 200 | 200 | 200 |
| `/lawyers/me`, `/lawyers/me/cabinet`, `/seller/me/cabinet`, `/workspace/quota` | 403 | 403 | 403 | 403 (sotuvchi emas: workspace "faqat advokat va yuristlar uchun") |
| `/promotions/me` | 404 (marshrut TZ §20 da bor, jonli yo'q) | 404 | 404 | 404 |
| `/studio/constructors` | 61 obyekt | 61 obyekt | bo'sh ro'yxat | bo'sh ro'yxat |

Kuzatuv: client `GET /orders` va `/cases` ga 200 oladi, ya'ni "403" faqat staff endpointlarida; mobil `403` ni yakuniy qaror deb qabul qilishi kerak (TZ §3.2).

## 6. Rollararo oqimlar va status mashinalari

> Har bir senariy "kim -> nima -> qaysi status/endpoint -> keyingi kim" ko'rinishida. Statuslar jonli backend (siyosat, ro'yxat javoblari) va veb kodidan olingan; TZ §6.2 umumiy guruhlari ("draft / pending / open / claimed / in_review / completed / cancelled") shu aniq statuslarning ustki qatlami xolos. Mobil ilova statusni taxmin qilmaydi va backend qaytarmagan tugmani ko'rsatmaydi (TZ §6.2).

### 6.1 Client: ro'yxatdan o'tish -> entitlement -> birinchi qiymat

1. **Client** `register/start` -> Telegram botda OTP -> `register/verify` -> token + `/auth/me` (`account_status=active`, `permissions=[]`). Mehmon sifatida ishlatgan AI chat limiti (2/24 soat) o'rniga ro'yxatdan o'tgan foydalanuvchi oyiga 5 ta bepul AI so'rov oladi (jonli: `lexgo-ai-free`).
2. Huquqiy roziliklar (`GET /legal/consents`, `POST .../accept`) - yangi versiya chiqsa qayta so'raladi (admin "qayta rozilik" bayrog'i).
3. `GET /clients/me/entitlements` -> `has_active_subscription`, `ai_limit`, `manual_documents.{manual_document_templates, template_download, manual_document_fill}`. Obuna yo'q bo'lsa hujjat qo'lda to'ldirish/yuklab olish oyiga 3 tadan keyin pullik (19 000) (veb); `402` kelsa -> tariflar ekrani.
4. Client tarif tanlaydi -> §6.15. Referral kodi bilan kelgan bo'lsa `referred_by_user_id` saqlanadi.
5. `/ws/users/me` ulanadi; bildirishnoma preferences yuklanadi.

### 6.2 AI chat, AI Instructor va support AI

- **AI yuridik chat** (`/clients/{id}/chats`): maslahat beradi, xizmat/advokat tavsiya qiladi (intake: `POST /ai/classify` -> kategoriya, shoshilinchlik, 3 darajali paket). U yuridik qaror emas; kerak bo'lsa "advokatga yuborish" tugmasi hujjat/marketplace/urgent oqimiga o'tkazadi. Natija PII maskalangan holda AI'ga ketadi.
- **AI Instructor** (`/ai/instructor/*`): mobil har ekranda `visible_targets` reyestrini yuboradi; instructor `navigate/scroll_to/highlight/tooltip/open_modal/prefill/preview_action/request_confirmation` qaytaradi. To'lov, rozilik, o'chirish, sotib olish - `actions/preview` -> native confirm -> `actions/confirm`; foydalanuvchisiz yakunlanmaydi.
- **Support AI** admin kiritgan **reglamentlar** (`/admin/ai/support/reglaments`, versiyali; "javobsiz savollar" ro'yxati `gaps`) asosida javob beradi; topolmasa operatorga o'tishni taklif qiladi (§6.7).

### 6.3 Hujjat: uch usul va "navbatchi advokat" oqimi (asosiy rollararo oqim)

**Umumiy:** client katalogdan xizmat tanlaydi (`/service-categories` -> `/services` -> `passport`), `document-fields` sxemasi section/order bo'yicha chiziladi (label/type/required/options mobil tomonidan o'zgartirilmaydi). Uch usul (TZ §11-14):

| Usul | Bosqichlar | Natija |
|---|---|---|
| **Qo'lda** | field schema -> wizard -> lokal draft -> `document-preview` -> `document-generate` | server shablon formatini saqlagan fayl |
| **AI bilan** | `document-ai/questions` (dinamik savollar) -> `document-ai/generate` | original shablon asosidagi fayl; `ai_document_ready` |
| **Navbatchi advokat bilan** | `document-lawyer/request` yoki `request-with-files` (fayl/ovoz) | advokat tayyorlagan fayl |

**Navbatchi advokat (batafsil):**

| # | Kim | Amal | Status / hodisa |
|---|---|---|---|
| 1 | Client | `GET /document-requests/service-flow` orqali ochiq so'rov yo'qligini tekshiradi (`can_send_lawyer_request`); so'rov yuboradi | `questionnaire` -> to'lov kerak bo'lsa `payment_required` / `pending_payment` (Telegram inline tasdig'i kutadi) |
| 2 | Client | Telegram'da to'lovni tasdiqlaydi / bekor qiladi | `lawyer_review_requested` -> yoki `payment_cancelled` / `payment_rejected`; `/ws/users/me` hodisasi `document_request.payment_approved/_rejected` |
| 3 | Backend | So'rov call-center yuristlari poolga tushadi | `open_pool` (client ko'radi: "Navbatchi mutaxassis kutmoqda"); hodisa `document_request_created`, `document_request.pool_created` |
| 4 | Call-center yurist (yoki ruxsat etilgan advokat) | `GET /call-center/document-requests/open` -> `claim` | `claimed` ("Mutaxassis ishni oldi"); ikkinchi urinish `409`; `pool_removed`; client/advokat o'rtasida secure chat ochiladi |
| 5 | Advokat | Editor oldi: manba tanlaydi (o'z fayli / mijoz fayli / AI draft) -> OnlyOffice -> `editor/draft` saqlaydi; ixtiyoriy 15 daqiqalik meeting (client advokatga hujjat uchun <=3 marta audio call qila oladi) | `lawyer_review`; `editor_saved` |
| 5a | Advokat/CCY | Boshqa advokatga `transfer` | yangi assignee realtime xabar oladi |
| 6 | Advokat | `editor/finalize` (faqat save tasdiqlangandan keyin) | `file_ready` ("Natija tayyor"); `document_request_file_ready`, `document_lawyer_request_ready` |
| 7 | Client | Preview/download, kerak bo'lsa tuzatish uchun chat | - |
| 8 | Client | 15 daqiqalik oynada baho (`POST /document-requests/{id}/rating`) | `rated` (`rating_available`, `rating_deadline_at`, `rating_submitted`); oyna tugasa yopiladi |
| 9 | Backend | Baho 1-2 yulduz -> sifat shikoyati ochiladi | `quality_complaint.created` (call-center sifat navbati) -> §6.8 |

Himoyalar: bir hujjatga bitta ochiq so'rov; client konstruktorni tanlasa ham ochiq advokat so'rovi yakunlanmaguncha yangisi ochilmaydi; payment faqat Telegram tasdig'idan keyin "paid"; pool'da `open_pool` 24 soatdan oshsa veb "kechikkan" deb belgilaydi; "Mening hujjatlarim" (arxiv) va "Mening ishlarim" (jarayon, tur `document_lawyer_work`) alohida.

### 6.4 Hujjat tahlili (AI + advokat)

1. Client faylni yuklaydi (`POST /ai/document-analysis/file`, <=20 MB; 1 bet ~ 2 500 belgi) yoki matn yuboradi; sahifa sonini client taxmin qilmaydi.
2. `POST /ai/document-analysis/quote`: bepul chegara (obuna: 10 yoki 25 bet; yoki AI tarif kvotasi) ichida bo'lsa to'lovsiz; undan oshsa server quote qaytaradi (1-10 bet 149 000, 11-20 299 000, 21-30 499 000, +15 000/bet, shoshilinch +50%, yozma xulosa +99 000).
3. AI xavf/xulosa natijasi qaytadi. "Advokatga yuborish": `POST /document-services/review-existing/request` -> to'lov Telegram'da tasdiqlanmaguncha advokatga yuborilmaydi (`document_review_payment_required`) -> tasdiqdan keyin pool (§6.3 4-qadamdan), `existing_document_review_sent`. Advokat ishni olgach client bergan fayl editorning manbalaridan biri bo'ladi. Va'da qilingan muddat: ish vaqtida 60 daqiqagacha (veb matni).

### 6.5 Marketplace buyurtma: client -> seller -> to'lov -> payout -> moliya

| # | Kim | Amal | Status |
|---|---|---|---|
| 1 | Client | Qidiradi (`/marketplace/lawyers`, `ai-search`), profil, xizmat (`/services`), `POST .../purchase-request` (summa clientdan olinmaydi; o'z xizmatini sotib olish bloklanadi; takroriy pending `409`) | order `pending_payment` (to'lov kutilmoqda), `payment_status=pending`; seller navbatiga **tushmaydi** (to'lanmagan) |
| 2 | Client + Telegram | To'lovni tasdiqlaydi (Telegram inline) | hodisa `marketplace_purchase_requested` -> `marketplace_purchase_approved`; order `paid`, `payment_status=paid`, `contact_unlocked=true`; secure chat xonasi ochiladi (`secure_chat_room_id`) |
| 3 | Seller | Yangi buyurtmani ko'radi (30 ish daqiqasi javob muddati, `confirmation_deadline_at`); `accept` yoki `decline` (9 sabab) | `sent_to_seller` -> `accepted` / `declined` (taxmin: marketplace buyurtmasi `paid` dan keyin ham shu bosqichdan o'tadi - siyosat jadvalida `paid -> accepted`); muddat o'tsa "Javob muddati tugadi", mijozga boshqa advokatlar taklif qilinadi, seller balli tushadi |
| 3a | Call-center | Rad etilgan/javobsiz buyurtmani `POST /matching/orders/{id}/assign-next` bilan keyingi seller'ga o'tkazadi (`orders.manage`) | `seller_selection` -> `sent_to_seller` |
| 4 | Seller + Client | Chat, qo'ng'iroq, hujjat almashinuvi; seller ishni boshlaydi | `started` / `in_progress` |
| 5 | Seller | Natijani topshiradi (`PATCH /orders/{id}/status`) | `result_ready` -> (`quality_check`) -> `delivered` |
| 6 | Client | "Ishni tasdiqlash": `POST /marketplace/me/orders/{id}/complete` yoki milestone `release` | `client_confirmation` -> `completed`; bosqich puli sotuvchiga (escrow `held` -> `released`) |
| 7 | Client | 15 daqiqalik baho oynasi, kerak bo'lsa shikoyat | `rated` |
| 8 | Backend | To'lov bo'linadi (`/payments/{id}/split`): platforma 18%, provayder 1%, seller ulushi | payout `calculated` |
| 9 | Moliya/admin | Haftalik (payshanba) ro'yxat; min 100 000; `PATCH /admin/payouts/{id}` | `queued` -> `processing` -> `paid` (yoki `held`/`failed`/`cancelled`) |
| 10 | Seller | `GET /payouts/me` | - |

Bekor qilish: client `POST /marketplace/me/orders/{id}/cancel` (faqat `new, waiting_info, waiting_docs, waiting_payment, seller_selection`); to'langan ish bo'yicha qaytarish -> §6.14. Backend siyosatida ikkinchi, "bosqichli" (milestone) varianti ham bor: `POST /orders` -> `waiting_payment` -> avans 10% (`/orders/{id}/milestones/{mid}/pay`) -> kontakt ochiladi -> qolgan 90% bosqichlar bo'yicha; mobil hozir aynan shu yo'ldan foydalanadi (§9.2).

### 6.6 Tezkor advokat (urgent)

| # | Kim | Amal | Status |
|---|---|---|---|
| 1 | Client | `GET /urgent-advokat/catalog` -> xizmat turi tanlaydi (6 tur), sohalar (`directions`), hudud (ixtiyoriy), tavsif (>=10 belgi), fayl/ovoz; guruh uchun 2-7 advokat; `POST /urgent-advokat/requests` | `open_pool` (pool turlari) |
| 1a | Backend | Guruh ikkinchi fikr uchun eligibility: oldin LexGo xizmati bo'lishi shart (`second_opinion_eligible_sources`), aks holda `402 previous_lexgo_advokat_service_required` | - |
| 2 | Express / YTX (`immediate_call`) | Navbat yo'q: yo'nalishga mos, band bo'lmagan navbatchi advokatga **darhol audio call** yuboriladi (`direct_on_duty_call`); client audio xonaga kiradi | `urgent_advokat.express_call_started` |
| 3 | Call-center operatori | Pool'dan `claim` (private chat ochiladi, client xabardor) | `claimed` |
| 4 | Operator | Yakka: `candidates` -> `transfer`/tayinlash; Guruh: 3-7 (kamida 2) yo'nalishga mos advokat + vaqt (`assign-group`) | `scheduled` (vaqt berilsa) yoki `in_progress` |
| 5 | Operator/advokat | `POST .../meeting` (30 daqiqalik LiveKit); chat variantida guruh secure chat | `meeting_active` |
| 6 | Advokat | Konsultatsiya; pause/uzaytirish/recording (§6.13); guruh chatni `chat/complete` bilan yopish | - |
| 7 | Operator | `complete` (xulosa, fayl, keyingi qadam) | `completed`; client xulosani bildirishnoma va chat xabari sifatida oladi |
| 8 | Client | 15 daqiqalik baho (`POST /urgent-advokat/requests/{id}/rating`) | 1-2 yulduz -> sifat shikoyati (§6.8) |
| x | Operator/client | `cancel` (sabab clientga ko'rinadi) | `cancelled`; `expired` - vaqt o'tsa |

Operator `status` ni faqat yozuvning `lifecycle.next_statuses` ichidan o'zgartiradi. Operator client nomidan ham so'rov yarata oladi (`source=callcenter_assist/support_assist`; client "Operator yaratgan" belgisini ko'radi) va to'lovni Telegram'da client tasdiqlaydi. Narx: `price` (katalogdan, guruh: advokat soniga ko'paytiriladi - staging misoli 2 advokat x 200 000 = 400 000).

### 6.7 Support ticket va operator "assist"

1. **Client** support AI bilan gaplashadi; javob topilmasa `POST /support/tickets` (kategoriya `general/subscription/payment/marketplace/documents/urgent_advokat/account/technical`, ustuvorlik `low/normal/high/urgent`, tavsif <=4000). Operator AI bilan oldingi suhbat kontekstini ko'radi. Status `ai_handling` -> `waiting_operator`.
2. **Operator** (call-center) `claim` -> `claimed` (boshqasi olgan bo'lsa `409`); supervisor (admin/manager) boshqaning ticketini kuzatuv rejimida ochadi.
3. Xabarlar `POST/GET /support/tickets/{id}/messages` (+ WS `support.ticket_message`).
4. **Assist:** `assist/context` (client holati) -> operator variant tanlaydi (`subscription-preview/-checkout`, `document-lawyer-request`, `marketplace-purchase-request`, `urgent-advokat-request`) -> client ekraniga **preview** realtime keladi (`support.assist_*`) -> client tasdiqlaydi -> kerak bo'lsa Telegram to'lov tasdig'i -> backend amalni yakunlaydi -> ikkala tomonda status yangilanadi. Status `waiting_client_confirm`.
5. Operator `transfer` (boshqa operator + sabab; yangi operator `support.ticket_transferred_to_you` oladi) -> `transferred`.
6. Operator qo'ng'iroq: `POST /call-center/support/tickets/{id}/calls` (audio/video; faqat operator).
7. `close` (resolution) -> `resolved`/`closed`; client `reopen` -> `reopened`. Client bekor qilsa `cancelled`.

### 6.8 Baho, shikoyat va sifat nazorati

1. Ish `completed` bo'ladi -> clientga **15 daqiqalik** oyna (`rating.available`, `deadline_at`, `remaining_seconds`); 15 daqiqadan keyin baho ham, shikoyat ham yopiladi (`closed_reason`: `expired/submitted/not_ready/status_not_rateable`).
2. Baho (+ixtiyoriy izoh) sotuvchi reytingiga ta'sir qiladi (reyting <5 sharh bo'lsa "Yangi"). **Shikoyat bahodan alohida** biznes obyekt (`POST /complaints`: mavzu 3-150, tavsif 15-4000, kategoriya `service/lawyer/payment/quality/sla/other`).
3. 1-2 yulduzli baho avtomatik **sifat shikoyati** ochadi -> call-center sifat navbati (`quality_complaint.created`).
4. Operator shikoyat + ish + berilgan hujjatni ko'radi, `resolve` (izoh majburiy): `rework_required` (bepul redo; shu advokatga ish qayta ochiladi, `quality_complaint.rework_started`), `rejected` (clientga izoh) yoki `resolved`.
5. Advokat qayta ishlaydi (`rework_in_progress`) -> client qayta baholaydi. Doimiy muammo bo'lsa client advokat almashtirishni so'raydi (§6.14). Sifat KPI'lari: `GET /quality/overview`; sharh moderatsiyasi (`pending -> approved/rejected`) moderator/menejer tomonidan.

### 6.9 Seller onboarding: ro'yxatdan o'tish -> tasdiq

1. Seller (advokat/yurist) register: `register/start` -> OTP -> `register/verify`; rol-ga xos maydonlar (§4.2/4.3). Natija: `account_status=pending` (token berilishi yoki "so'rov yuborildi" xabari); 2FA majburiy bo'lsa darhol `loginRequired`.
2. Login (2FA) -> cheklangan kabinet (dashboard, profil, tarif, bildirishnoma, support); yurist uchun xizmat tanlash ham.
3. Onboarding checklist: profil -> identifikatsiya (MyID/OneID) -> hujjatlar (`POST /seller-onboarding/documents`) -> xizmatlar -> narx -> `submit` (kam bo'lsa `422`). Isbot hujjatlar admin tomonidan token bilan yuklab olinadi (`/admin/lawyer-proof-documents/{id}/file`).
4. **Admin** (`users.manage`) `GET /admin/seller-requests` (rol tablari, sana filtri, statistika) -> detail -> 4 band: telefon, shaxs, professional profil, qoidalar -> `accept` / `reject`. Moderator `lawyers.verify` bilan `POST /admin/lawyers/{id}/verify` (veb'da UI yo'q).
5. Tasdiqdan keyin: marketplace'da public ro'yxatga chiqadi (`is_verified`), xizmat sota oladi, workspace (1 GB), kabinet to'liq ochiladi. Pending seller public chiqmaydi va sotmaydi.
6. Xizmat narxi: tavsiya oralig'i (70-100%) va ceiling (staj/hudud/reyting/soha ustamalari) backenddan; yurist `advokat_required` xizmatni qo'sha olmaydi.

### 6.10 Tashkilot egasi oqimlari

1. Egasi `POST /organizations` (nom, telefon, STIR, hudud, manzil) -> `verification_status=pending` -> admin tasdig'i.
2. `POST /organizations/{id}/members` (`user_id` + lavozim) - a'zo advokat/yuristlar. A'zo `status` (`active/inactive/suspended`).
3. Egasi a'zo nomidan xizmat qo'shadi/narx/status o'zgartiradi (`.../members/{uid}/services/manage`) va promotion xarid qiladi (`organization_id` bilan).
4. Mijoz a'zo xizmatini sotib oladi (§6.5); buyurtma a'zoning ishi, lekin egasi dashboard'da ko'radi: a'zolar, faol ishlar, kechikkan, bajarilgan, daromad, yuklama (buyurtma/case/urgent bo'yicha), `owner/workload` filtrlari (a'zo, status).
5. Egasi qaysi advokat nima ish qilayotganini detailga (WorkDetail) kirib ko'radi; qayta taqsimlash ishning o'zida (`transfer`) yoki call-center orqali. Boshqa tashkilot ma'lumoti `403`.

### 6.11 CRM: lead -> sotuv/call-center -> konversiya

1. **Lead manbalari:** veb formalar (`POST /leads`, `source=web`), call-center qo'lda (`POST /call-center/leads`, `POST /admin/leads`), B2B so'rovi ("Taklif so'rash"), kanal attributsiyasi (`/analytics/channels-attribution`).
2. Yaratilganda `score` (`hot/warm/cold`), `urgency` (`low/normal/high/critical/urgent`), `category`, `region`. Backend (yoki veb) eng kam yuklangan faol `call_center`/`sales` operatoriga avtomatik tayinlaydi (`round_robin`/`least_loaded`, hudud ustuvor); tayinlash `lead.details.assigned_to_user_id` ga yoziladi.
3. Kanban ustunlari (sozlanadi; jonli): `new` -> `contacted` -> `qualified` -> `proposal` -> `won` | `lost` | `duplicate` (oxirgi uchtasi final; final ustunni o'chirib bo'lmaydi, lead bor ustun o'chirilsa qayta tayinlash kerak).
4. Operator/sales: call log (`answered/no_answer/busy/callback/wrong_number`), eslatma vazifa, timeline; `lost` ga o'tkazishda sabab (`price/solved_self/competitor/no_answer/no_service/spam`) majburiy.
5. **Konversiya:** lead `client_user_id` ga bog'lanadi; `won` -> mijoz buyurtma/obuna oladi (marketplace/support assist orqali); sotuv bonusi HRM payroll'da (`sales_bonus`). Yo'qotilgan/uzoq vaqt faol bo'lmagan mijoz uchun `retention` navbati ("win_back" taklifi, `POST /retention/queue`; staging'da `/retention/*` 404).
6. Kanban ko'chirish optimistik; backend `409/422` bersa oldingi ustunga qaytariladi (TZ §34). SLA: navbatda lead/order 60 daq, urgent 15 daq (`sla_breached`). Excel eksport.
7. B2B: `/b2b/clients` alohida bosqichlar `discovered -> ... -> active -> renewal` / `lost`; shartnoma, hisob-faktura (QQS 12%), oylik hisobot.

### 6.12 Reklama (promotion) checkout

Seller `GET /promotions/packages` (4 paket) -> placement preview (banner / profil boost / xizmat boost; `requires_service`, `accepts_banner_asset`) -> banner uchun `POST /promotions/banner-assets` -> `POST /promotions/checkout` (provayder `telegram_manual`) -> `pending` (Telegram'da admin/reviewer tasdig'i) -> `promotion.checkout_approved` / `_rejected` realtime -> faol (`GET /promotions/active`: bannerlar yuqorida aylanadi, boost ball bilan ro'yxatda "Tavsiya etiladi"/"Sponsored") -> `POST /promotions/events` (ko'rish/bosish) -> `GET /promotions/analytics` -> muddat (7/14 kun) tugagach to'xtaydi. Admin `ads.manage` bilan mahsulotlarni boshqaradi (Studio K12-PROMO/MP04/MP09 ham).

### 6.13 Qo'ng'iroq va meeting hayot sikli

1. Boshlovchi (`meetings.manage` yoki operator) `POST /secure-chats/{room}/calls` (audio yoki video, sarlavha, ishtirokchilar) -> chaqirilganlar `call.incoming` / `meeting_invite` oladi (global kiruvchi qo'ng'iroq oynasi; backend `GET /calls/invited` zaxira).
2. Har ishtirokchi `GET .../join-token` -> LiveKit xonasi -> `POST .../join`; participant holati `PATCH .../participants/{uid}` (mute/kick/invite host huquqi bilan).
3. **Audio = video'ning alohida turi emas:** audio boshlanganda kamera o'chiq; kimdir kamerani yoqsa sessiya video bo'ladi (`call.upgraded_to_video`), yakuniy analytics video foydalanishni yozadi. Tarmoqqa moslashish avtomatik (simulcast, dynacast, adaptive stream); sifatni qo'lda tanlash majburiy emas.
4. **Vaqt:** hujjat uchun meeting 15 daqiqa; tezkor advokat 30 daqiqa; sessiya `max_duration_minutes` default 60. Advokat 1 marta **bepul 3 daqiqagacha** uzaytiradi (`free-extend`); keyin pullik: advokat daqiqa kiritadi -> `extension-payment-request` (narx 2 000 so'm/daq) -> meeting **pause** -> client javobi (`PATCH`, Telegram) -> 5 daqiqada javob bo'lmasa so'rov eskiradi; tasdiqlansa vaqt qo'shiladi va `resume`.
5. **Recording:** client `recording-request` -> advokat `recording-permission` (approve) -> `recording/start`; ruxsatsiz boshlanmaydi (`recording_status`: `off -> requested -> allowed -> started`).
6. **Transfer:** advokat aktiv ishni/callni boshqa advokatga uzatadi: meeting pause, yangi assignee realtime xabar oladi.
7. `leave` / `end` -> sessiya tugaydi; `ended_at`, `GET /calls/analytics` (jami, javob berilgan, o'tkazib yuborilgan, o'rtacha davomiylik, top operatorlar).

### 6.14 Qaytarish, advokat almashtirish va 4 ko'zli tasdiq

1. **Client** `POST /refund-requests` (to'langan buyurtma bo'yicha) yoki `POST /replacement-requests` (advokat almashtirish; menejer 24 soat ichida javob beradi); kafolat da'vosi `POST /warranty/claims` (advokat javob bermasa, SLA buzilsa, ish tashlab ketilsa, xizmat topshirilmasa).
2. Backend `ApprovalRequest` yaratadi: `pending`.
3. **Admin** `POST /approvals/{id}/admin-approve` -> `admin_approved`; **Menejer** `POST /approvals/{id}/manager-approve` -> `manager_approved`; ikkalasi bajarilgach `approved` (yoki `rejected`). Veb'da har ikki tugma har kimga ko'rinadi, 4 ko'z qoidasini backend tekshiradi; "rad etish" tugmasi veb'da yo'q.
4. Refund: moliya `refunds.manage` bilan bajaradi (ko'rib chiqish muddati 3 ish kuni); almashtirishda call-center `matching/orders/{id}/assign-next` bilan yangi advokat tayinlaydi, tarix `GET /replacement-requests/{id}/history`.
5. Approval turlari (veb): `payout, refund, plan_change, verification, service, ad, withdrawal, advocate_change`.

### 6.15 Obuna, sovg'a, referral

- **Obuna:** client reja va davr (oylik / 6 oy -5% / yillik -10% / oldindan yillik yana -10%) tanlaydi -> `POST /subscription-plans/{id}/purchase` yoki `.../telegram-purchase-request` -> `pending` (`SUB-*`; reviewer Telegram chatlariga xabar) -> tasdiq -> `starts_at/ends_at`, entitlement'lar faollashadi. `PATCH /subscriptions/{id}/auto-renew`; ATMOS avtoto'lovi `charge-due` job orqali (`/admin/subscriptions/charge-due`). Operator client nomidan `subscription-preview/-checkout` qila oladi (§6.7).
- **Gift:** beruvchi `POST /gifts` (`plan_slug`, `term_months` 3/6/12, qabul qiluvchi telefoni, xabar) oldindan to'laydi -> `share_url` + QR (`/gifts/{code}/qr`); qabul qiluvchi ro'yxatdan o'tib `POST /gifts/{code}/claim` -> muddat shu paytdan boshlanadi; holat `claimed`; admin `/analytics/gifts`.
- **Referral:** `GET /referrals/me` (kod, havola, QR, `invited_count`, `joined_count`, `discount_unlocked`); 5 ta obunachi do'st -> chegirma (obuna va buyurtma komissiyasiga). Seller uchun referral komissiyani 18% dan 16/15/13% gacha tushiradi.

### 6.16 Studio: konfiguratsiyani nashr qilish

1. Admin Studio grant beradi (`POST /admin/studio/access`) va approval route'ni sozlaydi (`POST /admin/studio/approval-routes`; default: reviewer -> publisher).
2. **Editor** konstruktorni tanlaydi (`GET /studio/constructors/{code}`) -> reference data (`/studio/reference/{key}`) -> obyekt yaratadi -> `validate`/`preview` -> `save` (yangi versiya) -> `submit` (`draft -> submitted`; tahrir qulflanadi).
3. **Reviewer/Publisher** navbat (`GET /admin/studio/approvals`): `review` (`approve` / `changes_requested` / `reject`; ikkinchi va uchinchisida izoh majburiy). `changes_requested` -> editor'ga qaytadi (`change_request_restart` siyosati). Oxirgi bosqich `approved`.
4. **Publisher/Admin** `publish` (faqat `approved` dan; `studio_publish_requires_approved`) -> runtime'ga qo'llanadi (`runtime_target`); xatolik `rollback(version)` yoki `archive`. Admin tasdiqlamaguncha production'ga chiqmaydi; route oxirida admin bo'lishi ixtiyoriy.
5. Realtime: `studio.object_submitted / _reviewed / _published / _rollback / _archived`; monitoring (kim online, qaysi obyekt, saqlashlar); Excel eksport.

### 6.17 Internal HRM oqimi

1. Admin/HR tashkilot tuzilmasini yuritadi (birlik -> lavozim) va xodim yaratadi (`InternalEmployee`) + `assignment` (maosh).
2. Rahbar vazifa yaratadi (`new`), mas'ul `accepted` -> `in_progress` -> `in_review` -> `done` (yoki `returned/paused/cancelled`), izoh va checklist qo'shiladi (WS `task:{id}`).
3. Qaror talab qiladigan masalalar `GET /internal/me/approvals` ga tushadi; xodim `approved/rejected` + izoh bilan javob beradi.
4. Davomat hodisalari (`check_in/check_out/break_start/break_end`) jadval (`schedule`) bilan solishtiriladi; KPI metrikalar (execution/attendance/sales/manual) hisoblanadi.
5. Payroll yozuvlari (`salary, kpi_bonus, sales_bonus, ...`) `draft` bo'lib yaratiladi; oylik xulosa va `internal_analytics` eksport. Veb'da draftdan keyingi holatlar (tasdiq/to'lov) yo'q (§9.3).


### 6.18 Realtime va bildirishnoma "yopishtiruvchi" jadvali

| Hodisa (`data.event` / WS) | Kim yaratadi | Kim oladi | Mobil harakat |
|---|---|---|---|
| `document_request_created`, `document_request.pool_created` | client | call-center yuristlari / ruxsatli advokatlar | pool ro'yxatini yangilash |
| `document_request.claimed` / `document_lawyer_request_claimed` | advokat | client | "Mutaxassis ishni oldi", chat ochish |
| `document_request_file_ready` / `document_lawyer_request_ready` | advokat | client | natijani ochish, 15 daqiqalik baho oynasi |
| `document_review_payment_required` | backend | client | Telegram tasdig'ini kutish ekrani |
| `marketplace_purchase_requested` / `_approved` / `marketplace_order_paid` | client / Telegram | seller, client | seller: "yangi buyurtma"; client: chat xonasi ochildi |
| `order_created`, `order_payment_updated`, `payment_paid` | backend | client, seller | order detail'ni qayta olish |
| `urgent_advokat.request_claimed` / `.group_scheduled` / `.meeting_created` / `.express_call_started` / `.status_updated` / `.transferred` / `.completed` / `.cancelled` | operator / backend | client, tayinlangan advokat | holat va chat yangilash; meeting kartasi |
| `support.ticket_created / _claimed / _transferred(_to_you) / _message / _closed / _reopened`, `support.assist_*` | client / operator | operator, client | queue va chat; assist preview tasdig'i |
| `quality_complaint.created / .updated / .resolved / .rework_started` | backend / operator | call-center, client, advokat | sifat navbati; redo vazifasi |
| `call.incoming` / `meeting_invite`, `call.paused / resumed / extended / upgraded_to_video`, `call.recording_*`, `call.payment_extension_*` | boshlovchi / advokat | ishtirokchilar | to'liq ekranli qo'ng'iroq oynasi |
| `secure_chat_message`, `secure_chat.read` | ishtirokchi | boshqa ishtirokchilar | unread counter |
| `promotion.checkout_approved / _rejected` | admin/Telegram | seller | reklama holati |
| `subscription.purchase_request_created`, `subscription.*` | client / operator | reviewerlar, client | entitlement yangilash |
| `studio.object_*`, `approval_route_updated` | editor/reviewer | Studio foydalanuvchilari | approval navbati |
| `internal.*` | HRM | xodimlar | vazifa/approval |
| `notification.created`, `notifications.unread_count` | backend | foydalanuvchi | badge (kanal nusxalarini jamlash bilan) |

### 6.19 Status mashinalari (jamlama)

Quyidagi jadvallar **jonli backend** (siyosat/ro'yxat javoblari/lifecycle maydonlari) va veb kodidan; `*` belgisi - kuzatilgan, lekin siyosat jadvalida bo'lmagan qiymat.

**A. Xizmat buyurtmasi (service order; `GET /admin/platform/policies` -> `order.status_transitions`)**

| Joriy | Mumkin keyingi |
|---|---|
| `new` | `accepted, cancelled, paid, seller_selection, sent_to_seller, waiting_docs, waiting_info, waiting_payment` |
| `waiting_info` | `cancelled, seller_selection, waiting_docs, waiting_payment` |
| `waiting_docs` | `cancelled, seller_selection, sent_to_seller, waiting_payment` |
| `waiting_payment` | `cancelled, paid` |
| `seller_selection` | `cancelled, sent_to_seller, waiting_payment` |
| `sent_to_seller` | `accepted, cancelled, declined` |
| `paid` | `accepted, cancelled, in_progress, started` |
| `accepted` | `cancelled, in_progress, result_ready, started` |
| `started` | `cancelled, in_progress, result_ready` |
| `in_progress` | `cancelled, delivered, quality_check, result_ready` |
| `result_ready` | `client_confirmation, delivered, quality_check` |
| `quality_check` | `delivered, in_progress` |
| `delivered` | `client_confirmation, completed, rated` |
| `client_confirmation` | `completed, in_progress, rated` |
| `completed` | `rated` |
| `rated`, `lost`, `cancelled`, `declined` | final |

Client UI'da 5 bosqich: so'rov -> moslash -> to'lov -> ish -> yakun (+ yopilgan); client faqat `completed`/`cancelled` o'tkaza oladi. Marketplace buyurtmasi ro'yxatlarida soddalashgan qiymatlar uchraydi: `pending_payment*, paid, completed, cancelled` (payment: `pending, paid, cancelled, refunded, failed`); `rejected, expired, refunded` yorliqlari bor.

**B. To'lov, bosqich, payout**

| Obyekt | Holatlar |
|---|---|
| Payment | `pending` -> `pending_confirmation` (TZ: Telegram tasdig'i kutilmoqda) -> `paid` \| `cancelled` \| `failed` (jonli ro'yxatda faqat `pending`/`paid` ko'rindi) |
| Milestone | `waiting_payment` -> `paid` -> `held` (escrow) -> `released` |
| Payout | `calculated` -> `queued` -> `processing` -> `paid`; `held`, `failed`, `cancelled` |
| Refund/replacement approval | `pending` -> `admin_approved` / `manager_approved` -> `approved` \| `rejected` (veb yorliqlari: `partial`, `completed` ham) |

**C. Hujjat va "ishlar"**

| Obyekt | Holatlar |
|---|---|
| Hujjat so'rovi (client) | `questionnaire` -> `ready_to_generate` -> `awaiting_payment` / `payment_pending` -> `file_ready` -> `rated` -> `closed`; chetga: `payment_cancelled`, `payment_rejected` |
| Advokat hujjat so'rovi | `payment_required` / `pending_payment` -> `lawyer_review_requested` -> `open_pool` -> `claimed` -> (`lawyer_review`) -> `file_ready` / `completed` -> `rated` / `closed` |
| Tezkor advokat | `open_pool` -> `claimed` -> `scheduled` / `in_progress` -> `meeting_active` -> `completed`; final: `cancelled`, `expired` (faol: `claimed, in_progress, meeting_active, open_pool, scheduled`) |
| Mening ishlarim (`works`) turlari | `urgent_advokat, document_lawyer_work, service_order, quality_complaint, complaint, legal_case` (case: `open`; veb: `new, active, investigation, court, appeal, completed, archived`) |

**D. Support, shikoyat, lead**

| Obyekt | Holatlar |
|---|---|
| Support ticket | `ai_handling` -> `waiting_operator` -> `claimed` -> `transferred` \| `waiting_client_confirm` -> `resolved` -> `closed`; `reopened`; `cancelled` |
| Shikoyat (client) | `new` -> `pending` / `under_review` -> `rework_required` -> `rework_in_progress` -> `resolved` \| `rejected` \| `closed` \| `cancelled` |
| Sifat shikoyati | `new` -> `under_review` -> `rework_required` \| `rejected` \| `resolved` |
| Lead | `new` -> `contacted` -> `qualified` -> `proposal` -> `won` \| `lost` \| `duplicate` (ustunlar admin tomonidan sozlanadi) |
| B2B mijoz | `discovered` -> `contacted` -> `meeting` -> `diagnostics` -> `proposal` -> `negotiation` -> `contract` -> `active` -> `renewal`; `lost` |
| Yuridik yordam | `new` -> `in_progress` / `assigned` -> `resolved` -> `closed` (+ `pending`, `rejected`; veb'da holatni o'zgartirish UI yo'q) |

**E. Hisob, tasdiq va qo'ng'iroq**

| Obyekt | Holatlar |
|---|---|
| Account | `active`; seller: `pending` (tasdiqgacha) |
| Register/seller so'rovi | `pending` -> `approved`/`accepted` \| `rejected` |
| Seller verification (profil) | `pending` -> `approved`/`verified` \| `rejected` (`none` = tasdiqlanmagan) |
| Tashkilot | `pending` -> `verified` \| `rejected`; (`active/inactive/suspended`) |
| Sharh moderatsiyasi | `pending` -> `approved` \| `rejected` |
| Call session | `invited` -> faol -> `paused` -> faol -> tugagan (`ended_at`); recording `off -> requested -> allowed -> started` |
| Obuna | `pending` (Telegram tasdig'i) -> faol (`starts_at..ends_at`) -> tugagan; `auto_renew` |
| Gift | yaratilgan -> `claimed` |
| Promotion | `pending` -> `approved` (faol) \| `rejected`; muddat tugasa to'xtaydi |
| Ichki vazifa | `new, accepted, in_progress, in_review, done, returned, paused, cancelled` (`/admin/tasks` jonli: `todo, doing, review, done`) |
| Studio obyekt | `draft -> submitted -> in_review -> approved -> published -> archived`; `changes_requested` -> `draft` |
| Studio route qadami | `pending, approved, changes_requested, rejected, skipped` |

## 7. Realtime, bildirishnoma va xavfsizlik qoidalari (qisqa)

### 7.1 Realtime kanallar (TZ §37)

| Kanal | Nima uchun | Kim |
|---|---|---|
| `WS /ws/users/me` | Bildirishnoma, to'lov tasdig'i (Telegram), hujjat statusi, marketplace order, urgent request, support ticket, **kiruvchi qo'ng'iroq**, assignment/transfer, "completed" va baholash oynasi | barcha login qilganlar |
| `WS /ws/secure-chats/{room_id}` | chat xabarlari, o'qildi, typing | xona ishtirokchilari |
| `WS /ws/secure-chats/{room_id}/calls/{call_id}` | qo'ng'iroq signaling | qo'ng'iroq ishtirokchilari |
| `WS /internal/ws/{channel}` | Internal HRM (vazifa, xabar, approval) | ichki xodimlar |
| `WS /ws/clients/{client_id}/chats/{chat_id}` | AI chat stream | client |

Qoidalar: eksponensial backoff 1-2-4-8-30 s; foreground'ga qaytganda va token yangilanganda qayta ulanish; event ID bo'yicha dedupe; reconnectdan keyin REST sync; ping/pong; **realtime bor joyda 1-5 sekundlik polling taqiqlangan** (faqat socket uzoq tiklanmasa va ekran aktiv bo'lsa zaxira polling). Bitta umumiy ulanish menejeri (TZ §37.6, §39).

### 7.2 Bildirishnoma modeli (TZ §28 va jonli backend farqi)

- TZ payload: `id, type, title, body, created_at, read_at, entity_type, entity_id, deep_link, metadata`. **Jonli backend** esa: `id, title, body, kind, read (bool), data, meta, category, audience_role, created_at`. `kind` kanalni bildiradi (`in_app`, `push`, `email`, `telegram`, `sms`, `meeting_invite`, `secure_chat`), hodisa nomi `data.event` ichida. Bitta hodisa har yetkazish kanali uchun alohida qator bo'ladi, shuning uchun mobil ilova bir hodisani bitta yozuvga jamlaydi va `unread-count` o'rniga jamlangan o'qilmaganlarni sanaydi (§9.4). Siyosat: yetkazish kaskadi `in_app -> push -> telegram -> sms -> email` (`/admin/platform/policies` -> `notifications.cascade`).
- Staging'da kuzatilgan haqiqiy `data.event` qiymatlari (rolga qarab kim oladi): `document_request_created`, `document_lawyer_request_sent / _claimed / _ready`, `document_request_file_ready`, `document_request_meeting_created`, `document_review_payment_required`, `existing_document_review_sent`, `ai_document_ready`, `document_constructor_continue_prompt` (client, call-center lawyer, advokat); `order_created`, `marketplace_purchase_requested / _approved` (client, seller); `urgent_advokat.request_claimed / cancelled / group_scheduled / meeting_created / status_updated / transferred / completed` (client, operator, advokat); `support.ticket_created / _claimed / _message / _closed` (client, operator); `quality_complaint.created / resolved / rework_started` (client, call-center, advokat); `subscription.purchase_request_created`; `secure_chat_message`; `meeting_invite` (incoming call); `studio.object_reviewed`.
- Bildirishnoma kategoriyalari hozir faqat `system` va `payment`; foydalanuvchi sozlamasi `GET/PUT /notifications/preferences`.
- Push bosilganda role va ownership tekshirilib deep link ochiladi; ruxsat yo'q bo'lsa xavfsiz fallback - ro'yxatga qaytish (TZ §28).
- Admin/sales/call-center `POST /admin/notifications` orqali bitta foydalanuvchiga yoki rol bo'yicha xabar yuboradi (`notifications.manage`).

### 7.3 Xavfsizlik (TZ §1.3, §40)

- Access token - secure storage; refresh token faqat secure storage'da; loglarga telefon/token/OTP/chat matni/fayl URL yozilmaydi; sertifikat tekshiruvi o'chirilmaydi; release'da HTTP yo'q.
- Biometrika serverdagi auth o'rnini bosmaydi, faqat lokal token vault'ni ochadi.
- Bir vaqtda kelgan ko'p `401` uchun bitta refresh (single-flight); refresh muvaffaqiyatsiz bo'lsa sessiya bir marta tozalanadi.
- OTP javobda hech qachon qaytmaydi (faqat Telegram orqali); TOTP secret screenshot/analytics'ga ketmaydi; `enable` bo'lmaguncha setup tugagan hisoblanmaydi.
- **Majburiy 2FA** (veb kodi `MANDATORY_2FA_ROLES`): `yurist, advokat, advokat_tashkiloti, admin, superadmin, manager, call_center, sales` (+ `call_center*`, `sales*` prefikslari); bu rollarda 2FA'ni `DELETE /auth/2fa` bilan o'chirib bo'lmaydi (403). Register natijasi: seller rollar tokensiz `pending` qaytadi (admin tasdig'i), 2FA talab qiladigan rollar `loginRequired` bilan login'ga yo'naltiriladi. Staging'da `superadmin/admin/sales_operator` 2FA'siz kirdi (asosiy `role` = `client`, rollar `roles[]` da) - §9.1.
- Sessiya bo'sh turish oynasi (veb): admin/superadmin/manager uchun 2 soat, boshqalar uchun 8 soat.
- Deep-link resource avtorizatsiyasi, to'lov summasi faqat backenddan, takroriy so'rovlar idempotent, `403` yakuniy qaror, logout'da lokal maxfiy kesh tozalanadi.
- Fayllar: MIME/kengaytma/hajm tekshiruvi; platforma siyosati: fayl <= 50 MB, video <= 200 MB, imzolangan URL 15 daqiqa, bloklangan kengaytmalar (`.exe, .apk, .js, .sh ...`), skan majburiy (`/admin/platform/policies` -> `workspace`).
- Offline navbat faqat idempotent draft/xabar uchun; to'lov, claim, complete, approve, delete, transfer hech qachon offline navbatga qo'yilmaydi (TZ §38).

## 8. Mobil ilova: maqsad va hozirgi holat

> Holat 2026-10-10 bo'yicha `mobile/app/**`, `mobile/src/**` kodidan olindi (75 ta route fayli; `src/` da ~1400 ta fayl; 3 til: uz/ru/en). Audit paytida kod parallel o'zgarib turgan (yangi `src/shared/realtime/*`, `SessionBoundary`, `modules/pdf-pages`, `package.json`/`app.json` yangilanishi) - bular tekshirilmagan. Quyida "bor" deganda kodda ishlaydigan oqim, "qisman" deganda ekran bor lekin TZ talab qilgan hamma amal yo'q, "yo'q" deganda kodda topilmadi.

### 8.1 Maqsad (TZ §44, §3)

TZ mobil ilovani **rolga qarab 4 xil qobiq (shell)** sifatida belgilaydi:

| Qobiq | Pastki navigatsiya (TZ §44) | Global amallar |
|---|---|---|
| Client | Bosh sahifa · Xizmatlar · **Ishlar** · **Xabarlar** · Profil | AI Instructor, bildirishnoma, kiruvchi qo'ng'iroq |
| Advokat/yurist | **Ish maydoni · So'rovlar · Mijozlar · Xabarlar** · Profil | kiruvchi qo'ng'iroq, bildirishnoma |
| Call-center | **Leadlar · Support · Mijozlar · Uchrashuvlar** · Profil | operator qo'ng'irog'i, kiruvchi qo'ng'iroq |
| Admin/planshet | permission asosida dinamik drawer | - |

Qobiq tanlash (TZ §3.2) tartibi: login -> account `active` -> onboarding/verification tugagan -> `permissions` -> resource `can_*` -> entitlement. Ya'ni qobiq **permission'ga** qarab belgilanishi, role nomi hardcode qilinmasligi kerak (TZ §45.2).

### 8.2 Hozir nima qurilgan

**Tab-bar (4 sessiya turi).** Mehmon: Bosh, Xizmatlar, AI, Advokat, Kirish. **Client:** Bosh, Advokat, AI, Buyurtmalar, Profil. **Staff:** Bosh, Boshqaruv, AI, Buyurtmalar, Profil. **Seller (advokat/yurist):** Bosh, Ishlar, AI, Ishlarim, Profil. Markaz tab har doim AI (qora tema). iOS'da "liquid glass", Android'da tekis bar. Sessiya turini `useTabRole` aniqlaydi: `user.role` = `lawyer|advocate` -> seller; aks holda `useAccess().staff` -> staff; aks holda client.

**Client tomoni:**
- *Auth* - to'liq: login (parol), Telegram/SMS/TOTP 2FA challenge (428), ro'yxatdan o'tish (faqat client), parol tiklash, refresh (single-flight), sessiyalar ro'yxati va revoke, xavfsizlik ekrani (2FA yoqish/o'chirish, Telegram ulash, xabarnoma sozlamalari).
- *Bosh sahifa, xizmatlar katalogi, advokatlar ro'yxati* - bor (server filtrlari: `seller_type, region, specialization, min_rating, price_max, q, sort`), advokat tafsiloti bottom-sheet.
- *AI chat* - bor (`/clients/{id}/chats`), mehmon uchun kunlik limit; stream va WS yo'q (bitta POST -> javob).
- *Hujjat tahlili* (`/doc-analysis`) - bor: matn va fayl (20 MB gacha), xavf natijasi, "advokatga yuborish" (`/document-services/review-existing/request`); `quote` funksiyasi yozilgan, lekin chaqirilmaydi.
- *Buyurtmalar* - qisman: `GET /orders`, to'lov siyosati va `POST /payments` (payme provayderi staging'da 503), cheklar/qaytarish/baholash/bekor qilish yo'q.
- *Obuna* - qisman: tariflar ro'yxati, entitlement, Telegram orqali sotib olish so'rovi (`telegram-purchase-request`).
- *Bildirishnomalar* - qisman: ro'yxat (60 s polling), read/read-all, preferences; `unread-count`/`categories` va `notification` WS hodisasi ishlatilmaydi (bildirishnoma kanal-nusxalari "event" bo'yicha jamlanadi).
- *Secure chat/call* - Profil -> "Chats" orqali (staff chat modulidan qayta ishlatilgan): matn, javob, fayl/rasm, qo'ng'iroq; client xona yarata olmaydi, ovozli xabarni yoza olmaydi.

**Staff tomoni ("Boshqaruv" hub, ~30 modul)** - web admin panelining deyarli to'liq nusxasi: dash, ceo, pipeline (kanban), callcenter (navbat, tezkor pool, sifat shikoyatlari, mijoz qidirish/karta, call log), meetings, call-analytics, retention (staging'da 404), b2b, marketplace (faqat o'qish), services, plans, templates, ads, studio (draft->publish->rollback), register-requests, reviews, payouts, approvals, support (ticket: claim/transfer/close/reopen, chat, operator call, **assist**), legalAid (faqat o'qish), notifications (yuborish), chats, internal HRM (dashboard, me, tasks, attendance, approvals, messages, employees, org, execution, time, schedules, kpi, payroll, analytics), integrations, test-otp, roles, audit, legal, policies, aiReglaments. Har modul `AdminGate` va `modules.ts` dagi web qoidalari (superadmin hammasini ko'radi; permission'siz modul faqat to'liq admin uchun) bilan yashiriladi.

**Real vaqt va qo'ng'iroq:** `/ws/users/me` (ping 25 s, backoff 1-2-5-10-30 s), `/ws/secure-chats/{room}`, qo'ng'iroq signaling; LiveKit (mikrofon, kamera, speaker, taklif, mute/kick, pause/resume, bepul va pullik uzaytirish so'rovi); global `IncomingCallWatcher` (`call.incoming` + `GET /calls/invited` zaxira polling).

### 8.3 Infratuzilma holati (TZ §1-2, §28-43)

| Talab (TZ) | Holat |
|---|---|
| Token secure storage (TZ §1.3) | **Bor** (`expo-secure-store`) |
| Refresh single-flight (TZ §2) | **Bor** (`http.ts`) - lekin `httpRaw` va ba'zi raw fetch'lar refresh qilmaydi |
| `Accept-Language`, `X-Request-ID` (TZ §1.2) | Audit paytida qo'shilayotgan edi (tekshirilmagan) |
| WebSocket manager (TZ §37) | 3 kanal bor (user, secure-chat, call); AI chat WS yo'q; Internal HRM WS (`/internal/ws/{channel}`) yo'q; token query'da uzatiladi |
| Push (FCM/APNs) (TZ §28) | **Yo'q** (`expo-notifications` e'lon qilingan, kodda ishlatilmaydi) |
| Deep link (TZ §28) | **Yo'q** (scheme `lexgo` bor; `app.json` da `applinks:lexgo.uz` qo'shilgan, lekin `Linking` tinglovchisi va `deep_link` -> route xaritasi yo'q) |
| Offline kesh / lokal DB (TZ §38) | **Yo'q** (React Query faqat xotirada; `expo-sqlite` ishlatilmaydi) |
| Fayl preview/download (TZ §29) | Minimal (`downloadAuthed` + share sheet; ilova ichida PDF/DOCX viewer yo'q) |
| OnlyOffice editor (TZ §17) | **Yo'q** |
| Biometrika (TZ §1.3) | **Yo'q** (`expo-local-authentication` e'lon qilingan) |
| Ekran himoyasi, analytics, crash reporting (TZ §40-41) | **Yo'q** |
| Logout'da kesh/socket tozalash (TZ §45.9) | Qisman (faqat `orders`, `notifications` so'rovlari; yangi `SessionBoundary` tekshirilmagan) |
| Til/tema | uz (asosiy), ru, en; light/dark/system; qurilma tilini aniqlash yo'q |

### 8.4 TZ yo'l xaritasidagi bo'shliqlar (rol bo'yicha)

**Client (eng katta qism qurilmagan):**
1. Navigatsiya TZ bilan mos emas: "Xizmatlar" client tabi emas (mehmon uchun tab), **"Ishlar"** va **"Xabarlar"** tablari yo'q (chatlar Profil ichida), "Advokat" va "Buyurtmalar" tablari TZ'da yo'q.
2. **Hujjat oqimlari yo'q:** qo'lda to'ldirish (§12), AI bilan tayyorlash (§13), navbatchi advokatga so'rov (§14), "Mening hujjatlarim" va "Mening ishlarim" (`/clients/me/works`) (§15), hujjat reytingi.
3. **Tezkor advokat** (client tomoni, §21), **support ticket** (client tomoni, §10), **reyting va shikoyat oynasi** (§25), **AI Instructor V2** (§9) - yo'q.
4. **Marketplace xaridi TZ API'siga mos emas:** mobil `POST /orders` + `pricing/quote` ishlatadi, TZ esa `POST /marketplace/lawyers/{id}/services/{sid}/purchase-request`, `GET /marketplace/me/orders`, cancel/complete deb belgilaydi; `/marketplace/meta`, `/marketplace/ai-search`, `/marketplace/lawyers/{id}` ishlatilmaydi (advokat tafsiloti ro'yxatning birinchi 100 tasidan qidiriladi).
5. Profil: tahrirlash, oila a'zolari, to'lov usullari, roziliklar (consent), referral, gift, cheklar (receipt) - yo'q.
6. Obuna: to'liq to'lov oqimi (checkout) emas, faqat Telegram so'rovi; avto-yangilash (`auto-renew`) yo'q.

**Advokat/yurist (qobiq deyarli yo'q):** hozirgi "Ishlar/Ishlarim" faqat marketplace buyurtmasini qabul/rad qilish (`/orders/{id}/accept|decline`) imkonini beradi. Yo'q: hujjat queue va editor (§17), buyurtma hayot sikli (boshlash/topshirish/yakunlash), mening xizmatlarim va availability (§19), workspace (§30), mijozlar/cases/calendar, professional statistika, reklama checkout (§20), tezkor ishlarni olish, **seller onboarding va verification** (§31 - ro'yxatdan o'tish faqat client uchun), tashkilot konteksti. `call_center_lawyer` va staff + `yurist/advokat` backend roli bo'lgan foydalanuvchi **seller qobig'ini** oladi va Boshqaruv hub'iga kira olmaydi (qobiq `role` bo'yicha tanlanadi, permission bo'yicha emas) - TZ §3.2 va §45.2 ga zid.

**Advokat tashkiloti (§32):** umuman yo'q (`/organizations` kodda yo'q; `advokat_tashkiloti` oddiy seller qobig'iga tushadi).

**Call-center (§44):** alohida bottom navigation yo'q; funksiyalar hub kartalari orqali bor (pipeline, support, callcenter, meetings), lekin "Leadlar / Support / Mijozlar / Uchrashuvlar / Profil" tablari va top-level "Mijozlar" yo'q; `callcenter.access` permission'siz `call_center` roli client qobig'iga tushadi.

**Admin/boshqa:** CEO/executive/ceo_viewer kabi rollar `dash`/`ceo` modullarini faqat to'liq admin bo'lsa ko'radi (web qoidasi); `quality_control`, `executive`, `provider` va boshqa qo'shimcha rollar nomi bilan hech qaerda tilga olinmagan; `accountStatus` UI'ni gate qilmaydi; `can_*` flaglardan faqat qo'ng'iroq kodida foydalaniladi.

### 8.5 Ustuvorlik bo'yicha taklif (taxmin)

1. **Poydevor:** permission-first qobiq tanlash (role emas), `/auth/me` ni foreground'da yangilash, push + deep-link marshrutizatori, logout'da to'liq tozalash, WS'ni yagona manager'ga o'tkazish.
2. **Client yadro oqimlari:** Ishlar/Xabarlar tablari, hujjat oqimlari (3 usul), tezkor advokat, support ticket, reyting/shikoyat, marketplace purchase-request API'ga o'tish.
3. **Seller qobig'i:** onboarding/verification, hujjat queue + editor (OnlyOffice WebView), buyurtma hayot sikli, xizmatlar/availability, workspace.
4. **Call-center qobig'i** (mavjud modullarni 5 tabga qayta guruhlash) va **tashkilot egasi** paneli.
5. **Sifat:** offline kesh (draft), biometrik vault, analytics, ekran himoyasi.

## 9. Ziddiyatlar, bo'shliqlar va ochiq savollar

> Belgilar: **TZ** - `mobile/TZ.md`; **Veb** - `law-main` kodi/matnlari; **Jonli** - staging backend (faqat GET bilan tekshirilgan). "Tavsiya" ustuni - (taxmin).

### 9.1 Rol, permission va 2FA

| # | Qayerda | Nima | Tavsiya |
|---|---|---|---|
| 1 | TZ §3.1 / Jonli `/admin/roles` | `superadmin` va `super_admin` ikkita bir xil rol (35 ta permission); qoldiq `TEST` roli; matritsada `client` roli yo'q. TZ ikkalasini ham, `TEST` ni ham tilga olmaydi | Mobil `super_admin` ni `superadmin` bilan teng deb olsin; backend dublikatni tozalasin |
| 2 | TZ §0, §3.2 / Jonli `/auth/me` | TZ `assigned_roles` deydi, haqiqiy maydon `roles`; `UserOut` da `two_factor_required` maydoni yo'q (veb uni o'qiydi) | Mobil `roles` ni o'qisin; TZ yangilansin |
| 3 | TZ §3.1, §47.186 | `UserRole` enum'ida atigi 8 qiymat (`client, yurist, advokat, advokat_tashkiloti, admin, manager, call_center, sales`); `RegisterRequest.role` ham shu enum - nazariy jihatdan `admin`/`manager` bilan ro'yxatdan o'tish so'rovi yuborish mumkin (backend rad etishi tekshirilmagan) | Backend tomonidan rad etilishi kerak; ochiq savol |
| 4 | Jonli `login` | `superadmin`, `admin`, `sales_operator` 2FA'siz token oldi (asosiy `role=client`, rollari `roles[]` da). Veb `MANDATORY_2FA_ROLES` esa `admin, superadmin, manager, call_center, sales` + `sales*`/`call_center*` ni majburiy deydi. Demak majburiy 2FA backend'da faqat *asosiy* rol bo'yicha ishlaydi (taxmin) - biriktirilgan rol bilan kirgan staff 2FA'siz kiradi | Xavfsizlik bo'shlig'i: biriktirilgan staff rollari uchun ham majburiy 2FA |
| 5 | Veb `lib/auth.tsx` | Majburiy 2FA ro'yxatida `finance, quality_control, moderator, b2b_manager, marketing, content_manager, ceo_viewer, executive, provider` yo'q, ya'ni ularda 2FA'ni o'chirish mumkin; TZ §4 majburiylik haqida umuman gapirmaydi | TZ'ga majburiy 2FA ro'yxatini kiritish |
| 6 | Veb AdminShell izohi / Jonli | "Superadmin/admin hamma narsani ko'radi" - aslida `admin` da `roles.manage, callcenter.access, sales.access, payout.approve, audit.export, chat.open_for_dispute` yo'q; admin operator ticketlariga (`/call-center/support/tickets`) `403` oladi. Veb Overview'dagi modul havolalari admin'ni hamma narsaga ruxsatli deb hisoblaydi | Mobil `visible()` qoidalari kodlarga qarasin (hozir shunday), "admin = hamma narsa" faraziga tayanmasin |
| 7 | Jonli `payout.approve` | Faqat `finance` va `superadmin`da bor, lekin veb Payoutlar sahifasi `payments.manage` bilan ochiladi (admin, manager, executive, ceo_viewer, finance). `PATCH /admin/payouts` aslida qaysi kodni tekshirishi noma'lum (yozish testi o'tkazilmadi) | Backend qoidasini aniqlash |
| 8 | Jonli rollar | `ceo_viewer` ("ko'ruvchi") da `*.manage` yozish kodlari bor; veb CEO paneli faqat admin/superadmin; `executive` kodda umuman yo'q; `provider` ma'nosi hech qaerda yozilmagan | Rollarning maqsadini belgilash |
| 9 | TZ §25 / Veb | `quality_control` ishining asosiy qismi (sifat shikoyati navbati) `callcenter.access` talab qiladi, rolda esa yo'q; `/admin/quality` sahifasi yo'q; `chat.open_for_dispute` uchun UI yo'q | QC uchun permission yoki alohida modul |
| 10 | Veb matni / Jonli | Marketing: "hujjatlarni moderatorlar ko'rib chiqadi", lekin `moderator` da `users.manage` yo'q -> register arizani qabul/rad eta olmaydi | Qaysi rol seller'ni tasdiqlaydi - aniqlash |
| 11 | TZ §3.9 / Jonli | Ichki xodim rollari (`employee`, `hr`, `internal_*`) backend ro'yxatida yo'q; `InternalEmployee` profili qaysi permission bilan ochilishi noma'lum; oddiy xodim check-in qila olmaydi (tugma `internal_time.manage` talab qiladigan sahifada) | Oddiy xodim uchun "Men" bo'limida self-service |
| 12 | TZ §5 | "Role almashtirish backend bir nechta context bersa" - inventarda context almashtirish endpointi yo'q; bir user ham advokat, ham tashkilot a'zosi, ham `call_center_lawyer` bo'lsa qaysi qobiq? | Qobiq tanlash qoidasi yozilsin (§8.4) |

### 9.2 Endpoint va oqim nomuvofiqliklari

| # | Qayerda | Nima | Tavsiya |
|---|---|---|---|
| 1 | TZ §46 va §0-45 | Inventardagi moduldan **0 ta endpoint** matnda tilga olingan: Academy, Gifts, Referrals, Warranty, Legal Aid, SOS, Cases, Calendar(+Events), Contracts va imzo, Orders (seller accept/decline, milestones), Payouts, Refund/Replacement, Reviews, Quality, Identity, Seller Onboarding endpointlari, B2B, Approvals, Workflow, Retention, Matching, Upsell, Conflicts, Tasks, Complaints, Case Documents, Workspace endpointlari (§30 faqat umumiy matn). Rol bo'limlarida (§3.3) "roziliklar, referral, giftlar", "cases, calendar" tilga olinadi, lekin ekran/oqim yo'q | Mobil jamoa uchun har biriga TZ bo'limi |
| 2 | TZ §18 / Mobil / Jonli | Ikki xarid yo'li: TZ `POST /marketplace/lawyers/{id}/services/{sid}/purchase-request` (+Telegram tasdig'i); mobil `POST /orders` + `/pricing/quote`; siyosat avans 10% + 90% bosqichlarni aytadi, jonli buyurtmalar esa to'liq summa bilan `paid`. Qaysi biri kanonik - noaniq | Bitta kanonik yo'l tanlansin; mobilni TZ'ga moslashtirish |
| 3 | TZ §14 / Veb / Jonli | Client advokat tanlamaydi deyiladi, inventarda esa `GET /services/{id}/document-lawyers` va `GET /lawyers/{id}/private-chat` bor. Shuningdek TZ §3.4: oddiy advokat faqat o'ziga tayinlanganni ko'radi, veb advokat portali esa "Yangi so'rovlar" pool tabini hammaga ko'rsatadi va `GET /lawyers/me/document-requests` clientga ham 200 qaytaradi | Pool'ga kirish qoidasi (`documents.manage`? yoki faqat `call_center_lawyer`?) aniqlansin |
| 4 | TZ §3.6 va §22 | "Call-center urgent advokat ishini olmaydi" deyiladi, §22 esa operator `claim` qiladi deydi. Ma'no: operator = koordinator (claim, tayinlash), advokat = ijrochi. TZ ikki "claim"ni farqlamaydi | TZ'da terminlar ajratilsin: operator-claim vs lawyer-assignment |
| 5 | TZ §3.6 / Veb | Mijoz kartasi (`GET /call-center/clients/{id}`) call-center xodimiga kerak, lekin veb kod izohiga ko'ra `users.manage`siz `403` | Operator uchun alohida ruxsat |
| 6 | TZ §46.49 / Jonli | `/retention/*` inventarda, staging'da `404 retention_removed`; `/promotions/me` (TZ §20) jonli `404`; `/admin/test-otps` `404` | Inventarni jonli bilan moslash (§48) |
| 7 | TZ §46 | Takroriy/eskirgan endpointlar belgilanmagan: `/callcenter/*` aliaslari, `/api/ai/*` va `/ai/*`, `/ai/platform-instructor*` (v1) va `/ai/instructor/*` (v2), `/auth/register` va `register/start+verify`, `/auth/2fa/start` va `/auth/login/2fa`, `/admin/leads/*` va `/call-center/leads/*`, `PUT`+`PATCH` juftliklari | Deprecated ro'yxati va migratsiya sanasi (§48) |
| 8 | TZ §46 / Veb | Demo endpointlar farqi: TZ'da `/admin/showcase-data/seed`, `/admin/leads/cleanup-demo`; veb `/admin/demo-data/seed` ni chaqiradi | Nomlarni bir xillashtirish |
| 9 | TZ §21 / Jonli katalog | TZ: "express oqim - darhol *audio call*"; katalog nomi: "Express *videokonsultatsiya*" (`immediate_call`); veb: express va YTX `direct_on_duty_call` audio xonasi ochadi | Nomlash va birinchi kanal aniqlansin |
| 10 | TZ §21, §27 | Tezkor advokat to'lovi (kim, qachon, qanday to'laydi; summa guruhda advokat soniga ko'payadi) TZ'da yozilmagan; `target_type` ro'yxati yo'q | To'lov oqimi bo'limi |
| 11 | TZ §16 | "10 sahifagacha bazaviy qoida" - uchta turli qoida bor: obuna (10/25 bet bepul advokat tekshiruvi), AI tarif (oyiga 1/5/20 tahlil, Pro 50 betgacha), siyosat narx jadvali (1-10 bet 149 000 va hokazo) | Qaysi qoida qaysi holatda ishlashi yozilsin |
| 12 | TZ §6.3, §18 | UUID o'rniga `work_id`: haqiqatda prefikslar xilma-xil (`ADV-`, `ORD-`, `PAY-`, `SPT-`, `CMP-`, `SUB-`, `WRT-`, `PROMO-`, `LGC-/LGA-` lexgo_id); buyurtmada ham `work_id` (ADV-) ham `order_work_id` (ORD-) bor, TZ esa "asosiy ID `ADV-*`" deydi | Qaysi maydon qayerda ko'rsatilishi aniqlansin |
| 13 | TZ §3.5 | Tashkilot egasi uchun "ichki exportlar" - tashkilot ostida eksport endpointi inventarda yo'q | - |
| 14 | Veb / Mobil | Veb SOS sahifasi `POST /sos` xato bersa ham "yuborildi" holatini ko'rsatadi (fail-soft) - favqulodda funksiya uchun xavfli | Mobilda xatoni ochiq ko'rsatish |

### 9.3 Rol vazifalari va navigatsiya bo'shliqlari

1. **TZ §44** faqat 3 ta bottom navigation beradi: client, advokat/yurist, call-center. Quyidagilar uchun yo'q: `call_center_lawyer`, sales/sales_operator/sales_head, tashkilot egasi, admin (telefon), internal xodim, Studio, finance, QC, moderator, b2b, marketing, content, ceo_viewer, executive, provider. Mobilda hozir ham ularning qobig'i yo'q (§8).
2. **`call_center_lawyer`** TZ'da ham advokat (TZ §3.4: pool'dan oladi), ham call-center (TZ §3.6: "aralashtirmang") sifatida tilga olinadi; navigatsiyasi yo'q; mobilda `role` bo'yicha seller qobig'iga tushadi va call-center modullariga kirmaydi.
3. **Tashkilot egasi:** TZ §32 faqat endpointlarni beradi; veb'da oddiy advokat ham "Tashkilot" bo'limini ko'radi va yarata oladi; `advokat_tashkiloti` self-register UI'da yo'q, lekin `UserRole`da va seller-requests statistikasida bor - akkaunt qanday yaratiladi?
4. **Sales:** TZ §3.7 faqat umumiy ro'yxat; `sales.access` kodi hech qaerda ishlatilmaydi; `sales_head` `packages.approve` bilan nima tasdiqlaydi (UI yo'q) - ma'lum emas.
5. **Finance/QC/Moderator/B2B/Marketing/Content/CEO/Executive** TZ §3.8 da bitta band ("maxsus admin rollar permission bo'yicha"); ularning kunlik ishi va ekranlari aniqlanmagan, veb'da ham faqat badge (+ ochiladigan bo'limlar).
6. **Payroll:** veb faqat `draft` yaratadi (tasdiqlash, to'lov, bloklash holati yo'q); **Yuridik yordam**: holatni o'zgartirish UI yo'q; **Approvals**: rad etish tugmasi yo'q; **Refund** ekrani yo'q; **User boshqaruvi** (ro'yxat, bloklash) sahifasi veb'da yo'q (faqat API).
7. **Vacation (ta'til) rejimi** faqat brauzerda saqlanadi (backend yo'q); **AI bepul savol hisoblagichi** brauzerda (`localStorage`) - mobil serverdan olishi kerak (TZ §8 buni talab qiladi).

### 9.4 Ma'lumot modeli va protokol farqlari

| # | TZ | Jonli/Veb | Ta'siri |
|---|---|---|---|
| 1 | TZ §28 bildirishnoma: `type, read_at, entity_type, entity_id, deep_link, metadata` | `kind` (kanal: in_app/push/email/telegram/sms/secure_chat/meeting_invite), `read` (bool), `data`, `meta`, `category`, `audience_role`; hodisa nomi `data.event`; `deep_link` yo'q | Mobil `event -> route` xaritasini o'zi tuzishi kerak; read vaqti yo'q |
| 2 | TZ §28 `GET /notifications/unread-count` | Backend har yetkazish kanali uchun alohida qator saqlaydi -> hisoblagich kanal nusxalarini ham sanaydi | Mobil bitta hodisa = bitta yozuv qilib jamlaydi (60 s ichida) |
| 3 | TZ §27 `pending_confirmation` | Jonli to'lovlarda faqat `pending`/`paid`; `PaymentOut.status` erkin matn | Status ro'yxati TZ'da kafolatlanmagan |
| 4 | TZ §6.2 status guruhlari | Haqiqiy statuslar ancha ko'p (`open_pool, file_ready, meeting_active, waiting_*, rework_required, held, calculated...`) va ikki buyurtma lug'ati (`waiting_payment` siyosatda, `pending_payment` marketplace ro'yxatida) | Statuslar xaritasi (§6.19) |
| 5 | TZ §37 WS autentifikatsiya | Veb va mobil tokenni query-string'da yuboradi (`?token=`) -> log/proxy xavfi; TZ §40 token loglanmasin deydi | Authorization header yoki qisqa muddatli WS-token |
| 6 | TZ §24.1 "meeting default 15 daqiqa" | Tezkor katalog 30 daqiqa; `CallSessionOut.max_duration_minutes` default 60; hujjat meetingi 15 | Qaysi tur uchun nechta ekanini yozish |
| 7 | TZ §30 workspace "default 1 GB" | Siyosat: `case_quota_mb=2048`, fayl <=50 MB, video <=200 MB; boshqa limitlar: AI hujjat 20 MB, chat 25 MB, seller hujjati 15 MB, so'rov fayllari 25 MB x 10 | Server kvotasini o'qish; TZ'ga jadval |
| 8 | TZ §12-13 | Katalogda staging'da fixture/test yozuvlari ("Fixture-*" sohalar, `district: Demo`, "ZZ ..." yozuvlari, regionlar faqat 5 ta) | Mobil real ma'lumotni test bilan aralashtirmasin |
| 9 | TZ §47 `UserOut` | Telefon maskalanmagan `phone` har yerda (urgent, ticket, order obyektlarida mijoz telefoni); TZ "public phone yashirin" deydi (TZ §18, §40) | Faqat ruxsatli rollar ko'radi - javob maydonlarini tekshirish |

### 9.5 Raqamlar va marketing vs backend

| # | Joy | Farq |
|---|---|---|
| 1 | Tarif narxlari | Jonli: Standard 149 000, Premium 349 000; veb `reference/index.html` dizayni: 249 000 / 549 000; sovg'a "747 000 dan - 3 oy" = 3 x 249 000 (eskirgan). Veb UI'da 6 oylik chegirma (-5%) yorlig'i yo'q |
| 2 | Payout muddati | Marketing: "48 soat o'rtacha to'lov"; veb jadvali: haftasiga bir marta (payshanba), min 100 000, oy oxirida qoldiq |
| 3 | Komissiya zinasi | Asosiy 18%; kod izohi "floor 12%", zinaning eng pasti 13%; FAQ "5% gacha kamayadi" (18 -> 13) |
| 4 | Referral chegirmasi | Matn: "5 ta do'st -> 5% gacha"; kod fallback'i 25% (`discountPercent || 25`); jonli `discount_percent` = 0, `eligible_after` = 5 |
| 5 | B2B | Veb paketlari 2.9 / 6.4 mln + Enterprise; backend'da yashirin `biznes-abonent-*` 3.5 / 6 / 12 mln rejalari hali faol va `/b2b/products` bo'sh |
| 6 | Statistika | "1 240+ advokat", "14 hudud", "63 000+ yopilgan ish" qo'lda yozilgan; auth ekranida "800+ yurist, 400+ advokat"; mijozlar "12k+", reyting 4.9 vs 4.8; enumda 10 hudud; marketplace meta 5 hudud |
| 7 | Bepul AI | "Dastlabki 5 so'rov bepul" (bir martalik ma'noda) vs oyiga 5 (ro'yxatdan o'tgan), mehmon 2/24 soat va jami 5 |
| 8 | Hujjat tekshiruvi narxi | Marketing "150 000" (va "AI 60 000 / advokat 140 000") vs jonli siyosat 149 000; "Express 15 daqiqa 90 000 dan" va "video 240 000" vs jonli katalog 220 000 / 150 000 |
| 9 | Narx ustamalari | Matn: "viloyat TOP-3 - 30% gacha, tor yo'nalishda 10+ yil - 20% gacha" vs siyosat: sohada >=5 yil +30%, 11+ yil +20% |
| 10 | Super-advokat | "6 shart" deyiladi, dashboard 4 ta ko'rsatadi (reyting >4.5, javob >90%, >=3 yil, >=10 buyurtma) |
| 11 | Majburiy konstruktor "yordam" | 399 000 va "3 ta bepul yuklab olish, keyin 19 000" veb kodida qattiq yozilgan - backend siyosatida yo'q |
| 12 | "For lawyers" tugmasi | "Advokat sifatida ro'yxatdan o'tish" `/register` ga emas `/contact` ga olib boradi |

### 9.6 Studio, HRM va texnik izohlar

1. **Studio bosqichlari:** TZ §36 "1-10 bosqichli sozlanadigan approval"; veb UI'da `MAX_STEPS = 6`. Studio roli `studio_publisher` route qadamlarida bor, `studio_admin` veb ro'yxatida. Qaror nomlari: veb backend'ning `rejected / declined / rework / returned` qiymatlarini `changes_requested` ga keltiradi, shuning uchun UI'da "rad etildi" holati hech qachon ko'rinmaydi; TZ bu holatlarni tavsiflamaydi.
2. **Studio hajmi:** jonli backend'da 61 ta konstruktor (9 toifa); veb kodida faqat K01-K20, M1-M3, CORE aniq nomlangan - qolganlari (MP01-MP10, SEC01-05, OPS01-08, INT01-03, SEARCH01, ORG01, CALL01) generic muharrir bilan ishlaydi. Mobil monitoring/review uchun to'liq, murakkab tahrir planshetga (TZ §36).
3. **Dashboard demo ma'lumotlari:** veb admin sahifalari (Overview, CEO, Retention, Call analytics, seller kabineti) barcha raqamlar nol bo'lsa `demoStats` bilan to'ldiriladi ("Demo ma'lumot" bannerida). Mobil statik demo son ko'rsatmasligi shart (TZ §7).
4. **Idle oynasi:** veb staff uchun 2 soat; TZ sessiya muddatlari haqida jim.
5. **Excel/PDF:** TZ §3.8 "Excel export" deydi; veb'da faqat Studio va HRM analitikasi Excel, audit CSV, B2B PDF; mobil backend'dagi `*.xlsx` endpointlarini (admin users, payments, payouts, leads, complaints, dashboard ...) ishlatishi mumkin, lekin TZ qaysi rolga ruxsat berilganini aytmaydi (`audit.export`?).

### 9.7 Egasiga savollar (javob kutilayotgan)

1. Marketplace'da kanonik xarid yo'li qaysi: `purchase-request` (to'liq summa, Telegram tasdig'i) yoki `POST /orders` (avans 10% + bosqichlar)? Mobilning hozirgi `orders` oqimi qaysiga o'tadi?
2. Biriktirilgan rol bilan (primary `client`) kirgan staff (admin, sales_operator, call_center_lawyer...) uchun majburiy 2FA yoqiladimi?
3. `call_center_lawyer` mobil qobig'i qanday: seller qobig'i + call-center "Uchrashuvlar"mi yoki alohida? Va ularda `leads.manage` yo'qligi shundayligicha qoladimi?
4. Oddiy outsource advokat ochiq hujjat poolini ko'radimi (veb ko'rsatadi, TZ §3.4 yo'q deydi)?
5. Tezkor advokat (urgent) to'lovi qanday: oldindan Telegram tasdig'imi yoki yakunda?
6. `executive`, `provider`, `ceo_viewer` rollari uchun aniq vazifa va ekranlar; `ceo_viewer` CEO panelini ko'ra oladimi (`/analytics/ceo` ruxsati)?
7. Tashkilot egasi akkaunti qanday yaratiladi (self-register, admin, upgrade)? Alohida bottom navigation kerakmi?
8. Ichki xodimlarga HRM ruxsati qanday beriladi (rol nomi, permission, yoki faqat `InternalEmployee` mavjudligi) va oddiy xodim o'z davomatini mobil orqali belgilay oladimi?
9. Bildirishnomalarga `deep_link`, `entity_type/entity_id`, `read_at` qo'shiladimi (TZ §28), yoki mobil `data.event` -> route xaritasini o'zi yuritadimi?
10. Workspace kvotasi 1 GB mi 2048 MB mi; fayl turi bo'yicha limitlar jadvali.
11. `/retention/*`, `/promotions/me`, `/admin/test-otps` marshrutlari rejalashtirilgan olib tashlashmi yoki staging'ga xosmi?
12. Hujjat tahlili uchun sahifa qoidasi: obuna (10/25 bet), AI tarif (1/5/20 tahlil, Pro 50 bet) va narx jadvali o'zaro qanday ustma-ust tushadi?
13. Payout `approve` qoidasi (`payout.approve` vs `payments.manage`) va payoutni "to'langan" belgilash vakolati.
14. Studio approval route necha bosqichgacha (6 yoki 10) va `studio_publisher` zarurmi?
15. Seller'ni tasdiqlash vakolati kimda (admin `users.manage`, moderator `lawyers.verify`, yoki ikkalasi)?
16. Staging fixture/test yozuvlarini ("Fixture-*", "ZZ ...", "TEST" roli) tozalash rejasi.

