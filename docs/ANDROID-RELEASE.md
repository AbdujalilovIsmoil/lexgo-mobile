# Android release guide (Google Play) — LexGo

Audience: the next developer **and their AI agent**. Read this whole file before building, signing or uploading anything.
Last verified: 2026-11-01 (first internal-test release, version 1.1.0, versionCode 4).

> **Hard rules (agents: follow these literally)**
> 1. Never commit or paste into chat/tickets: keystores (`*.jks`, `*.keystore`, `*.p12`), keystore passwords, key aliases' passwords, `credentials.json`, Expo/EAS tokens, Play service-account JSON, test-account passwords. `.gitignore` blocks the file types, but it cannot block text.
> 2. Never choose **"Set up a new keystore"** or **"Delete your keystore"** in `eas credentials`. Never answer **Yes** to "Generate a new Android Keystore?" during a build. A different key than the one Play knows means every upload is rejected (this already happened once, see "History").
> 3. Every upload to Play needs a **higher `android.versionCode`** than any version Play has already accepted. Bump it in `app.json` before building.
> 4. Before uploading any `.aab`, **verify its signing certificate** (section 6). Do not upload on the build's word alone.
> 5. Do not change `android.package`. It is permanent in Google Play.

---

## 1. Identities and where things live

| Thing | Value |
|---|---|
| App name | LexGo |
| Android package (`applicationId`) | `org.cognilabs.lexgo.app` |
| iOS bundle id | `org.cognilabs.lexgo` (different on purpose; see History) |
| Expo account that owns the project | `cognilabs-dev` (project slug `lexgo`) |
| EAS project | https://expo.dev/accounts/cognilabs-dev/projects/lexgo |
| EAS `projectId` | `4919a25b-38c2-44ad-9ac4-eef07dcd72a2` (in `app.json` → `extra.eas.projectId`; the OTA `updates.url` uses the same id) |
| Build profile used for Play | `production` (`eas.json`; produces an `.aab`; `appVersionSource` is `local`) |
| Version source | `app.json` → `expo.version` (human) and `expo.android.versionCode` (integer, must increase) |
| API | `EXPO_PUBLIC_API_BASE_URL` (see `.env.example`; production is `https://lexgo.api.cognilabs.org`) |
| Play listing texts | `play-store/listing/{uz,en,ru}.txt` (uz is the primary language) |
| Play declarations (data safety, content rating, etc.) | `play-store/data-safety.md`, `play-store/content-rating.md`, `play-store/release-and-store-info.md` |
| Store images | `play-store/graphics/` (icon) and `play-store/graphics/store-listing/` (feature graphic + screenshots, with generator) |
| Account-deletion URL given to Play | https://law-two-tau.vercel.app/uz/legal/account-deletion |
| Privacy policy URL | https://law-two-tau.vercel.app/uz/legal/privacy |

## 2. Signing keys — what exists and how to store them

There are two different keys. Do not confuse them.

**A. Upload key (ours).** Lives on EAS's servers, in the credential set **`KG3xC17yfV`** for `org.cognilabs.lexgo.app`. This is the key every `.aab` must be signed with.

| | |
|---|---|
| EAS credential set | `KG3xC17yfV` (must be the **default** for the `production` profile) |
| Certificate SHA-1 | `71:22:8E:D9:E5:E3:17:02:CA:9E:6A:D1:85:5D:F2:A0:9D:15:EE:89` |
| Certificate SHA-256 | `DA:23:52:F0:FE:AF:AD:71:93:A4:A8:05:62:45:10:4E:5E:88:B8:AB:38:93:57:BC:1C:E8:64:32:7C:E7:78:86` |
| Valid | 2026-10-31 → 2054-03-18 |

These fingerprints are public certificate data and are safe to keep in the repo. The **private key, passwords and alias password are not**.

**B. App signing key (Google's).** With Play App Signing (on by default) Google holds the key that signs what users install. We never see it. Its SHA-256 (Play Console → Test and release → App integrity → App signing) is what `https://lexgo.uz/.well-known/assetlinks.json` needs for Android App Links (see "Open items").

**Other credential sets on EAS.** Two other sets exist: `rNeBYNwkV1` and `Al9Z0glyQO`. `rNeBYNwkV1` was the *default* on 2026-11-01 and a build made with the default came out signed with certificate SHA-1 `69:BF:98:7E:7B:BE:30:C1:AA:78:63:FA:E7:7D:5B:72:28:4D:18:12`, which Play does not know. Treat those sets as wrong/unused. Do not delete them until someone has confirmed they are not needed.

### Where the secrets must be stored
- Put the keystore file (`.jks`) **and** its keystore password, key alias and key password in the team's shared **password manager / secure vault**. Not in the repo, not in chat, not in a loose folder.
- EAS holds the live copy. The vault copy is the backup in case the Expo account is lost.
- To make or refresh the backup (run on a trusted machine):
  ```bash
  npx eas-cli@latest credentials        # Android -> production -> "Keystore: Manage everything..." -> "Download existing keystore"
  ```
  Choose credential set `KG3xC17yfV`. EAS saves a `.jks` in the current folder and **prints the passwords once**. Copy them into the vault, then delete the local `.jks`. To confirm it is the right key without Java:
  ```bash
  python3 -I - path/to/file.jks <<'EOF'
  import struct,hashlib,sys
  b=open(sys.argv[1],'rb').read(); i=b.find(b'X.509'); j=i+5
  n=struct.unpack('>I',b[j:j+4])[0]; c=b[j+4:j+4+n]
  print(':'.join('%02X'%x for x in hashlib.sha1(c).digest()))
  EOF
  ```
  The output must equal the SHA-1 above.
- If the upload key is ever lost: Play Console → Test and release → App integrity → App signing → *Request upload key reset* (reason "I lost my upload key", upload a new certificate PEM). Google takes about 1–2 days.

## 3. Who needs which access

1. **Expo / EAS:** an Expo account that is a member of the `cognilabs-dev` account with a role allowed to run builds. Ask an Owner to add you at https://expo.dev/accounts/cognilabs-dev/settings/members. Without this, `eas build` fails with "Entity not authorized".
2. **Google Play Console:** a user invited under *Users and permissions* with permission to manage releases for this app.
3. **GitHub:** push access to this repository.
4. Do **not** share a personal login. Use named accounts.

## 4. One-time setup on a new machine

```bash
git clone https://github.com/AbdujalilovIsmoil/lexgo-mobile && cd lexgo-mobile
npm ci                                  # dependencies; app.config.js needs them even for cloud builds
npx eas-cli@latest login                # browser login with YOUR Expo account
npx eas-cli@latest whoami               # must list cognilabs-dev
```

Cloud builds need no Android Studio and no Java. (Java/Android SDK are only needed for the emulator and for local APK conversion; see section 8.)

## 5. Release procedure (new version → Play)

1. **Pre-flight**
   ```bash
   npm run typecheck && npm run lint && npm test
   ```
   As of 2026-11-01 `tsc` reports 3 pre-existing errors in `app/(tabs)/_layout.tsx` and `src/widgets/client-sidebar/useSidebarHidden.ts`. They do not block an EAS build (it does not typecheck) but should be fixed.
2. **Bump the version** in `app.json`:
   - `expo.android.versionCode`: increase by at least 1 (it is currently 4; every upload must be higher than the last one Play accepted).
   - `expo.version`: only when the user-visible version changes.
3. **Confirm the signing key BEFORE building:**
   ```bash
   npx eas-cli@latest credentials         # Android -> production
   ```
   The summary at the top must show `Configuration: Build Credentials KG3xC17yfV (Default)` with SHA-1 starting `71:22:8E`. If another set is the default: *Keystore: Manage everything…* → **Change default keystore** → pick `KG3xC17yfV`. Re-open the screen and confirm.
4. **Build**
   ```bash
   npx eas-cli@latest build -p android --profile production
   ```
   - If it asks *"Generate a new Android Keystore?"* answer **No** and stop (credentials are wrong; fix step 3).
   - It takes roughly 15–20 minutes. The result is a link to a `.aab`.
5. **Download** the `.aab` and rename it, e.g. `lexgo-<version>-app-v<versionCode>.aab`. Do not commit it (`*.aab` is gitignored).
6. **Verify the artifact (section 6).** Do not skip.
7. **Upload to Play Console**: Test and release → Testing → *Internal testing* (or Closed testing) → Create new release → upload the `.aab`. If an older draft contains a previous bundle, remove it so the release holds only the new bundle. Paste release notes (section 7), then *Save → Review release → Start rollout*.
8. **Testers:** Testers tab → email list → copy the **opt-in link** and send it to testers. Testers must open it with the Google account on their phone and tap "Become a tester". The plain store URL does not work for closed/internal tracks.
9. Commit the `app.json` version bump and push.

## 6. Verifying an `.aab` before upload (no Java needed)

An `.aab` is a zip. This reads its signing certificate and checks the package and permissions:

```bash
python3 -I - path/to/app.aab <<'EOF'
import sys,zipfile,subprocess,tempfile,os
z=zipfile.ZipFile(sys.argv[1])
m=z.read("base/manifest/AndroidManifest.xml")
print("package org.cognilabs.lexgo.app :", b"org.cognilabs.lexgo.app" in m)
print("MEDIA_PLAYBACK permission absent:", b"FOREGROUND_SERVICE_MEDIA_PLAYBACK" not in m)
print("AD_ID permission absent         :", b"AD_ID" not in m)
rsa=[n for n in z.namelist() if n.startswith("META-INF/") and n.endswith(".RSA")][0]
d=tempfile.mkdtemp(); p=os.path.join(d,"c.rsa"); open(p,"wb").write(z.read(rsa))
pem=subprocess.run(["openssl","pkcs7","-inform","DER","-in",p,"-print_certs"],capture_output=True,text=True).stdout
fp=subprocess.run(["openssl","x509","-noout","-fingerprint","-sha1"],input=pem,capture_output=True,text=True).stdout.strip()
print(fp)
print("signed with registered upload key:", "71:22:8E:D9:E5:E3:17:02:CA:9E:6A:D1:85:5D:F2:A0:9D:15:EE:89" in fp)
EOF
```

All lines must be `True`. If the key line is `False`, do not upload: see section 2 ("Other credential sets") and rebuild.

Also confirm the build's version code: `npx eas-cli@latest build:list --platform android --limit 1 --non-interactive` shows `Version code`.

Permissions policy for this app (set in `app.json`):
- `android.blockedPermissions` removes `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, storage and `SYSTEM_ALERT_WINDOW` permissions. The media-playback permission is merged in by the media libraries but the app has no background media feature, so declaring it would need a false justification in Play's declaration form. Do not re-add it.
- No advertising ID (`AD_ID`) is used; the Play declaration answer is **No**. If an ads/attribution SDK is ever added, revisit this and the Data safety form.

## 7. Release notes and listing text

- Release name (internal): `<version> (<versionCode>) – <purpose>`, e.g. `1.1.0 (4) – internal test`.
- Release notes use language tags and are limited to 500 characters per language. Valid tags for this app: `<en-US>`, `<ru-RU>`, `<uz>` (not `<uz-UZ>`). Only languages added to the store listing are accepted. The current texts are in `play-store/listing/*.txt`.
- Short description ≤ 80 chars, full description ≤ 4000 chars. The Uzbek text is the primary one.

## 8. Emulator, real screenshots and store graphics

Play phone screenshots must not be taller than 2:1, so the AVD is 1080×2160 (the shape of the committed captures).

```bash
# SDK (already present on the owner's Mac): /opt/homebrew/share/android-commandlinetools, JDK: openjdk@17
export ANDROID_HOME=/opt/homebrew/share/android-commandlinetools JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH=$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH

avdmanager create avd -n lexgo_shots -k "system-images;android-34;google_apis;arm64-v8a" -d pixel_6
# edit ~/.android/avd/lexgo_shots.avd/config.ini: hw.lcd.width=1080 hw.lcd.height=2160 hw.lcd.density=420 hw.ramSize=4096
emulator -avd lexgo_shots -no-snapshot -no-audio -gpu host &

# install an .aab on the emulator: build a universal APK (debug-signed, local use only) and install it
brew install bundletool
bundletool build-apks --bundle=app.aab --output=app.apks --mode=universal \
  --ks=$HOME/.android/debug.keystore --ks-pass=pass:android --ks-key-alias=androiddebugkey --key-pass=pass:android
unzip -o app.apks universal.apk && adb install -r universal.apk
```

Clean status bar for captures (Android "demo mode"):
```bash
adb shell settings put global sysui_demo_allowed 1
adb shell am broadcast -a com.android.systemui.demo -e command enter
adb shell am broadcast -a com.android.systemui.demo -e command clock -e hhmm 1200
adb shell am broadcast -a com.android.systemui.demo -e command battery -e level 100 -e plugged false
adb shell am broadcast -a com.android.systemui.demo -e command network -e wifi show -e level 4 -e fully true
adb shell am broadcast -a com.android.systemui.demo -e command notifications -e visible false
adb exec-out screencap -p > shot.png
```

Store graphics generator (needs Google Chrome and macOS `sips`):
```bash
# put real 1080x2160 captures in play-store/graphics/store-listing/src/shots/, add a line to SLIDES in build.mjs
node play-store/graphics/store-listing/build.mjs     # writes out/*.jpg (upload these) and out/*.png
```
Rules: screenshots must be **real captures of the app**, never mock-ups. The generator only adds a headline, a phone frame and crops the status-bar strip.

Data caveats when capturing (as of 2026-11-01): the production backend contains test data. The lawyers list shows "Demo Advokat …" with weak ratings, and the Client test account has junk requests ("test xizmat"). Use guest/public screens, or clean the data first. Guest users get a limited number of free AI questions per day.

Do not sign in with a staff/admin account for captures, and decline notification prompts on the emulator so it does not register a push token on the production backend.

## 9. Google Play app state (as of 2026-11-01)

- App: `org.cognilabs.lexgo.app`, free, default listing language Uzbek (or the nearest available), category Business/Productivity.
- Track in use: **Internal testing**. Production later requires (new personal developer accounts) a closed test with 12+ testers for 14 days first.
- App content already answered (details in `play-store/*.md`): target age 18+, no ads, Advertising ID **No**, content rating (category "All other app types"), financial features **none** (check the "Reward balance" referral item with the product owner), data safety (draft; see `data-safety.md`, confirm with backend/legal), account creation = username+password+other authentication (phone + password + OTP), account-deletion URL (above), App access = client test account (credentials are **not** in this repo).
- Play App Signing is on. Release builds must be signed with the upload key in section 2.

## 10. History (why things look like this)

- The first Play app used `org.cognilabs.lexgo`. Its original upload key (SHA-1 `54:7C:BF:E1:E5:5B:3E:46:03:25:31:F2:83:51:CE:55:22:27:CB:7F`) was lost and could not be recovered from anyone. Google's upload-key reset takes 1–2 days and the team could not wait, and no one had installed the app yet, so on 2026-11-01 a **new Play app** with package `org.cognilabs.lexgo.app` was created. A package name can never be reused, so the old app is abandoned. iOS keeps `org.cognilabs.lexgo`.
- The project was moved from a personal Expo account to the company account `cognilabs-dev` (new `projectId`), so the project no longer depends on one person.
- versionCode 3 was the first accepted upload; versionCode 4 removed the unused `FOREGROUND_SERVICE_MEDIA_PLAYBACK` permission. A first build of versionCode 4 was signed with the wrong credential set (`69:BF…`) and must not be uploaded; it was rebuilt after making `KG3xC17yfV` the default.

## 11. Open items / known issues

- **Privacy policy** page still has a blank company name (`MChJ «________________»`). Fill it in before production.
- `lexgo.uz` did not resolve in DNS from the owner's machine on 2026-11-01. Store pages currently use the Vercel URLs above. Put the app's real **Play App Signing SHA-256** and package `org.cognilabs.lexgo.app` into `https://lexgo.uz/.well-known/assetlinks.json`, or Android App Links will not open the app.
- **Account deletion** in the app creates a support ticket (backend has no self-delete endpoint). Someone must process it within the 30 days promised on the deletion page.
- **Data safety / sharing answers**: confirm with the backend team whether the AI provider and payment providers (Payme/Click) are plain service providers (current assumption) or separate controllers.
- **Play Billing policy**: plans/subscriptions are paid through the provider's own page. Check whether Google requires Play Billing for them before production.
- **Status bar**: on light-themed screens (Documents, AI chat) Android's status-bar icons are white on a light background and nearly invisible.
- **Branding**: three logo variants appear (the "LG" glyph in the launcher/login, an "L" tile in the side menu, and the scales-and-book logo used in the store graphics). Pick one and align the icon/splash/512 px icon.
- **Test data in production**: remove "Demo …" lawyers and junk requests, or the lawyers/orders screens cannot be used in screenshots.
- Rotate any credential that was ever pasted into a chat or ticket during the 2026-11-01 setup (the staff/admin test passwords were shared in plain text).
