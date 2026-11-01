# LexGo — App Store'ga chiqarish paketi

Sana: 2026-10-28. Manba: `app.json`, `eas.json`, kod va backend (`https://lexgo.api.cognilabs.org`).
Bu papka (`app-store/`) App Store Connect'ni to'ldirish uchun kerak bo'lgan hamma narsani o'z ichiga oladi. Google Play uchun paket alohida: `play-store/`.

> Qisqa xulosa. Kod tayyor (typecheck, lint, 1233 test, toza `prebuild`, Release build o'tdi). Lekin App Store'ga yuborishdan oldin **3 ta narsa sizdan kerak** (qizil belgilangan): tekshiruvchi uchun mijoz akkaunti (telefon + parol), `lexgo.uz` domenida maxfiylik siyosati va yordam sahifasini joylash, mas'ul shaxsning telefon raqami. Batafsil — 11-bo'lim.

---

## 1. Ilova nomi (App Name)

| Maydon | Qiymat | Chegara |
|---|---|---|
| **Name** (do'kondagi nom) | `LexGo — yuridik yordam` | 30 belgi (22 ishlatilgan) |
| Qurilmadagi nom (`CFBundleDisplayName`) | `LexGo` | `app.json → expo.name` |
| **Subtitle** | `Advokat, hujjat va AI maslahat` | 30 belgi |
| SKU (App Store Connect ichki kodi) | `lexgo-ios` | ixtiyoriy matn |
| Primary category | **Business** | — |
| Secondary category | **Productivity** | ixtiyoriy |
| Narx | **Bepul** (ilova ichida pullik xizmatlar va tariflar bor — to'lov Payme/Click veb-sahifasida, Apple IAP emas) | — |

Eslatma: App Store Connect'da **o'zbek tili lokalizatsiya sifatida yo'q**. Shuning uchun asosiy til **Russian** (yoki English U.S.) tanlanadi, nom esa baribir o'zbekcha yoziladi — nom matni istalgan tilda bo'lishi mumkin. Ruscha va inglizcha tavsiflar 4-bo'limda; o'zbekcha tavsifni ham beraman — uni xohlasangiz English (U.S.) lokalizatsiyasining tavsif maydoniga qo'yish mumkin (Apple bunga to'sqinlik qilmaydi, lekin tekshiruvchi inglizcha o'qiydi).

## 2. Bundle va texnik identifikatorlar

| Maydon | Qiymat |
|---|---|
| **Bundle ID** | `org.cognilabs.lexgo` (iOS; Android paketi — `org.cognilabs.lexgo.app`) |
| Versiya (`CFBundleShortVersionString`) | `1.1.0` (`app.json → expo.version`) |
| Build (`CFBundleVersion`) | `1` (`app.json → expo.ios.buildNumber`; EAS production profili har buildda avtomatik oshiradi) |
| Minimal iOS | 16.4 (Expo SDK 57 standarti) |
| Qurilmalar | iPhone va iPad (`supportsTablet: true`, iPad'da barcha orientatsiyalar, iPhone'da faqat portret) |
| Arxitektura | arm64 |
| URL scheme | `lexgo://` ; Universal Links: `applinks:lexgo.uz` |
| Push | APNs (`aps-environment`), background modes: `audio`, `fetch`, `processing`, `remote-notification` |
| Shifrlash (Export Compliance) | `ITSAppUsesNonExemptEncryption = false` → savolga **"No"** (faqat HTTPS/TLS) |
| EAS project | `3c3729af-185c-4be7-8c62-298aff835b84`, owner `ismoilabdujalilov`, updates kanali `production` |
| Apple Team ID | **Nashr qiluvchining pullik Apple Developer akkaunti kerak.** Hozirgi Mac'dagi sertifikat shaxsiy (bepul) jamoa — u bilan App Store'ga yuborib bo'lmaydi. |

Ilova so'raydigan ruxsatlar va ularning matnlari (Info.plist, o'zbekcha, tekshiruvchi ko'radi):

| Ruxsat | Matn |
|---|---|
| Kamera | LexGo video uchrashuvlar uchun kameradan foydalanadi. / hujjatlarni skanerlash |
| Mikrofon | LexGo qo'ng'iroq va uchrashuvlar uchun mikrofondan foydalanadi. |
| Galereya (o'qish) | LexGo suhbatga rasm yuborish va hujjat skanerlash uchun galereyaga kiradi. |
| Galereya (saqlash) | LexGo faylni galereyaga saqlaydi. |
| Face ID | LexGo ilovani Face ID bilan tez va xavfsiz ochish uchun ruxsat so'raydi. |
| Joylashuv (faqat ilova ochiqda, faqat advokat/yurist uchun) | LexGo yaqin atrofdagi mijozlarga sizni taxminiy masofa bilan ko'rsatish uchun, ilova ochiq turganda joylashuvingizdan foydalanadi. |

## 3. Rasmlar

Tayyor fayllar (alpha kanalisiz PNG, Apple o'lchamlarida):

| Nima | O'lcham | Fayl |
|---|---|---|
| Ilova ikonkasi | 1024 × 1024, alpha yo'q | `logos/app-store/lexgo-app-store-1024.png` |
| iPhone 6.9" skrinshotlar (iPhone 17 Pro Max) | 1320 × 2868 | `app-store/screenshots/iphone-6.9/01…06.png` |
| iPhone 6.3" skrinshotlar (iPhone 17 Pro) | 1206 × 2622 | `app-store/screenshots/iphone-6.3/01…06.png` |
| iPad 13" skrinshotlar (iPad Pro 13") | 2064 × 2752 | `app-store/screenshots/ipad-13/01…06.png` |

Har to'plamda 6 ta ekran, tartib: 01 Bosh sahifa · 02 Hujjatlar · 03 AI yordamchi · 04 Advokat va yuristlar · 05 Mening ishlarim · 06 Xabarlar. Hammasi haqiqiy mijoz akkaunti bilan, qorong'i rejimda, status bar 9:41.

Apple talabi: iPhone uchun kamida bitta 6.9" **yoki** 6.5" to'plam; iPad qo'llab-quvvatlangani uchun 13" to'plam **majburiy**. Boshqa o'lchamlar kerak bo'lsa, shu fayllarni App Store Connect o'zi kichraytiradi. Nashr qiluvchi boshqa o'lcham so'rasa (3-band), shu manbadan qayta eksport qilish mumkin: `app-store/screenshots/` ga qarang.

Eslatmalar:
- 6.9" to'plam 6.3" (iPhone 17 Pro) ekranidan 1320 × 2868 ga masshtablangan (nisbat farqi 0,07 %, ko'zga ko'rinmaydi); Pro Max simulyatorida har deep-link tizim dialogini ko'rsatgani uchun natural olinmadi.
- Skrinshotlarda test ma'lumotlari ko'rinadi ("Demo Advokat 1", "test xizmat"). Backend'da real advokatlar paydo bo'lgach qayta olish tavsiya etiladi (`PROMPT`dagi deep-link usuli: `xcrun simctl openurl <sim> lexgo://services`).
- App Preview (video) ixtiyoriy, tayyorlanmagan.

## 4. Tavsif (Description), kalit so'zlar, reklama matni

### 4.1 O'zbekcha (asosiy matn; English (U.S.) lokalizatsiyasiga qo'yish mumkin)

**Promotional text** (170 belgi):
`Muammoingizni yozing — LexGo mos xizmat va tasdiqlangan advokatni topadi. Hujjatlar, AI maslahat, xavfsiz chat va qo'ng'iroq — bitta ilovada.`

**Description** (4000 belgigacha):

```
LexGo — O'zbekistondagi yuridik xizmatlarni bir joyga to'plagan ilova. Muammoingizni oddiy so'zlar bilan yozing — ilova kerakli xizmat va mutaxassisni tez topadi.

NIMA QILA OLASIZ

• AI yuridik yordamchi — savolingizni yozing, ilova muammo turini aniqlab, mos xizmat va advokatni tavsiya qiladi.
• Advokat va yuristlar katalogi — hudud, ixtisoslik, reyting va narx bo'yicha qidiring, profilini ko'ring va buyurtma bering.
• Hujjat tayyorlash — shartnoma, ariza va boshqa hujjatlarni shablondan to'ldiring, AI yordamida yarating yoki navbatchi advokatga topshiring.
• Tezkor advokat — shoshilinch holatda bir necha daqiqada advokat bilan bog'laning.
• Xavfsiz chat, audio va video qo'ng'iroq — mutaxassis bilan ilova ichida gaplashing.
• Buyurtmalar va holatlar — har bir bosqichni kuzating, natijani yuklab oling va baho bering.
• Tariflar — kerakli paketni tanlab, AI va hujjat imkoniyatlarini kengaytiring.
• Bildirishnomalar — buyurtma, xabar va qo'ng'iroqlar haqida o'z vaqtida xabar oling.
• Yordam markazi — operator bilan chat orqali murojaat qiling.

ADVOKATLAR VA YURISTLAR UCHUN

Ro'yxatdan o'ting, xizmatlaringizni joylashtiring, so'rovlar va buyurtmalarni qabul qiling, ishlar, vazifalar va kalendarni bir joyda yuriting.

XAVFSIZLIK

• Parol, ikki bosqichli tasdiqlash va Face ID qulfi.
• Ma'lumotlar uzatishda shifrlanadi.
• Hisobni ilovaning o'zida o'chirish mumkin (Profil → Xavfsizlik).

MUHIM

AI yordamchi umumiy ma'lumot beradi va advokat maslahatining o'rnini bosmaydi. Murakkab masalalarda malakali mutaxassisga murojaat qiling. Ilova 18 yoshdan katta foydalanuvchilar uchun.

Til: o'zbek, rus, ingliz.
```

**Keywords** (100 belgi, vergul bilan, bo'sh joysiz — 97 belgi):
`advokat,yurist,huquq,hujjat,shartnoma,ariza,maslahat,sud,yuridik,lawyer,legal,advocate,uzbekistan`

**What's New** (1.1.0):
`LexGo'ning App Store'dagi birinchi versiyasi: AI yuridik yordamchi, advokatlar katalogi, hujjat tayyorlash, tezkor advokat, xavfsiz chat va qo'ng'iroqlar, buyurtmalar va bildirishnomalar.`

### 4.2 Ruscha (Russian lokalizatsiyasi uchun)

Name: `LexGo — yuridik yordam` (o'zbekcha qoladi) · Subtitle: `Адвокат, документы и ИИ`
Promotional text: `Опишите проблему — LexGo подберёт услугу и проверенного адвоката. Документы, ИИ-консультация, защищённый чат и звонки — в одном приложении.`
Description va What's New: `play-store/listing/ru.txt` dagi to'liq matn (qaytarish/kafolat shartlari bir xil). Oxiriga qo'shing: `• Аккаунт можно удалить в самом приложении (Профиль → Безопасность).`
Keywords: `адвокат,юрист,право,документ,договор,заявление,консультация,суд,lawyer,legal,узбекистан`

### 4.3 Inglizcha (English (U.S.) lokalizatsiyasi uchun)

Name: `LexGo — yuridik yordam` · Subtitle: `Lawyers, documents and AI`
Promotional text: `Describe your problem — LexGo finds the right service and a verified advocate. Documents, AI guidance, secure chat and calls in one app.`
Description va What's New: `play-store/listing/en.txt`. Oxiriga qo'shing: `• You can delete your account inside the app (Profile → Security).`
Keywords: 4.1 dagi ro'yxat.

## 5. Tekshiruvchi uchun login va parol (App Review Information → Sign-in required)

Ilovaning asosiy qismi kirishni talab qiladi, ro'yxatdan o'tish O'zbekiston raqamiga SMS kod bilan — Apple tekshiruvchisi (AQSh) bunday kod ololmaydi. Shuning uchun **tayyor mijoz akkaunti majburiy**:

| Maydon | Qiymat |
|---|---|
| Username (telefon) | **`+998 __ ___ __ __` — SIZ TO'LDIRASIZ** |
| Password | **`________` — SIZ TO'LDIRASIZ** |

Talablar (bo'lmasa ilova rad etiladi):
1. Rol — **mijoz** (`client`). Advokat/yurist akkaunti tekshiruv uchun kerak emas.
2. 2FA **o'chirilgan** bo'lsin (mijozda u ixtiyoriy; Profil → Xavfsizlik → Himoya → 2FA: O'chirilgan).
3. Akkauntda kamida 1 ta faol so'rov/buyurtma va 1 ta suhbat bo'lsin — tekshiruvchi "Ishlar" va "Xabarlar" tabini bo'sh ko'rmasin. Hozirgi test akkaunt ("LexGo Client ONE", simulyatorda kirilgan) shunga mos, lekin uning paroli menda yo'q — paroli sizda.
4. Tekshiruv tugaguncha parol o'zgartirilmasin.

Men kodni o'qib akkaunt yaratolmayman va parolni bilmayman: ro'yxatdan o'tish `POST /auth/register/start` → SMS kod → `verify` orqali, kod faqat real telefonga keladi. Shuning uchun bu ikki maydon siz tomondan to'ldiriladi (yoki "LexGo Client ONE" ning parolini berasiz).

**Review Notes** (App Store Connect'ga inglizcha kiritiladi — tekshiruvchi faqat ingliz tilini o'qiydi; quyida o'zbekcha tarjimasi):

```
LexGo is a legal-services app for Uzbekistan (clients, advocates, jurists).
Sign in with the phone number and password above (role: client). Registration
needs an Uzbek SMS code, so please use the provided account; 2FA is disabled on it.

What to test: Home → type a question in the field (AI assistant); "Hujjatlar" tab →
document templates; "Ishlar" tab → the account's active requests; "Xabarlar" tab →
chats with specialists; drawer (☰) → "Advokat va yuristlar" marketplace.
Paid services are settled on the web pages of the Uzbek payment providers
Payme/Click (no Apple in-app purchase); no payment is required to review the app.
Urgent requests and calls connect to real advocates, so please do not create an
urgent request. Account deletion: Profile → Security → Protection → Delete account.
Microphone/camera are used only for in-app calls, voice messages and document
scanning; location (when in use) is requested only from advocate/jurist accounts.
```

O'zbekcha mazmuni: ilova nima; berilgan akkaunt bilan kirish (SMS tufayli ro'yxatdan o'tib bo'lmaydi, 2FA o'chiq); nimani tekshirish (AI, Hujjatlar, Ishlar, Xabarlar, advokatlar bozori); to'lovlar Payme/Click veb-sahifasida, tekshiruv uchun to'lov shart emas; tezkor so'rov yaratmaslik iltimosi (real advokatlarga boradi); hisobni o'chirish yo'li; ruxsatlar nima uchun.

## 6. Mas'ul shaxs (App Review contact va Apple Developer akkaunti)

| Maydon | Qiymat |
|---|---|
| Ism, familiya | Ismoil Abdujalilov |
| E-mail | ismoilbek.abdujalilov@gmail.com (Apple Developer / EAS akkaunti bilan bir xil); zaxira: ismoilbek20050421@gmail.com |
| Telefon | **+998 __ ___ __ __ — SIZ TO'LDIRASIZ** (App Store Connect'da majburiy, xalqaro formatda) |
| Kompaniya | Cognilabs (`org.cognilabs.lexgo`, API `lexgo.api.cognilabs.org`) |
| Copyright (do'kon sahifasi) | `© 2026 Cognilabs` |

Agar ilova kompaniya nomidan nashr qilinsa, Apple Developer Program'da **Organization** akkaunti va D-U-N-S raqami kerak; shaxsiy nomdan bo'lsa — Individual. Trader status (EU DSA) uchun: Yevropa do'konida sotilsa, mas'ul shaxsning manzili va telefoni do'kon sahifasida ko'rinadi.

## 7. Maxfiylik siyosati (Privacy Policy)

| Maydon | Qiymat |
|---|---|
| Privacy Policy URL (majburiy) | `https://lexgo.uz/legal/privacy` — **hozir ochilmaydi** (domen DNS'da yo'q, 2026-10-28 tekshirildi) |
| Tayyor sahifalar | `docs/legal/privacy.html` (uz), `privacy.uz_cyrl.html`, `privacy.ru.html` + `terms*`, `personal-data*`, `payments*`, `platform-rules*`, `cookie*` |
| Matn manbai | Backend'dagi rasmiy hujjatlar: `GET /legal/consents` → `privacy` (Tahrir 1.0, 14.09.2026) va boshqalar; sahifalar shu matndan avtomatik yig'ilgan |

Nima qilish kerak: `docs/legal/` papkasini `lexgo.uz` (yoki istalgan HTTPS domen, masalan `legal.lexgo.uz`) ga statik joylash — oddiy nginx/S3/Cloudflare Pages yetarli. Keyin App Store Connect'ga `https://lexgo.uz/legal/privacy.html` yoziladi. Hujjat matnlarida `MChJ «________________»` bo'sh joy bor — yuridik shaxs nomini backend'dagi hujjatlarga kiritib, sahifalarni qayta yig'ish kerak (skript: shu sessiya; qayta ishlatish uchun `python3` bilan `/legal/consents` dan o'qiladi).

**App Privacy (Nutrition labels)** — kod asosida javoblar:

| Savol | Javob |
|---|---|
| Ma'lumot yig'iladimi? | Ha |
| Tracking (reklama uchun kuzatuv) | **Yo'q** (reklama SDK, IDFA yo'q) |

Yig'iladigan va foydalanuvchiga bog'langan (Linked to you) ma'lumotlar — maqsadi **App Functionality**:

| Kategoriya | Tur |
|---|---|
| Contact Info | Name, Phone Number, Email (agar kiritilsa) |
| Identifiers | User ID, Device ID (push token) |
| User Content | Photos or Videos, Audio Data (ovozli xabar, qo'ng'iroq), Customer Support, Other User Content (chat, hujjatlar) |
| Purchases | Purchase History (buyurtma va to'lov holati; karta ma'lumoti ilovada saqlanmaydi) |
| Location | Coarse Location — faqat advokat/yurist roli, ilova ochiq turganda |
| Financial Info | — (to'lov provayder sahifasida) |
| Usage Data / Diagnostics | Yo'q (tashqi analitika va crash SDK yo'q; jurnal qurilmada) |

Uchinchi tomon: hujjat matnlari AI provayderga tahlil uchun yuboriladi (backend orqali), to'lov Payme/Click. Bu `data-safety.md` (Play) bilan bir xil.

**Age rating** (yangi anketa): zo'ravonlik/jinsiy/qo'pol so'z/giyohvand/qimor — Yo'q; tibbiy maslahat — Yo'q; cheklanmagan veb — Yo'q; **foydalanuvchilar o'rtasida xabar almashish — Ha**; **foydalanuvchi kontenti — Ha**; **xaridlar — Ha**; AI kontent — Ha. Kutilgan natija 13+ yoki 16+; foydalanuvchi ofertasi 18+ talab qilgani uchun reytingni qo'lda **18+** qilish xavfsizroq.

## 8. Yordam URL (Support URL) va Marketing URL

| Maydon | Qiymat |
|---|---|
| Support URL (majburiy) | `https://lexgo.uz/legal/support.html` — tayyor sahifa `docs/legal/support.html` (uz), `support.ru.html`, `support.en.html`; 7-bo'limdagi joylash bilan birga ishga tushadi |
| Marketing URL (ixtiyoriy) | `https://lexgo.uz` |
| Support e-mail | `cognilabs@vallomat.com` (Play paketida ham shu; boshqasi bo'lsa `docs/legal/support*.html` da almashtiring) |
| Support telefon | `+998 78 777 00 00` (ilova ichidagi raqam) |
| Hisobni o'chirish sahifasi | `support.html` ichida — Apple 5.1.1(v) va Play uchun kerak |

## 9. Kodga dostup

| Nima | Qayerda |
|---|---|
| Git repozitoriy (private) | `https://github.com/AbdujalilovIsmoil/lexgo-mobile` — nashr qiluvchining GitHub loginini **Collaborator (Write)** qilib qo'shish: Settings → Collaborators |
| Asosiy branch | `main` (har task'dan keyin push qilinadi) |
| EAS (Expo) loyihasi | owner `ismoilabdujalilov`, project `3c3729af-…`; build qilish uchun `expo.dev` da loyihaga **Developer** rolida qo'shish yoki `eas build` ni siz ishga tushirasiz |
| Apple Developer | Nashr qiluvchining o'z akkaunti; sertifikat va provisioning'ni EAS o'zi yaratadi (`eas build -p ios --profile production` birinchi marta Apple login so'raydi) |
| Backend | `https://lexgo.api.cognilabs.org` — ilova build'iga hech qanday maxfiy kalit kiritilmaydi (`.env` yo'q); push uchun APNs `.p8` kaliti EAS'ga yuklanadi |
| Android kaliti | `~/lexgo-keys/lexgo-upload.jks` (faqat Play uchun, iOS'ga aloqasi yo'q) |

Build va yuborish tartibi (nashr qiluvchi Mac'ida yoki EAS bulutida):

```bash
git clone https://github.com/AbdujalilovIsmoil/lexgo-mobile.git && cd lexgo-mobile
npm ci
npx eas-cli login                                   # Expo akkaunti
npx eas-cli build -p ios --profile production       # Apple ID so'raydi, sertifikatlarni o'zi yaratadi, build raqamini oshiradi
npx eas-cli submit -p ios --latest                  # eas.json → submit.production.ios ni to'ldirgandan keyin
```

Lokal Xcode orqali: `npx expo prebuild --platform ios --clean` → `ios/LexGo.xcworkspace` → Signing: pullik jamoa → Product → Archive → Distribute. `ios/` papka git'da yo'q (`.gitignore`), har safar `prebuild` dan yig'iladi — qo'lda tahrir qilinmaydi.

## 10. iOS papkasi va tekshiruv natijalari (2026-10-28)

Bajarilgan ishlar:
- `app.json`: `ios.buildNumber: "1"` qo'shildi; `expo-location` plugin'idan keraksiz "Always location" va "Motion" ruxsat matnlari olib tashlandi (ular inglizcha shablon edi — tekshiruvchi uchun noto'g'ri signal).
- `eas.json`: `production.ios.autoIncrement`, `development` profili, `submit.production.ios` (Apple ID, ascAppId, Team ID — to'ldiriladi).
- `npx expo install --fix`: 6 ta paket SDK 57 ning oxirgi patch versiyasiga ko'tarildi (expo, expo-location, expo-network, expo-notifications, expo-router, expo-sharing).
- Eski `ios/build-rel` (3,3 GB) va `ios/build` o'chirildi; `ios/` `npx expo prebuild --platform ios --clean` bilan noldan yig'ildi; `pod install` o'tdi.
- Endi `ios/LexGo/LexGo.entitlements` da `aps-environment` va `applinks:lexgo.uz` bor (oldingi papka shaxsiy jamoa uchun yig'ilgan, ikkalasi ham yo'q edi — App Store build'ida push ishlamas edi).
- Hisobni o'chirish (App Store 5.1.1(v) talabi): Profil → Xavfsizlik → Himoya → **Hisobni o'chirish** kartasi qo'shildi (uz/ru/en). Backend'da o'z-o'zini o'chirish endpointi yo'q (OpenAPI'da 881 yo'l tekshirildi), shuning uchun so'rov `POST /support/tickets` (`category: account`) orqali operatorlarga boradi va ilova darhol chiqadi. **Backend'ga `DELETE /users/me` qo'shilgach**, `src/widgets/security/DeleteAccountCard.tsx` dagi `send` funksiyasi shunga almashtiriladi.

Tekshiruvlar:

| Tekshiruv | Natija |
|---|---|
| `npx tsc --noEmit` | 0 xato |
| `npx expo lint` | 0 xato |
| `npx jest --ci` | 188 suite, 1233 test — hammasi o'tdi |
| `npx expo-doctor` | 21/21 (paketlar yangilangandan keyin) |
| `npx expo prebuild --platform ios --clean` + `pod install` | o'tdi |
| `xcodebuild … -configuration Release -sdk iphonesimulator` (arm64) | **BUILD SUCCEEDED** |
| Ilova simulyatorda (iPhone 17 Pro, iPhone 17 Pro Max, iPad Pro 13") | mijoz akkaunti bilan barcha tablar ochildi, skrinshotlar olindi |

Ma'lum cheklovlar:
- `modules/text-ocr` dagi `TesseractKit.xcframework` faqat `ios-arm64` va `ios-arm64-simulator` ga ega: Intel simulyatorda (x86_64) Release build o'tmaydi. Real qurilma, App Store va Apple Silicon simulyatorlariga ta'siri yo'q.
- Universal Links (`applinks:lexgo.uz`) ishlashi uchun `https://lexgo.uz/.well-known/apple-app-site-association` fayli kerak (domen ishga tushganda).
- Qo'ng'iroq push (ilova yopiq bo'lganda kiruvchi qo'ng'iroq) uchun PushKit/CallKit hali yo'q — `docs/backend-call-push.md`; tekshiruvga to'sqinlik qilmaydi.

## 11. Yuborishdan oldin — nazorat ro'yxati

- [ ] **Siz:** tekshiruvchi uchun mijoz telefon + parol (5-bo'lim), 2FA o'chiq, ichida 1–2 so'rov va suhbat bor.
- [ ] **Siz:** mas'ul shaxs telefon raqami (6-bo'lim).
- [ ] **Siz / backend:** `docs/legal/` ni `lexgo.uz` ga joylash; Privacy va Support URL ochilishini brauzerda tekshirish (7–8-bo'lim). Hujjatlardagi `MChJ «____»` ni to'ldirish.
- [ ] Nashr qiluvchi: App Store Connect'da ilova yaratish (Name, Bundle ID `org.cognilabs.lexgo`, SKU `lexgo-ios`, primary language Russian).
- [ ] Nashr qiluvchi: Apple Developer akkauntini EAS'ga ulab `eas build -p ios --profile production` (yoki Xcode Archive).
- [ ] App Store Connect'da: App Information, Pricing (Free), App Privacy (7-bo'lim), Age Rating, Screenshots (3-bo'lim), Description/Keywords/Promo (4-bo'lim), Support/Marketing URL, Review Information (5–6-bo'lim), Export Compliance "No".
- [ ] Push uchun APNs Auth Key (`.p8`) ni `eas credentials` orqali yuklash — bo'lmasa bildirishnomalar kelmaydi (tekshiruvdan o'tishga xalaqit bermaydi).
- [ ] Birinchi yuklashdan keyin TestFlight'da real iPhone'da kirish, AI, hujjat ochish, chat va qo'ng'iroqni bir marta tekshirish.
