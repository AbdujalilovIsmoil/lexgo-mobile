# Tezkor Himoya — app and store icons

The brand mark is the **shield with "TH"** (black and blue). Master: `source/tezkor-himoya-logo.png` (1254×1254, white background).
The installed launcher icon and the Google Play listing icon must be the same picture (Play policy "Misleading Claims: app store
listing mismatch" rejected a release once for this), and the name must match too (see `docs/ANDROID-RELEASE.md`).

| File | Size | Used for |
|---|---|---|
| `app-store/app-store-1024.png` | 1024×1024, no alpha | iOS icon (`app.json` → `icon`) |
| `play-market/play-icon-512.png` | 512×512, no alpha | **Play Console → Store listing → App icon** (every language) |
| `android/adaptive-foreground.png` | 1024×1024 | Android launcher foreground (logo at 80%, inside the safe zone; its background is lifted to pure white) |
| `android/adaptive-monochrome.png` | 1024×1024, white silhouette | Android 13+ themed icon |
| `android/notification-icon.png` | 96×96, white silhouette | notification icon (colour `#0058F6`) |
| launcher background | colour `#FFFFFF` | `app.json` → `android.adaptiveIcon.backgroundColor` |

In-app copies: `assets/logo.png` (1024, splash), `assets/logo-small.png` (256, `BrandLogo`), `assets/favicon.png` (48, web).

Regenerate the Android layers (needs Google Chrome): copy the master to `<dir>/logo.png`, run
`node logos/source/render-icons.mjs <dir>` and copy `fg`→`adaptive-foreground`, `mono`→`adaptive-monochrome`, `notif`→`notification-icon`;
`store1024`/`play512` are plain `sips -z` resizes of the master.

Changing the icon needs a new native build (`eas build`); OTA updates do not change it. After any icon change, update the Play listing
icon in **all** listing languages, plus `play-store/graphics/store-listing/src/assets/icon.png` (the graphics generator).
