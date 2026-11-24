# LexGo — app and store icons

The brand mark is the blue **"LG" glyph** (`source/lexgo-lg-glyph.png`, transparent). The installed launcher icon and the Google Play
listing icon must be the same picture (Play policy "Misleading Claims: app store listing mismatch" rejected a release once for this).

| File | Size | Used for |
|---|---|---|
| `app-store/lexgo-app-store-1024.png` | 1024×1024, no alpha | iOS icon (`app.json` → `icon`) |
| `play-market/lexgo-play-icon-512.png` | 512×512, no alpha | **Play Console → Store listing → App icon** (every language) |
| `android/adaptive-foreground.png` | 1024×1024, transparent | Android launcher foreground (glyph inside the 66% safe zone) |
| `android/adaptive-monochrome.png` | 1024×1024, white silhouette | Android 13+ themed icon |
| `android/notification-icon.png` | 96×96, white silhouette | notification icon (colour `#3B82F6`) |
| launcher background | colour `#0B1F45` | `app.json` → `android.adaptiveIcon.backgroundColor` |

Regenerate everything from the glyph (needs Google Chrome): `node logos/source/render-icons.mjs <dir containing glyph.png>`, then copy
`fg`→`adaptive-foreground`, `mono`→`adaptive-monochrome`, `notif`→`notification-icon`, `store1024`, `play512`.

Changing the icon needs a new native build (`eas build`); OTA updates do not change it. After any icon change, update the Play listing
icon in **all** listing languages, plus `play-store/graphics/store-listing/src/assets/icon.png` (the graphics generator).
