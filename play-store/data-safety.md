# Data safety (Play Console → App content → Data safety)

> Bu javoblar KOD ASOSIDA tuzilgan qoralama. Yuborishdan oldin backend/huquqiy jamoa bilan tekshiring:
> ayniqsa "ma'lumotni o'chirish" va "uchinchi tomonga uzatish" (AI provayder, to'lov provayderi) bandlari.

## 1. Umumiy savollar
| Savol | Javob |
|---|---|
| Ilova foydalanuvchi ma'lumotlarini yig'adimi yoki ulashadimi? | Ha |
| Barcha ma'lumotlar uzatishda shifrlanadimi? | Ha (barcha so'rovlar HTTPS/WSS, `https://lexgo.api.cognilabs.org`) |
| Foydalanuvchi ma'lumotlarini o'chirishni so'ray oladimi? | **Tekshirish kerak** (hisobni o'chirish yo'li ilovada/backend'da tasdiqlanmagan). Play siyosati uchun hisobni o'chirish havolasi (URL) majburiy bo'ladi. |
| Play Families siyosatiga amal qiladimi? | Yo'q (ilova bolalarga mo'ljallanmagan) |

## 2. Yig'iladigan ma'lumot turlari
| Kategoriya | Tur | Yig'iladi | Ulashiladi | Majburiy | Maqsad |
|---|---|---|---|---|---|
| Personal info | Name | Ha | Yo'q | Ha | Hisob, buyurtma, mutaxassis bilan aloqa |
| Personal info | Phone number | Ha | Yo'q | Ha | Kirish (OTP / parol), aloqa |
| Personal info | User IDs | Ha | Yo'q | Ha | Hisob boshqaruvi |
| Personal info | Other info (hudud, rol, ixtisoslik) | Ha | Yo'q | Yo'q | Xizmat tavsiyasi, mutaxassis profili |
| Financial info | Purchase history / payment info | Ha (buyurtma va to'lov holati; karta ma'lumoti ilovada saqlanmaydi, to'lov provayder sahifasida kiritiladi) | **Provayder bilan** (Payme/Click) | Yo'q | To'lov |
| Messages | In-app messages (chat, support) | Ha | Yo'q | Yo'q | Mutaxassis va operator bilan aloqa |
| Photos and videos | Photos / Videos (yuborilgan fayl, video qo'ng'iroq) | Ha | Yo'q | Yo'q | Chat, hujjat, video qo'ng'iroq |
| Audio files | Voice or sound recordings (ovozli xabar, qo'ng'iroq) | Ha | Yo'q | Yo'q | Ovozli xabar, audio qo'ng'iroq |
| Files and docs | Files and docs (hujjatlar) | Ha | **AI provayder bilan** (hujjat tahlili/yaratish) | Yo'q | Hujjat tayyorlash va tahlil |
| App activity | App interactions | Ha | Yo'q | Yo'q | Funksiyalar ishlashi |
| App info and performance | Crash logs / Diagnostics | **Tekshirish kerak** (hozir tashqi analitika yo'q: hodisalar qurilmada saqlanadi) | Yo'q | Yo'q | — |
| Device or other IDs | Device or other IDs (push token) | **Push yoqilganda** | Yo'q | Yo'q | Bildirishnoma |

Yig'ilMAYDI: aniq/taxminiy joylashuv, kontaktlar, kalendar (mahalliy eslatma uchun kalendar hodisalari faqat qurilmada), SMS/qo'ng'iroq jurnali, sog'liq ma'lumotlari, reklama identifikatori.

## 3. Xavfsizlik amaliyotlari
- Ma'lumotlar uzatishda shifrlanadi: **Ha**
- Foydalanuvchi ma'lumotni o'chirishni so'ray oladi: **Tekshirish kerak** (yuqorida)
- Mustaqil xavfsizlik ko'rigi: **Yo'q** (agar o'tkazilmagan bo'lsa)

## 4. Ilova ruxsatlari (Android) va sabablari
| Ruxsat | Nima uchun |
|---|---|
| CAMERA | Video qo'ng'iroq, fayl uchun rasm olish |
| RECORD_AUDIO | Audio/video qo'ng'iroq, ovozli xabar |
| MODIFY_AUDIO_SETTINGS, BLUETOOTH | Qo'ng'iroq paytida dinamik/quloqchin yo'naltirish |
| POST_NOTIFICATIONS | Buyurtma, xabar, qo'ng'iroq bildirishnomalari |
| USE_BIOMETRIC | Biometrik qulf |
| VIBRATE, WAKE_LOCK, FOREGROUND_SERVICE(_MEDIA_PLAYBACK) | Qo'ng'iroq signali va qo'ng'iroq davomida ekran/audio |
| INTERNET, ACCESS_NETWORK_STATE | Tarmoq |

Olib tashlangan (Play'da cheklangan): SYSTEM_ALERT_WINDOW, READ_MEDIA_IMAGES/VIDEO/AUDIO, READ_MEDIA_VISUAL_USER_SELECTED, READ/WRITE_EXTERNAL_STORAGE (`app.json → android.blockedPermissions`).
