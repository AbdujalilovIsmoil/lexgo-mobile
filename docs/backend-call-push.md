# Push for incoming calls and task alerts

Date: 2026-10-20, updated 2026-10-24 · Audience: backend team · Mobile app: Expo / React Native (iOS + Android)

The backend's contract is "LexGo Mobile Integration: Remote Push for Calls and Tasks" (2026-10-20). In short:

- iOS calls go as VoIP pushes (PushKit) to an `apns_voip` token, and the end of a call as a background push.
- Android calls go as FCM high-priority data messages.
- Delivery works only once the provider credentials are set on the server.

This file records what was verified from the mobile side and what is still missing.

## Why a push is needed

The app learns about an incoming call from the user WebSocket (`/ws/users/me`, `call.incoming`). The phone stops that socket once the app leaves the screen:

- iOS suspends the app within seconds.
- Android 15 cuts the app's network about 10 seconds after it leaves the screen. On the emulator the app's network state turned to "none" until it was opened again.
- Swiping the app away kills it.

A person who is not looking at the app can only be reached by a remote push. Telegram and WhatsApp work the same way.

## Status on 2026-10-24

Tested with two test accounts, an advokat calling a client: iPad / iPhone simulators and an Android 15 emulator.

| Client app | iOS | Android |
| --- | --- | --- |
| Open, on any screen | Rings at once: full-screen Join / Decline | Same |
| Left a few seconds ago | The app's own "incoming call" notification with Join / Decline | Same |
| In the background for longer | Nothing | Nothing |
| Closed (swiped away) | Nothing | Nothing |

With today's setup no call push can reach a phone:

- **iOS:** calls go only to an `apns_voip` token. The app registers just its `apns` alert token, because PushKit and CallKit are not integrated yet. The iPhone simulator was connected to the APNs sandbox with the client's `apns` token registered. A call invite and a chat message brought nothing, which the contract predicts (chats are not pushed).
- **Android:** the app has no Firebase project, so it has no FCM token.
- **Server:** delivery needs `PUSH_PROVIDER_ENABLED`, `FCM_*` and `APNS_*`. It is not known whether they are set. With `APNS_ENVIRONMENT=production`, only production-signed iOS builds (TestFlight, App Store, ad-hoc) can receive pushes. Simulator and development builds have sandbox tokens.

The device side works: a test push sent with `xcrun simctl push` to the closed app was shown at once.

Fixed in the app on 2026-10-24: a call started from a secure chat now sends `participant_user_ids` (the other members of the room). Before, it invited nobody, so the client got no `call.incoming`, no `/calls/invited` row and no notification.

## Backend, please

1. Confirm the provider credentials are installed. Check the outbox for the test calls of 2026-10-24 to the client `9e6f40ab-f072-45db-88bd-021daec54f6c`: was a push attempted, and what did the provider answer?
2. Optional, so iOS rings before CallKit ships: when an iOS device has no `apns_voip` token, send the call as an alert push to its `apns` token. Use the headers `apns-push-type: alert`, `apns-priority: 10`, `apns-expiration` = now + 45 s, `apns-collapse-id: <call_id>`. The app already shows this push, also when it is closed, with Join / Decline from the `incoming_call` category. Once the device registers `apns_voip`, the VoIP path takes over.

   ```json
   {
     "aps": { "alert": { "title": "<caller name>", "body": "Kiruvchi audio qo'ng'iroq" }, "sound": "default", "category": "incoming_call" },
     "type": "call.incoming", "room_id": "...", "call_id": "...", "caller_name": "...", "caller_user_id": "...", "call_type": "audio | video"
   }
   ```

   Body text by the device's `locale`:

   | Locale | Audio call | Video call |
   | --- | --- | --- |
   | uz | Kiruvchi audio qo'ng'iroq | Kiruvchi video qo'ng'iroq |
   | ru | Входящий аудиозвонок | Входящий видеозвонок |
   | en | Incoming audio call | Incoming video call |

3. Each invite creates the `meeting_invite` notification **twice** (same `call_id`, same second).
4. Its title is "Video uchrashuvga taklif" also for an audio call (`call_type: "audio"`).
5. The web portal's chat (`/portal/chat/[roomId]`) still starts calls without `participant_user_ids`, so a call placed from the web chat rings nobody. Safest fix on the backend: when `participant_user_ids` is empty, invite the other members of the room.

## Still missing outside the backend code

- **iOS app:** PushKit + CallKit, registering the `apns_voip` token, and answer / decline from the system call screen. This is native work. It can be tested only on a real iPhone with a build signed by the paid Apple team, because PushKit does not work on the simulator.
- **Android app:**
  - A Firebase project with the Android app `org.cognilabs.lexgo.app`. Its `google-services.json` goes into the project root (or an EAS file variable `GOOGLE_SERVICES_JSON`), followed by a new build.
  - A full-screen incoming-call screen. The app already turns an FCM `call.incoming` data message into the call notification with Join / Decline. This was built but cannot be tested without Firebase.
- **Apple:** the APNs auth key (`.p8`, key id, team id) of the paid team that owns `org.cognilabs.lexgo`, for the server. Builds signed with a free "Personal Team" (the USB test phone) can never receive a push. No iOS build has been made on EAS yet.

## What the app sends and expects (matches the backend contract)

- `POST /devices`: `{ platform, token_type, token, installation_id, app_version, locale, environment }`. It is sent after sign-in and again when the token, language or app version changes. `DELETE /devices` is sent on sign-out.
  - iOS today registers `apns` only; `apns_voip` comes with PushKit.
  - Android registers `fcm` once Firebase is configured.
- `call.incoming`: `{ type, room_id, call_id, caller_name, caller_user_id, call_type }`.
- `call.ended`: `{ type, call_id }`. It takes the call notification away.
- An answer or decline from a device sends `answered_device_id` (the `id` from `POST /devices`).
