# Play Console — asosiy ma'lumotlar va yuklash tartibi

## Ilova
| Maydon | Qiymat |
|---|---|
| Ilova nomi | LexGo — yuridik yordam (uz) / LexGo — юридическая помощь (ru) / LexGo — Legal Help (en) |
| Paket nomi (applicationId) | `org.cognilabs.lexgo` |
| Versiya | 1.0.0 (versionCode **1**) — keyingi har yuklashda versionCode ni oshiring |
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
| **AAB** (Play'ga yuklanadigan) | `mobile/play-store/lexgo-1.0.0-v3.aab` |
| Ilova ikonkasi 512×512 | `mobile/logos/play-market/lexgo-play-icon-512.png` |
| Feature graphic 1024×500 | `mobile/logos/play-market/lexgo-feature-graphic-1024x500.png` |
| Skrinshotlar (telefon) | `mobile/play-store/graphics/screenshots/` |
| Matnlar | `mobile/play-store/listing/uz.txt, ru.txt, en.txt` |

## Imzo (MUHIM)
AAB **upload kaliti** bilan imzolangan: `~/lexgo-keys/lexgo-upload.jks` (parol `~/lexgo-keys/keystore.properties` ichida).
- Bu fayllarni **zaxiralang** (parol menejeri / xavfsiz disk). Yo'qolsa, yangilanish yuklab bo'lmaydi (Google qo'llab-quvvatlashi orqali kalitni almashtirish mumkin, lekin sekin).
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
Play tekshiruvchisi uchun **test akkaunt** kerak:
- Telefon: **(to'ldiring)**
- Parol: **(to'ldiring)**
- Eslatma: akkauntda 2FA/OTP bo'lmasligi yoki tekshiruvchiga kod berilishi kerak (aks holda ilova rad etiladi).
