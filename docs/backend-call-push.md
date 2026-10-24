# Push for incoming calls and task alerts — what the backend must add

Date: 2026-10-20, updated 2026-10-24 · Audience: backend team · Mobile app: Expo / React Native (iOS + Android)

## Why this is needed

The app learns about an incoming call from the user WebSocket (`/ws/users/me`, event `call.incoming`). A phone does not keep that
socket alive once the app leaves the screen: iOS suspends the app within seconds, Android 15 cuts the app's network about 10 seconds
after it leaves the screen (seen on the emulator: the app's own network state turns to "none" until it is opened again), and swiping
the app away kills it. So a person who is not looking at the app gets **no call notification at all**. The only way to reach a phone
in that state is a **remote push** — Telegram and WhatsApp work the same way:

- Android: Firebase Cloud Messaging (FCM).
- iOS: Apple Push Notification service (APNs).

## Status on 2026-10-24

Tested with two test accounts, an advokat calling a client: iPad / iPhone simulators and an Android 15 emulator.

| Client app | iOS | Android |
| --- | --- | --- |
| Open, on any screen | Rings at once: full-screen Join / Decline | Same |
| Left a few seconds ago | The app's own "incoming call" notification with Join / Decline | Same |
| In the background for longer | Nothing | Nothing |
| Closed (swiped away) | Nothing | Nothing |

The last two rows need a remote push. **No push is sent today.** The iPhone simulator was connected to the APNs sandbox
(`8-courier.sandbox.push.apple.com`) with the client's `development` token registered (`GET /devices`: `active`); a call invite and a
chat message to that client brought no push. A test push to the same app from Xcode's tool (`xcrun simctl push`) was shown at once
with the app closed, so the device and the app are ready.

Fixed in the app on 2026-10-24: a call started from a secure chat now sends `participant_user_ids` (the other members of the room).
Before, it invited nobody, so the client got no `call.incoming`, no `/calls/invited` row and no notification.

Please:

1. Send the pushes of sections 2 and 3 to every `active` device of each invited user. Pick the APNs host by the device's `environment`:
   `development` → `api.sandbox.push.apple.com`, `production` → `api.push.apple.com`. Drop tokens that APNs / FCM report as invalid.
2. Each invite creates the `meeting_invite` notification **twice** (same `call_id`, same second).
3. Its title is "Video uchrashuvga taklif" also for an audio call (`call_type: "audio"`).
4. The web portal's chat (`/portal/chat/[roomId]`) still starts calls without `participant_user_ids`, so a call placed from the web chat
   rings nobody. Safest fix on the backend: when `participant_user_ids` is empty, invite the other members of the room.

Missing outside the backend code:

- **Android: there is no Firebase project in the app.** The repository has no `google-services.json` and EAS has no `GOOGLE_SERVICES_JSON`
  variable, so Android builds get no FCM token and even a backend push cannot reach them. Needed: a Firebase project with the Android
  app `org.cognilabs.lexgo`; its `google-services.json` goes into the project root (or into an EAS file variable `GOOGLE_SERVICES_JSON`),
  then a new build. The backend sends with that project's service account.
- **iOS: an APNs auth key** (`.p8`, key id, team id) of the paid Apple Developer team that owns `org.cognilabs.lexgo`, for the backend.
  Builds signed with a free "Personal Team" (the USB test phone) can never receive a push; test with an EAS / TestFlight build (no iOS
  build has been made on EAS yet).

## 1. Register a device

`POST /devices` (auth: bearer token) — exists; the app sends it after sign-in and again when the token, language or app version changes:

```json
{
  "platform": "ios | android",
  "token_type": "apns | fcm",
  "token": "<device token>",
  "installation_id": "<one id per install>",
  "app_version": "1.1.0",
  "locale": "uz | ru | en",
  "environment": "development | production"
}
```

- iOS sends `apns` (alert token), Android sends `fcm`. `apns_voip` comes later (end of section 2).
- `DELETE /devices` with `{ "token": "..." }` on sign-out.

## 2. Incoming call

When a user is invited to a call (the moment `call.incoming` goes to the user socket), also send to every device of that user.
Text by the device's `locale`: uz "Kiruvchi audio qo'ng'iroq" / "Kiruvchi video qo'ng'iroq", ru "Входящий аудиозвонок" /
"Входящий видеозвонок", en "Incoming audio call" / "Incoming video call"; the title is the caller's name.

**iOS — an APNs alert push** to `apns` tokens. iOS shows it even when the app is closed; the category gives it Join / Decline buttons.
Headers: `apns-push-type: alert`, `apns-priority: 10`, `apns-topic: org.cognilabs.lexgo`, `apns-expiration`: now + 45 s,
`apns-collapse-id: <call_id>`.

```json
{
  "aps": { "alert": { "title": "<caller name>", "body": "Kiruvchi audio qo'ng'iroq" }, "sound": "default", "category": "incoming_call" },
  "type": "call.incoming", "room_id": "...", "call_id": "...", "caller_name": "...", "caller_user_id": "...", "call_type": "audio | video"
}
```

**Android — an FCM HTTP v1 data-only message** to `fcm` tokens: `android.priority: "HIGH"`, `android.ttl: "45s"`, all values strings.
The app's background task turns it into the call notification with Join / Decline, also when the app is closed (built; it can only be
tested once the app has Firebase).

```json
{ "type": "call.incoming", "room_id": "...", "call_id": "...", "caller_name": "...", "caller_user_id": "...", "call_type": "audio | video" }
```

**Later — the full-screen ring of Telegram (phone locked, app closed):** iOS VoIP push (PushKit, topic `org.cognilabs.lexgo.voip`,
`apns-push-type: voip`) to an `apns_voip` token, which the app reports to CallKit; Android a full-screen-intent notification from the
same FCM message. This needs native work in the app first; until the app registers `apns_voip` tokens, do not send VoIP pushes (iOS
stops delivering them to an app that does not report each one as a call).

## 3. The ring ends

When the call is answered, declined, cancelled by the caller or times out, send `{ "type": "call.ended", "call_id": "..." }` to the
devices that did not answer, so their call notification goes away: Android as an FCM data-only message, iOS as a background push
(`apns-push-type: background`, `apns-priority: 5`, `"aps": { "content-available": 1 }`). Do not push to the device that answered.

## 4. Task alerts (optional, same transport)

For `tasks.assigned`, `tasks.returned` and "task entered testing (to those who may approve)": a normal alert push (APNs alert / FCM
notification with `data`): `{ "type": "tasks.assigned", "task_id": "...", "task_code": "TSK-..." }`. The text is localised by the
backend from `locale`.

## 5. What the mobile team does after that

1. Android: add `google-services.json`, build, and test the call push on a phone (closed app, locked screen).
2. iOS: test on an EAS / TestFlight build of the paid team.
3. Then the Telegram-like screen: PushKit + CallKit on iOS (`apns_voip` token), a full-screen call notification on Android.
