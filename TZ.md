# LexGo Marketplace Enterprise Mobile Integration

## 1. Purpose

This document defines the iOS/Android integration for the production marketplace enterprise workflow. Mobile must use the same backend state machine as web and must not calculate prices, percentages, deadlines or permissions locally.

## 2. Startup synchronization

After authenticated app startup:

1. Open `wss://lexgo.api.cognilabs.org/ws/users/me?token=<access_token>`.
2. Fetch unread notifications.
3. Fetch active marketplace orders.
4. Fetch `GET /subscriptions/me/features`.
5. Fetch `GET /marketplace/runtime-capabilities`.
6. Restore the active secure chat/call screen only from the latest order detail.

After foreground resume, token refresh or socket reconnect, refetch active data. Do not depend on a missed push event.

## 3. Order creation

Create a selected-seller order:

```http
POST /orders

{
  "service_id": "<service-id>",
  "package_id": null,
  "lawyer_user_id": "<seller-user-id>",
  "source": "marketplace",
  "details": {
    "region": "Toshkent",
    "problem": "Client legal problem",
    "selected_option_ids": []
  }
}
```

For automatic seller selection, omit `lawyer_user_id`.

Show the backend client-facing status. Never expose internal matching attempts or “lawyer is being searched”.

## 4. Order list and detail

```http
GET /marketplace/me/orders?limit=50&offset=0
GET /marketplace/me/orders/{order_id}
```

Use backend action flags and URLs. Do not unlock chat, calls, completion, cancellation or rating from a locally maintained status table.

Order detail must show:

- service/package;
- safe seller card;
- current status and timeline;
- payment state;
- checklist progress;
- final result;
- secure chat/call actions;
- rating/complaint countdown;
- warranty action;
- financial summary link.

## 5. Seller assignment on mobile

Incoming seller notification: `marketplace.assignment_received`.

Deep-link to the order detail. Display `acceptance_deadline_at` as an absolute backend deadline and update the countdown locally once per second.

Actions:

```http
POST /orders/{order_id}/accept
POST /orders/{order_id}/decline
```

If acceptance expires, close action buttons, show a neutral expired state and refetch. Call-center handles reassignment.

## 6. Protected payment flow

### Advance

After seller acceptance, the client receives the 10% payment request through Telegram and in-app/push notification.

Do not open seller contact, chat or calls until the refreshed order has:

```json
{
  "contact_unlocked": true
}
```

Expected events:

- `order_accepted`
- `marketplace.advance_paid`
- `order_payment_updated`

### Final payment

After completion, show the 90% final payment request using backend `final_payment_id` and `final_amount`.

Expected event: `marketplace.final_paid`.

The mobile timeline must keep the service step as completed after final payment.

### Financials

```http
GET /marketplace/me/orders/{order_id}/financials
```

Render payment rows by their backend stage/status. Do not calculate seller income or commission on mobile.

## 7. Chat

Use:

```text
wss://lexgo.api.cognilabs.org/ws/secure-chats/{room_id}?token=<access_token>
```

Open only when `can_start_chat=true`.

Mobile requirements:

- optimistic send with server acknowledgment;
- deduplicate by message ID;
- reply, emoji, copy and attachment preview;
- unread counter update;
- newest conversation ordering;
- reconnect and history refetch;
- read-only composer after completion;
- no direct phone reveal before payment.

## 8. Audio/video calls

Use `call_create_url`, `allowed_call_types` and the backend LiveKit configuration.

Audio and video share the same call flow. Audio starts with camera off; enabling camera converts the active experience to video without creating a separate business order.

Quality behavior:

- adaptive quality enabled;
- audio has priority;
- automatic downgrade/upgrade;
- silent audio-only fallback on poor internet;
- no user prompt asking to select lower quality;
- restore video automatically when connection improves.

Use backend call WebSocket:

```text
wss://lexgo.api.cognilabs.org/ws/secure-chats/{room_id}/calls/{call_id}?token=<access_token>
```

## 9. Seller execution

Start work:

```http
PATCH /orders/{order_id}/status

{
  "status": "in_progress",
  "note": "Work started"
}
```

Checklist evidence must follow backend requirements. Do not permit completion while required items remain incomplete unless backend explicitly returns an allowed skip-with-reason action.

Complete:

```http
POST /marketplace/me/orders/{order_id}/complete

{
  "result_text": "Result summary",
  "result_files": []
}
```

At least text or one result file is mandatory.

## 10. Rating and complaint

Display both actions only during the backend 15-minute window.

```http
POST /marketplace/me/orders/{order_id}/rating

{
  "rating": 5,
  "comment": "Optional comment"
}
```

```http
POST /marketplace/me/orders/{order_id}/complaint

{
  "reason": "Detailed complaint reason"
}
```

Rules:

- rating and complaint are separate actions;
- rating 1–2 automatically opens a complaint;
- after low rating, refresh detail and disable duplicate complaint submission;
- use backend countdown/deadline;
- after window expiry, remove both controls;
- an open complaint places settlement on hold.

## 11. Warranty

```http
POST /marketplace/me/orders/{order_id}/warranty

{
  "resolution": "replacement",
  "reason": "Reason"
}
```

Show replacement and full-refund choices. Mark the request as “under call-center review”; never show immediate success before resolution.

## 12. Subscription features

```http
GET /subscriptions/me/features
```

Render feature state:

- unavailable: locked with upgrade CTA;
- limited: remaining counter;
- unlimited: enabled without counter.

Consume only through:

```http
POST /subscriptions/me/features/{feature_key}/consume

{
  "amount": 1
}
```

If the plan version changed, display renewal terms from:

```http
GET /subscriptions/{subscription_id}/contract
```

Submit consent:

```http
POST /subscriptions/{subscription_id}/renewal-consent

{
  "accepted": true
}
```

Current paid period keeps its original feature snapshot.

## 13. Seller experience

```http
GET /marketplace/me/experience
POST /marketplace/me/experience
```

Show each revision status. New/edited experience remains pending until call-center verification and must not immediately change verified pricing/ranking labels.

## 14. Push and deep links

Support push routing for:

- assignment received/expired;
- seller accepted;
- advance paid;
- secure message;
- incoming audio/video call;
- order status changed;
- service completed;
- final payment confirmed;
- complaint/warranty update;
- subscription renewal consent required.

Every push tap must open the relevant order, room, call, complaint or subscription by ID. Always refetch before rendering.

## 15. Offline behavior

- Queue only safe draft text locally.
- Do not queue payment, accept, decline, complete, rating or complaint mutations for automatic replay.
- Show a retry action for failed mutations.
- Prevent duplicate taps while a mutation is pending.
- Use server IDs for idempotent display.
- On restored connection, refetch order, financials and chat history.

## 16. Error handling

Prefer `detail.code` when present.

Important codes:

- `assignment_response_deadline_expired`
- `assignment_not_accepting`
- `marketplace_advance_payment_required`
- `required_checklist_incomplete`
- `marketplace_result_required`
- `marketplace_order_already_completed`
- `rating_window_closed`
- `complaint_window_closed`

For `409`, refetch current state before offering another action. For `401`, refresh the token once and reconnect sockets. For `422`, map field errors to the form.

## 17. Mobile acceptance checklist

- Socket reconnect performs REST resync.
- Push deep links open the correct object.
- Seller countdown uses backend deadline.
- Seller phone remains hidden before advance payment.
- Chat/call opens only after `contact_unlocked=true`.
- Poor internet automatically falls back without prompting.
- Completion requires checklist and result.
- Final payment does not revert completed UI.
- Rating/complaint closes after 15 minutes.
- Low rating creates only one complaint.
- Completed chat and calls are closed/read-only.
- Subscription limits are never calculated only on-device.
- Unrated seller is shown as “Not rated yet”.
- Sensitive provider and financial fields are never logged.