# LexGo — do'kon ikonkalari

Belgi: to'q sariq fonda oq chat pufakchasi, uning ichida § (qonun moddasi belgisi). Ma'nosi: **advokat bilan onlayn yuridik maslahat**.
Umumiy ko'rinish: `preview.png`.

## Qaysi fayl qayerga

| Fayl | O'lcham | Qayerda ishlatiladi |
|---|---|---|
| `app-store/lexgo-app-store-1024.png` | 1024×1024, RGB (shaffofliksiz) | **App Store** ikonkasi. Alohida yuklanmaydi, build ichidan olinadi (`app.json` → `icon`). |
| `play-market/lexgo-play-icon-512.png` | 512×512, 32-bit PNG | **Play Console** → Store listing → *App icon* |
| `play-market/lexgo-feature-graphic-1024x500.png` | 1024×500, RGB | **Play Console** → Store listing → *Feature graphic* |
| `android/adaptive-foreground.png` | 1024×1024, shaffof | Android launcher ikonkasining old qatlami (`app.json` → `adaptiveIcon`) |
| `android/adaptive-background.png` | 1024×1024 | Android launcher ikonkasining fon qatlami |
| `android/adaptive-monochrome.png` | 1024×1024, oq siluet | Android 13+ "themed icons" |
| `android/notification-icon.png` | 96×96, oq siluet | Android bildirishnoma ikonkasi (`expo-notifications`) |
| `source/*.svg` | vektor | Tahrirlanadigan manbalar (Figma, Illustrator, Inkscape). Yozuvlar konturga aylantirilgan, shrift o'rnatish shart emas. |

## Eslatmalar

- **Ranglar:**
  - fon `#FFB648` → `#FF7438` → `#D93A22`;
  - § belgisi `#FF8B3A` → `#DC3B22`;
  - bildirishnoma rangi `#E8552A`.
- **Shrift:** Onest, ilovaning o'z shrifti.
- **Android:**
  - Pufakcha xavfsiz doira ichida turadi, shuning uchun doira, squircle va boshqa niqoblarda kesilmaydi.
  - iOS'dagi kabi ikonkaning ~66% ini egallaydi.
- **Play Market:** burchakni ham, tashqi soyani ham Play o'zi qo'shadi. Shuning uchun 512 faylda ular yo'q.
- **Yangilash vaqti:**
  - Ikonka telefonda keyingi native build'dan keyin almashadi: `eas build`, yoki `npx expo prebuild` va undan keyin build.
  - OTA yangilanish (`eas update`) ikonkani o'zgartirmaydi.
