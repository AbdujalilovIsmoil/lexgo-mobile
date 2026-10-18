# LexGo mobile — ish hisoboti (2026-10-12)

Bu fayl `play-store/` papkasi bilan birga turadi. Qisqa mazmun va hal bo'lmagan masalalar quyida.

## Bajarilganlar
| # | Mavzu | Natija |
|---|---|---|
| 1 | Login'dan keyin ekranda qolib ketish | `router.dismissAll()` o'rniga `canDismiss()` tekshiruvi, yo'q bo'lsa bosh sahifaga `replace("/")` |
| 2 | Qo'ng'iroqda ovoz / video | Ringback iOS mikrofonini o'chirib qo'ymaydi; kamera `wanted.cam` tuzatildi; LiveKit loglari tozalandi |
| 3 | Real vaqt (websocket) | Barcha `call.*` voqealari roster'ni yangilaydi; pauzada 3 s so'rov; o'lik socketni aniqlash (pong), foreground'da qayta ulanish |
| 4 | Fon rejimida kiruvchi qo'ng'iroq | Socket tirik bo'lsa OS bildirishnomasi; tugagach o'chadi |
| 5 | So'rovlar va kesh | 2 daqiqa fresh, 30 daqiqa gc; bir xil GET'lar birlashtirildi; ommaviy katalog diskda 24 soat (AsyncStorage) |
| 6 | Testlar | Jest o'rnatildi, `npm test`: 13 suite, 54 test — hammasi o'tdi |
| 7 | Dashboard | Kutilayotgan ishlar, Monetizatsiya, Konversiya, Sifat bo'limlari + drawer'lar + grafiklar |
| 8 | Muammo formasi | Header'dagi AI tugmasi o'rniga muammo formasi (`POST /support/tickets`) |
| 9 | Play Market | AAB, ikonka, feature graphic, skrinshotlar, uz/ru/en matnlar, data safety, kontent reytingi, ruxsatlar tozalandi |

## Hal bo'lmagan / sizdan kerak
1. **Masofaviy push (FCM/APNs)** — backend'da qurilma-token endpointi yo'q; Firebase `google-services.json` va APNs kaliti kerak.
2. **Copy-paste** — Android emulyatorda (release APK) Cut/Copy/Paste menyusi ishladi. Sizning telefoningizda qaysi ekran/maydonda ishlamasligini aniqlash kerak.
3. **Telegram'ga yuborish** — token va chat ID yoki backend endpointi kerak (xavfsizlik uchun backend orqali tavsiya qilinadi).
4. **Hisobni o'chirish** — Play siyosati bo'yicha hisobni o'chirish yo'li (URL) kerak; ilovada/backend'da tasdiqlanmagan.
5. **Aloqa email, test akkaunt** — Play Console'da to'ldirish kerak (`release-and-store-info.md`).
6. **Test qamrovi** — kodning ~1% i qamrab olingan (pure-logic: api, realtime, formatlar, normalizatorlar). Ekran/UI testlari (React Native Testing Library) yozilmagan.
7. **Skrinshotlar** — emulyatordan olingan; ba'zi kartochkalarda "Demo" nomli test mutaxassislar ko'rinadi. Nashrdan oldin real ma'lumot bilan almashtirish tavsiya etiladi.
