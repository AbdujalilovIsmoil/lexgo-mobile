# Play Console — asosiy ma'lumotlar va yuklash tartibi

## Ilova
| Maydon | Qiymat |
|---|---|
| Ilova nomi | LexGo — yuridik yordam (uz) / LexGo — юридическая помощь (ru) / LexGo — Legal Help (en) |
| Paket nomi (applicationId) | `org.cognilabs.lexgo.app` (Android; iOS bundle ID — `org.cognilabs.lexgo`. Eski `org.cognilabs.lexgo` Play ilovasi yo'qolgan upload kaliti sababli tashlandi) |
| Versiya | 1.1.0 (versionCode **4**) — keyingi har yuklashda `app.json` → `android.versionCode` ni oshiring (batafsil: `docs/ANDROID-RELEASE.md`) |
| Asosiy til | O'zbekcha (uz) |
| Ilova yoki o'yin | Ilova |
| Bepul yoki pullik | Bepul (ilova ichida pullik tariflar bor) |
| Kategoriya | Business (yoki Productivity) |
| Teglar | Legal, Lawyer, Documents |
| Min Android | 7.0 (API 24), target API 36 |
| Veb-sayt | https://lexgo.uz |
| Maxfiylik siyosati (URL) | https://lexgo.uz/uz/legal/privacy |
| Foydalanish shartlari | https://lexgo.uz/uz/legal/terms |
| Aloqa email | cognilabs@vallomat.com |
| Aloqa telefon | +998 71 200 00 00 (ilova ichidagi raqam; to'g'riligini tekshiring) |

## Yuklanadigan fayllar
| Fayl | Joyi |
|---|---|
| **AAB** (Play'ga yuklanadigan) | git'da yo'q (`*.aab` ignor qilingan). Qayta yig'ish va tekshirish: `docs/ANDROID-RELEASE.md` |
| Ilova ikonkasi 512×512 | `play-store/graphics/icon-512.png` |
| Feature graphic 1024×500 | `play-store/graphics/store-listing/out/feature-graphic-1024x500.jpg` |
| Skrinshotlar (telefon, 1080×1920) | `play-store/graphics/store-listing/out/screenshot-01…06.jpg` (haqiqiy emulyator suratlari; generator: `play-store/graphics/store-listing/build.mjs`) |
| Matnlar | `play-store/listing/uz.txt` (asosiy), `en.txt`, `ru.txt` (ru hali yangilanmagan) |

## Imzo (MUHIM)
AAB EAS serverida saqlanadigan **upload kaliti** bilan imzolanadi (expo.dev → lexgo → Credentials → Android). Yangi paket (`org.cognilabs.lexgo.app`) uchun birinchi `eas build -p android --profile production` EAS'da yangi keystore yaratadi; Play'dagi yangi ilova birinchi yuklashda shu kalitni upload kaliti sifatida qabul qiladi.
Eski paket `org.cognilabs.lexgo` Play'da boshqa upload kalitini (SHA-1 `54:7C:BF:E1:…:CB:7F`) kutardi va u yo'qolgan (2026-10-31), shuning uchun yangi paket nomi bilan boshidan boshlandi.
- Yangi build'dan keyin EAS'dagi kalitni zaxiralang (`eas credentials` → Android → Download keystore) — parol menejeriga. Yo'qolsa, yangilanish yuklab bo'lmaydi (kalitni almashtirish faqat Google orqali, 1–2 kun).
- Play Console'da "Play App Signing" ni yoqing (standart): Google ilovani o'z kaliti bilan imzolaydi, sizning kalit — faqat yuklash uchun.
- Kalit va parolni git'ga solmang (`.gitignore` da `*.jks` bor).

## Yuklash tartibi
1. Play Console → "Create app" (til: O'zbekcha, ilova, bepul).
2. App content: Privacy policy URL, App access (quyida), Ads (**Yo'q**), Content rating (`content-rating.md`), Target audience (**18+**), Data safety (`data-safety.md`), Government apps (Yo'q), Financial features (Yo'q), Health (Yo'q).
3. Store listing: matn (`listing/*.txt`), ikonka, feature graphic, skrinshotlar.
4. Release → Production (yoki Internal testing avval) → AAB yuklash → Release notes → Review → Rollout.
5. Yangi shaxsiy hisob (2023-11 dan keyin ochilgan) bo'lsa: Production'dan oldin **Closed testing: 12+ tester, 14 kun** talab qilinadi.

## App access (tekshiruvchi uchun)
Ilovaning katta qismi kirishni talab qiladi (OTP / parol, xodimlar uchun majburiy 2FA).
Play tekshiruvchisi uchun **test akkaunt** kerak. Play Console → App content → App access'da **faqat `client` rolidagi, 2FA'siz** akkaunt kiritiladi (xodim/admin/advokat akkauntlari 2FA yoki keng huquq sababli yaramaydi).
- Telefon va parol **repoga yozilmaydi** — loyiha egasidan olinadi va Play Console'ga qo'lda kiritiladi.
- Matn (≤500 belgi): `1. Open LexGo and tap "Kirish". 2. Log in with the phone and password above. No SMS/OTP/2-step code is needed. 3. The account opens the full client app. 4. Allow camera, microphone and notifications when asked.`
- Akkaunt ishlashini har yuborishdan oldin telefonda tekshiring; parolni o'zgartirsangiz Play Console'dagi ma'lumotni ham yangilang.
