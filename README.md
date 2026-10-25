# LexGo Mobile Integration: Remote Push for Calls and Tasks

Date: 2026-10-20
Audience: Mobile developer
Platforms: Android and iOS
Backend status: device API, durable outbox, call lifecycle and task alert hooks implemented

## 1. Transport model

WebSocket remains the foreground realtime transport. Remote push is the background and terminated-app transport.

- Android calls: FCM high-priority data message
- Android task alerts: FCM notification plus data
- iOS incoming calls: APNs VoIP / PushKit
- iOS call end: normal APNs background push
- iOS task alerts: normal APNs alert push

The same event may arrive through WebSocket and push. Deduplicate by `type + call_id` for calls and `type + task_id` for task alerts.

## 2. Device registration

### Register or refresh

```http
POST /devices
Authorization: Bearer <token>
Content-Type: application/json
```

Android:

```json
{
  "platform": "android",
  "token_type": "fcm",
  "token": "FCM_DEVICE_TOKEN",
  "installation_id": "PERSISTENT_INSTALLATION_UUID",
  "app_version": "1.1.0",
  "locale": "uz",
  "environment": "production"
}
```

iOS must register both tokens using two calls:

```json
{
  "platform": "ios",
  "token_type": "apns",
  "token": "APNS_ALERT_TOKEN",
  "installation_id": "PERSISTENT_INSTALLATION_UUID",
  "app_version": "1.1.0",
  "locale": "uz",
  "environment": "production"
}
```

```json
{
  "platform": "ios",
  "token_type": "apns_voip",
  "token": "PUSHKIT_VOIP_TOKEN",
  "installation_id": "PERSISTENT_INSTALLATION_UUID",
  "app_version": "1.1.0",
  "locale": "uz",
  "environment": "production"
}
```

Registration is idempotent for the authenticated user and token. Call it after login, token rotation, app update, and notification permission changes. The response never exposes the raw token.

### List current devices

```http
GET /devices
Authorization: Bearer <token>
```

Use this only for account/device settings. It is not needed during normal startup.

### Sign out

```http
DELETE /devices
Authorization: Bearer <token>
Content-Type: application/json
```

```json
{
  "token": "CURRENT_DEVICE_TOKEN"
}
```

Call once for every token registered by that installation. Response is `204`, including when the token was already absent.

## 3. Incoming calls

Payload:

```json
{
  "type": "call.incoming",
  "room_id": "ROOM_UUID",
  "call_id": "CALL_UUID",
  "caller_name": "Caller name",
  "caller_user_id": "USER_UUID",
  "call_type": "audio"
}
```

`call_type` is `audio` or `video`. TTL is 45 seconds.

Android requirements:

1. Handle high-priority data messages in background and terminated states.
2. Use a dedicated high-importance calls notification channel.
3. Show a full-screen incoming-call UI with Accept and Decline actions.
4. Use `call_id` as the stable Android notification identifier.
5. Do not create a second screen when the same call arrives through WebSocket.

iOS requirements:

1. Register PushKit and send its token as `apns_voip`.
2. Report every `call.incoming` VoIP push immediately to CallKit.
3. Use `call_id` as the CallKit UUID mapping key.
4. Never delay CallKit reporting while fetching call details.
5. Fetch/join the call only after the system UI has been reported.

## 4. Answer, decline, leave

Existing participant endpoint:

```http
PATCH /secure-chats/{room_id}/calls/{call_id}/participants/{current_user_id}
```

Answer from this device:

```json
{
  "status": "joined",
  "answered_device_id": "DEVICE_ID_FROM_POST_DEVICES_RESPONSE"
}
```

Decline:

```json
{
  "status": "declined",
  "answered_device_id": "DEVICE_ID_FROM_POST_DEVICES_RESPONSE"
}
```

`answered_device_id` is optional for backward compatibility but must be sent by the new mobile app. The backend sends a stop-ringing event to the user's other devices and excludes the answering device.

Use the existing join endpoint to get the current LiveKit token after acceptance:

```http
POST /secure-chats/{room_id}/calls/{call_id}/join
```

## 5. Stop ringing

Payload:

```json
{
  "type": "call.ended",
  "call_id": "CALL_UUID"
}
```

On receipt:

- dismiss the Android full-screen notification
- end the matching CallKit call
- stop ringtone and vibration
- clear local ringing state
- do nothing if the call is already absent

The backend emits this when a participant answers, declines, leaves, is removed, the caller cancels/ends, or the call timeout expires. A background worker enforces expired calls even when no client is polling.

## 6. Task alerts

Supported types:

```text
tasks.assigned
tasks.returned
tasks.status_changed
```

Payload:

```json
{
  "type": "tasks.assigned",
  "task_id": "TASK_UUID",
  "task_code": "TSK-00123"
}
```

For `tasks.status_changed`, push is sent to test coordinators only when the task enters `testing`. Alert text is localized by the backend using the device locale.

Notification tap must open the task detail in the standalone task mini app/mobile task screen using `task_id`.

## 7. Token lifecycle

- Persist the backend `device.id` with the local installation.
- Re-register whenever FCM/APNs rotates a token.
- Delete old tokens on logout.
- If notification permission is denied, do not register a call token.
- Backend automatically invalidates tokens rejected by FCM/APNs as unregistered or invalid.
- Never log a full push token in the app.

## 8. Test matrix

Test on physical devices:

1. Android foreground, background, screen locked, and app swiped away.
2. iOS foreground, background, screen locked, and app terminated.
3. Audio and video call.
4. Answer on device A and verify device B stops ringing.
5. Decline and verify all related ringing UI closes.
6. Caller cancels before answer.
7. Call expires after its configured time.
8. Duplicate WebSocket and push events produce one call UI.
9. Task assignment, return, and testing alerts.
10. Token rotation and logout deletion.

PushKit cannot be validated on the iOS simulator.

## 9. Backend operations configuration

The backend deployment must set:

```text
PUSH_PROVIDER_ENABLED=true
FCM_PROJECT_ID=<firebase-project-id>
FCM_SERVICE_ACCOUNT_JSON=<json, base64-json, or mounted json path>
APNS_KEY_ID=<apple-key-id>
APNS_TEAM_ID=<apple-team-id>
APNS_BUNDLE_ID=<ios-bundle-id>
APNS_AUTH_KEY=<p8 text or mounted p8 path>
APNS_ENVIRONMENT=production
CALL_RING_TTL_SECONDS=45
```

Without provider credentials, device registration and durable outbox creation still work, but external delivery cannot succeed. Mobile QA of remote delivery starts only after these credentials are installed.
