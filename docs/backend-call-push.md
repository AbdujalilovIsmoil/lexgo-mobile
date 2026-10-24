# Push for incoming calls and task alerts — what the backend must add

Date: 2026-10-20 · Audience: backend team · Mobile app: Expo / React Native (iOS + Android)

## Why this is needed

Today the app learns about an incoming call only from the user WebSocket (`/ws/users/me`, event `call.incoming`). A phone does not keep
that socket alive once the app leaves the screen: iOS suspends the app within about 30 seconds, Android puts it to sleep (Doze) and
swiping it away kills it. So a person who is not looking at the app gets **no call notification at all**. The same is true for
task alerts. The only reliable way to reach a phone in that state is a **remote push**:

- Android: Firebase Cloud Messaging (FCM), high priority, data message.
- iOS: Apple Push Notification service (APNs). For a ringing call: a **VoIP push (PushKit)** that wakes the app and shows the
  system call screen (CallKit). Ordinary alerts: a normal APNs alert push.

Verified on 2026-10-20 against `https://lexgo.api.cognilabs.org/openapi.json`: there is no device-registration or push endpoint.

## Status on 2026-10-24 (tested with two test accounts: an advokat on an iPad simulator calling a client on an iPhone simulator)

| What | Result |
| --- | --- |
| `POST /devices` | Exists. The app registers its token after sign-in (iOS: `apns`, Android: `fcm`); `GET /devices` lists it as `active`. |
| A call started from a secure chat | Fixed in the app: it now sends `participant_user_ids` (the other members of the room). Before, a call started from the chat header invited nobody, so the client got no `call.incoming`, no `/calls/invited` row, no notification — they only saw the call after opening that chat. |
| Client app open on any screen | Rings at once (user socket `call.incoming`, `GET /calls/invited` as a safety net). |
| Client app in the background (still alive) | The app posts its own local "incoming call" notification with Join / Decline. |
| Client app closed (killed) | **Nothing arrives.** The backend does create the in-app notification (`meeting_invite`), but no remote push reached the device. |

Please check on your side:

1. Is a remote push sent at all when a user is invited to a call (and for other notifications)? To which gateway — the simulator /
   development builds register `environment: "development"` tokens, which only the APNs **sandbox** accepts; store / TestFlight / EAS
   builds register `"production"` tokens.
2. Each invite currently creates the `meeting_invite` notification **twice** (same `call_id`, same second).
3. Its title is "Video uchrashuvga taklif" also for an audio call (`call_type: "audio"`).

Things that block remote push on our side, independent of the backend:

- iOS builds signed with a free Apple "Personal Team" (the USB test phone) have no Push capability: they can never receive a remote push.
  Test with an EAS / TestFlight build of the paid team.
- Android: the repository has no Firebase `google-services.json`, so Android builds get no FCM token today (see section 5).

For a Telegram-like ringing screen while the phone is locked or the app is closed, sections 2 and 3 still apply (VoIP push + CallKit on
iOS, high-priority FCM data message + full-screen notification on Android). The mobile side will register an `apns_voip` token and add
CallKit / the Android full-screen call once the backend confirms it sends those pushes.

## 1. Register a device

`POST /devices` (auth: bearer token)

```json
{
  "platform": "ios | android",
  "token_type": "fcm | apns | apns_voip",
  "token": "<device token>",
  "app_version": "1.1.0",
  "locale": "uz | ru | en"
}
```

- Idempotent per `(user, token)`. A user may have several devices.
- iOS sends two tokens: `apns` (alerts) and `apns_voip` (calls). Android sends `fcm`.
- `DELETE /devices` with `{ "token": "..." }` on sign-out. Drop tokens that FCM/APNs report as invalid.
- The app already has the registration code behind a switch (`EXPO_PUBLIC_PUSH_TOKEN=1`, `EXPO_PUBLIC_PUSH_TOKEN_PATH=/devices`): it is turned
  on the day this endpoint exists.

## 2. Incoming call

When `call.incoming` is created for a user, also send, to every device of every invited user:

**Android (FCM, data-only, `priority: high`, `ttl: 45s`)**

```json
{ "type": "call.incoming", "room_id": "...", "call_id": "...", "caller_name": "...", "call_type": "audio | video" }
```

The app shows a full-screen ringing notification from this message.

**iOS (APNs VoIP push, topic `<bundle id>.voip`, `apns-push-type: voip`, `apns-priority: 10`, `apns-expiration`: now + 45 s)**

```json
{ "type": "call.incoming", "room_id": "...", "call_id": "...", "caller_name": "...", "call_type": "audio | video" }
```

The app must report the call to CallKit as soon as the push arrives (iOS terminates apps that do not), so the push must be sent
**only for a real, ringing call**, never for other events.

## 3. The ring ends

When the call is answered, declined, cancelled by the caller or times out, send a second push with `{ "type": "call.ended", "call_id": "..." }` to
the devices that did not answer so the ringing stops (CallKit end / notification dismissed). Do not push to the device that answered.

## 4. Task alerts (optional, same transport)

For `tasks.assigned`, `tasks.returned` and "task entered testing (to those who may approve)": a normal alert push (APNs alert / FCM notification
with `data`): `{ "type": "tasks.assigned", "task_id": "...", "task_code": "TSK-..." }`. The text is localised by the backend from `locale`.

## 5. Credentials the app side needs from you

- Apple: an APNs auth key (`.p8`) with the key id and team id, on the account that owns the app (VoIP and normal pushes use the same key).
- Firebase: a project with an Android app `org.cognilabs.lexgo`; its `google-services.json` (goes into the Android build) and the service
  account for sending.

## 6. What the mobile team does after that

1. Turn on token registration and send `apns` / `apns_voip` / `fcm` tokens to `POST /devices`.
2. iOS: integrate PushKit + CallKit (the iPhone's own incoming-call screen), answer and decline from the lock screen.
3. Android: a high-importance "calls" channel with a full-screen intent and Accept / Decline actions.
4. Test on real devices (PushKit does not work on the iOS simulator).
