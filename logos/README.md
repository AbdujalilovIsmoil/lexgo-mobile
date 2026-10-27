# LexGo — do'kon ikonkalari

Belgi: zumrad yashil fonda oltin qalqon, qalqon ichiga adolat tarozisi o'yilgan. Ma'nosi: **huquq va uning himoyasi**.
Avvalgi "LG" belgisiga o'xshamaydi. Umumiy ko'rinish: `preview.png`.

## Qaysi fayl qayerga

| Fayl | O'lcham | Qayerda ishlatiladi |
|---|---|---|
| `app-store/lexgo-app-store-1024.png` | 1024×1024, RGB (shaffofliksiz) | **App Store** ikonkasi. U alohida yuklanmaydi, build ichidan olinadi (`app.json` → `icon`). |
| `play-market/lexgo-play-icon-512.png` | 512×512, RGB | **Play Console** → Store listing → *App icon* |
| `play-market/lexgo-feature-graphic-1024x500.png` | 1024×500, RGB | **Play Console** → Store listing → *Feature graphic* (majburiy) |
| `android/adaptive-foreground.png` | 1024×1024, shaffof | Android launcher ikonkasining old qatlami (`app.json` → `adaptiveIcon`) |
| `android/adaptive-background.png` | 1024×1024 | Android launcher ikonkasining fon qatlami |
| `android/adaptive-monochrome.png` | 1024×1024, oq siluet | Android 13+ "themed icons" |
| `android/notification-icon.png` | 432×432, oq siluet | Android bildirishnoma ikonkasi (`expo-notifications`) |
| `alternatives/*` | 1024×1024 | Muqobil variantlar: ko'k va to'q qizil qalqon, suhbat pufakchasi, muhr |
| `source/*.svg` | vektor | Tahrirlanadigan manbalar (Figma, Illustrator, Inkscape). Feature graphic uchun **Onest** shrifti kerak. |

## Eslatmalar

- **Ranglar:** fon `#14866E` → `#0A4B40` → `#03211C`; oltin `#FFF3CB` → `#F6CC67` → `#D79D37` → `#9B6815`.
- **Android:** qalqon adaptive ikonkaning xavfsiz doirasi ichida turadi, shuning uchun doira, squircle va boshqa niqoblarda kesilmaydi.
- **Yangilash vaqti:** ikonka telefonda keyingi native build'dan keyin almashadi (`eas build` yoki `npx expo run:ios|android`). Fast Refresh va OTA yangilanish ikonkani o'zgartirmaydi.
- **Muqobil variantga o'tish:** `app.json`dagi `icon`ni o'sha 1024 PNG'ga almashtiring. Android qatlamlarini ham shu rangda qayta chiqarish kerak.
