# LexGo Frontend Integration: Marketplace Review, Rules, Checklist, and Studio AI

Date: 2026-10-22  
Backend base URL: `https://lexgo.api.cognilabs.org`  
Audience: LexGo web frontend team  
Status: Production backend is deployed

## 1. Purpose

This document is the frontend implementation contract for the latest Marketplace and Studio backend features:

1. Marketplace service rules separated by audience.
2. Seller review stage before the final delivery deadline is selected.
3. Three-hour review deadline warning and call-center escalation.
4. Service checklist with separate seller/client labels and controlled evidence visibility.
5. Studio field-level AI suggestions.
6. Deep Studio AI jobs with official-source research, background processing, validation, repair, and recovery.
7. Realtime updates for the client, seller, Studio worker, and call-center operator.

The frontend must use the backend response as the source of truth. Do not recreate duration, deadline, checklist, visibility, rule, or AI validation logic in the browser.

## 2. Shared API Rules

### 2.1 Authentication

Protected endpoints require the current access token:

```http
Authorization: Bearer <access_token>
```

Never send an admin or seller token from public server components, browser logs, analytics, or error-report payloads.

### 2.2 Date and time

All backend timestamps are ISO 8601 values. Parse them as absolute timestamps and display them in the user's local timezone.

Countdowns must be calculated from the server timestamp, not from a locally created duration. Recalculate visually every second, but never write every countdown tick to application state shared across the page.

### 2.3 Money

Money values are integer UZS values. Do not send formatted strings such as `"500 000"` to the API.

### 2.4 Error format

Business errors usually use this format:

```json
{
  "detail": {
    "code": "machine_readable_code",
    "message": "Optional human-readable message"
  }
}
```

The frontend must branch on `detail.code`, not on translated text.

### 2.5 Loading and mutation rules

- Disable a mutation button while its request is running.
- Prevent double submission.
- Keep the existing screen visible during a background refetch.
- On success, update the local record immediately and then revalidate the relevant GET endpoint.
- On `409`, refetch the current resource because another actor may already have changed it.
- On `401`, use the existing token refresh flow once, then redirect to login if refresh fails.
- On `403`, show the role/permission state and do not retry automatically.
- On `422`, display the field-specific business error next to the affected control.

## 3. Realtime Connection

### 3.1 User socket

Use the existing authenticated user WebSocket:

```text
wss://lexgo.api.cognilabs.org/ws/users/me?token=<access_token>
```

The token may also be supplied through the supported authorization mechanism already used by the frontend. Reuse the single application-level socket. Do not open one user socket per component.

Send a heartbeat when the shared WebSocket layer requires it:

```json
{"event":"ping"}
```

Expected reply:

```json
{
  "event": "pong",
  "user_id": "<user_id>",
  "created_at": "2026-10-22T10:00:00+00:00"
}
```

### 3.2 Reconnection

Use exponential backoff with jitter. Suggested delays: 1, 2, 4, 8, 15, then 30 seconds maximum.

After reconnecting:

1. Refetch the currently open order or AI job.
2. Refetch counters and queue data used by the current page.
3. Do not replay a POST request.
4. Do not create a second AI job.

### 3.3 Event handling rule

Treat a realtime event as an invalidation signal and lightweight optimistic payload. The REST endpoint remains the final source of truth.

## 4. Marketplace Service Runtime Configuration

### 4.1 Endpoint

```http
GET /marketplace/services/{service_id}/runtime-configuration?placement=service_detail
```

This endpoint is public for an active service.

### 4.2 Response contract

```json
{
  "service_id": "uuid",
  "duration": {
    "value": 5,
    "unit": "day",
    "calendar": "business_days",
    "starts_on": "seller_acceptance",
    "business_weekdays": [1, 2, 3, 4, 5],
    "business_days_label": "Monday-Friday"
  },
  "review": {
    "value": 2,
    "unit": "hour",
    "starts_on": "seller_acceptance",
    "client_note": "The professional will review the case before confirming delivery time."
  },
  "executor_types": ["advokat", "yurist"],
  "template": {
    "mode": "not_required",
    "source": "",
    "document_template_id": null
  },
  "pricing": {
    "recommended_price": 500000,
    "minimum_listing_price": 250000,
    "maximum_price": 1500000,
    "currency": "UZS",
    "seller_can_price_below_recommended": true,
    "maximum_listing_discount_percent": 50,
    "negotiation_minimum_price": 0,
    "factors": [],
    "formula": "fixed_first_then_percent_on_base"
  },
  "usage_steps": [],
  "negotiation_available": true,
  "minimum_requirements": {},
  "rules": [],
  "client_rules": [],
  "seller_selectable_rules": [],
  "guarantees": [],
  "placement": "service_detail",
  "checklist_preview": []
}
```

### 4.3 Client service detail page

Render:

- `review.client_note` when `review.value > 0`.
- The estimated standard duration from `duration` as informational data only.
- `client_rules`, never `rules`.
- `guarantees` returned for the requested placement.
- `checklist_preview` as a read-only section titled conceptually as “What the professional will do”.

Do not render checklist action controls on the service detail page.

Do not expose seller-only rule text, internal checklist labels, minimum requirement internals, or internal template metadata to the client unless a product screen explicitly needs them.

### 4.4 Duration labels

Supported units:

- `minute`
- `hour`
- `day`

Supported calendars:

- `calendar`
- `business_days`

For `business_days`, the backend currently defines business days as Monday through Friday. Display the localized equivalent of `business_days_label`; do not infer another workweek.

## 5. Seller Service Rules

### 5.1 Rule list

```http
GET /marketplace/service-rules?service_id={service_id}
Authorization: Bearer <seller_token>
```

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "rule_key": "rule-key",
      "version": "1.0",
      "title": "Rule title",
      "body": "Rule text",
      "scope_type": "service",
      "scope_id": "service-id",
      "effective_at": "2026-10-22T00:00:00+00:00",
      "accepted": false
    }
  ],
  "all_accepted": false,
  "count": 1
}
```

### 5.2 Accept a rule

```http
POST /marketplace/service-rules/{rule_id}/accept
Authorization: Bearer <seller_token>
Content-Type: application/json
```

```json
{
  "device": "Web Chrome 130 / Linux"
}
```

Response:

```json
{
  "accepted": true,
  "rule_id": "uuid",
  "version": "1.0",
  "accepted_at": "2026-10-22T10:00:00+00:00"
}
```

### 5.3 Seller service configuration

Before enabling a service, fetch:

```http
GET /marketplace/me/services/{service_id}/configuration
```

The response contains:

- `required_rules`
- `selectable_rules`
- `selected_rule_ids`
- `missing_rule_ids`
- `rules_accepted`
- `rules_status`
- pricing limits and explanations

When the seller enables the service, send the full configuration through the existing endpoint:

```http
PATCH /marketplace/me/services/{service_id}/configuration
```

```json
{
  "enabled": true,
  "selected_price": 700000,
  "negotiation_allowed": true,
  "selected_rule_ids": ["rule-id"]
}
```

If the API returns `409 service_rules_acceptance_required`, show the missing rules and keep the service disabled until the seller accepts all IDs from `missing_rule_ids`.

## 6. Starting a Marketplace Order

### 6.1 Seller action

The assigned seller starts a paid order:

```http
POST /marketplace/orders/{order_id}/start
Authorization: Bearer <seller_token>
```

No request body is required.

### 6.2 Preconditions

- The current user must be the assigned seller.
- `payment_status` must be `paid`.
- Order status must be `paid` or `accepted`.

Errors:

- `409 payment_required`
- `409 order_start_not_allowed`
- `404` when the order is unavailable to the current seller

### 6.3 Response with review stage

```json
{
  "order_id": "uuid",
  "status": "in_progress",
  "work_phase": "reviewing",
  "started_at": "2026-10-22T10:00:00+00:00",
  "review_deadline_at": "2026-10-22T12:00:00+00:00",
  "review_duration": {
    "value": 2,
    "unit": "hour"
  },
  "review_seller_note": "Review the client's files and confirm a realistic deadline.",
  "expected_completed_at": null,
  "duration": null,
  "chat": {
    "room_id": "uuid",
    "title": "Service: ...",
    "read_only": false
  },
  "checklist": [],
  "show_second_opinion_promotion": true,
  "second_opinion_promotion_url": "/marketplace/orders/{order_id}/second-opinion-promotion?placement=in_progress"
}
```

### 6.4 Response without review stage

When the service has no review duration:

- `work_phase` is `execution`.
- `expected_completed_at` is calculated immediately.
- `duration` contains the final duration.
- The seller starts checklist execution immediately.

### 6.5 Frontend state transition

After a successful start:

1. Replace the order status locally with `in_progress`.
2. Store `chat.room_id` and enable the secure chat entry point.
3. If `work_phase=reviewing`, open the review-stage UI.
4. If `work_phase=execution`, open the checklist/execution UI.
5. Refetch the order detail and checklist.

## 7. Review Stage UI

### 7.1 Seller screen

When `work_phase=reviewing`, show:

- A clear “Reviewing client materials” status.
- Countdown to `review_deadline_at`.
- `review_seller_note`.
- Secure chat access.
- Client-provided files and order context from the existing order detail/chat APIs.
- A primary action: “Complete review and set delivery time”.

Do not display checklist completion controls before the review is completed. The checklist may be visible as a read-only preview.

### 7.2 Client screen

When `work_phase=reviewing`, show:

- “The professional is reviewing your request”.
- `review_client_note` from the start event/order data.
- Review deadline/countdown.
- Active secure chat.
- Read-only client-safe checklist preview.

Never expose `review_seller_note` to the client.

### 7.3 Complete review and select execution duration

```http
POST /marketplace/orders/{order_id}/review/complete
Authorization: Bearer <seller_token>
Content-Type: application/json
```

```json
{
  "duration_value": 5,
  "duration_unit": "day",
  "duration_calendar": "business_days"
}
```

Validation:

- `duration_value` must be at least 1.
- `duration_unit` must be `minute`, `hour`, or `day`.
- `duration_calendar` must be `calendar` or `business_days`.

Success response:

```json
{
  "event": "marketplace.order_review_completed",
  "order_id": "uuid",
  "status": "in_progress",
  "work_phase": "execution",
  "review_completed_at": "2026-10-22T11:00:00+00:00",
  "expected_completed_at": "2026-10-29T11:00:00+00:00",
  "duration": {
    "value": 5,
    "unit": "day",
    "calendar": "business_days",
    "business_weekdays": [1, 2, 3, 4, 5],
    "business_days_label": "Monday-Friday"
  }
}
```

On success, close the duration dialog and switch the order screen to execution mode.

Error `409 order_not_in_review` means the phase has already changed. Close the dialog and refetch the order.

## 8. Review Deadline and Call-Center Escalation

### 8.1 Backend behavior

- Three hours before the review deadline, call-center operators receive `marketplace.order_review_deadline_soon`.
- When the review deadline expires, the backend creates an escalation and sends `marketplace.order_review_escalated`.
- The frontend must not create these reminders itself.

### 8.2 Call-center queue

```http
GET /call-center/marketplace/review-escalations?status=open
Authorization: Bearer <call_center_operator_token>
```

Response:

```json
{
  "items": [
    {
      "id": "escalation-id",
      "order_id": "order-id",
      "title": "Review deadline expired: ...",
      "status": "open",
      "payload": {
        "order_id": "order-id",
        "client_user_id": "uuid",
        "lawyer_user_id": "uuid",
        "service_id": "uuid",
        "review_started_at": "ISO timestamp",
        "review_deadline_at": "ISO timestamp",
        "reason": "review_deadline_expired",
        "history": []
      },
      "created_at": "ISO timestamp",
      "updated_at": "ISO timestamp"
    }
  ],
  "count": 1,
  "realtime_channel": "call-center:marketplace"
}
```

Use the shared `/ws/users/me` socket for operator notifications. On `marketplace.order_review_deadline_soon` or `marketplace.order_review_escalated`, refetch the queue.

The returned `realtime_channel` is a logical backend channel identifier. Do not open a WebSocket URL directly from that value.

### 8.3 Resolve an escalation

```http
POST /call-center/marketplace/review-escalations/{escalation_id}/resolve
Authorization: Bearer <call_center_operator_token>
```

Supported actions:

#### Extend review time

```json
{
  "action": "extend",
  "duration_value": 2,
  "duration_unit": "hour",
  "message": "The professional confirmed that review will be completed within two hours."
}
```

#### Transfer to another seller

```json
{
  "action": "transfer",
  "lawyer_user_id": "replacement-user-id",
  "message": "The request was reassigned to another professional."
}
```

#### Send an operator resolution message

```json
{
  "action": "message",
  "message": "The operator contacted both parties and resolved the issue."
}
```

#### Cancel the order

```json
{
  "action": "cancel",
  "message": "Cancellation reason"
}
```

Important behavior:

- `extend` recalculates the review deadline and the three-hour reminder.
- `transfer` assigns a valid active seller and restarts the review timing.
- `message` records the operator message and resolves the escalation.
- `cancel` cancels the order and stores the reason.

Errors:

- `409 escalation_already_resolved`
- `422 escalation_action_invalid`
- `422 extension_duration_invalid`
- `422 replacement_lawyer_invalid`

After success, remove the item from the open queue and refetch the order. Other operator sessions should refetch when receiving the related notification or during normal reconnect/resync.

## 9. Order Checklist

### 9.1 Fetch checklist

```http
GET /marketplace/orders/{order_id}/checklist
Authorization: Bearer <client_or_assigned_seller_token>
```

Response:

```json
{
  "order_id": "uuid",
  "items": [],
  "progress": {
    "done": 0,
    "total": 4,
    "required_done": 0,
    "required_total": 3,
    "percent": 0
  },
  "completed_count": 0,
  "total_count": 4,
  "progress_percent": 0,
  "work_phase": "execution",
  "realtime_channel": "order:uuid",
  "snapshot_locked": true,
  "file_upload": {
    "url": "/secure-chats/{room_id}/messages/upload",
    "id_field": "file_id",
    "name_field": "file_name",
    "url_field": "download_url"
  }
}
```

### 9.2 Seller checklist item

The seller can receive the full item:

```json
{
  "id": "item-1",
  "key": "verify-client-document",
  "executor_title": "Verify the client's identity document",
  "client_title": "Identity document verified",
  "description": "Internal execution guidance",
  "client_description": "The professional verifies the submitted identity document.",
  "required": true,
  "verification_methods": ["checkbox", "comment", "image", "file"],
  "comment_required": true,
  "image_required": false,
  "file_required": false,
  "show_comment_to_client": true,
  "show_images_to_client": false,
  "show_files_to_client": true,
  "skip_allowed": true,
  "skip_reason_required": true,
  "status": "pending",
  "comment": "",
  "images": [],
  "files": [],
  "updated_at": null,
  "updated_by_user_id": null
}
```

### 9.3 Client checklist item

For the client, the backend returns a sanitized item:

- `title` is the client title, with executor title only as fallback.
- `description` is the client description.
- Internal title fields are removed.
- Comments, images, and files are emptied unless their `show_*_to_client` switch is enabled.

Do not attempt to expose hidden evidence from another endpoint or cached seller state.

### 9.4 File upload before checklist update

When evidence is a file, upload through the URL returned in `file_upload.url`. Save the returned identifiers using the returned field names. Then include the normalized file object in the checklist PATCH payload.

Do not base64-encode large files into the checklist request.

### 9.5 Update a checklist item

Only the assigned seller can update an active order checklist:

```http
PATCH /marketplace/orders/{order_id}/checklist/{item_id}
Authorization: Bearer <seller_token>
Content-Type: application/json
```

Done example:

```json
{
  "status": "done",
  "comment": "The document was checked against the submitted data.",
  "images": [
    {
      "file_id": "image-file-id",
      "file_name": "proof.jpg",
      "download_url": "/secure-files/..."
    }
  ],
  "files": [
    {
      "file_id": "document-file-id",
      "file_name": "result.pdf",
      "download_url": "/secure-files/..."
    }
  ]
}
```

Skipped example:

```json
{
  "status": "skipped_with_reason",
  "comment": "This item does not apply to the client's case.",
  "images": [],
  "files": []
}
```

Reset example:

```json
{
  "status": "pending",
  "comment": "",
  "images": [],
  "files": []
}
```

Validation errors:

- `checklist_status_invalid`
- `skip_reason_required`
- `checklist_comment_required`
- `checklist_image_required`
- `checklist_file_required`

Keep the checklist item editor open when validation fails and focus the missing field.

### 9.6 Checklist realtime event

```json
{
  "event": "marketplace.checklist_updated",
  "order_id": "uuid",
  "item": {},
  "items": []
}
```

The client receives sanitized data. The seller receives full data. Replace the checklist array from the event, recalculate from a subsequent GET if necessary, and never merge seller-only evidence into client state.

### 9.7 Completing an order

Use the existing completion endpoint:

```http
POST /marketplace/orders/{order_id}/complete-v2
```

The backend prevents completion when a required item is neither `done` nor `skipped_with_reason`.

Expected blocking error:

```json
{
  "detail": {
    "code": "required_checklist_incomplete",
    "items": [
      {
        "id": "item-1",
        "title": "Verify the client's identity document"
      }
    ]
  }
}
```

Show the returned items as actionable links that scroll to and highlight the incomplete checklist entries.

## 10. Marketplace Realtime Events

Handle these events on the shared user socket:

| Event | Recipient | Frontend action |
|---|---|---|
| `marketplace.order_review_started` | Client | Refetch order and checklist; show review phase |
| `marketplace.order_started` | Client | Refetch order and checklist; show execution phase |
| `marketplace.order_review_completed` | Client | Replace review timer with execution deadline |
| `marketplace.order_review_deadline_soon` | Call-center | Refetch review escalation context/counters |
| `marketplace.order_review_escalated` | Call-center | Refetch open escalation queue and show unread indicator |
| `marketplace.order_review_escalation_resolved` | Client/seller | Refetch order and show operator result |
| `marketplace.checklist_updated` | Client/seller | Replace checklist with role-safe event data |
| `marketplace.rule_accepted` | Seller | Refetch service configuration |

All handlers must verify `order_id`, `job_id`, or `rule_id` before mutating an open screen.

## 11. Studio Field-Level AI

### 11.1 Availability

The Studio constructor schema marks AI-enabled fields with metadata similar to:

```json
{
  "ai_assist": {
    "enabled": true,
    "endpoint": "/studio/ai/field-suggestions",
    "method": "POST",
    "requires_confirmation": true,
    "provider": "openai",
    "fallback": false,
    "response_count": 3
  }
}
```

Only show the AI control when `ai_assist.enabled === true`. Do not hardcode a field-name list.

### 11.2 Request

```http
POST /studio/ai/field-suggestions
Authorization: Bearer <studio_user_token>
Content-Type: application/json
```

```json
{
  "constructor_code": "K02",
  "field_key": "description",
  "field_label": "Service description",
  "current_value": "Current draft text",
  "context": {
    "title": "Service title",
    "category_title": "Category title",
    "client_value": "Expected client value"
  }
}
```

Context rules:

- Send only relevant form fields.
- Maximum useful context is the current constructor form, not the full application state.
- Do not send files, attachments, secrets, tokens, personal phone numbers, or authentication data.
- The backend keeps only the first 20 context fields and explicitly excludes file/secret/token keys.

### 11.3 Response

```json
{
  "constructor_code": "K02",
  "field_key": "description",
  "suggestions": [
    {
      "value": "Suggested text 1",
      "rationale": "Why this version is useful"
    },
    {
      "value": "Suggested text 2",
      "rationale": "Alternative emphasis"
    },
    {
      "value": "Suggested text 3",
      "rationale": "More concise version"
    }
  ],
  "quality_notes": [],
  "provider": "openai",
  "model": "gpt-5-mini",
  "auto_saved": false,
  "requires_user_confirmation": true,
  "cache_hit": false,
  "provider_latency_ms": 4065,
  "latency_ms": 4150
}
```

### 11.4 Required UX

1. Put a compact AI action beside or below the supported field label.
2. Keep the user's current field value visible while loading.
3. Show three selectable suggestion cards in a popover, drawer, or inline panel.
4. Show `rationale` as secondary text.
5. A suggestion click copies only its `value` into the local form field.
6. Do not save automatically.
7. Mark the form dirty after applying a suggestion.
8. The normal Studio validation, preview, review, and approval flow still applies.
9. Provide undo until the user saves or changes the field again.

The backend caches an identical request for five minutes. `cache_hit=true` is informational; no different UX is required.

### 11.5 Errors

| HTTP | Code | UI behavior |
|---|---|---|
| 422 | `ai_field_context_required` | Mark missing constructor/field metadata; this is an integration error |
| 404 | `studio_constructor_not_found` | Stop and refresh constructor definitions |
| 503 | `ai_provider_unavailable` | Show AI temporarily unavailable; keep manual editing enabled |
| 502 | `ai_field_suggestion_failed` | Show retry action and keep current text |
| 502 | `ai_field_suggestion_incomplete` | Show retry action; do not display a partial set as final |

Never block manual Studio editing because AI is unavailable.

## 12. Deep Studio AI Agent

### 12.1 Purpose

The deep agent researches official sources and creates Studio draft objects for:

- `K01`: service category
- `K02`: marketplace service
- `K03-M`: service package

It can create up to 10 drafts in one job. Drafts are never published automatically.

### 12.2 Create job

```http
POST /studio/ai/agent-jobs
Authorization: Bearer <studio_user_token>
Content-Type: application/json
```

```json
{
  "prompt": "Research and prepare ten high-demand family law services for Uzbekistan.",
  "max_drafts": 10,
  "constructor_codes": ["K01", "K02", "K03-M"]
}
```

Rules:

- `prompt` must contain at least 10 characters.
- `max_drafts` is clamped to 1–10.
- Unsupported constructor codes are ignored.
- If constructor codes are omitted, all three supported codes are used.

Response: `202 Accepted`

```json
{
  "id": "job-id",
  "status": "queued",
  "stage": "queued",
  "progress_percent": 0,
  "max_drafts": 10,
  "constructor_codes": ["K01", "K02", "K03-M"],
  "realtime_channel": "user:user-id",
  "detail_url": "/studio/ai/agent-jobs/job-id"
}
```

Store the returned job ID immediately. A page reload must resume the same job, not submit a duplicate.

### 12.3 Job detail

```http
GET /studio/ai/agent-jobs/{job_id}
Authorization: Bearer <studio_user_token>
```

The owner and an admin can read the job.

Important fields:

```json
{
  "id": "job-id",
  "status": "running",
  "prompt": "...",
  "max_drafts": 10,
  "constructor_codes": ["K01", "K02", "K03-M"],
  "stage": "research",
  "progress_percent": 25,
  "requested_at": "ISO timestamp",
  "started_at": "ISO timestamp",
  "completed_at": null,
  "failed_at": null,
  "worker_heartbeat_at": "ISO timestamp",
  "attempt_count": 1,
  "provider_response_id": "internal-provider-id",
  "provider_status": "in_progress",
  "provider_elapsed_ms": 12000,
  "provider_latency_ms": null,
  "summary": "",
  "drafts": [],
  "sources": [],
  "publish_requires_human_approval": true,
  "auto_published": false,
  "error": null,
  "created_at": "ISO timestamp",
  "updated_at": "ISO timestamp",
  "realtime_channel": "user:user-id"
}
```

Possible stages:

- `queued`
- `research`
- `repairing`
- `drafting`
- `completed`
- `failed`

### 12.4 Draft result

Completed jobs contain:

```json
{
  "status": "completed",
  "stage": "completed",
  "progress_percent": 100,
  "summary": "Research summary",
  "draft_count": 3,
  "drafts": [
    {
      "object_id": "studio-object-id",
      "version_id": "studio-version-id",
      "constructor_code": "K02",
      "title": "Draft service title",
      "validation": {
        "ok": true,
        "errors": []
      },
      "existing_matches": [],
      "comparison_required": false,
      "dependency_titles": [],
      "improvements": []
    }
  ],
  "sources": [
    {
      "title": "Official source title",
      "url": "https://lex.uz/...",
      "checked_at": "2026-10-22"
    }
  ],
  "publish_requires_human_approval": true,
  "auto_published": false
}
```

### 12.5 Required Studio agent screen

Create a dedicated Studio AI agent screen with:

- Prompt textarea.
- Constructor multi-select for K01, K02, and K03-M.
- Draft count control from 1 to 10.
- Submit button.
- Active job progress section.
- Stage label and progress bar.
- Elapsed time.
- Draft result list.
- Validation state per draft.
- Existing-match comparison action.
- Official source links with checked date.
- “Open draft” action that opens the existing Studio object editor.
- Clear notice that human review and approval are required.

Do not add a direct “Publish” action to the AI result card. Publication must go through the standard Studio review/approval/release flow.

### 12.6 Realtime and polling

Realtime events:

```json
{
  "event": "studio.ai_agent.progress",
  "job_id": "job-id",
  "stage": "research",
  "progress_percent": 10
}
```

```json
{
  "event": "studio.ai_agent.completed",
  "job_id": "job-id",
  "draft_count": 3,
  "progress_percent": 100
}
```

```json
{
  "event": "studio.ai_agent.failed",
  "job_id": "job-id",
  "error": {
    "code": "studio_ai_agent_failed",
    "reason": "ProviderError",
    "message": "..."
  }
}
```

Implementation:

1. Listen on `/ws/users/me`.
2. Update progress immediately when the active `job_id` matches.
3. Refetch job detail on every stage event, completion, or failure.
4. While status is `queued` or `running`, use GET fallback polling every 3–5 seconds.
5. Stop polling on `completed`, `failed`, or when the screen is unmounted.
6. Pause polling while the document is hidden and refetch immediately when visible again.

The backend runs at most two deep jobs concurrently. `queued` is a normal state and must not be presented as an error.

### 12.7 Recovery behavior

The backend stores the OpenAI background response ID, worker heartbeat, attempt count, and provider status. After backend restart, stale queued/running jobs are recovered.

Frontend rules:

- Never resubmit automatically after a timeout, refresh, or reconnect.
- Persist the active job ID in route state or durable client state.
- Call the returned `detail_url` after reload.
- Show “Still processing” while heartbeat/status indicates active work.
- Do not display `provider_response_id` or repair response IDs to normal users.

### 12.8 Validation and repair

The backend validates generated objects against their constructor schema. Invalid AI output is passed through a repair stage. A draft can still contain validation errors after repair.

Frontend must:

- Show `validation.ok` clearly.
- List validation errors grouped by field.
- Prevent presenting an invalid draft as ready for approval.
- Let the Studio worker open and correct the draft manually.
- Show `existing_matches` and require comparison when `comparison_required=true`.
- Preserve `improvements` and `dependency_titles` as review context.

## 13. Role-Based Screen Matrix

| Feature | Client | Marketplace seller | Call-center operator | Studio worker/admin |
|---|---:|---:|---:|---:|
| View client service rules | Yes | Optional | Optional | Yes |
| Accept seller rules | No | Yes | No | No |
| Start paid order | No | Assigned seller only | No | No |
| Complete review stage | No | Assigned seller only | No | No |
| View client-safe checklist | Yes | Yes | Context only | No |
| Update checklist | No | Assigned seller only | No | No |
| Resolve review escalation | No | No | Yes | No |
| Use field AI | No | No | No | Authorized Studio user |
| Create deep AI job | No | No | No | Authorized Studio user |
| Publish AI result directly | No | No | No | No; standard approval required |

Do not rely only on hidden navigation. Keep route guards and API error handling in place.

## 14. State Model

Recommended normalized frontend entities:

```ts
type WorkPhase = "reviewing" | "execution" | "cancelled";

type ChecklistStatus = "pending" | "done" | "skipped_with_reason";

type StudioAiStage =
  | "queued"
  | "research"
  | "repairing"
  | "drafting"
  | "completed"
  | "failed";
```

Keep these domains separate:

- Order business status: `paid`, `accepted`, `in_progress`, `completed`, `cancelled`.
- Work phase: `reviewing`, `execution`, `cancelled`.
- Checklist item status.
- Escalation status: `open`, `handled`, `resolved`.
- AI job status and stage.

Do not collapse them into one generic UI status.

## 15. Suggested Components

Use the project's existing component system. The following boundaries are recommended:

- `ServiceRuntimeSummary`
- `ClientRuleList`
- `SellerRuleAcceptanceDialog`
- `OrderReviewPanel`
- `ReviewDurationDialog`
- `OrderExecutionDeadline`
- `OrderChecklist`
- `ChecklistItemEditor`
- `ChecklistEvidenceUploader`
- `ReviewEscalationQueue`
- `ReviewEscalationResolutionDialog`
- `StudioFieldAiSuggestions`
- `StudioAiAgentForm`
- `StudioAiJobProgress`
- `StudioAiDraftReviewCard`
- `StudioAiSourceList`

Avoid putting all API and realtime logic inside page components. Use shared query/mutation hooks and one shared authenticated WebSocket client.

## 16. UX Details

### 16.1 Review countdown

- Normal state: neutral.
- Under three hours: warning state.
- Expired: error state with “Call center is resolving this delay”.
- Do not let a negative countdown continue visually.

### 16.2 Checklist progress

- Show completed count and percentage.
- Distinguish required and optional items.
- Show evidence requirements before the seller presses Done.
- A skipped item must always require a reason.
- Use client-safe labels on client screens.
- Files/images hidden by backend visibility switches must not leave empty broken placeholders.

### 16.3 AI latency

Field AI may take several seconds. Deep research may take around one minute or longer. Use factual progress states rather than a frozen button.

Do not show fake token streaming because these endpoints return completed structured JSON or background job state.

### 16.4 Accessibility

- Countdown and progress changes must not announce every second to screen readers.
- Announce stage changes, successful checklist updates, and errors through a polite live region.
- Dialogs must trap focus and restore it on close.
- Error messages must be linked to their controls.
- All icon-only actions require accessible labels and tooltips.

## 17. Cache and Query Invalidation

Suggested query keys:

```text
["service-runtime", serviceId, placement]
["seller-service-configuration", serviceId]
["service-rules", serviceId]
["marketplace-order", orderId]
["marketplace-order-checklist", orderId]
["review-escalations", status]
["studio-ai-job", jobId]
```

Invalidation rules:

- Rule accepted: invalidate service rules and seller configuration.
- Order started: invalidate order and checklist.
- Review completed: invalidate order and checklist.
- Checklist changed: update from event, then invalidate checklist in background.
- Escalation resolved: invalidate escalation queue and order.
- AI job event: invalidate that job only.

## 18. Error Mapping

| Code | User-facing meaning | Required action |
|---|---|---|
| `payment_required` | Payment is not complete | Return to payment state |
| `order_start_not_allowed` | Order can no longer be started from its current status | Refetch order |
| `order_not_in_review` | Review was already completed or changed | Close dialog and refetch |
| `delivery_duration_invalid` | Delivery duration is invalid | Mark duration fields |
| `service_rules_acceptance_required` | Required seller rules are not accepted | Open rule acceptance flow |
| `escalation_already_resolved` | Another operator already resolved it | Remove item and refetch |
| `escalation_action_invalid` | Unsupported operator action | Integration error |
| `extension_duration_invalid` | Extension value/unit is invalid | Mark extension fields |
| `replacement_lawyer_invalid` | Selected replacement cannot receive the order | Refresh seller selector |
| `checklist_status_invalid` | Unsupported checklist state | Integration error |
| `skip_reason_required` | Skip reason is missing | Focus comment field |
| `checklist_comment_required` | Required comment is missing | Focus comment field |
| `checklist_image_required` | Required image is missing | Open image uploader |
| `checklist_file_required` | Required file is missing | Open file uploader |
| `required_checklist_incomplete` | Required execution items are incomplete | Highlight returned items |
| `ai_field_context_required` | Constructor/field metadata is missing | Fix frontend request mapping |
| `ai_provider_unavailable` | AI is temporarily unavailable | Keep manual editing active |
| `ai_field_suggestion_failed` | AI request failed | Allow retry |
| `ai_field_suggestion_incomplete` | AI returned fewer than three valid choices | Allow retry |
| `agent_prompt_too_short` | Deep-agent instruction is too short | Mark prompt field |

## 19. End-to-End Acceptance Tests

### 19.1 Seller rule acceptance

1. Open a seller service configuration with missing rules.
2. Verify enabling is blocked.
3. Accept every missing rule.
4. Refetch configuration.
5. Verify the service can be enabled.

### 19.2 Review-stage order

1. Create/use a paid order whose service has a review duration.
2. Start as the assigned seller.
3. Verify `work_phase=reviewing` on seller and client screens.
4. Verify seller and client notes are not mixed.
5. Set a final delivery duration.
6. Verify both screens move to execution in realtime.
7. Verify `expected_completed_at` comes from the backend.

### 19.3 Direct execution order

1. Start a paid order with no review duration.
2. Verify it enters execution immediately.
3. Verify the checklist is editable by the seller.

### 19.4 Review escalation

1. Use a review deadline close to expiration in a test environment.
2. Verify the call-center receives the warning.
3. Let the deadline expire.
4. Verify the open escalation appears.
5. Test extend, transfer, message, and cancel with separate orders.
6. Verify duplicate resolution returns 409 and the UI refreshes.

### 19.5 Checklist visibility

1. Complete an item with comment, image, and file.
2. Verify the seller sees all evidence.
3. Verify the client sees only evidence allowed by the `show_*_to_client` switches.
4. Verify skipped items require a reason.
5. Verify order completion is blocked until all required items are done or skipped with reason.

### 19.6 Field AI

1. Open an AI-enabled Studio field.
2. Request suggestions and verify exactly three options.
3. Apply one option and verify it is not auto-saved.
4. Repeat the identical request and verify cached response behavior remains transparent.
5. Simulate AI failure and verify manual editing remains usable.

### 19.7 Deep Studio AI

1. Create a job for K01/K02/K03-M.
2. Verify queued/running progress through WS plus GET fallback.
3. Reload the page and resume by job ID without creating another job.
4. Verify completed drafts show source links and validation.
5. Verify similar existing objects require comparison.
6. Verify no draft is auto-published.
7. Verify an invalid draft can be opened and corrected through normal Studio flow.

## 20. Definition of Done

Frontend integration is complete only when:

- Client and seller rules are never mixed.
- Sellers cannot enable a service without accepting required rules.
- Review and execution are separate visible phases.
- Review deadline reminders and escalations are visible to call-center operators.
- Call-center resolution actions work with proper conflict handling.
- Checklist labels and evidence are role-safe.
- Required checklist validation blocks order completion correctly.
- Realtime updates work without page refresh, with REST refetch as fallback.
- Field AI returns three user-confirmed options and never auto-saves.
- Deep AI jobs survive reload/reconnect without duplicate submission.
- AI drafts are always reviewed through the existing Studio workflow.
- Error states are mapped by code and remain recoverable.
- Desktop and mobile web layouts do not hide primary order/checklist actions.

## 21. Backend Verification Already Completed

The backend implementation was deployed and verified before this handoff:

- Local regression suite: 270/270 passed.
- Production workflow checks: 28/28 passed.
- Field AI returned three suggestions in approximately 4.15 seconds.
- Cached field AI response returned in approximately 0.012 seconds.
- Deep Studio AI completed in approximately 60.2 seconds with three official sources and `validation.ok=true`.
- Production HTTPS health check returned 200.
- Category API returned 200 with 20 categories at verification time.
- Temporary production test drafts were removed.
- No new production errors were found during the verification window.

These results verify backend behavior. The frontend team must still execute the role-based browser acceptance tests in Section 19 after integration.
# LexGo Studio AI Agent v2.1 Frontend Integration

## 1. Scope

This document is the frontend contract for the autonomous Studio AI agent implemented in the LexGo backend.

The agent can research trusted sources, inspect Studio constructor contracts, resolve real database references, validate generated data, detect duplicates, and save Studio drafts. The frontend starts a job, displays realtime progress, and opens the generated drafts in the existing Studio review flow.

The frontend must not implement agent routing, keyword trigger detection, source validation, duplicate detection, schema repair, or tool orchestration. Those responsibilities belong to the backend AI agent.

Production API base URL:

```text
https://lexgo.api.cognilabs.org
```

Authenticated user WebSocket:

```text
wss://lexgo.api.cognilabs.org/ws/users/me?token=<access_token>
```

## 2. Access

All endpoints require:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

The user must have Studio access. A user without Studio access receives `403`.

The job owner can read their own job. An admin can also read a job. A different non-admin user receives `404`, so the frontend must not expose or reuse another user's job ID.

## 3. Required Screen

Add an `AI Agent` entry inside Studio. The first screen must be the real working interface, not an explanatory landing page.

Required controls:

- Prompt textarea.
- Constructor multi-select populated from the existing Studio constructor registry.
- Number of drafts control from `1` to `10`.
- Output language selector: Uzbek, Russian, or English.
- Uzbek script selector when Uzbek is selected: Latin or Cyrillic.
- Official sources requirement toggle, enabled by default.
- Start button.
- Active-job progress area.
- Generated drafts list.
- Source list.
- Quality summary.
- Expandable audit timeline.
- Human review notice.

The constructor selector must use real constructor codes returned by the Studio backend. Do not hardcode only `K01`, `K02`, and `K03-M`; the agent supports the complete current Studio registry.

## 4. Create A Job

```http
POST /studio/ai/agent-jobs
```

Example request:

```json
{
  "prompt": "Research official sources and prepare three distinct family-law service drafts for Studio review.",
  "constructor_codes": ["K02"],
  "max_drafts": 3,
  "target_drafts": 3,
  "output_language": "uz",
  "output_script": "latn",
  "official_sources_required": true
}
```

Request rules:

| Field | Type | Rules |
|---|---|---|
| `prompt` | string | Required, trimmed length must be at least 10 characters |
| `constructor_codes` | string[] | Optional; every value must be a valid Studio constructor code |
| `max_drafts` | integer | Optional, clamped to `1..10` |
| `target_drafts` | integer | Optional, `1..max_drafts` |
| `output_language` | string | `uz`, `ru`, or `en` |
| `output_script` | string | `latn` or `cyrl` |
| `official_sources_required` | boolean | Optional, defaults to `true` |

Use the same value for `target_drafts` and `max_drafts` in the normal UI. Keep both fields in the API adapter for compatibility.

Successful response is `202 Accepted`:

```json
{
  "id": "job-uuid",
  "status": "queued",
  "stage": "queued",
  "progress_percent": 0,
  "max_drafts": 3,
  "target_drafts": 3,
  "constructor_codes": ["K02"],
  "output_language": "uz",
  "output_script": "latn",
  "agent_version": "2.1-autonomous-tools",
  "realtime_channel": "user:user-uuid",
  "detail_url": "/studio/ai/agent-jobs/job-uuid"
}
```

Immediately persist `id` and `detail_url` in durable client state. A browser refresh must resume the same job instead of submitting a second job.

Do not disable the page because the response status is `queued`. The backend limits parallel workers and a queued job is a valid state.

## 5. Create Validation Errors

Prompt too short:

```json
{
  "detail": {
    "code": "agent_prompt_too_short"
  }
}
```

No valid constructor code:

```json
{
  "detail": {
    "code": "agent_constructor_codes_invalid",
    "requested": ["INVALID"]
  }
}
```

Invalid language or script:

```json
{
  "detail": {
    "code": "agent_language_invalid",
    "allowed_languages": ["uz", "ru", "en"],
    "allowed_scripts": ["latn", "cyrl"]
  }
}
```

Show these errors next to the corresponding control. Do not show a generic server-error page for `422`.

## 6. Read Job Detail

```http
GET /studio/ai/agent-jobs/{job_id}
```

Example running response:

```json
{
  "id": "job-uuid",
  "status": "running",
  "prompt": "Research official sources and prepare three drafts.",
  "max_drafts": 3,
  "target_drafts": 3,
  "constructor_codes": ["K02"],
  "output_language": "uz",
  "output_script": "latn",
  "official_sources_required": true,
  "stage": "legal_research",
  "progress_percent": 30,
  "requested_at": "2026-10-22T10:00:00Z",
  "started_at": "2026-10-22T10:00:02Z",
  "worker_heartbeat_at": "2026-10-22T10:00:15Z",
  "attempt_count": 1,
  "provider_status": "in_progress",
  "provider_latency_ms": 12000,
  "tool_call_count": 4,
  "agent_turns": 2,
  "drafts": [],
  "sources": [],
  "publish_requires_human_approval": true,
  "auto_published": false,
  "tool_history": [],
  "quality_summary": {
    "validated_count": 0,
    "language_check_count": 0,
    "source_check_count": 0,
    "comparison_count": 0
  },
  "created_at": "2026-10-22T10:00:00Z",
  "updated_at": "2026-10-22T10:00:15Z",
  "realtime_channel": "user:user-uuid"
}
```

The response shape grows as the job progresses. Treat optional timestamps, summary, error, drafts, and sources defensively.

The backend intentionally does not return these internal fields:

- OpenAI provider response IDs.
- Previous-response IDs.
- Pending function outputs.
- Full internal agent state.
- Full downloaded source-page content.

Do not create frontend types or UI for those internal fields.

## 7. Job Statuses

| Status | Meaning | Frontend behavior |
|---|---|---|
| `queued` | Waiting for an available worker | Keep the job visible and show queued state |
| `running` | Agent is researching, validating, or saving | Show progress and live stage |
| `completed` | Exactly the requested number of valid drafts was saved | Show all drafts and review actions |
| `partial_failed` | Some valid drafts were saved, but exact requested count was not reached | Preserve and show valid drafts plus the shortfall |
| `failed` | The job stopped with an error | Show error and a manual retry action |
| `cancelled` | Reserved terminal state | Stop updates and show cancelled state |

Terminal statuses are `completed`, `partial_failed`, `failed`, and `cancelled`.

Do not treat `partial_failed` as an empty failure. Its successfully saved drafts remain valid and must be shown.

## 8. Agent Stages

Map backend stages to localized UI labels. Do not use stage values as hardcoded workflow logic.

| Stage | Meaning |
|---|---|
| `queued` | Waiting for worker |
| `understanding` | Understanding the request |
| `loading_contracts` | Reading constructor schemas |
| `catalog_research` | Checking existing Studio records |
| `legal_research` | Searching official legal sources |
| `primary_research` | Searching trusted first-party sources |
| `reading_sources` | Reading exact source pages |
| `drafting` | Preparing structured drafts and resolving references |
| `schema_validation` | Validating constructor fields |
| `language_review` | Checking language and script consistency |
| `source_verification` | Verifying source quality |
| `duplicate_comparison` | Comparing possible duplicates or versions |
| `saving_drafts` | Saving validated Studio drafts |
| `completed` | Requested result completed |
| `partial_failed` | Partial valid result completed |
| `failed` | Job failed |

Unknown future stage values must fall back to a generic processing label. They must not crash the page.

## 9. Realtime Connection

Use the application's single shared authenticated socket:

```text
GET wss://lexgo.api.cognilabs.org/ws/users/me?token=<access_token>
```

`realtime_channel` is a logical backend channel identifier. It is not a WebSocket URL and must not be opened directly.

Send the existing heartbeat when required:

```json
{
  "event": "ping"
}
```

The server replies:

```json
{
  "event": "pong",
  "user_id": "user-uuid",
  "created_at": "2026-10-22T10:00:00Z"
}
```

### Progress event

```json
{
  "event": "studio.ai_agent.progress",
  "job_id": "job-uuid",
  "stage": "source_verification",
  "progress_percent": 78,
  "saved_count": 1,
  "target_drafts": 3
}
```

### Completed event

```json
{
  "event": "studio.ai_agent.completed",
  "job_id": "job-uuid",
  "draft_count": 3,
  "target_drafts": 3,
  "progress_percent": 100,
  "error": null
}
```

### Partial result event

```json
{
  "event": "studio.ai_agent.partial_failed",
  "job_id": "job-uuid",
  "draft_count": 2,
  "target_drafts": 3,
  "progress_percent": 100,
  "error": {
    "code": "exact_draft_count_not_reached",
    "requested": 3,
    "created": 2,
    "message": "..."
  }
}
```

### Failed event

```json
{
  "event": "studio.ai_agent.failed",
  "job_id": "job-uuid",
  "error": {
    "code": "studio_ai_agent_failed",
    "reason": "ProviderError",
    "message": "..."
  }
}
```

## 10. Realtime State Algorithm

1. Open the shared authenticated socket once per signed-in browser session.
2. Create the job through REST.
3. Save the returned job ID before navigating or rendering progress.
4. Fetch `detail_url` once to establish canonical state.
5. Apply matching `studio.ai_agent.progress` events immediately.
6. Refetch job detail when stage changes, a draft count changes, or a terminal event arrives.
7. Ignore AI-agent events whose `job_id` does not match the displayed job, but invalidate any active-jobs indicator if the application has one.
8. After WebSocket reconnect, fetch job detail once to reconcile missed events.
9. When the socket is healthy, do not continuously poll.
10. While the socket is disconnected and the job is non-terminal, use temporary fallback polling every 5 seconds.
11. Stop fallback polling as soon as the socket reconnects or the job becomes terminal.
12. Never automatically create a replacement job after refresh, timeout, reconnect, or failure.

The backend survives restarts and resumes stale queued/running jobs. A frontend timeout must not be interpreted as a backend cancellation.

## 11. Completed Result

Example:

```json
{
  "id": "job-uuid",
  "status": "completed",
  "stage": "completed",
  "progress_percent": 100,
  "draft_count": 1,
  "target_drafts": 1,
  "drafts": [
    {
      "object_id": "studio-object-uuid",
      "version_id": "studio-version-uuid",
      "constructor_code": "K02",
      "title": "Legal service title",
      "validation": {
        "ok": true,
        "errors": [],
        "language": {
          "ok": true
        },
        "sources": {
          "ok": true
        },
        "existing_comparison": null
      },
      "existing_matches": [],
      "comparison_required": false,
      "dependency_titles": [],
      "improvements": [],
      "sources": [
        {
          "title": "Official source title",
          "url": "https://lex.uz/...",
          "checked_at": "2026-10-22"
        }
      ]
    }
  ],
  "sources": [],
  "publish_requires_human_approval": true,
  "auto_published": false,
  "quality_summary": {
    "validated_count": 1,
    "language_check_count": 1,
    "source_check_count": 1,
    "comparison_count": 0
  }
}
```

Render each draft with:

- Title.
- Constructor code and resolved constructor name.
- Validation result.
- Source-quality result.
- Language check result.
- Duplicate/comparison warning.
- Dependency titles.
- Improvement summary.
- Official source links.
- `Open draft` action.

Open a generated draft with the existing Studio object/detail and form-context flow using `object_id` and `constructor_code`. The generated record is a normal `draft`; it is not a separate AI-only object.

The user must review, edit if necessary, submit, approve, and publish through the normal Studio workflow.

## 12. Partial Result

For `partial_failed`:

- Display `created / requested` prominently.
- Display every valid saved draft.
- Display `error.code`, `error.message`, and the numerical shortfall.
- Offer `Review saved drafts`.
- Offer an explicit manual `Start another job` action if more drafts are needed.
- Never silently resubmit the same prompt.
- Never describe saved drafts as invalid merely because the requested count was not reached.

## 13. Failure Handling

The failure object has this public shape:

```json
{
  "code": "studio_ai_agent_failed",
  "reason": "TimeoutError",
  "message": "Studio AI agent umumiy timeoutga yetdi"
}
```

Required behavior:

- Keep the failed job ID available for support and diagnostics.
- Show a readable error message.
- Do not expose a raw stack trace.
- Provide a manual retry action that creates a new job only after user confirmation.
- Reuse the previous form values when manually retrying.
- Do not retry `401`, `403`, or validation errors automatically.
- On `404`, clear only the inaccessible local job reference.

## 14. Quality Summary

`quality_summary` is a compact count of completed quality gates:

| Field | Meaning |
|---|---|
| `validated_count` | Drafts checked against constructor schema |
| `language_check_count` | Drafts checked for requested language/script |
| `source_check_count` | Drafts checked for acceptable grounding sources |
| `comparison_count` | Existing objects explicitly compared as possible versions/duplicates |

Use it as a compact quality panel. Do not calculate these values in the browser.

A count lower than `draft_count` should be shown as a warning and handled from the canonical job response. Do not invent a pass state.

## 15. Tool History

`tool_history` returns up to the latest 100 backend agent-tool audit entries. It exists for transparency and diagnostics.

The current agent can use these tools:

1. `list_studio_constructors`
2. `get_constructor_contract`
3. `search_existing_catalog`
4. `search_official_legal_sources`
5. `search_trusted_primary_sources`
6. `read_legal_source`
7. `read_trusted_source`
8. `resolve_studio_reference`
9. `validate_studio_draft`
10. `validate_language_consistency`
11. `verify_source_quality`
12. `compare_with_existing_object`
13. `save_studio_draft`

Show history in an optional collapsed `Agent activity` section. A useful row includes tool name, result state, duration, and timestamp when present.

Do not:

- Execute tools from the browser.
- Infer the next tool.
- Add frontend keyword triggers.
- Allow users to call `save_studio_draft` directly.
- Treat tool order as a fixed sequence.
- Render downloaded source content as trusted HTML.

## 16. Source Rendering

The backend returns source metadata, not full source documents.

Display:

- Source title.
- Source domain.
- Checked date when available.
- External-link action.
- Official/trusted status when returned.

Open sources in a new tab with `noopener,noreferrer`. Render all titles and snippets as plain text. Never inject source content with `dangerouslySetInnerHTML`.

## 17. Duplicate And Version Handling

`existing_matches` may contain exact or similar Studio objects.

When matches exist:

- Show a visible duplicate/version warning.
- Display matched object title and similarity metadata returned by the API.
- Link to the existing Studio object when its ID is available.
- Keep the generated record as a draft.
- Let the Studio user decide whether it is a new object, replacement, or new version through existing Studio actions.

The browser must not merge records automatically.

## 18. Human Approval Is Mandatory

Every job response must be interpreted with these invariants:

```json
{
  "publish_requires_human_approval": true,
  "auto_published": false
}
```

Required UI copy should clearly state that AI generated a draft and a Studio reviewer must verify it.

Do not place a direct `Publish` button on an AI result card. The result card may only open the existing Studio object flow. Publishing remains controlled by Studio approval permissions and approval routes.

## 19. Recommended Frontend Modules

Keep API and realtime logic outside page components.

Suggested modules:

```text
features/studio-ai/api.ts
features/studio-ai/types.ts
features/studio-ai/hooks/useCreateStudioAiJob.ts
features/studio-ai/hooks/useStudioAiJob.ts
features/studio-ai/hooks/useStudioAiRealtime.ts
features/studio-ai/components/AgentRequestForm.tsx
features/studio-ai/components/AgentProgress.tsx
features/studio-ai/components/AgentDraftList.tsx
features/studio-ai/components/AgentQualitySummary.tsx
features/studio-ai/components/AgentToolHistory.tsx
features/studio-ai/components/AgentSources.tsx
```

Use the project's existing query client, authenticated API client, shared WebSocket client, localization, notifications, and Studio navigation components.

## 20. UI States

The screen must implement all of these states:

- Initial form.
- Submitting.
- Queued.
- Running with progress.
- Reconnecting realtime.
- Temporary REST fallback.
- Completed with drafts.
- Partial result with valid drafts.
- Failed.
- Unauthorized.
- Forbidden.
- Job not found.
- Network retry.
- Empty sources.
- Duplicate warning.
- Validation warning.

Keep the form values after a failed submission. Disable duplicate submit while the create request is in flight.

## 21. Security And Data Rules

- Never store access tokens in local storage if the existing authentication layer uses secure cookies or protected memory.
- Never log prompt text, generated legal content, access tokens, or job detail in production analytics.
- Never expose internal provider IDs.
- Never trust external source content as HTML.
- Never publish an AI draft automatically.
- Never synthesize missing backend validation results in the frontend.
- Never submit a duplicate job automatically.
- Never use `realtime_channel` as a URL.

## 22. Acceptance Checklist

- [ ] A Studio-authorized user can create a job and receives `202`.
- [ ] Prompt validation is shown inline.
- [ ] Constructor selection uses the current backend registry.
- [ ] Draft count is limited to `1..10`.
- [ ] The returned job ID survives page refresh.
- [ ] One shared `/ws/users/me` connection is used.
- [ ] Progress updates only the matching job.
- [ ] WebSocket reconnect triggers one detail refetch.
- [ ] Polling runs only while WebSocket is disconnected.
- [ ] `queued` is shown as a normal state.
- [ ] All current stages have labels and unknown stages have a fallback.
- [ ] `completed`, `partial_failed`, and `failed` are handled separately.
- [ ] Partial jobs keep and display valid drafts.
- [ ] Draft cards show validation, comparison, dependencies, and sources.
- [ ] Quality summary is read from the backend.
- [ ] Tool history is optional and read-only.
- [ ] Source links are rendered safely.
- [ ] Internal provider fields are never expected or displayed.
- [ ] Generated drafts open in the normal Studio object workflow.
- [ ] No AI result is automatically published.
- [ ] The page works after backend restart and job recovery.
- [ ] No frontend helper, trigger detector, or agent function routing is added.

## 23. Backend Verification Reference

The deployed backend implementation was verified with:

- Full regression suite: `275/275` passed.
- Marketplace workflow suite: `33/33` passed.
- Real strict-tool schema verification: all 13 tools accepted.
- Real category-agent job: valid grounded draft saved.
- Real service-agent job: valid service draft with a real category reference saved.
- Exact-count run: `3/3` distinct drafts saved.
- Production health endpoint: `200`.

These are backend verification results. Frontend acceptance tests must still cover the browser workflow, reconnect behavior, responsive layout, and opening generated drafts in the Studio editor.
# LexGo Studio Guarantees: K32/K33 Frontend Integration

## 1. Purpose

This document defines the frontend contract for creating, editing, assigning, and displaying guarantees in LexGo Studio.

The guarantee flow is split into three responsibilities:

- `K32` defines the guarantee itself.
- `K33` defines where and under which conditions guarantees are displayed.
- `K02` selects existing guarantees for a marketplace service.

The frontend must not recreate these responsibilities in local constants. Constructor forms must be rendered from backend metadata.

## 2. Required Frontend Changes

Remove the following legacy behavior:

- Do not render a scalar `audience` field in K32.
- Do not render `conditions` in K32.
- Do not render `inline_guarantees` in the service constructor K02.
- Do not create guarantees directly inside the service form.
- Do not hardcode client-only guarantee labels or fields.

Use the following behavior:

- Render `audiences` as a required multi-select in K32.
- Create every client, advocate, and lawyer guarantee through K32.
- Select existing K32 guarantees in K02 through `guarantee_ids`.
- Configure placement and display conditions through K33.
- Use the backend form schema, options, visibility rules, and validation response.

## 3. Constructor Responsibilities

### K32: Guarantee Definition

K32 stores reusable guarantee content. It does not decide where the guarantee appears.

K32 supports one or more audiences:

- `client`: Client
- `advokat`: Advocate
- `yurist`: Lawyer

A single guarantee may target multiple audiences.

### K33: Guarantee Display Rules

K33 controls:

- which guarantees are displayed;
- where they are displayed;
- when they are displayed;
- optional display conditions;
- whether the rule is active.

### K02: Marketplace Service

K02 only links already-created guarantees to a service through `guarantee_ids`.

The service form must not contain an inline guarantee editor.

## 4. Form Context Endpoints

Always load the current backend schema before rendering a constructor form.

```http
GET /studio/constructors/K32/form-context?mode=create
Authorization: Bearer <token>
```

```http
GET /studio/constructors/K33/form-context?mode=create
Authorization: Bearer <token>
```

For service creation or editing, load K02 in the same way:

```http
GET /studio/constructors/K02/form-context?mode=create
Authorization: Bearer <token>
```

For edit mode, use the constructor's existing edit flow and pass the current object context required by the API. Do not reuse stale create-mode metadata for editing.

## 5. K32 Field Contract

The frontend must render the fields returned by the backend in their returned order. The current K32 contract contains:

1. `title`
2. `audiences`
3. `guarantee_type`
4. `description`
5. `trigger`
6. `resolution`
7. `resolution_minutes`
8. `evidence_required`
9. `refund_policy_id`
10. `is_active`

### audiences

`audiences` is required and must be rendered as a multi-select.

Example:

```json
{
  "audiences": ["client", "advokat"]
}
```

Do not send:

```json
{
  "audience": "client"
}
```

The backend can read legacy records, but all new frontend requests must use `audiences`.

### guarantee_type

Render this field from backend-provided choices. Do not hardcode the available types.

### refund_policy_id

This field is conditionally visible. Respect the `visible_when` metadata returned by the form context.

It must only appear when the selected guarantee type requires a refund policy. Hidden conditional fields must not block submission.

### description, trigger, and resolution

Display the backend-provided helper text and placeholder below or inside each input. Do not replace it with generic frontend copy.

### is_active

Render as a switch. New records should use the backend default when one is provided.

## 6. K32 Payload Example

```json
{
  "title": "24/7 support guarantee",
  "audiences": ["client"],
  "guarantee_type": "support",
  "description": "The client can contact LexGo support at any time while the service is active.",
  "trigger": "The client cannot use the purchased service or cannot contact the executor.",
  "resolution": "LexGo support reviews the case and coordinates a resolution.",
  "resolution_minutes": 180,
  "evidence_required": false,
  "refund_policy_id": null,
  "is_active": true
}
```

The exact create/save endpoint must be taken from the actions returned by the constructor context. Do not construct Studio URLs from assumptions when action metadata is available.

## 7. K33 Placement Contract

K33 owns placement and conditional display behavior.

The frontend must render all K33 fields dynamically. The schema includes the selected guarantee IDs and display configuration.

K33 may include:

- `guarantee_ids`
- placement selections
- conditions
- active state

The actual field names, options, and supported condition operators must come from:

```http
GET /studio/constructors/K33/form-context?mode=create
```

Do not move K33 `conditions` into K32.

Do not infer placement based on K32 audience. Audience and placement are separate concepts:

- Audience defines who the guarantee is for.
- Placement defines where the guarantee is shown.

## 8. Guarantee Reference Select

Use this endpoint for searchable guarantee selects:

```http
GET /studio/reference/client-guarantees?q=<query>&limit=20&offset=0
Authorization: Bearer <token>
```

Expected frontend behavior:

- Debounce search by 250-350 ms.
- Reset `offset` when the query changes.
- Use pagination instead of loading every guarantee.
- Preserve selected values when loading the next page.
- Display active/inactive state if returned.
- Use the returned stable ID as the option value.
- Use the returned title as the primary option label.
- Do not filter only by legacy scalar `audience`.

The backend normalizes old records and returns `audiences` as an array.

Example normalized item:

```json
{
  "id": "<guarantee-id>",
  "title": "24/7 support guarantee",
  "audiences": ["client", "advokat", "yurist"],
  "is_active": true
}
```

## 9. K02 Service Integration

The K02 service form must show a guarantee selector backed by the guarantee reference endpoint.

Submit only selected guarantee IDs:

```json
{
  "guarantee_ids": [
    "<guarantee-id-1>",
    "<guarantee-id-2>"
  ]
}
```

The K02 UI must not render:

- `inline_guarantees`
- an embedded guarantee creation form
- K32 guarantee fields inside the service form

If the user needs a new guarantee, provide a navigation action to open K32 in a separate Studio flow. After the K32 object is published, refresh the guarantee reference select and allow the user to select it.

## 10. Legacy Record Compatibility

The backend supports existing records that contain:

- scalar `audience`;
- `advokat_yurist` or `executor` audience aliases;
- old inline service guarantees;
- old K32 `conditions`.

Frontend rules:

- Read normalized `audiences` returned by the API.
- Never send scalar `audience` in new saves.
- Never send K32 `conditions`.
- Never send new `inline_guarantees` from K02.
- Do not delete or hide legacy runtime guarantees returned for already-published services.

Legacy runtime data may remain visible to clients, but all new configuration must use K32/K33.

## 11. Validation Handling

Before final submission, use the validation action returned by the constructor context.

When validation fails:

- Keep all entered values.
- Map field errors to the matching input.
- Scroll to the first invalid field.
- Show a compact error summary above the form.
- Do not submit for approval until validation succeeds.

For `audiences`, show a field error when no value is selected.

Do not silently discard backend validation errors.

## 12. Create and Edit UX

### Create

1. Load K32 form context in create mode.
2. Render fields from metadata.
3. Start with no locally reused values from the previous creation.
4. Save draft through the backend-provided action.
5. Validate.
6. Submit through the normal Studio approval flow.

### Edit

1. Load the current object and edit form context.
2. Populate fields from the returned payload.
3. Render normalized `audiences` as selected values.
4. Respect lock/version fields returned by the backend.
5. Save changes through the backend-provided edit action.
6. Refresh object history and approval state.

## 13. Cache Invalidation

Invalidate the following frontend queries after a K32 object is created, edited, published, activated, deactivated, or archived:

- K32 object lists
- K32 form reference data
- `/studio/reference/client-guarantees`
- open K02 guarantee selectors
- K33 guarantee selectors
- service detail queries that display guarantees

Do not keep published guarantee lists only in component-local state.

## 14. Display Rules Outside Studio

When a marketplace/service API returns guarantees:

- Render only what the runtime API returns.
- Do not independently evaluate Studio K33 conditions in the browser unless the runtime contract explicitly requires it.
- Do not expose guarantees to an audience that is not included by the backend runtime response.
- Do not display internal Studio metadata to clients.

The backend is the source of truth for runtime filtering.

## 15. Loading and Error States

Required states:

- Form-context loading skeleton.
- Reference-select loading indicator.
- Empty guarantee list state.
- Retry state for failed reference requests.
- Saving state with duplicate-submit prevention.
- Validation-error state.
- Approval/publishing state.
- Conflict state when the record version is stale.

On a version conflict, reload the latest object before allowing another save. Do not overwrite the newer backend version automatically.

## 16. Acceptance Checklist

- K32 renders `audiences` as a required multi-select.
- K32 does not render scalar `audience`.
- K32 does not render `conditions`.
- K32 refund policy visibility follows backend metadata.
- K33 renders placement and conditions from backend metadata.
- K02 selects existing guarantees through `guarantee_ids`.
- K02 does not render `inline_guarantees`.
- Guarantee reference search is debounced and paginated.
- Old guarantee records render through normalized `audiences`.
- New requests never send legacy `audience` or K32 `conditions`.
- Form validation errors are shown on the correct fields.
- Create, edit, draft, approval, and publish flows preserve backend lock/version fields.
- Reference and runtime caches refresh after publication.
- Client runtime pages display only backend-returned guarantees.
- No frontend constant duplicates backend constructor choices.

## 17. Backend Verification Status

The backend contract has been verified with the following results:

- K32 form context returns the simplified field set.
- `audiences` is a required multi-select.
- K32 no longer returns `audience` or `conditions`.
- K33 continues to return placement conditions.
- K02 returns `guarantee_ids` and no longer returns `inline_guarantees`.
- Legacy K32 audience values are normalized to `audiences`.
- Focused backend tests passed: `73/73`.
- Full backend regression passed: `277/277`.
- Production deployment and health checks passed.
# LexGo Frontend Contract: Pricing Growth, Task Periods, and Promotion Campaign Creation

**Date:** 23 October 2026  
**Audience:** LexGo web frontend  
**Backend base URL:** `https://lexgo.api.cognilabs.org`

## 1. Summary

This backend release resolves three frontend integration gaps:

1. Seller service configuration now returns the maximum additional price increase and backend-evaluated requirement progress.
2. Task list status counts now use the same filters as the visible list, including the selected period.
3. A new promotion campaign no longer asks the user to select an existing campaign.

The frontend must stop calculating pricing eligibility and must stop issuing four additional status requests for a filtered task list.

## 2. Seller Service Price Growth

### Endpoint

```http
GET /marketplace/me/services/{service_id}/configuration
Authorization: Bearer <access_token>
```

### New Top-Level Fields

```json
{
  "maximum_increase_percent": 30,
  "requirements": [
    {
      "key": "lawyer_experience",
      "current": 3,
      "required": 10,
      "unit": "year",
      "met": false,
      "progress_percent": 30
    }
  ]
}
```

The same values are also present inside `pricing_limits`, but frontend cards should use the stable top-level fields.

### maximum_increase_percent Meaning

`maximum_increase_percent` is the additional percentage by which the seller's currently allowed maximum price can increase after all unmet backend criteria are satisfied.

The backend calculates it from:

- current `maximum_price`;
- potential maximum price after unmet criteria;
- absolute service price cap;
- current seller profile and verified experience;
- active backend pricing policy.

The frontend must not calculate, modify, cap, or reinterpret this number.

Recommended copy:

```text
Talablarni bajarsangiz xizmat narxining ruxsat etilgan yuqori chegarasini yana {maximum_increase_percent}% gacha oshirishingiz mumkin.
```

Hide this growth message when `maximum_increase_percent` equals `0`.

### requirements Contract

Every item contains:

- `key`: stable criterion identifier;
- `current`: current seller value, number or object;
- `required`: backend target, number or object;
- `unit`: `year` or `mixed`;
- `met`: final backend verdict;
- `progress_percent`: integer from `0` through `100`.

Current keys:

- `lawyer_experience`
- `sector_experience`
- `seller_performance`
- `client_rating`

The frontend must tolerate additional keys in future releases.

### Rendering Rules

- Use `met` for completed/incomplete state.
- Use `progress_percent` for the progress bar.
- Never derive `met` from `current` and `required`.
- Never reproduce backend formulas in TypeScript.
- Render scalar values directly.
- Render object values as structured criterion details.
- For `required.any_of`, explain that satisfying any one alternative completes the criterion.
- Clamp only the visual progress bar defensively to `0..100`; do not alter displayed backend data.

### Example seller_performance

```json
{
  "key": "seller_performance",
  "current": {
    "wins": 20,
    "success_rate": 80,
    "total_cases": 25,
    "rating": 4.8,
    "reviews": 12
  },
  "required": {
    "any_of": [
      {"wins": 50},
      {"success_rate": 85, "total_cases": 20},
      {"rating": 5, "reviews": 20}
    ]
  },
  "unit": "mixed",
  "met": false,
  "progress_percent": 94
}
```

### Existing Pricing Fields Remain Valid

Continue using:

- `minimum_listing_price`
- `maximum_price`
- `recommended_price`
- `selected_price`
- `price_explanation`
- `maximum_listing_discount_percent`
- `negotiation_allowed`

The PATCH response from the same configuration URL returns the same new contract. Refresh the price card from the mutation response or invalidate the configuration query.

## 3. Task List Period Contract

### Endpoint

```http
GET /task-management
Authorization: Bearer <access_token>
```

### New Preferred Period Parameters

```text
date_from=2026-09-01
date_to=2026-09-30
period_field=deadline
```

Allowed `period_field` values:

- `deadline`: tasks whose deadline falls inside the period;
- `created`: tasks created inside the period;
- `completed`: tasks moved to Ready inside the period.

`date_from` and `date_to` are inclusive calendar dates in the backend task-report timezone. They must be sent together.

Example:

```http
GET /task-management?date_from=2026-09-01&date_to=2026-09-30&period_field=deadline&status=testing&limit=30&offset=0
```

### Legacy Compatibility

These parameters remain supported:

- `deadline_from`
- `deadline_to`

Do not send legacy deadline parameters together with `date_from/date_to`. The backend returns `422 period_filter_conflict`.

New frontend code should use `date_from`, `date_to`, and `period_field`.

### Response

```json
{
  "items": [],
  "total": 0,
  "limit": 30,
  "offset": 0,
  "has_more": false,
  "status_counts": {
    "new": 0,
    "in_progress": 0,
    "testing": 0,
    "ready": 0
  },
  "period": {
    "field": "deadline",
    "date_from": "2026-09-01",
    "date_to": "2026-09-30",
    "start_at": "2026-08-31T19:00:00+00:00",
    "end_at_exclusive": "2026-09-30T19:00:00+00:00",
    "timezone": "Asia/Tashkent"
  },
  "count_scope": "all_active_filters_except_status"
}
```

### status_counts Semantics

`status_counts` now applies every active list filter except `status` itself:

- period and period field;
- search query;
- assignee;
- deleted/non-deleted scope;
- legacy deadline period when used.

This allows status tabs to show all status totals for the current search/filter scope while changing the selected status.

Frontend must remove the four extra per-status requests. One list request returns all matching status totals.

### Recommended Query State

Keep these values in one query state:

```ts
type TaskPeriodField = "deadline" | "created" | "completed";

type TaskFilters = {
  status?: "new" | "in_progress" | "testing" | "ready";
  assignee_user_id?: string;
  q?: string;
  date_from?: string;
  date_to?: string;
  period_field: TaskPeriodField;
  limit: number;
  offset: number;
};
```

Reset `offset` to zero whenever search, period, assignee, or status changes.

### Error Handling

Possible structured errors:

```json
{"code":"period_field_invalid","allowed":["deadline","created","completed"]}
```

```json
{"code":"period_incomplete","message":"date_from va date_to birga yuborilishi kerak"}
```

```json
{"code":"invalid_date_range","message":"date_to date_from dan oldin bo'lishi mumkin emas"}
```

```json
{"code":"date_range_too_large","maximum_days":367}
```

```json
{"code":"period_filter_conflict","message":"date_from/date_to yoki deadline_from/deadline_to dan bittasini ishlating"}
```

## 4. Task Statistics Cards

`GET /task-management/stats` remains available for report cards.

Its metrics intentionally describe events:

- `period_tasks.total_created`: tasks created during the period;
- `period_tasks.by_current_status`: current statuses of tasks created during the period;
- `period_tasks.ready_in_period`: tasks completed during the period;
- `current_snapshot`: current all-time snapshot under the assignee filter.

For a list that must exactly match a card, call `/task-management` with the corresponding `period_field`:

- Created card detail: `period_field=created`
- Completed card detail: `period_field=completed`
- Deadline view: `period_field=deadline`

Do not label a created-period metric as a deadline-period metric.

## 5. Promotion Campaign Constructor MP09

### Change

The `Mavjud kampaniya` / `campaign_id` field has been removed from the MP09 create schema.

Load the current schema through the existing Studio form-context endpoint. Do not keep a hardcoded campaign selector.

New campaign fields are:

- `title`
- `package_ids`
- `discount_type`
- `discount_value`
- `starts_at`
- `ends_at`
- `purchase_limit`

### Create Flow

1. User clicks `Yangi aksiya`.
2. Open a blank MP09 create form.
3. Select one or more existing promotion packages through `package_ids`.
4. Enter percent or fixed discount.
5. Enter an end time, purchase limit, or both.
6. Save and submit through the normal Studio approval flow.

Do not display or send `campaign_id` during creation.

### Edit Flow

Existing campaigns are edited from the campaign list:

1. User opens a campaign row.
2. Frontend opens that Studio object's edit flow by object ID.
3. The object identity comes from the route/list row, not from an input field.

Legacy payloads containing `campaign_id` are normalized by the backend, but new frontend requests must not send it.

## 6. Required Frontend Changes

1. Read `maximum_increase_percent` directly from seller service configuration.
2. Render `requirements[]` using backend `met` and `progress_percent`.
3. Remove all local seller pricing eligibility calculations.
4. Replace task date ambiguity with an explicit `period_field` control or a fixed field appropriate to the view.
5. Use one `/task-management` request for list and status counts.
6. Remove the four status-count requests.
7. Remove `campaign_id` from MP09 create UI, form state, validation schema, and submit payload.
8. Keep existing-campaign editing in the campaign list/detail flow.

## 7. Acceptance Checklist

- Seller price card shows the backend maximum additional increase percentage.
- Every pricing criterion shows backend current, required, completion, and progress values.
- Frontend contains no duplicate pricing formula.
- Task list and sidebar status counts agree under search, assignee, and period filters.
- A September period returning zero list items also returns zero scoped status counts.
- No extra per-status API calls are issued.
- Created, completed, and deadline period views use the correct `period_field`.
- MP09 new campaign form contains no existing-campaign selector.
- MP09 submit payload contains no `campaign_id`.
- Existing campaigns can still be opened and edited from their list.

## 8. Backend Verification

- Focused regression: `84/84` tests passed.
- Full backend regression: `279/279` tests passed.
- Pricing requirements are validated to return progress values between `0` and `100`.
- Task status counts are tested against search and period filters.
- MP09 schema is tested to exclude `campaign_id`.
# LexGo Marketplace Enterprise Frontend Integration

## 1. Scope

This document describes the production frontend integration for:

- marketplace order assignment;
- seller acceptance deadline;
- protected 10% advance and 90% final payment;
- secure client–seller communication;
- order completion;
- rating and complaint window;
- warranty, replacement and refund requests;
- seller experience verification;
- subscription feature contracts and limits;
- advertising readiness;
- payment reconciliation and platform monitoring.

The backend is the source of truth for prices, percentages, deadlines, permissions, availability and transitions. The frontend must not reproduce these calculations.

## 2. Authentication and realtime

Use the normal bearer access token for every protected REST request.

Open one authenticated user socket after login:

```text
wss://lexgo.api.cognilabs.org/ws/users/me?token=<access_token>
```

Use the secure room socket only after the backend returns a room ID:

```text
wss://lexgo.api.cognilabs.org/ws/secure-chats/{room_id}?token=<access_token>
```

On socket reconnect, refetch the active order, notifications and unread counters. WebSocket events are refresh signals as well as UI events; REST remains the canonical state.

## 3. Runtime capability bootstrap

Call:

```http
GET /marketplace/runtime-capabilities
```

Use this response to enable enterprise marketplace UI. Do not hardcode commission, advance percentage, feedback window or warranty availability.

## 4. Client order flow

### 4.1 Create an order

For a selected external seller:

```http
POST /orders
Content-Type: application/json

{
  "service_id": "<service-id>",
  "package_id": null,
  "lawyer_user_id": "<external-seller-user-id>",
  "source": "marketplace",
  "details": {
    "region": "Toshkent",
    "problem": "Client-provided legal problem",
    "selected_option_ids": []
  }
}
```

If the client does not choose a seller, omit `lawyer_user_id` and keep `source=marketplace`. The backend selects a suitable external seller.

The client UI must show the backend-provided client status/message. Do not display “lawyer is being searched”. Recommended neutral state: request received and LexGo is preparing the service.

### 4.2 Order detail

```http
GET /marketplace/me/orders/{order_id}
```

Render actions from backend flags and URLs:

- `can_start_chat`
- `can_create_call`
- `can_start`
- `can_complete`
- `can_cancel`
- `can_request_cancellation`
- `actions`
- `chat_url`
- `call_create_url`
- `financials_url`
- `rating`
- `complaint`
- `warranty_url`

Never infer action permission from status alone.

### 4.3 Seller privacy before payment

Before the advance payment is confirmed:

- hide seller phone and direct contact data;
- disable secure chat and calls;
- do not expose private seller identity fields not returned by the API;
- show only the safe marketplace profile information returned by the backend.

After the backend returns `contact_unlocked=true`, enable protected communication.

## 5. Seller assignment flow

The seller receives `marketplace.assignment_received` through notifications, push/Telegram and realtime user events.

The assignment contains:

- `order_id`
- `acceptance_deadline_at`
- `response_minutes`

Display a backend-deadline countdown. Do not generate a new local 30-minute deadline.

Seller actions:

```http
POST /orders/{order_id}/accept
```

```http
POST /orders/{order_id}/decline
Content-Type: application/json

{
  "reason_code": "busy",
  "reason": "Optional explanation"
}
```

Expired assignments can return:

```json
{
  "detail": {
    "code": "assignment_response_deadline_expired",
    "acceptance_deadline_at": "..."
  }
}
```

Show a non-destructive message and refetch the order. Call-center resolves expired or declined assignments.

## 6. Payment flow

### 6.1 Advance payment

When the seller accepts, the backend creates the 10% advance payment and sends Telegram inline confirmation.

The client receives `order_accepted` with:

- `advance_payment_id`
- `advance_amount`
- `purchase_request_id`
- `telegram_inline_sent`

UI state:

1. Show “Initial payment required”.
2. Show the backend amount exactly.
3. Wait for realtime/push confirmation.
4. Refetch the order after `marketplace.advance_paid` or `order_payment_updated`.
5. Open chat/call only when `contact_unlocked=true`.

### 6.2 Financial breakdown

```http
GET /marketplace/me/orders/{order_id}/financials
```

Response sections:

- `snapshot`: immutable pricing and commission snapshot;
- `payments`: advance/final payment rows;
- `settlement`: current protected settlement state.

Clients may receive a redacted commission view. The frontend must not calculate hidden seller income.

### 6.3 Final payment

When the seller completes the service, the backend creates the remaining 90% payment request.

The client receives `marketplace_order_completed` with:

- `final_payment_id`
- `final_amount`
- `rating_deadline_at`
- `rating_url`
- `complaint_url`
- `settlement_status`

After `marketplace.final_paid`, refetch financials and order detail. The order remains `completed` or `rated`; it must not visually revert to an earlier `paid` workflow step.

## 7. Service execution

After advance payment, the seller starts work using:

```http
PATCH /orders/{order_id}/status

{
  "status": "in_progress",
  "note": "Work started"
}
```

The seller must complete required checklist items before completion. Use checklist information from the order detail.

Complete:

```http
POST /marketplace/me/orders/{order_id}/complete
Content-Type: application/json

{
  "result_text": "Completed work summary",
  "result_files": []
}
```

At least one result text or result file is required.

Important errors:

- `marketplace_advance_payment_required`: advance is not confirmed;
- `required_checklist_incomplete`: required checklist items remain;
- `marketplace_result_required`: no final result was provided;
- `marketplace_order_already_completed`: prevent duplicate completion.

## 8. Secure chat and calls

Use the `secure_chat_room_id`, `chat_url`, `call_create_url`, `calls_enabled` and `allowed_call_types` returned by order detail.

Rules:

- before payment: disabled;
- after advance payment: enabled;
- after completion: chat becomes read-only;
- active call sessions are closed when the order is completed;
- message unread counters and newest-message ordering must be updated through realtime events;
- attachment previews must use backend file metadata and authorized preview/download endpoints.

## 9. Rating and complaint

Rating and complaint are separate actions but share the same 15-minute window.

### 9.1 Rating

```http
POST /marketplace/me/orders/{order_id}/rating

{
  "rating": 1,
  "comment": "Optional feedback"
}
```

Render the rating action only when `rating.available=true`. Use `deadline_at` and `remaining_seconds` from the API.

Rating 1 or 2 automatically opens a complaint. Do not ask the client to submit the same complaint again.

### 9.2 Complaint

```http
POST /marketplace/me/orders/{order_id}/complaint

{
  "reason": "Detailed complaint reason"
}
```

Render only when `complaint.available=true`. After submission, show the complaint as pending call-center review.

Complaint creation places settlement into `complaint_hold`.

### 9.3 Closed window

If backend returns `complaint_window_closed` or `rating_window_closed`, remove both actions and show the order as fully closed.

## 10. Warranty

Client endpoint:

```http
POST /marketplace/me/orders/{order_id}/warranty

{
  "resolution": "replacement",
  "reason": "Why the delivered service must be replaced"
}
```

Supported user-facing resolutions:

- replacement by another suitable seller;
- full refund.

Call-center reviews every request. The frontend must not show an immediate successful refund/replacement before the backend resolution arrives.

## 11. Call-center pages

Call-center actions:

```http
POST /call-center/marketplace/complaints/{complaint_id}/resolve
```

```http
POST /call-center/marketplace/warranty/{claim_id}/resolve
```

```http
POST /call-center/marketplace/experience/{experience_id}/review
```

Call-center must see:

- client and seller;
- order and financial snapshot;
- payment stages;
- submitted result;
- rating/complaint reason;
- settlement state;
- complete audit history;
- replacement/refund controls allowed by backend.

## 12. Seller experience verification

Seller endpoints:

```http
GET /marketplace/me/experience
```

```http
POST /marketplace/me/experience

{
  "category_id": "<category-id>",
  "years": 8,
  "description": "Verifiable professional experience",
  "evidence": []
}
```

Every new or edited revision is pending until call-center verification. Pending revisions must not be presented as verified or used by frontend pricing explanations.

## 13. Subscription feature contract

### 13.1 User feature state

```http
GET /subscriptions/me/features
```

Feature modes:

- `unavailable`: hide or lock the action and show upgrade CTA;
- `limited`: show used/remaining limit;
- `unlimited`: allow without a counter.

Before consuming a limited feature:

```http
POST /subscriptions/me/features/{feature_key}/consume

{
  "amount": 1
}
```

The backend is the only limit authority. Never decrement counters only in local state.

### 13.2 Contract and renewal consent

```http
GET /subscriptions/{subscription_id}/contract
```

```http
POST /subscriptions/{subscription_id}/renewal-consent

{
  "accepted": true
}
```

Purchased subscriptions retain their original feature snapshot until renewal. If a newer plan version exists, show the new terms before the next payment and collect consent.

## 14. Admin subscription management

```http
GET /admin/subscription-features
POST /admin/subscription-features
POST /admin/subscription-plans/{plan_id}/versions
```

Plan editor must select registered features and configure each as unavailable, limited or unlimited. Publishing creates a new immutable version; it must not mutate existing subscriber contracts.

## 15. Review and rating administration

```http
PATCH /admin/marketplace/reviews/{review_id}
```

```http
POST /admin/marketplace/ratings/recalculate
```

Unrated sellers must be shown as “Not rated yet”, not as 5.0. Use backend `rating_status`, `rating` and `reviews_count`.

## 16. Advertising readiness

```http
GET /admin/marketplace/advertising-readiness
```

Promotion checkout must follow backend readiness. Advertising remains unavailable until backend requirements are met. Premium promotion additionally requires the seller rating threshold returned/enforced by backend.

## 17. Payments and monitoring administration

```http
GET /admin/payments/provider-readiness
GET /admin/payments/reconciliation-v2
GET /admin/monitoring/overview
GET /admin/monitoring/integrations/{integration_key}
GET /admin/monitoring/history
POST /admin/monitoring/snapshots
```

Monitoring UI should include:

- API/server health;
- CPU and RAM usage when available;
- users and request volume;
- provider state;
- reconciliation mismatches;
- recent snapshots and history.

Do not expose provider secrets, tokens or private configuration values.

## 18. Required realtime handling

Handle at least these events or notification types:

- `marketplace.assignment_received`
- `marketplace.assignment_expired`
- `marketplace.assignment_escalated`
- `order_accepted`
- `marketplace.advance_paid`
- `order_payment_updated`
- `marketplace.final_paid`
- `marketplace_order_completed`
- `marketplace.order_rated`
- `marketplace.complaint_created`
- `marketplace.additional_payment_requested`
- `notification.created`
- `notifications.unread_count`
- `notification.read`
- `notifications.read_all`

For unknown future events, keep the socket alive and trigger a safe order/notification refresh.

## 19. Frontend acceptance checklist

- No seller phone is visible before advance payment.
- Seller has a backend-driven acceptance countdown.
- Client never sees a “seller search failed” dead-end state.
- Advance and final payments are separate.
- Completing after advance payment works.
- Final payment does not revert `completed` status.
- Secure communication opens only after advance payment.
- Completed chat is read-only.
- Rating and complaint disappear after 15 minutes.
- Rating 1–2 creates one complaint only.
- Settlement hold is visible to authorized staff.
- Subscription limits come from backend.
- Plan updates do not mutate existing contracts.
- Unrated seller is not displayed as 5.0.
- Realtime reconnect performs REST resync.
- All error responses use backend `detail.code` where present.
# LexGo Studio Tariffs, Promotions, Monitoring, and Constructor Cleanup

Date: 2026-10-23

This document is the frontend integration contract for the latest backend release. It covers subscription tariff versioning, promotion discounts, realtime system monitoring, and removed Studio constructors.

## 1. General rules

- Use the authenticated API client for every admin and Studio endpoint.
- Do not hardcode constructor counts, group counts, feature keys, promotion targets, or integration states.
- Render the Studio navigation only from `GET /studio/constructors`.
- A constructor that is not returned by the catalog must not remain visible through a cached frontend menu.
- Clear the Studio catalog cache after deployment and after an administrator calls the constructor sync endpoint.
- Treat backend validation as authoritative. Display field-level errors using `detail.errors[]` or `errors[]`.
- Do not calculate subscription limits or promotion discounts in the frontend.

## 2. Studio catalog cleanup

### Catalog endpoint

`GET /studio/constructors`

The response currently contains 6 active groups and 39 active constructors. These values can change later, so use:

- `group_count`
- `constructor_count`
- `groups[]`
- `groups[].constructors[]`
- `journeys[]`

Removed constructors return `404` from their detail, schema, validation, preview, and record endpoints.

### Removed constructor codes

The frontend must remove all routes, menu items, buttons, cached schemas, and deep links for:

`CALL01`, `INT01`, `INT02`, `INT03`, `K10`, `K12-M`, `K13`, `K14`, `K20`, `K21`, `K22`, `K25`, `K27`, `MP02`, `MP03`, `MP05`, `MP06`, `MP07`, `MP08`, `SEC01`, `SEC02`, `SEC03`, `SEC04`, `SEC05`.

Their runtime business functions were not deleted. Only the unnecessary Studio configuration surfaces were removed. Existing notifications, calls, integrations, security, reviews, commissions, and other runtime workflows continue through backend code.

### Error behavior

If a stale URL opens a removed constructor and receives `404`, redirect to the Studio home page and show: “This constructor is no longer managed from Studio.”

## 3. Subscription feature registry

### List feature definitions

`GET /admin/subscription-features`

Response:

```json
{
  "items": [
    {
      "id": "uuid",
      "key": "ai.document_generation",
      "title": "AI document generation",
      "description": "...",
      "unit": "use",
      "allowed_reset_periods": ["billing_period"]
    }
  ],
  "count": 1,
  "modes": ["unavailable", "limited", "unlimited"],
  "reset_periods": ["day", "month", "billing_period", "lifetime"]
}
```

### Create a feature definition

`POST /admin/subscription-features`

```json
{
  "key": "ai.document_generation",
  "title": "AI document generation",
  "description": "Allows AI-based document generation",
  "unit": "document",
  "allowed_reset_periods": ["month", "billing_period"]
}
```

Feature keys are unique. A duplicate returns `409` with `feature_key_exists`.

## 4. K17 tariff constructor

K17 is the single Studio constructor for all subscription tariff types. Obtain its latest schema from:

- `GET /studio/constructors/K17`
- `GET /studio/constructors/K17/form-context?mode=create`
- `GET /studio/reference/subscription-features`

The form supports:

- title and description;
- tariff type and target roles;
- billing type;
- monthly, six-month, yearly, and prepaid-yearly prices;
- duration;
- entitlement list;
- trial settings;
- grace period;
- renewal notice;
- consent requirement after tariff changes;
- upgrade, downgrade, and cancellation rules;
- sales status.

### Entitlement row

```json
{
  "feature_key": "ai.document_generation",
  "mode": "limited",
  "limit": 20,
  "reset_period": "billing_period"
}
```

Rules:

- `feature_key` must exist in the backend registry.
- Feature keys cannot repeat inside one tariff.
- `mode=limited` requires a positive `limit`.
- `mode=unlimited` and `mode=unavailable` do not require a limit.
- Use only reset periods returned by the backend.

## 5. Tariff version lifecycle

Published tariff versions are immutable. Editing a published tariff means creating a new draft version.

### List versions

`GET /admin/subscription-plans/{plan_id}/versions`

Use `current_version_id` to label the active published version.

### Create draft

`POST /admin/subscription-plans/{plan_id}/drafts`

Send the complete tariff payload. A draft can be created with validation errors; the response includes:

```json
{
  "id": "version_uuid",
  "status": "draft",
  "version": 2,
  "validation": {
    "ok": false,
    "errors": []
  }
}
```

### Update draft

`PATCH /admin/subscription-plan-versions/{version_id}`

Only `draft` versions can be updated. A published or superseded version returns `409 immutable_plan_version`.

### Validate draft

`POST /admin/subscription-plan-versions/{version_id}/validate`

Disable the Publish button while `ok` is false. Map every item in `errors[]` to the relevant form field.

### Publish draft

`POST /admin/subscription-plan-versions/{version_id}/publish`

Publishing:

- marks the prior published version as `superseded`;
- makes the new version the current tariff;
- updates the runtime plan prices and sales state;
- does not rewrite existing subscribers’ current contracts immediately.

### Archive version

`POST /admin/subscription-plan-versions/{version_id}/archive`

The current published version cannot be archived. The backend returns `409 published_version_cannot_be_archived`. Publish a replacement first.

## 6. Subscriber contract and renewal consent

### Contract snapshot

`GET /subscriptions/{subscription_id}/contract`

Each subscriber keeps the tariff snapshot captured for the current billing period. A later tariff edit does not silently change that contract.

### Renewal consent

`POST /subscriptions/{subscription_id}/renewal-consent`

Use this when the backend marks the subscription as `renewal_consent_required`. After a successful renewal payment, the backend captures the latest published tariff version as the new contract.

### Current feature access

- `GET /subscriptions/me/features`
- `POST /subscriptions/me/features/{feature_key}/consume`

Never decrement counters locally. The consume endpoint is authoritative and handles reset periods and limits.

## 7. MP09 promotion constructor

MP09 now creates a new discount directly. The Create form must not show an “existing campaign” selector.

Obtain the schema and targets from:

- `GET /studio/constructors/MP09`
- `GET /studio/reference/promotion-targets`

### Form fields

- `title`
- `target_type`: `advertising` or `subscription`
- `target_ids`: multiselect from the backend reference endpoint
- `discount_type`: `percent` or `fixed`
- `discount_value`
- `starts_at`
- `ends_at`
- `usage_limit`

Example:

```json
{
  "title": "Autumn tariff discount",
  "target_type": "subscription",
  "target_ids": ["plan_uuid"],
  "discount_type": "percent",
  "discount_value": 15,
  "starts_at": "2026-10-23T00:00:00+05:00",
  "ends_at": "2026-11-01T00:00:00+05:00",
  "usage_limit": 100
}
```

Validation rules:

- at least one valid target is required;
- targets must match `target_type`;
- percentage must be within the backend limit;
- fixed discount must be positive;
- end time must be after start time;
- usage limit must be valid.

The backend applies the best currently active discount. Usage reservation is atomic and includes pending purchases, preventing parallel requests from exceeding the campaign limit.

Subscription payment metadata can contain:

- `campaign_id`
- `discount_amount`
- `amount_before_discount`

Display the backend-calculated final payment amount. Do not reproduce the discount formula in the client.

## 8. Monitoring overview

### Overview

`GET /admin/monitoring/overview`

Optional filters:

- `date_from`
- `date_to`

Main response sections:

- `system`: CPU, memory, disk, and process metrics;
- `requests`: activity count, errors, and error rate;
- `users`: active and total users;
- `integrations`: individual integration state;
- `graph`: nodes and edges for the visual map;
- `realtime`: websocket URL, connection counts, and supported events.

Render the integration diagram from `graph.nodes[]` and `graph.edges[]`. Do not hardcode the node layout or integration list.

### Integration detail

`GET /admin/monitoring/integrations/{integration_key}`

Supported integrations are returned by the overview and currently include database, Redis, OpenAI, LiveKit, OnlyOffice, Telegram, push, Payme, Click, and Atmos.

### Manual snapshot

`POST /admin/monitoring/snapshots`

Successful capture returns `201`. If another instance is collecting at the same time, `409 monitoring_collection_in_progress` is expected; keep the existing UI data and retry later.

### History

`GET /admin/monitoring/history?date_from=...&date_to=...&limit=100`

The response includes both `monitoring_snapshot` and `monitoring_incident` items plus the retention policy.

## 9. Realtime monitoring

Use the existing authenticated user websocket:

`/ws/users/me`

Handle these events:

- `monitoring.metrics`
- `monitoring.integration_changed`
- `monitoring.incident`

Recommended behavior:

1. Load the initial state from `/admin/monitoring/overview`.
2. Connect to the authenticated websocket.
3. Patch cards and graph nodes from realtime events.
4. On reconnect, reload the overview to avoid gaps.
5. Show incidents as a persistent alert until the next healthy update or administrator acknowledgement UI.

The backend collector uses a Redis lock, so multiple API instances do not create duplicate periodic snapshots.

## 10. Required frontend states

Every affected page must implement:

- loading skeleton;
- empty state;
- field-level validation state;
- `403` permission state;
- `404` removed or missing resource state;
- `409` immutable/conflict state;
- websocket reconnect indicator;
- stale-data refresh action;
- accessible labels for graph status colors.

## 11. Acceptance checklist

- Studio shows only backend-returned groups and constructors.
- Removed constructors cannot be opened from cached routes.
- K17 entitlements are selected from the backend feature registry.
- Published tariff versions are read-only.
- Existing subscribers retain their contract until renewal.
- MP09 Create has no existing campaign selector.
- Promotion targets change when target type changes.
- Final discount amount always comes from the backend.
- Monitoring graph uses backend nodes and edges.
- Realtime monitoring updates without polling.
- A websocket reconnect triggers one overview refresh.
# Studio Service Rule Versioning Fix

## Scope

This contract applies to the `K31` Studio constructor, **Service Rules**.

The backend now supports creating a new version of an existing rule without forcing the user to manually change the rule name or enter a version number.

## Load existing rules

Use:

```http
GET /studio/reference/service-rules?q=&limit=50&offset=0
Authorization: Bearer <token>
```

Each item includes:

- `id` and `value`: send this value as `existing_rule_id`;
- `title`;
- `rule_key`;
- `version`: current published version;
- `next_version`: the backend-calculated next version;
- `body`;
- `audience`;
- `scope_type`;
- `scope_id`;
- `service_id` when the scope is `service`;
- `category_id` when the scope is `category`;
- `seller_selectable`;
- `effective_at`.

## Create mode

When `creation_mode = new`:

- do not show the existing-rule selector;
- allow the user to enter a new title and rule content;
- the title must not duplicate an existing rule title;
- `version` may remain visible only as read-only/default metadata if desired.

## New-version mode

When `creation_mode = new_version`:

1. Show the existing-rule selector.
2. After selection, prefill the form from the selected reference item.
3. Show `next_version` as read-only text.
4. Do not require the user to type or modify `version`.
5. Keep the existing title by default, but allow the user to edit it.
6. Send the selected rule ID as `existing_rule_id`.

Minimum payload:

```json
{
  "creation_mode": "new_version",
  "existing_rule_id": "service-rule-uuid",
  "title": "Optional updated title",
  "body": "Updated full rule text",
  "audience": "client",
  "scope_type": "global",
  "seller_selectable": false,
  "is_active": true
}
```

Do not derive or increment `version` on the frontend. The backend always derives the current next version from the selected rule lineage and overwrites stale client values.

For a service scope, send `service_id`. For a category scope, send `category_id`.

## Validation

Use:

```http
POST /studio/constructors/K31/validate
Authorization: Bearer <token>
Content-Type: application/json
```

The response now contains `normalized_payload`. Use it as the canonical preview of what will be stored:

```json
{
  "ok": true,
  "errors": [],
  "normalized_payload": {
    "creation_mode": "new_version",
    "existing_rule_id": "service-rule-uuid",
    "rule_key": "existing-rule-lineage",
    "version": "1.1",
    "title": "Rule title"
  }
}
```

The backend inherits a blank title from the selected rule. A changed title is also accepted unless that title belongs to another rule lineage.

## Save and submit

Continue using the existing Studio endpoints:

```http
POST /studio/objects
POST /studio/objects/{object_id}/save
POST /studio/objects/{object_id}/submit
```

The backend persists the generated `rule_key`, normalized title and next version during create/save. It also repairs old drafts during submit when those generated fields are absent.

## Error handling

- `reference_not_found` on `existing_rule_id`: selected rule no longer exists; reload the selector.
- `rule_title_exists`: entered title belongs to another rule; show the conflicting-title message.
- `rule_version_duplicate`: reload reference data and revalidate. The backend normally prevents this by recalculating the next version.
- `required` on `service_id` or `category_id`: request the missing scope reference.

## Required frontend removal

Remove any client-side rule that:

- requires a new-version title to be different from the old title;
- requires a new-version title to be identical to the old title;
- manually increments the version;
- blocks save because `version` is empty in `new_version` mode.

The backend response is the source of truth for the rule lineage and version.
# Secure chat file upload — current backend contract

Endpoint:

```http
POST /secure-chats/{room_id}/messages/upload
Content-Type: multipart/form-data
```

## 1. File size

- Regular files: maximum **50 MB**.
- `.mp4` and `.mov`: maximum **200 MB**.
- The current frontend limit of 25 MB is safe, but lower than the backend limit.
- File limit exceeded: HTTP `413`, `detail = "Fayl hajmi ruxsat etilgan limitdan oshdi"`.
- The user's total workspace quota is currently 1 GB. If it is exhausted, HTTP `413` returns an object containing `message`, `quota_bytes`, `used_bytes`, `remaining_bytes`, `limit_gb`, and `incoming_size`.
- These two current `413` responses do not contain `detail.code`.

## 2. Allowed file types

Allowed extensions:

`pdf`, `doc`, `docx`, `xls`, `xlsx`, `odt`, `rtf`, `txt`, `jpg`, `jpeg`, `png`, `heic`, `webp`, `mp3`, `m4a`, `ogg`, `wav`, `webm`, `mp4`, `mov`, `zip`.

- `video/mp4` with `.mp4`: accepted.
- `video/quicktime` with `.mov`: accepted.
- `video/webm` with `.webm`: accepted, but it uses the regular 50 MB limit.
- MIME is not validated against a strict allowlist. The primary allowlist is based on the file extension.
- Blocked or unknown extension: HTTP `415`.
- Invalid PDF signature: HTTP `415`.
- Invalid ZIP: HTTP `422`.

## 3. Caption/content

- The multipart `content` value is stored as the caption.
- `filtered_content` is returned in the message response.
- Phone number, Telegram username, contact and external-link filtering is applied to the caption.
- When contact data is detected, the response has `is_blocked=true`, `block_reason`, and masked `filtered_content`.
- The UI should render `filtered_content` as the safe source of truth.

## 4. HEIC

- `.heic` is accepted and stored in its original form.
- The backend does not currently convert HEIC to JPEG.
- The backend does not currently provide a JPEG derivative in `meta.preview`.
- Current metadata may mark HEIC as `image/browser_inline`, but unsupported browsers may still fail to render it. Provide a preview fallback and download action.

## 5. Multiple files

- The endpoint accepts exactly one `file` per request.
- Each uploaded file becomes a separate chat message.
- The frontend's sequential upload queue is the correct integration.

## 6. Voice messages

- `message_type=voice` is supported.
- There is no separate backend duration limit for voice messages.
- The normal file-size limit based on the extension applies.
- The frontend's 10-minute limit is currently a frontend policy.
- `duration_ms` is not a multipart endpoint field and is not currently persisted in message metadata.

## 7. WebSocket/realtime

After the HTTP upload is committed, the backend broadcasts immediately:

- room socket event: `secure_message.created`;
- user/global socket event: `secure_chat.message_created`.

The global event payload contains `room_id`, the complete `message`, and the updated `room` object.

## Frontend conclusion

- Keep the sequential multi-file upload queue.
- Keeping 25 MB is valid. To match the backend, use 50 MB for regular files and 200 MB for `.mp4`/`.mov`.
- Add an HEIC preview fallback.
- Do not rely on `duration_ms` persistence yet.
# Marketplace Backend Contract Audit for Frontend

Date: 2026-10-24  
Audience: LexGo web frontend team  
Backend source reviewed: current `LawProject` backend

This document describes the backend contract that exists now. It also explicitly marks missing contracts. The frontend must not invent prices, refund states, revision rules, or realtime events that the backend does not currently return.

## Readiness summary

| Task | Current readiness | Frontend decision |
|---|---:|---|
| Alternative specialist or full refund | Partial | Call-center can directly reassign or start a manual refund. Client choice flow does not exist yet. |
| Transparent price explanation | Not complete | Do not calculate the final price in frontend. Current snapshot cannot explain the paid total and leaks seller financial data to clients. |
| Category-specific seller experience | Partial | Basic submission and call-center review can be integrated. File evidence, history, typed stages/results and review queue APIs are missing. |

---

# 1. Alternative specialist or full refund

## 1.1 Current call-center escalation list

```http
GET /call-center/marketplace/assignment-escalations?status=open&limit=50&offset=0
Authorization: Bearer <token>
```

Access: call-center operator permission.

Response shape:

```json
{
  "items": [
    {
      "id": "escalation-id",
      "status": "open",
      "title": "Marketplace ijrochi eskalatsiyasi: <order-id>",
      "order_id": "order-id",
      "order": {},
      "reason": "no_eligible_candidate",
      "previous_seller_user_id": "seller-user-id",
      "note": "",
      "history": [
        {
          "action": "escalated",
          "reason": "no_eligible_candidate",
          "seller_user_id": "seller-user-id",
          "note": "",
          "at": "2026-10-24T00:00:00Z"
        }
      ],
      "assignment_history": [],
      "created_at": "2026-10-24T00:00:00Z",
      "updated_at": "2026-10-24T00:00:00Z",
      "actions": ["reassign", "message", "cancel", "full_refund"]
    }
  ],
  "total": 1,
  "count": 1,
  "limit": 50,
  "offset": 0,
  "has_more": false,
  "realtime_channel": "call-center:marketplace"
}
```

## 1.2 Current resolve endpoint

```http
POST /call-center/marketplace/assignment-escalations/{escalation_id}/resolve
Authorization: Bearer <token>
Content-Type: application/json
```

Supported bodies:

### Automatically assign the next eligible external specialist

```json
{
  "action": "reassign",
  "message": "Optional operator note"
}
```

The backend chooses the next specialist. There is currently no `reassign_to` field in this endpoint.

### Send an informational message and keep the escalation open

```json
{
  "action": "message",
  "target": "client",
  "message": "Required text"
}
```

`target` values: `client`, `seller`.

### Cancel without a charged refund

```json
{
  "action": "cancel",
  "message": "Cancellation reason"
}
```

### Start a full refund request

```json
{
  "action": "full_refund",
  "message": "Refund reason"
}
```

Current response:

```json
{
  "escalation": {
    "id": "escalation-id",
    "status": "handled | open | resolved | refund_pending",
    "history": []
  },
  "order": {},
  "action": "reassign | message | cancel | full_refund",
  "previous_seller_user_id": "optional",
  "seller_user_id": "optional",
  "acceptance_deadline_at": "optional ISO datetime",
  "refund_request_id": "optional",
  "refund_status": "pending | not_charged"
}
```

Important errors:

```json
{ "detail": { "code": "callcenter_operator_required" } }
```

```json
{ "detail": { "code": "assignment_escalation_closed", "status": "resolved" } }
```

```json
{ "detail": { "code": "assignment_escalation_action_invalid", "allowed": ["reassign", "message", "cancel", "full_refund"] } }
```

```json
{ "detail": { "code": "no_eligible_marketplace_candidate", "order_id": "order-id" } }
```

## 1.3 Realtime events that exist now

Subscribe to the authenticated user WebSocket and the call-center marketplace channel where applicable.

### Escalation opened

```json
{
  "event": "marketplace.assignment_escalated",
  "escalation_id": "...",
  "order_id": "...",
  "reason": "no_eligible_candidate",
  "previous_seller_user_id": "...",
  "created_at": "ISO datetime"
}
```

### Escalation action completed

```json
{
  "event": "marketplace.assignment_escalation_resolved",
  "escalation_id": "...",
  "order_id": "...",
  "order_status": "...",
  "escalation_status": "...",
  "operator_user_id": "...",
  "action": "reassign | message | cancel | full_refund"
}
```

### New specialist assignment

```json
{
  "event": "marketplace.assignment_received",
  "order_id": "..."
}
```

### Manual refund decision

```json
{
  "event": "marketplace.refund_approved",
  "request_id": "...",
  "order_id": "...",
  "refund_type": "full",
  "amount": 100000,
  "status": "approved",
  "order_status": "cancelled"
}
```

or:

```json
{
  "event": "marketplace.refund_rejected",
  "request_id": "...",
  "order_id": "...",
  "refund_type": "full",
  "amount": 100000,
  "status": "rejected",
  "order_status": "waiting_payment"
}
```

## 1.4 What does not exist yet

The requested client-choice flow is not implemented:

- There is no operator action that sends `other specialist / full refund` as a choice card to the client.
- There is no `offer_choice` action.
- There is no client endpoint such as `POST /marketplace/me/orders/{id}/resolution`.
- Order detail does not return `resolution_offer`, `options`, `deadline_at`, or `can_choose`.
- No dedicated client-choice audit event exists.
- No normalized refund object with `pending / processing / succeeded / failed` exists in the order response.
- There is no refund-status GET endpoint.
- A refund is not executed through Payme, Click or Atmos yet.

Therefore, the frontend must not show an actionable client choice dialog until these backend additions are implemented.

## 1.5 Current refund behavior and provider state

The current `full_refund` action creates a manual `marketplace_refund_request`. Approval is performed through Telegram inline confirmation. It records approval and cancels the order, but it is not proof that money was returned by a payment provider.

Current runtime policy has `payments.provider_enabled: false`. Treat this as manual/test mode.

## 1.6 Idempotency status

The frontend does not currently send `Idempotency-Key` to the escalation resolve endpoint. The endpoint locks the escalation row and rejects many closed states with HTTP 409, but it does not provide a complete idempotency guarantee for all repeated actions. In particular, a repeated action against a `handled` escalation may still be accepted.

Frontend interim rule:

1. Disable the action button immediately after the first click.
2. Do not automatically retry a refund action.
3. On timeout, reload the escalation and order before allowing another action.
4. Treat HTTP 409 `assignment_escalation_closed` as an already-resolved state and refresh.

## 1.7 Audit data available now

- Escalation list and resolve response include `history`.
- They include `assignment_history` for specialist attempts.
- General order status audit exists at:

```http
GET /orders/{order_id}/status-history
```

There is no single unified resolution timeline endpoint yet.

## 1.8 Chat and call flags after refund

Order detail returns:

- `can_start_chat`
- `can_create_call`
- `calls_enabled`
- `allowed_call_types`
- `chat_read_only`

After an approved full refund, order status becomes `cancelled` and communication flags become false. However, while a manual refund is pending, the current order status becomes `waiting_payment`; communication can remain open if the existing payment is still marked paid. Therefore the frontend cannot rely on flags alone during `refund_pending` until this backend inconsistency is fixed.

## 1.9 Separate warranty flow that already exists

Client can create a warranty claim:

```http
POST /marketplace/me/orders/{order_id}/warranty
```

```json
{
  "kind": "no_response | sla_breach | abandoned | not_delivered | seller_restricted",
  "reason": "Required case description"
}
```

The claim contains:

```json
{
  "available_resolutions": ["replacement", "full_refund"]
}
```

Call-center resolves it directly:

```http
POST /call-center/marketplace/warranty/{claim_id}/resolve
```

```json
{
  "resolution": "replacement | full_refund | rejected",
  "seller_user_id": "Required for replacement",
  "note": "Operator note"
}
```

This is not a client choice endpoint. It is an operator decision flow.

---

# 2. Transparent marketplace price explanation

## 2.1 Current order pricing snapshot

Current direct service orders store:

```json
{
  "details": {
    "pricing_snapshot": {
      "selected_price": 879749,
      "effective_price": 879749,
      "final_price": 879749,
      "price_capped": false,
      "min_allowed": 519750,
      "max_allowed": 1039500,
      "modifiers": [
        {
          "code": "region",
          "key": "tashkent",
          "multiplier": 1.05,
          "amount": 45000
        },
        {
          "code": "lawyer_experience",
          "years": 4,
          "percent": 10,
          "amount": 94500
        }
      ]
    },
    "option_quote": {
      "base_price": 879749,
      "fixed_adjustment": 0,
      "percent_adjustment": 0,
      "percent_adjustment_amount": 0,
      "additional_amount": 0,
      "total_price": 879749,
      "currency": "UZS",
      "selected_option_ids": [],
      "breakdown": []
    }
  }
}
```

## 2.2 Critical semantic difference

`pricing_snapshot.modifiers` explains how the backend calculated the specialist's permitted/recommended ceiling. It does not explain how the client-paid `final_price` was assembled.

`option_quote.breakdown` explains only client-selected price-increasing options.

Consequently, adding `modifiers[].amount` to the final price is wrong. The frontend must not do this.

## 2.3 Modifier codes currently produced

| Current code | Meaning | Current fields |
|---|---|---|
| `region` | Region multiplier | `key`, `multiplier`, `amount` |
| `lawyer_experience` | General lawyer experience | `years`, `percent`, `amount` |
| `sector_experience` | Verified domain experience | `percent`, `amount` |
| `seller_premium` | Results/rating premium | `success_rate`, `percent`, `amount` |
| `client_rating_premium` | Client rating premium | `rating`, `reviews_count`, `percent`, `amount` |

Current code does not place `discount` or `referral` lines into this pricing snapshot. Referral currently affects platform commission, not the client service price in this direct purchase path.

## 2.4 Required target contract is missing

To render “Why this price?” without frontend calculations, backend must return an immutable final-price composition like:

```json
{
  "pricing_snapshot": {
    "version": 1,
    "created_at": "ISO datetime",
    "immutable": true,
    "currency": "UZS",
    "base_price": 850000,
    "components": [
      {
        "code": "base_price",
        "amount": 850000,
        "percent": null,
        "multiplier": null,
        "explanation": {
          "uz": "Xizmatning asosiy narxi",
          "ru": "Базовая стоимость услуги",
          "en": "Base service price"
        }
      },
      {
        "code": "selected_option",
        "amount": 29749,
        "percent": null,
        "multiplier": null,
        "explanation": {
          "uz": "Tanlangan qo‘shimcha imkoniyat",
          "ru": "Выбранная дополнительная опция",
          "en": "Selected additional option"
        }
      }
    ],
    "discounts_total": 0,
    "final_price": 879749
  }
}
```

Required invariant:

```text
base_price + sum(positive components) - sum(discount components) = final_price
```

This target contract is not implemented now. Until it exists, show the final price only. Do not present the current ceiling modifiers as paid-price components.

## 2.5 Financial snapshot and privacy

Current internal snapshot:

```json
{
  "snapshot_id": "...",
  "created_at": "ISO datetime",
  "gross_amount": 879749,
  "currency": "UZS",
  "commission": {
    "base_percent": 18,
    "referral_discount_percent": 0,
    "partner_discount_percent": 0,
    "effective_percent": 18,
    "platform_amount": 158354,
    "seller_net_amount": 721395,
    "policy_version": 1,
    "referral_count": 0
  },
  "payment": {
    "advance_percent": 10,
    "advance_amount": 87974,
    "final_percent": 90,
    "final_amount": 791775,
    "settlement_mode": "licensed_provider_split",
    "provider_enabled": false,
    "policy_version": 1
  }
}
```

Current privacy defect:

- `GET /marketplace/me/orders/{id}` returns raw `details.financial_snapshot`, including platform commission and seller net income, to the client.
- `GET /marketplace/me/orders/{id}/financials` hides only part of the seller net data and still exposes commission percentages and platform amount to the client.

Frontend must continue hiding these fields, but this is not sufficient security. Backend role-based response filtering is required.

Expected visibility:

| Field | Client | Seller | Staff |
|---|---:|---:|---:|
| `gross_amount`, currency, payment stages | Yes | Yes | Yes |
| client-facing price components | Yes | Yes | Yes |
| platform commission rate/amount | No | Yes | Yes |
| seller net amount | No | Yes | Yes |
| policy versions and reconciliation data | No | Optional | Yes |

## 2.6 Snapshot immutability and backfill

For newly created direct marketplace orders, `financial_snapshot()` is called during order creation and stored in `details_json`.

For old orders without a snapshot, the first financial read lazily creates a snapshot using the policies active at read time. This explains an old order with a new `financial_snapshot.created_at`.

Current guarantees:

- If an existing snapshot has the same `gross_amount` as the order price, it is reused.
- If the order price changes, the snapshot is recalculated using current policies.
- Old-order backfill is not historically exact unless the old policy happened to match the current one.

Therefore the backend does not currently guarantee immutable historical pricing for all legacy orders.

## 2.7 Seller view

Seller financial view currently includes:

- `commission.base_percent`
- `commission.effective_percent`
- `commission.platform_amount`
- `commission.seller_net_amount`
- referral/partner discounts
- payment stage amounts

These are valid for seller/staff UI but must not be reused in client UI.

## 2.8 Currency and precision

For marketplace service orders, use:

- `price`: integer amount in so‘m
- `currency`: normally `UZS`

Treat `price` and snapshot `*_amount` fields as whole UZS integers. `*_tiyin` fields that exist in generic models are not the primary marketplace order representation.

---

# 3. Category-specific seller experience profile

## 3.1 List current seller experience records

```http
GET /marketplace/me/experience
Authorization: Bearer <seller-token>
```

Allowed roles: `advokat`, `yurist`, `advokat_tashkiloti`.

Current response:

```json
{
  "items": [],
  "count": 0
}
```

There is no pagination, status filter or category filter currently.

## 3.2 Submit a new experience record

```http
POST /marketplace/me/experience
Authorization: Bearer <seller-token>
Content-Type: application/json
```

Current minimum accepted body:

```json
{
  "category_id": "category-id",
  "workplace": "Organization name",
  "position": "Position title",
  "started_at": "2020-01-01T00:00:00Z",
  "ended_at": null
}
```

`ended_at: null` or omitted means “currently working”. There is no separate `is_current` field.

The backend currently stores additional arbitrary keys, so this larger body is accepted but not fully validated:

```json
{
  "category_id": "category-id",
  "subcategory_id": "subcategory-id",
  "years": 4,
  "workplace": "Organization name",
  "position": "Position title",
  "started_at": "2020-01-01T00:00:00Z",
  "ended_at": null,
  "description": "Experience description",
  "evidence": [],
  "stages": ["pre_investigation", "investigation", "court"],
  "results": ["full_success", "partial_success"]
}
```

Important: `subcategory_id`, `years`, `evidence`, `stages` and `results` currently have no typed backend validation or documented enum. They must not yet be treated as a stable contract.

## 3.3 Create a revision of an existing record

There is no PATCH endpoint. Submit a new POST with `source_id`:

```json
{
  "source_id": "existing-experience-record-id",
  "category_id": "category-id",
  "workplace": "Updated organization",
  "position": "Updated position",
  "started_at": "2020-01-01T00:00:00Z",
  "ended_at": "2025-12-31T00:00:00Z"
}
```

Backend behavior:

- Creates a new record with the same `root_id`.
- Increments `version`.
- New record status becomes `pending_review`.
- Source record status becomes `superseded_pending_revision`.
- There is no cancel-pending-revision endpoint.
- There is no delete endpoint.

## 3.4 Current created record response

```json
{
  "id": "experience-record-id",
  "status": "pending_review",
  "category_id": "category-id",
  "subcategory_id": "subcategory-id",
  "workplace": "Organization name",
  "position": "Position title",
  "started_at": "2020-01-01T00:00:00Z",
  "ended_at": null,
  "description": "Experience description",
  "evidence": [],
  "root_id": "root-record-id",
  "version": 1,
  "submitted_at": "2026-10-24T00:00:00Z",
  "verified": false,
  "affects_pricing": false,
  "affects_ranking": false
}
```

After review, list items can also include:

```json
{
  "status": "approved | rejected | superseded_pending_revision",
  "verified": true,
  "affects_pricing": true,
  "affects_ranking": true,
  "checklist": [],
  "reviewed_by_user_id": "reviewer-id",
  "reviewed_at": "ISO datetime",
  "rejection_reason": "",
  "created_at": "ISO datetime",
  "updated_at": "ISO datetime"
}
```

Current GET returns all revisions as a flat list. The frontend must group by `root_id`, sort by `version`, and visually distinguish current/pending/rejected records. This grouping is an interim frontend adaptation; a dedicated history contract is still needed.

## 3.5 Current validation errors

Missing required fields:

```json
{
  "detail": {
    "code": "experience_fields_required",
    "fields": ["category_id", "workplace"]
  }
}
```

Invalid date or `ended_at < started_at`:

```json
{
  "detail": {
    "code": "experience_dates_invalid"
  }
}
```

Current backend does not return a `field` value for date errors. It does not detect date overlap, unreasonable duration, category/subcategory mismatch, or duplicate records.

## 3.6 Call-center review endpoint

```http
POST /call-center/marketplace/experience/{experience_id}/review
Authorization: Bearer <call-center-token>
Content-Type: application/json
```

Approval body:

```json
{
  "decision": "approved",
  "reason": "",
  "checklist": [
    { "key": "identity_license", "verdict": "approved", "note": "" },
    { "key": "workplace_position", "verdict": "approved", "note": "" },
    { "key": "dates_duration", "verdict": "approved", "note": "" },
    { "key": "category_relevance", "verdict": "approved", "note": "" },
    { "key": "court_investigation_evidence", "verdict": "approved", "note": "" },
    { "key": "duplicates_conflicts", "verdict": "approved", "note": "" },
    { "key": "file_authenticity", "verdict": "approved", "note": "" },
    { "key": "category_test", "verdict": "approved", "note": "" },
    { "key": "verifier_conclusion", "verdict": "approved", "note": "" }
  ]
}
```

Accepted checklist verdicts for approval: `approved`, `not_applicable`.

Rejection body:

```json
{
  "decision": "rejected",
  "reason": "Explain what must be corrected",
  "checklist": []
}
```

Approval with missing or failed checklist rows returns:

```json
{
  "detail": {
    "code": "verification_checklist_incomplete",
    "missing": ["category_test"],
    "failed": ["file_authenticity"]
  }
}
```

## 3.7 Realtime and notifications

When a seller submits experience, call-center receives:

```json
{
  "event": "marketplace.experience_submitted",
  "experience_id": "...",
  "seller_user_id": "..."
}
```

When reviewed, the seller receives a notification named:

```text
marketplace.experience_reviewed
```

Notification data:

```json
{
  "experience_id": "...",
  "decision": "approved | rejected",
  "reason": "..."
}
```

The review function does not explicitly emit a seller WebSocket event. Treat it as an in-app/push/Telegram notification and refresh the experience list when received. A guaranteed dedicated WS event is still missing.

## 3.8 Missing experience APIs and contracts

The following requested functionality is not implemented:

- Typed request and response schemas in OpenAPI.
- Category/subcategory relationship validation.
- Computed and validated `years`.
- Typed investigation/court stages and result enums.
- Multiple stage/result data model.
- Secure evidence upload endpoint.
- Evidence MIME/size rules and owner/reviewer-only download authorization.
- Call-center pending experience queue endpoint.
- Experience detail endpoint.
- Revision history endpoint.
- Cancel pending revision endpoint.
- Delete/archive endpoint.
- Side-by-side current approved vs pending revision response.
- Overlapping dates and unreasonable duration validation.
- Explicit seller WebSocket review event.

Until these are added, do not build evidence upload, full history, queue pagination, or stage/result editors against guessed payloads.

---

# 4. Frontend implementation rules

1. Use backend-provided action flags and URLs whenever they are consistent.
2. Never calculate marketplace price, commission, refund amount or seller income in frontend.
3. Do not display `details.financial_snapshot.commission` in client UI.
4. Do not show the client resolution-choice modal because no client resolution contract exists yet.
5. Call-center may use existing direct `reassign`, `message`, `cancel`, and `full_refund` actions with explicit confirmation dialogs.
6. Display “manual processing” for refunds while `payments.provider_enabled` is false.
7. For experience, implement the minimum submit/list/review flow only; label unsupported fields as blocked by backend contract.
8. Always refetch order/escalation/experience after a mutation and after the related notification/event.
9. Preserve unknown enum values using a safe fallback label instead of crashing.
10. Render server error `detail.code` and field lists where present.

# 5. Backend follow-up priority

## P0 security and financial correctness

- Remove commission and seller income from all client order responses.
- Add immutable final-price components whose sum equals `final_price`.
- Introduce provider-backed refund status and idempotency.

## P1 complete assignment-resolution flow

- Operator sends client choice offer.
- Client selects replacement or refund.
- Order exposes pending choice, choices, deadline and `can_choose`.
- Add unified timeline and realtime events.
- Close chat/calls immediately during refund processing.

## P1 complete experience contract

- Typed schemas and enums.
- Evidence upload/download security.
- Call-center review queue and detail.
- Revision history and cancel-pending-revision.
- Date overlap validation.
- Guaranteed seller WS event.
# Marketplace Backend Contract — Gaps Closed

Date: 2026-10-24  
Audience: LexGo frontend team  
Environment: production  
API base: `https://lexgo.api.cognilabs.org`

The previously reported backend contract gaps for marketplace assignment resolution, transparent pricing, and category-specific seller experience are now implemented and deployed.

The only external limitation is payment-provider execution: Payme, Click and Atmos are still disabled in production configuration. The complete refund state machine works in manual approval mode. When provider credentials are enabled, the same frontend contract remains valid.

## Production verification

- Production health: `200 OK`
- Full backend regression: `292/292 passed`
- New marketplace contract tests: `9/9 passed`
- OpenAPI contains all endpoints and typed request schemas described below.

---

# 1. Alternative specialist or full refund

## 1.1 Call-center escalation queue

```http
GET /call-center/marketplace/assignment-escalations?status=open&limit=50&offset=0
Authorization: Bearer <call-center-token>
```

Every item now contains:

```json
{
  "id": "escalation-id",
  "status": "open",
  "order_id": "order-id",
  "order": {},
  "reason": "no_eligible_candidate",
  "previous_seller_user_id": "seller-id",
  "history": [],
  "assignment_history": [],
  "resolution": {
    "offer": null,
    "refund": null,
    "can_choose": false
  },
  "actions": [
    "offer_resolution",
    "reassign",
    "message",
    "cancel",
    "full_refund"
  ]
}
```

## 1.2 Operator sends a choice to the client

```http
POST /call-center/marketplace/assignment-escalations/{escalation_id}/resolve
Authorization: Bearer <call-center-token>
Idempotency-Key: <unique-uuid>
Content-Type: application/json
```

```json
{
  "action": "offer_resolution",
  "message": "Boshqa mutaxassis yoki to‘liq qaytarishni tanlang",
  "deadline_minutes": 30
}
```

`deadline_minutes` range: `5..1440`; default: `30`.

Response contains:

```json
{
  "action": "offer_resolution",
  "resolution_offer": {
    "id": "offer-id",
    "status": "pending_client_choice",
    "options": ["reassign", "refund"],
    "deadline_at": "ISO datetime",
    "created_at": "ISO datetime",
    "created_by_operator_user_id": "operator-id",
    "message": "...",
    "selected_choice": null
  },
  "order": {},
  "escalation": {
    "id": "...",
    "status": "waiting_client_choice",
    "history": []
  }
}
```

Frontend behavior:

1. Require an operator confirmation dialog.
2. Generate one UUID for `Idempotency-Key` per user action.
3. Reuse that same key only when retrying the exact same request after a network timeout.
4. Do not generate a second key while the first request result is unknown.

## 1.3 Client sees the pending choice

```http
GET /marketplace/me/orders/{order_id}
Authorization: Bearer <client-token>
```

Relevant fields:

```json
{
  "status": "resolution_required",
  "resolution": {
    "offer": {
      "id": "offer-id",
      "status": "pending_client_choice",
      "options": ["reassign", "refund"],
      "deadline_at": "ISO datetime",
      "message": "...",
      "selected_choice": null
    },
    "refund": null,
    "can_choose": true
  },
  "can_start_chat": false,
  "can_create_call": false,
  "calls_enabled": false,
  "chat_read_only": true
}
```

Render the choice UI only when:

```ts
order.resolution?.can_choose === true
```

Use `offer.options` as the available buttons. Do not hardcode visibility independently from `can_choose`.

## 1.4 Client selects another specialist

```http
POST /marketplace/me/orders/{order_id}/resolution
Authorization: Bearer <client-token>
Idempotency-Key: <unique-uuid>
Content-Type: application/json
```

```json
{
  "choice": "reassign",
  "reason": "Optional client note"
}
```

Backend behavior:

- Excludes the previous specialist.
- Selects the best eligible external specialist.
- Returns order to `sent_to_seller` when a candidate exists.
- Creates a new 30-minute acceptance deadline.
- Sends `marketplace.assignment_received` to the new specialist.
- If no candidate exists, keeps the case under call-center attention without showing “specialist search” wording to the client.

Success response:

```json
{
  "idempotent_replay": false,
  "choice": "reassign",
  "status": "reassigned",
  "seller_user_id": "new-seller-id",
  "order": {},
  "resolution": {}
}
```

## 1.5 Client selects a full refund

```http
POST /marketplace/me/orders/{order_id}/resolution
Authorization: Bearer <client-token>
Idempotency-Key: <unique-uuid>
Content-Type: application/json
```

```json
{
  "choice": "refund",
  "reason": "Optional client note"
}
```

If no payment was charged:

```json
{
  "refund_status": "not_charged",
  "status": "cancelled"
}
```

If payment was charged:

```json
{
  "refund_request_id": "refund-id",
  "refund_status": "pending",
  "status": "refund_pending"
}
```

When refund starts:

- order status becomes `refund_pending`;
- secure chat becomes read-only;
- audio/video calls are disabled;
- duplicate active refund records are prevented;
- manual Telegram approval is requested while providers are disabled.

## 1.6 Refund status endpoint

```http
GET /marketplace/me/orders/{order_id}/refund
Authorization: Bearer <participant-or-staff-token>
```

```json
{
  "order_id": "order-id",
  "refund": {
    "request_id": "refund-id",
    "amount": 500000,
    "currency": "UZS",
    "status": "pending | processing | succeeded | failed | not_charged",
    "provider_mode": "manual",
    "provider_enabled": false,
    "created_at": "ISO datetime",
    "updated_at": "ISO datetime"
  },
  "provider_enabled": false,
  "realtime_events": [
    "marketplace.refund_processing",
    "marketplace.refund_approved",
    "marketplace.refund_rejected"
  ]
}
```

Frontend must display “Manual processing” when `provider_enabled === false`.

## 1.7 Idempotent replay

`Idempotency-Key` is required for:

- `offer_resolution`
- `reassign`
- `cancel`
- `full_refund`
- client `/resolution`

Missing header:

```json
{
  "detail": {
    "code": "idempotency_key_required",
    "header": "Idempotency-Key"
  }
}
```

Repeated request with the same key:

```json
{
  "idempotent_replay": true,
  "operation": {},
  "order": {}
}
```

Treat this as success; do not show an error toast.

## 1.8 Resolution expiry

If the client does not choose before `deadline_at`:

- offer status becomes `expired`;
- `can_choose` becomes false;
- order returns to call-center attention;
- call-center receives `marketplace.resolution_expired`.

The frontend must use backend timestamps and must not mutate order state from a local timer. A local timer may update display only; refetch at zero.

## 1.9 Unified order timeline

```http
GET /marketplace/me/orders/{order_id}/timeline
Authorization: Bearer <participant-or-staff-token>
```

```json
{
  "order_id": "order-id",
  "items": [
    {
      "id": "event-id",
      "type": "status | assignment_resolution | refund",
      "status": "...",
      "at": "ISO datetime",
      "data": {}
    }
  ],
  "count": 3,
  "resolution": {}
}
```

Client response removes internal Telegram and operator-only refund metadata.

## 1.10 Realtime events

Handle and refetch the order on:

- `marketplace.resolution_offered`
- `marketplace.resolution_selected`
- `marketplace.resolution_expired`
- `marketplace.assignment_received`
- `marketplace.assignment_escalation_resolved`
- `marketplace.refund_processing`
- `marketplace.refund_approved`
- `marketplace.refund_rejected`

---

# 2. Transparent price explanation

## 2.1 New immutable snapshot

New marketplace service/package orders return:

```json
{
  "details": {
    "pricing_snapshot": {
      "version": 1,
      "created_at": "ISO datetime",
      "immutable": true,
      "snapshot_source": "order_creation",
      "currency": "UZS",
      "base_price": 850000,
      "components": [
        {
          "code": "base_price",
          "amount": 850000,
          "percent": null,
          "multiplier": null,
          "explanation": {
            "uz": "Xizmatning asosiy narxi",
            "ru": "Базовая стоимость услуги",
            "en": "Base service price"
          }
        },
        {
          "code": "selected_option",
          "option_id": "urgent",
          "amount": 29749,
          "percent": null,
          "multiplier": null,
          "explanation": {
            "uz": "Shoshilinch bajarish",
            "ru": "Shoshilinch bajarish",
            "en": "Shoshilinch bajarish"
          }
        }
      ],
      "positive_components_total": 879749,
      "discounts_total": 0,
      "final_price": 879749,
      "selected_price": 879749,
      "price_capped": false
    }
  }
}
```

Guaranteed invariant:

```text
sum(components.amount) = final_price
```

The frontend must render the array in order and must not recalculate it.

## 2.2 Legacy orders

Old snapshots are normalized on read:

```json
{
  "snapshot_source": "legacy_backfill",
  "historical_policy_exact": false
}
```

Show a subtle “Historical calculation” label when `historical_policy_exact === false`. Do not imply that old eligibility policies were reconstructed exactly.

## 2.3 Internal eligibility modifiers

Seller/staff views may contain:

```json
{
  "seller_price_limits": {},
  "eligibility_modifiers": []
}
```

These explain seller price permissions, not the paid price. They are removed from client order details.

## 2.4 Financial privacy is enforced by backend

Client responses no longer expose:

- platform commission percentages;
- platform commission amount;
- seller net amount;
- settlement internal payload;
- financial policy versions;
- internal settlement mode.

Client financial response contains only client-safe payment information.

Seller and authorized staff can still see commission and seller net values.

## 2.5 Currency

All `amount`, `base_price`, `final_price`, `gross_amount`, `advance_amount` and `final_amount` values in this contract are integer UZS amounts in so‘m.

Use `currency` from the response. Do not use `price_tiyin` for marketplace UI.

---

# 3. Category-specific seller experience

## 3.1 Typed submission body

```http
POST /marketplace/me/experience
Authorization: Bearer <seller-token>
Content-Type: application/json
```

```json
{
  "source_id": null,
  "category_id": "root-category-id",
  "subcategory_id": "child-category-id",
  "workplace": "Organization name",
  "position": "Position title",
  "started_at": "2020-01-01T00:00:00Z",
  "ended_at": null,
  "is_current": true,
  "description": "Experience description",
  "stages": ["investigation", "first_instance"],
  "results": ["full_success"],
  "evidence_ids": ["uploaded-evidence-id"]
}
```

The backend computes `years`; frontend must not send or calculate it.

## 3.2 Stage values

- `pre_investigation`
- `investigation`
- `first_instance`
- `appeal`
- `cassation`
- `supervision`
- `enforcement`
- `advisory`
- `transactional`

Multiple values are allowed.

## 3.3 Result values

- `full_success`
- `partial_success`
- `settlement`
- `dismissed`
- `acquittal`
- `sentence_reduced`
- `claim_granted`
- `claim_partially_granted`
- `defense_success`
- `other`

Multiple values are allowed.

## 3.4 Evidence upload

```http
POST /marketplace/me/experience/evidence
Authorization: Bearer <seller-token>
Content-Type: multipart/form-data
```

Form field:

```text
file=<binary>
```

Allowed MIME types:

- `application/pdf`
- `image/jpeg`
- `image/png`
- `image/webp`
- `application/msword`
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

Maximum size: `20 MiB`.

Response:

```json
{
  "id": "evidence-id",
  "file_name": "proof.pdf",
  "mime_type": "application/pdf",
  "size": 12345,
  "download_url": "/marketplace/experience/evidence/evidence-id"
}
```

Download:

```http
GET /marketplace/experience/evidence/{evidence_id}
Authorization: Bearer <owner-or-reviewer-token>
```

Only the owner and authorized reviewers can access evidence.

## 3.5 List and grouped revisions

```http
GET /marketplace/me/experience?status=&category_id=&limit=50&offset=0
Authorization: Bearer <seller-token>
```

```json
{
  "items": [],
  "groups": [
    {
      "root_id": "root-id",
      "current": {},
      "pending_revision": {},
      "latest": {},
      "revision_count": 2
    }
  ],
  "total": 2,
  "count": 2,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

Use `groups` for profile cards and `items` for flat management tables.

## 3.6 Create a revision

Use the same POST endpoint and provide the approved record ID as `source_id`.

The approved record remains active while the new revision is pending. Only after the revision is approved does the previous version become `superseded`.

Only one pending revision is allowed per source.

Conflict:

```json
{
  "detail": {
    "code": "experience_revision_already_pending",
    "source_id": "..."
  }
}
```

## 3.7 Cancel a pending revision

```http
POST /marketplace/me/experience/{experience_id}/cancel
Authorization: Bearer <seller-token>
```

Only `pending_review` records can be cancelled.

## 3.8 Revision and review history

```http
GET /marketplace/me/experience/{experience_id}/history
Authorization: Bearer <seller-token>
```

```json
{
  "root_id": "root-id",
  "items": [],
  "reviews": [
    {
      "id": "review-id",
      "status": "approved | rejected",
      "decision": "approved | rejected",
      "reason": "",
      "checklist": [],
      "reviewed_by_user_id": "reviewer-id",
      "reviewed_at": "ISO datetime"
    }
  ],
  "count": 2
}
```

## 3.9 Call-center review queue

```http
GET /call-center/marketplace/experience?status=pending_review&seller_user_id=&category_id=&limit=50&offset=0
Authorization: Bearer <reviewer-token>
```

The queue is oldest-first.

Response includes:

```json
{
  "items": [],
  "total": 1,
  "count": 1,
  "limit": 50,
  "offset": 0,
  "has_more": false,
  "realtime_channel": "role:call_center",
  "realtime_event": "marketplace.experience_submitted"
}
```

## 3.10 Reviewer detail

```http
GET /call-center/marketplace/experience/{experience_id}
Authorization: Bearer <reviewer-token>
```

```json
{
  "record": {},
  "previous_approved_revision": {},
  "history": [],
  "reviews": [],
  "checklist_keys": []
}
```

Use this response for the side-by-side comparison UI.

## 3.11 Review request

```http
POST /call-center/marketplace/experience/{experience_id}/review
Authorization: Bearer <reviewer-token>
Content-Type: application/json
```

```json
{
  "decision": "approved",
  "reason": "",
  "checklist": [
    { "key": "identity_license", "verdict": "approved", "note": "" },
    { "key": "workplace_position", "verdict": "approved", "note": "" },
    { "key": "dates_duration", "verdict": "approved", "note": "" },
    { "key": "category_relevance", "verdict": "approved", "note": "" },
    { "key": "court_investigation_evidence", "verdict": "approved", "note": "" },
    { "key": "duplicates_conflicts", "verdict": "approved", "note": "" },
    { "key": "file_authenticity", "verdict": "approved", "note": "" },
    { "key": "category_test", "verdict": "approved", "note": "" },
    { "key": "verifier_conclusion", "verdict": "approved", "note": "" }
  ]
}
```

Accepted checklist verdicts for approval:

- `approved`
- `not_applicable`

Rejection requires a non-empty `reason`.

## 3.12 Structured validation errors

Examples:

```json
{ "detail": { "code": "experience_dates_invalid", "field": "ended_at" } }
```

```json
{ "detail": { "code": "experience_future_date", "field": "started_at" } }
```

```json
{ "detail": { "code": "experience_dates_overlap", "field": "started_at", "conflicting_experience_id": "..." } }
```

```json
{ "detail": { "code": "experience_category_invalid", "field": "category_id" } }
```

```json
{ "detail": { "code": "experience_subcategory_invalid", "field": "subcategory_id" } }
```

```json
{ "detail": { "code": "experience_stage_invalid", "field": "stages", "values": [], "allowed": [] } }
```

```json
{ "detail": { "code": "experience_result_invalid", "field": "results", "values": [], "allowed": [] } }
```

## 3.13 Experience realtime events

Call-center:

- `marketplace.experience_submitted`
- `marketplace.experience_queue_updated`

Seller:

- `marketplace.experience_reviewed`

On every event, refetch the relevant list/detail endpoint.

## 3.14 Pricing integration

Only approved category experience affects marketplace sector-experience pricing and ranking eligibility. Pending, rejected, cancelled and superseded records do not affect pricing.

---

# 4. Frontend completion checklist

- Add operator “Offer client a choice” action.
- Add client resolution card driven by `resolution.can_choose`.
- Send `Idempotency-Key` for every resolution mutation.
- Add refund status card and manual-provider label.
- Refetch order on all resolution/refund WS events.
- Render `pricing_snapshot.components` without calculations.
- Remove any client-side commission/net-income handling.
- Add typed seller experience form.
- Upload evidence first, then submit returned `evidence_ids`.
- Add grouped revision UI and cancel-pending action.
- Add call-center queue, detail comparison and checklist review.
- Handle every structured `detail.code` near the corresponding field.
# LexGo Backend Answers: Monitoring, Marketplace Complaints, Warranty, Categories and Experience

Date: 2026-10-24  
Environment checked: current backend source and production OpenAPI at `https://lexgo.api.cognilabs.org/openapi.json`

This document distinguishes the contract that is already implemented from backend gaps. The frontend must not invent missing fields or calculate financial values locally.

## 1. Monitoring history and platform KPI

### Existing monitoring endpoints

#### `GET /admin/monitoring/overview`

Available query parameters:

- `date_from`: optional ISO datetime
- `date_to`: optional ISO datetime

The default interval is the last 15 minutes. The response contains:

- `from`, `to`
- `system`: process/server metrics
- `requests.activity_events`
- `requests.errors`
- `requests.error_rate_percent`
- `users.active`
- `users.total`
- `integrations[]`
- `graph`
- `realtime.ws_url`
- `realtime.events`

This endpoint is operational monitoring, not commercial KPI reporting.

#### `GET /admin/monitoring/history`

Currently accepted query parameters:

- `date_from`: optional ISO datetime
- `date_to`: optional ISO datetime
- `limit`: `1..1000`, default `100`

Current response:

```json
{
  "items": [
    {
      "id": "...",
      "type": "monitoring_snapshot | monitoring_incident",
      "status": "...",
      "title": "...",
      "created_at": "..."
    }
  ],
  "count": 1,
  "retention": {
    "snapshots_days": 30,
    "incidents_years": 3,
    "user_request_stats_months": 12
  }
}
```

### Backend gaps in monitoring history

- `offset` or cursor pagination is not implemented.
- A `type=snapshot|incident` filter is not implemented.
- `count` is only the number of returned rows, not a complete pagination `total`.
- A monitoring-history Excel export endpoint is not implemented.
- A background export job for monitoring history is not implemented.

The frontend must not display working pagination, type filtering or background export for this endpoint until the backend adds them.

### Existing KPI endpoints

#### `GET /analytics/ceo`

This endpoint currently returns aggregate values such as:

- `revenue`
- `mrr`
- `gmv`
- `arr`
- `users`
- `active_users`
- `mau`, `dau`
- `conversion_pct`
- `funnel[]`
- `channels[]`
- `revenue_trend[]`
- `arpu`, `ltv`, `take_rate`
- new client/advocate/lawyer counts

Important limitation: this endpoint currently has no period query parameters. Its `mrr` is also currently populated from aggregate paid revenue rather than a strict monthly recurring-revenue calculation. Therefore it must not yet be treated as the canonical period-based KPI contract.

#### `GET /admin/dashboard`

Accepted filters:

- `region`
- `date_from`: date
- `date_to`: date

It provides period-filtered totals for users, orders, cases, leads, payments, tasks, reviews and related dashboard data. It is not a dedicated KPI time-series API.

#### `GET /analytics/ceo/export.xlsx`

Accepted filters:

- `date_from`: date
- `date_to`: date

This is a synchronous Excel download. It is not a background job.

### Frontend decision

- Use `/admin/monitoring/overview` for infrastructure and integration health.
- Use `/admin/monitoring/history` only as a limited recent-history list.
- Use `/admin/dashboard` for date-filtered operational totals.
- Use `/analytics/ceo` only for the currently returned top-level CEO cards, while treating the period and strict MRR semantics as a backend gap.

## 2. Marketplace complaint and settlement hold

### Marketplace complaint creation

`POST /marketplace/me/orders/{order_id}/complaint`

Current client body:

```json
{
  "reason": "Detailed complaint reason"
}
```

`description` is also accepted as a fallback. The reason must contain at least five characters.

The backend creates a complaint and holds the order settlement.

### Marketplace complaint resolution

`POST /call-center/marketplace/complaints/{complaint_id}/resolve`

Current body:

```json
{
  "action": "valid_rework | valid_refund | invalid | resolved",
  "note": "Operator conclusion"
}
```

Current effects:

- `valid_rework`
  - complaint status becomes `rework_required`
  - settlement status becomes `rework_hold`
  - order status becomes `in_progress`
- `valid_refund`
  - complaint status becomes `refund_required`
  - settlement status becomes `refund_required`
  - order status becomes `refund_pending`
- `invalid`
  - complaint status becomes `rejected`
  - settlement status becomes `ready_for_release`
- `resolved`
  - complaint status becomes `resolved`
  - settlement status becomes `ready_for_release`

### Backend gaps in complaint resolution

The endpoint is still declared as an untyped generic object in OpenAPI. The following are not implemented in this contract:

- separate partial and full refund decisions
- `refund_amount`
- structured evidence IDs or attachments
- typed resolution enum/schema in OpenAPI
- a dedicated paginated `GET /call-center/marketplace/complaints` queue

Do not send invented fields for partial refund or evidence yet.

### Difference from quality complaint resolution

`POST /call-center/quality-complaints/{complaint_id}/resolve` is the generic document and urgent-service quality workflow. It accepts:

```json
{
  "action": "rework_required | rejected | resolved",
  "note": "Operator conclusion"
}
```

It reopens document or urgent-service work and supports free rework. It does not implement marketplace settlement/refund handling.

For a marketplace order complaint, use:

`POST /call-center/marketplace/complaints/{complaint_id}/resolve`

Do not use the generic quality endpoint for a marketplace order.

### Settlement visibility

Existing endpoint:

`GET /marketplace/me/orders/{order_id}/financials`

It returns:

- `order_id`
- `snapshot`
- `payments[]`
- `settlement` for non-client authorized viewers

Current access rules allow:

- the order client
- the assigned seller
- direct `admin`, `manager` or `call_center` roles

Known backend access gap: a staff user who only receives a custom role/permission such as `callcenter.access`, but whose direct user role is not one of the roles above, can receive `404`.

Known admin-detail gap: `GET /admin/marketplace/orders/{order_id}` currently returns order, purchase requests and activity, but does not include settlement data.

The frontend cannot obtain a reliable settlement view for every permitted staff role until one of these backend gaps is fixed.

## 3. Warranty claims

### Client creation endpoint

`POST /marketplace/me/orders/{order_id}/warranty`

Current body:

```json
{
  "kind": "no_response | sla_breach | abandoned | not_delivered | seller_restricted",
  "reason": "Why the warranty is requested"
}
```

The client does not send `resolution`. The backend sets available resolutions to:

- `replacement`
- `full_refund`

Therefore `{kind, resolution, reason}` is not the current creation contract. Use `{kind, reason}` only.

### Call-center resolution endpoint

`POST /call-center/marketplace/warranty/{claim_id}/resolve`

Current body examples:

Replacement:

```json
{
  "resolution": "replacement",
  "seller_user_id": "NEW-SELLER-USER-ID",
  "note": "Operator note"
}
```

Full refund:

```json
{
  "resolution": "full_refund",
  "note": "Operator note"
}
```

Rejection:

```json
{
  "resolution": "rejected",
  "note": "Operator note"
}
```

### Backend gap

There is currently no `GET /call-center/marketplace/warranty` list endpoint. The call-center cannot build a proper warranty queue from a dedicated backend contract yet.

## 4. Category and subcategory IDs

### Current production behaviour

`GET /service-categories` returns category objects with IDs. However, its `subcategories[]` values are currently virtual groups derived from service metadata strings. They contain fields such as:

```json
{
  "title": "Subcategory title",
  "services_count": 1,
  "sample_services": []
}
```

They do not contain a true subcategory ID.

`GET /marketplace/service-categories` also groups services by metadata subcategory title and does not provide subcategory IDs. In the checked production state it currently returns an empty array because no matching active professional-service catalogue entries are returned.

The experience API validates `subcategory_id` as a real `ServiceCategory` row whose `parent_id` equals the selected root category ID. The current public catalogue responses do not provide those IDs, and the checked category data has root categories with `parent_id: null`.

### Backend gap

There is no usable public source of real subcategory IDs for the experience form at present. The frontend must not send a service ID or subcategory title in `subcategory_id`.

Until backend category-tree data is corrected, omit optional `subcategory_id`. A proper public tree endpoint must eventually return recursive nodes with at least:

```json
{
  "id": "CATEGORY-OR-SUBCATEGORY-ID",
  "parent_id": "PARENT-ID-OR-NULL",
  "title": "...",
  "children": []
}
```

## 5. Public lawyer profile privacy

### Current state

`GET /lawyers` still uses `LawyerProfileOut`. As a result:

- `verification_status` is returned publicly.
- `license_number` is returned as an empty string.
- `education` is returned as an empty string.
- other private-profile keys are also present as empty strings.

The sensitive values are blanked, but the keys are not removed from the JSON response.

Another marketplace lawyer detail serializer already removes fields including phone, licence, education and internal verification status, but `/lawyers` does not use that safe public DTO.

### Backend gap

These fields have not yet been completely removed from the public `/lawyers` serializer. The frontend must not rely on `verification_status`. A future safe contract should expose a public boolean/badge such as `is_verified` or `lexgo_verified`, without exposing internal verification workflow status.

## 6. Confirmed contracts

### Assignment escalation actions

Confirmed. Each item from:

`GET /call-center/marketplace/assignment-escalations`

now includes:

```json
{
  "actions": [
    "offer_resolution",
    "reassign",
    "message",
    "cancel",
    "full_refund"
  ]
}
```

`offer_resolution` is therefore available in the live backend contract.

### Seller experience grouping

Confirmed. `GET /marketplace/me/experience` returns:

```json
{
  "items": [],
  "groups": [
    {
      "root_id": "...",
      "current": {},
      "pending_revision": {},
      "latest": {},
      "revision_count": 2
    }
  ],
  "total": 0,
  "count": 0,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

Meanings:

- `current`: currently approved revision
- `pending_revision`: revision waiting for review
- `latest`: latest revision regardless of status
- `revision_count`: total number of versions in the group

### Experience review permission

`GET /call-center/marketplace/experience` and related detail/review endpoints currently allow:

- direct role `call_center`
- direct role `admin`
- direct role `manager`
- or permission `approvals.manage`

`callcenter.access` alone is not sufficient for this experience-review queue.

### Experience queue filters and paging

`GET /call-center/marketplace/experience`

Supported query parameters:

- `status`, default `pending_review`
- `seller_user_id`
- `category_id`
- `limit`, `1..200`, default `50`
- `offset`, default `0`

The response includes `items`, `total`, `count`, `limit`, `offset`, `has_more`, `realtime_channel` and `realtime_event`.

## Frontend implementation summary

Safe to integrate now:

- monitoring overview
- limited monitoring history
- current CEO/dashboard responses with the limitations above
- marketplace complaint creation
- marketplace complaint resolution using the four existing actions
- warranty creation using `{kind, reason}`
- warranty resolution by known claim ID
- assignment escalation `offer_resolution`
- grouped seller experience revisions
- experience review queue for the documented roles/permission

Do not implement as working features yet:

- monitoring history pagination/type filter/background export
- partial marketplace complaint refund
- complaint evidence payload
- dedicated marketplace complaint queue
- dedicated warranty queue
- experience subcategory selection from the current metadata-based `subcategories[]`
- public display of internal `verification_status`
- settlement access for permission-only staff accounts
# LexGo Frontend Contract: Monitoring and Marketplace Gaps Closed

Date: 2026-10-24  
Audience: Web frontend team  
Environment: Production  
API base URL: `https://lexgo.api.cognilabs.org`

All backend gaps listed in the 2026-10-24 frontend handoff are implemented and deployed. OpenAPI is available at `/openapi.json`.

## 1. Monitoring history

### Paginated history

```http
GET /admin/monitoring/history
Authorization: Bearer <token>
```

Query parameters:

- `date_from`: optional ISO datetime.
- `date_to`: optional ISO datetime.
- `type`: optional `snapshot` or `incident`.
- `limit`: `1..1000`, default `100`.
- `offset`: integer `>= 0`, default `0`.

Example:

```http
GET /admin/monitoring/history?type=incident&date_from=2026-10-01T00:00:00Z&date_to=2026-10-24T23:59:59Z&limit=50&offset=0
```

Response:

```json
{
  "items": [
    {
      "id": "record-id",
      "type": "incident",
      "status": "active",
      "title": "API error-rate incident",
      "created_at": "2026-10-24T08:00:00Z",
      "updated_at": "2026-10-24T08:01:00Z"
    }
  ],
  "total": 1073,
  "count": 50,
  "limit": 50,
  "offset": 0,
  "has_more": true,
  "filters": {
    "type": "incident",
    "date_from": "2026-10-01T00:00:00Z",
    "date_to": "2026-10-24T23:59:59Z"
  },
  "retention": {
    "snapshots_days": 30,
    "incidents_years": 3,
    "user_request_stats_months": 12
  }
}
```

Use `total`, `limit`, `offset`, and `has_more` as the only pagination source. A date range where `date_from > date_to` returns `422` with `detail.code = monitoring_date_range_invalid`.

### Background Excel export

Create a job:

```http
POST /admin/monitoring/history/exports
Authorization: Bearer <token>
Content-Type: application/json

{
  "date_from": "2026-10-01T00:00:00Z",
  "date_to": "2026-10-24T23:59:59Z",
  "type": "snapshot"
}
```

The response status is `202`:

```json
{
  "id": "job-id",
  "status": "queued",
  "filters": {},
  "progress_percent": 0,
  "rows_count": 0,
  "error": "",
  "created_at": "2026-10-24T08:00:00Z",
  "started_at": null,
  "completed_at": null,
  "expires_at": null,
  "download_url": null
}
```

Read status:

```http
GET /admin/monitoring/history/exports/{job_id}
```

Possible statuses are `queued`, `running`, `completed`, and `failed`. When completed, `progress_percent` is `100` and `download_url` is populated.

Download:

```http
GET /admin/monitoring/history/exports/{job_id}/download
```

The file is a real XLSX workbook. Export files expire after 24 hours. Handle:

- `409 monitoring_export_not_ready`;
- `410 monitoring_export_expired`;
- `404 monitoring_export_not_found` or `monitoring_export_file_missing`.

The backend emits `monitoring.export_completed` through the user's realtime channel and notification system.

## 2. CEO KPI by period

```http
GET /analytics/ceo?date_from=2026-10-01&date_to=2026-10-24&timezone=Asia/Tashkent
Authorization: Bearer <token>
```

Important rules:

- `date_from` and `date_to` are inclusive local calendar dates.
- `timezone` defaults to `Asia/Tashkent`.
- `period_revenue` is paid revenue inside the selected period.
- `gmv` is marketplace/service gross paid volume inside the selected period.
- `mrr` is normalized monthly recurring subscription revenue, not total paid revenue.
- yearly, quarterly, and other billing periods are normalized to one month using the immutable subscription contract snapshot.
- active subscriptions are calculated as of the selected period end.

Relevant response fields:

```json
{
  "period": {
    "date_from": "2026-10-01",
    "date_to": "2026-10-24",
    "timezone": "Asia/Tashkent",
    "start_at": "2026-09-30T19:00:00Z",
    "end_at_exclusive": "2026-10-24T19:00:00Z"
  },
  "period_revenue": 12000000,
  "all_time_revenue": 98000000,
  "gmv": 8500000,
  "mrr": 4300000,
  "arr": 51600000,
  "active_subscriptions": 42,
  "new_subscriptions": 8,
  "cancelled_subscriptions": 2,
  "orders_created": 75,
  "orders_paid": 61,
  "active_users_period": 310,
  "dau": 74,
  "mau": 590
}
```

Do not calculate MRR on the frontend.

## 3. Marketplace complaint queue

### List

```http
GET /call-center/marketplace/complaints?status=new&client_user_id=&seller_user_id=&date_from=&date_to=&limit=50&offset=0
Authorization: Bearer <call-center-token>
```

Access is allowed for direct call-center/admin/manager roles and permission-based staff with `callcenter.access`, `approvals.manage`, or `orders.manage`.

Response:

```json
{
  "items": [
    {
      "id": "complaint-id",
      "status": "new",
      "reason": "The result is incomplete",
      "rating": 1,
      "order": {
        "id": "order-id",
        "status": "completed",
        "payment_status": "paid",
        "price": 500000,
        "currency": "UZS"
      },
      "client": {
        "id": "client-id",
        "lexgo_id": "LGC-...",
        "name": "Client",
        "phone": "+998..."
      },
      "seller": {
        "id": "seller-id",
        "lexgo_id": "LGA-...",
        "name": "Seller",
        "phone": "+998..."
      },
      "evidence": [],
      "settlement": {
        "status": "complaint_hold",
        "gross_amount": 500000,
        "held_amount": 500000,
        "refunded_amount": 0,
        "pending_refund_amount": 0,
        "currency": "UZS"
      },
      "available_actions": [
        "valid_rework",
        "partial_refund",
        "full_refund",
        "invalid",
        "resolved"
      ]
    }
  ],
  "total": 1,
  "count": 1,
  "limit": 50,
  "offset": 0,
  "has_more": false,
  "realtime": {
    "channel": "role:call_center",
    "events": ["marketplace.complaint_created", "marketplace.complaint_resolved"]
  }
}
```

### Upload evidence

```http
POST /call-center/marketplace/complaints/{complaint_id}/evidence
Content-Type: multipart/form-data

file=<binary>
visibility=parties
```

`visibility` can be `staff` or `parties`. Maximum size is 25 MB. Allowed MIME types:

- `application/pdf`;
- `image/jpeg`, `image/png`, `image/webp`;
- `application/msword`;
- `application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
- `video/mp4`, `video/quicktime`, `video/webm`.

The response contains an `id`; send selected IDs in `evidence_ids` during resolution. Download using the returned `download_url`.

### Resolve

```http
POST /call-center/marketplace/complaints/{complaint_id}/resolve
Authorization: Bearer <call-center-token>
Content-Type: application/json
```

Typed body:

```json
{
  "action": "partial_refund",
  "refund_amount": 150000,
  "note": "Part of the service was not delivered",
  "evidence_ids": ["evidence-id"]
}
```

`action` enum:

- `valid_rework`: complaint is valid and seller must redo the work;
- `partial_refund`: requires positive `refund_amount` not exceeding the refundable paid balance;
- `full_refund`: backend calculates the full refundable paid balance;
- `invalid`: complaint is rejected and settlement can be released;
- `resolved`: issue was resolved without refund and settlement can be released.

`valid_refund` remains accepted only as a backward-compatible alias of `full_refund`.

Resulting order behavior:

- `valid_rework` -> order `in_progress`, settlement `rework_hold`;
- partial/full refund -> order `refund_pending`, settlement `refund_required`;
- invalid/resolved -> settlement `ready_for_release`.

Repeated submission of the same completed resolution returns `idempotent_replay: true`. A conflicting second resolution returns `409 marketplace_complaint_already_resolved`.

For marketplace complaints, use this endpoint. Do not use `/call-center/quality-complaints/{id}/resolve`; that endpoint belongs to the older generic quality workflow.

## 4. Settlement visibility

### Order financials

```http
GET /marketplace/me/orders/{order_id}/financials
```

Access is available to:

- the client who owns the order;
- the assigned seller;
- admin, manager, and call-center roles;
- permission-based staff with `callcenter.access`, `payments.manage`, `refunds.manage`, or `orders.manage`.

Client responses exclude commission, platform income, seller net income, policy version, and settlement mode. Staff/seller responses may include those private financial fields.

### Admin order detail

```http
GET /admin/marketplace/orders/{order_id}
```

The response now includes:

```json
{
  "order": {},
  "settlement": {
    "id": "settlement-id",
    "status": "complaint_hold",
    "gross_amount": 500000,
    "held_amount": 500000,
    "refunded_amount": 0,
    "pending_refund_amount": 0,
    "released_amount": 0,
    "releasable_amount": 0,
    "platform_amount": 75000,
    "seller_net_amount": 425000,
    "currency": "UZS",
    "hold_reason": "complaint",
    "complaint_id": "complaint-id"
  },
  "purchase_requests": [],
  "activity": []
}
```

## 5. Warranty queue

### Client opens a warranty claim

```http
POST /marketplace/me/orders/{order_id}/warranty
Content-Type: application/json

{
  "kind": "no_response",
  "reason": "The seller did not respond"
}
```

`kind` enum:

- `no_response`;
- `sla_breach`;
- `abandoned`;
- `not_delivered`;
- `seller_restricted`.

Only one open claim per order is allowed. A duplicate returns `409 warranty_already_open`.

### Call-center queue

```http
GET /call-center/marketplace/warranty?status=new&kind=no_response&client_user_id=&seller_user_id=&date_from=&date_to=&limit=50&offset=0
```

Each item includes the claim, order, client, seller, `available_resolutions`, settlement, timestamps, and current resolution. Use `total/count/limit/offset/has_more` for pagination.

Detail:

```http
GET /call-center/marketplace/warranty/{claim_id}
```

Resolve:

```http
POST /call-center/marketplace/warranty/{claim_id}/resolve
Content-Type: application/json

{
  "resolution": "replacement",
  "seller_user_id": "new-seller-id",
  "note": "Replacement approved"
}
```

`resolution` enum:

- `replacement`: `seller_user_id` is required and must differ from the current seller;
- `full_refund`: creates/reuses the full refund flow;
- `rejected`.

Realtime events:

- `marketplace.warranty_created` on `role:call_center`;
- `marketplace.warranty_resolved` for client and seller channels.

## 6. Public category tree with real IDs

Use this endpoint for all category/subcategory selects:

```http
GET /service-categories/tree
```

Response:

```json
[
  {
    "id": "root-category-id",
    "parent_id": null,
    "slug": "family-law",
    "title": "Oila va nikoh",
    "children": [
      {
        "id": "real-subcategory-id",
        "parent_id": "root-category-id",
        "slug": "family-law-divorce",
        "title": "Nikohni bekor qilish",
        "children": []
      }
    ]
  }
]
```

Every node has a real persistent `id`. Send the selected child ID as `subcategory_id` in marketplace experience forms. Do not derive IDs from titles and do not use the old metadata-only `subcategories[]` text values.

For backward compatibility, `/service-categories` and `/marketplace/service-categories` also include child IDs, but the recursive tree endpoint is the preferred source.

## 7. Public lawyer privacy

```http
GET /lawyers
```

Public items no longer contain:

- `verification_status`;
- `license_number`;
- `education`;
- phone number or other private verification details.

Use only:

```json
{
  "is_verified": true
}
```

as the public LexGo verification badge. Frontend must not infer verification from any former internal field.

## 8. Realtime and refresh rules

- Use realtime events to invalidate or update the relevant cached entity.
- After receiving an event, fetch only the affected detail or the current page; do not refetch every queue globally.
- Queue screens must retain current filters and offset after realtime refresh.
- Refund execution remains in manual provider mode while Click, Payme, and Atmos credentials are disabled. The frontend contract does not change when providers are enabled.

## 9. Production verification completed

- Full backend regression: `295/295` passed.
- Production targeted contract tests: `14/14` passed.
- Production health: `200 OK`.
- Production authenticated smoke tests: monitoring history, CEO analytics, complaints queue, and warranty queue all returned `200`.
- Production category tree has persistent root and child IDs.
- Production public lawyer payloads contain none of the removed private fields.
- Background monitoring export produced a valid XLSX file and completed successfully.
# Promotion banner AI localization

## Seller banner upload

Use `POST /promotions/banner-assets` as `multipart/form-data`:

- `file`: required image file.
- `language`: current frontend locale; send `uz`, `ru`, or `en`. Default is `uz`.

The backend now guarantees that `vision_validation.message`, `vision_validation.reasons[]`, and `vision_validation.suggestions[]` are fully returned in the requested language. Raw OpenAI text is never exposed. `vision_validation.reason_codes[]` contains stable technical codes and must not be shown as user-facing text.

For promotion checkout, also send `language` in `POST /promotions/checkout` so remote-image validation uses the same locale.

Invalid locale returns HTTP 422 with `detail.code = promotion_language_invalid`.

## Banner rendering

Read banners from `GET /promotions/active?placement=banner`. Render the returned `image_url` directly. Active uploaded assets now use:

`GET /promotions/assets/{asset_id}/file`

This file endpoint is public only while the asset belongs to a currently active, non-expired promotion. It returns the real image MIME type and an inline response.

## Frontend requirements

- Always pass the current application locale on upload and checkout.
- Render only the localized `message`, `reasons`, and `suggestions` returned by the backend.
- Do not append previous hardcoded validation text or translate `reason_codes` on the client.
- Refresh `GET /promotions/active` after a successful promotion activation.

Demo Advokat 1 (`+998 90 100 20 01`) already has the supplied image active in the banner placement.
🔔 Backend contract: subscription usage limits

Obuna limiti tugaganda quyidagi javob qaytadi:

• HTTP status: 402 Payment Required
• detail.code: feature_limit_exhausted
• Bir xil kontrakt ishlatiladi:
  - document_constructor
  - ai_document_analysis

Example response:
{
  "detail": {
    "code": "feature_limit_exhausted",
    "feature_key": "ai_document_analysis",
    "mode": "limited",
    "allowed": false,
    "limit": 5,
    "used": 5,
    "remaining": 0,
    "unit": "document",
    "resets_at": "2026-11-24T00:00:00+00:00"
  }
}

Frontend handling:
HTTP 402 + detail.code === "feature_limit_exhausted" bo‘lsa, foydalanuvchini tarif tanlash sahifasiga yo‘naltiring.

Additional 402 cases:
• active_subscription_required — faol obuna mavjud emas
• feature_not_in_plan — funksiya joriy tarifga kiritilmagan
• ai_subscription_required — umumiy AI limiti tugagan

Frontend ushbu code qiymatlarini alohida handling qilishi kerak.
# LexGo Remote Assistance Frontend Integration Contract

Date: 2026-10-26  
Backend status: deployed to production  
API base URL: `https://lexgo.api.cognilabs.org`

## 1. Outcome

LexGo now supports consent-based remote assistance during an active client and call-center support call.

The operator can guide the client or perform explicitly consented actions inside the LexGo interface only. This is not operating-system remote desktop access. The backend does not expose or permit raw DOM access, CSS selectors, arbitrary JavaScript, external navigation, clipboard access, device control, passwords, OTP codes, bank-card details, electronic signatures, identity secrets, or final payment confirmation by an operator.

The frontend must implement a semantic UI control layer based on stable `page_id`, `component_id`, allowed actions, UI revision, explicit scopes, and command acknowledgements.

## 2. Mandatory prerequisites

A remote-assistance session can start only when all conditions below are true:

1. A support ticket exists and is open.
2. The support ticket is claimed by the current call-center operator.
3. An active support audio/video call exists for the same ticket, client, and operator.
4. The operator has the required remote-assistance permissions.
5. The operator has 2FA configured.
6. The client explicitly accepts the requested mode and scopes on the same browser/app device session.

The session is automatically terminated or revoked when the support call ends, the ticket closes, the ticket transfers to another operator, the session expires, or the client device session changes.

## 3. Security model

The frontend must preserve these invariants:

- Never send raw DOM, HTML, screenshots, form values, cookies, access tokens, selectors, scripts, clipboard data, uploaded files, or hidden component values in `client-state`.
- The page manifest contains component identity and state only.
- Secret inputs must never be registered as controllable components.
- Mark personal fields as `sensitivity: "personal"`.
- Mark passwords, OTP, PIN, CVV, card, bank, e-signature, biometric, passport, identity, token, and secret fields as `sensitivity: "secret"`, or omit them entirely.
- A client must always see an active-assistance banner, operator identity, active mode, countdown, pause button, and stop/revoke button.
- Client pause, revoke, and end controls must remain available above modals and route transitions.
- Payment confirmation, agreement acceptance, identity confirmation, OTP, electronic signature, and destructive final submission must always be performed by the client.
- The operator UI must never offer an arbitrary URL, arbitrary selector, JavaScript, click-coordinate, keyboard, OS, camera, microphone, filesystem, or device-control command.
- Do not log WebSocket URLs containing access tokens.

Backend-reported security flags are available from `GET /remote-assistance/meta` and must be treated as authoritative.

## 4. Modes

### `guide`

The operator can navigate within registered LexGo client routes, highlight components, show tooltips, scroll, and open the editor/highlight editor content. The operator cannot fill or modify forms.

### `control`

Includes guide actions and allows focus, form value changes, select changes, toggles, modal opening, and step navigation. Personal fields require the separate `personal_form_fill` scope.

### `prepare`

Includes control actions and allows draft preparation or presentation of a pending action. `draft.prepare` and `confirmation.present` always require explicit client confirmation. The operator must never finalize payments or sensitive legal actions.

## 5. Permissions

Backend permission codes:

- `remote_assist.request`
- `remote_assist.guide`
- `remote_assist.control`
- `remote_assist.prepare_actions`
- `remote_assist.view_audit`
- `remote_assist.supervise`
- `remote_assist.emergency_revoke`

Call-center operators receive operational permissions. Admin/manager/superadmin users can supervise and emergency-revoke sessions. Render UI controls from the `capabilities` returned by the backend, not from hardcoded role names.

## 6. Read the runtime contract first

### Request

```http
GET /remote-assistance/meta
Authorization: Bearer <access_token>
```

### Important response fields

```json
{
  "contract_version": "1.0",
  "consent_version": "1.0",
  "modes": [
    {"key": "guide", "scopes": []},
    {"key": "control", "scopes": []},
    {"key": "prepare", "scopes": []}
  ],
  "actions": [
    {
      "action_id": "element.highlight",
      "scope": "highlight",
      "modes": ["control", "guide", "prepare"],
      "component_required": true,
      "requires_client_confirmation": false
    }
  ],
  "session": {
    "max_minutes": 30,
    "idle_pause_seconds": 90,
    "command_ttl_seconds": 20
  },
  "security": {
    "raw_dom": false,
    "arbitrary_javascript": false,
    "external_navigation": false,
    "device_control": false,
    "sensitive_values_shared": false,
    "final_payment_by_operator": false
  },
  "capabilities": {
    "request": true,
    "guide": true,
    "control": true,
    "prepare": true,
    "supervise": false,
    "emergency_revoke": false
  }
}
```

Do not duplicate mode/action definitions in frontend source code. Load this metadata once after authentication and cache it for the session.

## 7. Operator flow

### Step 1: use the support-ticket action

The support-ticket response contains `actions.remote_assistance_url`. The operator must first start or join the ticket's existing support audio/video call.

### Step 2: request client consent

```http
POST /call-center/support/tickets/{ticket_id}/remote-assist/sessions
Authorization: Bearer <operator_access_token>
Content-Type: application/json
```

```json
{
  "call_id": "uuid-of-active-support-call",
  "mode": "control",
  "requested_scopes": [
    "view_page_context",
    "highlight",
    "navigate",
    "scroll",
    "tooltip",
    "focus",
    "form_fill",
    "form_select",
    "form_toggle",
    "open_modal",
    "step_navigation",
    "personal_form_fill"
  ],
  "reason": "Help the client complete a subscription form",
  "duration_minutes": 20
}
```

Response status is `201`. The initial session status is `pending_consent`.

The request is idempotent for the same active ticket, call, operator, and mode. If an incompatible active session exists, backend returns `409 remote_assist_session_already_active`.

### Step 3: wait for consent

Subscribe to the remote-assistance WebSocket immediately after creating the session. Disable all command controls until `status === "active"` and `capabilities.can_command === true`.

### Step 4: render the semantic client mirror

The operator panel receives:

- current client page and route;
- monotonic `client_ui_revision`;
- visible registered components;
- component labels;
- allowed actions per component;
- normal/personal/secret sensitivity;
- coarse states such as ready, filled, selected, invalid, disabled, or hidden.

Do not attempt to reproduce pixels or inspect the client's DOM. Render a structured panel grouped by page section/component.

### Step 5: send commands

```http
POST /remote-assistance/sessions/{session_id}/commands
Authorization: Bearer <operator_access_token>
Content-Type: application/json
```

```json
{
  "idempotency_key": "client-profile-name-20261026-0001",
  "action_id": "form.set_value",
  "page_id": "client.profile",
  "component_id": "profile.full_name",
  "payload": {"value": "Ali Valiyev"},
  "expected_ui_revision": 14
}
```

Every user interaction must use a unique stable `idempotency_key`. Retry the same request with the same key after a network timeout. Do not generate a new key for the same intended command.

If the client page or revision changed, backend returns `409 remote_assist_ui_revision_conflict`. Refresh the session state and require the operator to choose the action again.

## 8. Client consent flow

### Pending requests

```http
GET /remote-assistance/sessions/pending?limit=20&offset=0
Authorization: Bearer <client_access_token>
```

Response uses standard pagination:

```json
{
  "items": [],
  "count": 0,
  "limit": 20,
  "offset": 0
}
```

`count` is the total number of pending consent requests, not the current page size.

Also react to the in-app/push notification type `remote_assist.requested` and the realtime event with the same name.

### Consent modal requirements

The modal must show:

- operator name and LexGo identity;
- support-ticket context;
- mode description;
- exact requested scope list in human-readable language;
- expiration/countdown;
- clear statement that LexGo-only actions are allowed;
- clear statement that passwords, OTP, cards, e-signatures, files, device controls, and external pages are not shared;
- Accept and Deny actions;
- a separate toggle for each optional requested scope;
- a prominent notice that consent can be paused or revoked at any time.

### Accept

```http
POST /remote-assistance/sessions/{session_id}/consent
Authorization: Bearer <client_access_token>
Content-Type: application/json
```

```json
{
  "decision": "accept",
  "mode": "control",
  "granted_scopes": [
    "view_page_context",
    "highlight",
    "navigate",
    "form_fill"
  ],
  "device_session_id": "stable-random-id-for-current-app-runtime",
  "consent_version": "1.0"
}
```

### Deny

Use the same endpoint with `decision: "deny"`. Keep the mode, consent version, and device session ID. After denial the session is terminal.

### Device session ID

Generate a cryptographically random identifier at app/browser runtime and keep it stable while the same authenticated runtime remains active. Do not use hardware identifiers, advertising IDs, phone numbers, tokens, or fingerprints. A changed device session ID automatically revokes access.

## 9. Client UI registry and state publishing

Every remotely assistable client page must declare a stable page definition. Example:

```ts
const remoteAssistPage = {
  pageId: "client.profile",
  route: "/profile",
  elements: [
    {
      componentId: "profile.full_name",
      label: "Full name",
      actions: ["element.highlight", "element.focus", "form.set_value"],
      sensitivity: "personal"
    },
    {
      componentId: "profile.region",
      label: "Region",
      actions: ["element.highlight", "form.select_option"],
      sensitivity: "normal"
    }
  ]
};
```

Never register OTP, password, card, PIN, electronic-signature, identity document, token, or security settings as controllable elements.

Publish state after consent, route changes, modal/step changes, meaningful element-state changes, and command execution. Increment `ui_revision` monotonically for every published state.

```http
POST /remote-assistance/sessions/{session_id}/client-state
Authorization: Bearer <client_access_token>
Content-Type: application/json
```

```json
{
  "device_session_id": "stable-runtime-id",
  "page_id": "client.profile",
  "route": "/profile",
  "ui_revision": 14,
  "elements": [
    {
      "component_id": "profile.full_name",
      "label": "Full name",
      "actions": ["element.highlight", "element.focus", "form.set_value"],
      "sensitivity": "personal",
      "state": "filled"
    },
    {
      "component_id": "profile.region",
      "label": "Region",
      "actions": ["element.highlight", "form.select_option"],
      "sensitivity": "normal",
      "state": "selected"
    }
  ]
}
```

Allowed states are `empty`, `filled`, `invalid`, `disabled`, `selected`, `unselected`, `loading`, `ready`, and `hidden`.

The state payload must never contain the actual field value.

## 10. Command registry and frontend execution

The backend runtime metadata is authoritative. Current actions:

| Action | Frontend behavior |
|---|---|
| `route.navigate` | Navigate only to the backend-approved LexGo route in `payload.route` |
| `element.highlight` | Animate/highlight the registered component |
| `element.tooltip` | Show operator-provided explanatory text near the registered component |
| `page.scroll_to` | Scroll the registered component into view |
| `element.focus` | Focus a non-secret registered control |
| `form.set_value` | Set a permitted field and dispatch the framework's normal change/input events |
| `form.select_option` | Select a permitted option through the normal form state manager |
| `form.toggle` | Toggle a permitted switch/checkbox through the normal form state manager |
| `modal.open` | Open a registered LexGo modal, never an arbitrary modal ID |
| `step.next` | Advance the registered wizard after local validation |
| `step.back` | Return to the previous registered wizard step |
| `draft.prepare` | Prepare data but show a client confirmation UI before applying/finalizing |
| `confirmation.present` | Present the final summary/action to the client for confirmation |
| `editor.open` | Open the registered LexGo editor context |
| `editor.highlight` | Highlight registered editor content/section without exposing raw document secrets |

The client must reject a command locally if the component is no longer mounted, disabled, no longer permits the action, or local validation fails. Send the rejection through the command acknowledgement contract.

## 11. Command acknowledgement

After receiving and attempting a command, the client must acknowledge it exactly once. HTTP fallback:

```http
POST /remote-assistance/sessions/{session_id}/commands/{command_id}/ack
Authorization: Bearer <client_access_token>
Content-Type: application/json
```

```json
{
  "device_session_id": "stable-runtime-id",
  "status": "executed",
  "failure_code": "",
  "result": {"applied": true}
}
```

Allowed statuses:

- `executed`
- `rejected`
- `confirmation_required`
- `confirmed`
- `cancelled`

For confirmation-required actions:

1. Receive the command with `requires_confirmation: true`.
2. Present the client confirmation UI.
3. Send `confirmation_required` if the confirmation UI is displayed.
4. Send `confirmed` only after the client explicitly confirms.
5. Send `cancelled` if the client declines.

Do not include secrets, field values, DOM, files, or tokens in `result`.

## 12. WebSocket contract

### Connect

```text
wss://lexgo.api.cognilabs.org/ws/remote-assistance/{session_id}?token=<access_token>
```

The backend also accepts an Authorization header where the platform permits custom WebSocket headers. Browser clients should use the query token and must not log the URL.

### First server message

```json
{
  "event": "remote_assist.connected",
  "session": {},
  "created_at": "ISO-8601"
}
```

### Client-to-server events

#### Heartbeat

```json
{"event": "ping"}
```

Send every 20-30 seconds while the assistance UI is mounted. Backend replies with `pong`.

#### State update

```json
{
  "event": "client.state",
  "payload": {
    "device_session_id": "stable-runtime-id",
    "page_id": "client.profile",
    "route": "/profile",
    "ui_revision": 15,
    "elements": []
  }
}
```

#### Command acknowledgement

```json
{
  "event": "command.ack",
  "payload": {
    "command_id": "command-uuid",
    "device_session_id": "stable-runtime-id",
    "status": "executed",
    "failure_code": "",
    "result": {"applied": true}
  }
}
```

### Server-to-client events

- `remote_assist.connected`
- `remote_assist.requested`
- `remote_assist.consent_granted`
- `remote_assist.consent_denied`
- `remote_assist.client_state`
- `remote_assist.command_requested`
- `remote_assist.command_executed`
- `remote_assist.command_rejected`
- `remote_assist.command_confirmation_required`
- `remote_assist.command_confirmed`
- `remote_assist.command_cancelled`
- `remote_assist.paused`
- `remote_assist.resumed`
- `remote_assist.revoked`
- `remote_assist.ended`
- `remote_assist.expired`
- `error`
- `pong`

On reconnect:

1. Fetch `GET /remote-assistance/sessions/{session_id}`.
2. Reopen the WebSocket.
3. Fetch pending command history if required.
4. Publish a new client state with a higher UI revision.
5. Never replay an already acknowledged command.

## 13. Session lifecycle endpoints

```http
GET  /remote-assistance/sessions/{session_id}
POST /remote-assistance/sessions/{session_id}/pause
POST /remote-assistance/sessions/{session_id}/resume
POST /remote-assistance/sessions/{session_id}/revoke
POST /remote-assistance/sessions/{session_id}/end
```

Pause/revoke/end bodies accept:

```json
{"reason": "Client requested a pause"}
```

Only the client can pause or resume. The client can revoke at any time. A session participant can end it. Supervisors use the emergency-revoke endpoint.

Session statuses:

- `pending_consent`
- `active`
- `paused`
- `denied`
- `revoked`
- `ended`
- `expired`

Terminal states are `denied`, `revoked`, `ended`, and `expired`.

## 14. Session response contract

Important fields:

```json
{
  "id": "session-uuid",
  "ticket_id": "ticket-uuid",
  "call_id": "call-uuid",
  "client": {"id": "", "name": "", "lexgo_id": "", "role": "client"},
  "operator": {"id": "", "name": "", "lexgo_id": "", "role": "call_center"},
  "mode": "control",
  "status": "active",
  "reason": "",
  "requested_scopes": [],
  "granted_scopes": [],
  "current_page_id": "client.profile",
  "current_route": "/profile",
  "client_ui_revision": 14,
  "manifest": [],
  "consent_version": "1.0",
  "expires_at": "ISO-8601",
  "last_client_seen_at": "ISO-8601",
  "last_operator_seen_at": "ISO-8601",
  "paused_at": null,
  "revoked_at": null,
  "ended_at": null,
  "end_reason": "",
  "lock_version": 4,
  "ws_url": "/ws/remote-assistance/{session_id}",
  "capabilities": {
    "can_consent": false,
    "can_pause": true,
    "can_resume": false,
    "can_revoke": true,
    "can_command": false,
    "can_end": true
  }
}
```

Use `capabilities` for buttons. Do not reconstruct permissions from status and role.

## 15. Command history and audit

### Commands

```http
GET /remote-assistance/sessions/{session_id}/commands?status=&limit=50&offset=0
```

### Audit trail

```http
GET /remote-assistance/sessions/{session_id}/audit?limit=100&offset=0
```

The audit response is chronological and includes actor, event type, safe metadata, timestamp, `previous_hash`, and `event_hash`. Display this as a timeline. Never alter or recompute audit content in the frontend.

## 16. Supervisor/admin UI

### Sessions

```http
GET /admin/remote-assistance/sessions?status=&operator_user_id=&client_user_id=&ticket_id=&limit=50&offset=0
```

### Monitoring

```http
GET /admin/remote-assistance/monitoring
```

Response includes active, pending-consent, paused, today's total, today's rejected-command count, and active session summaries.

### Emergency revoke

```http
POST /admin/remote-assistance/sessions/{session_id}/emergency-revoke
Content-Type: application/json
```

```json
{"reason": "Security incident"}
```

Require a confirmation modal and mandatory reason before calling this endpoint.

## 17. Required UI placement

### Call-center support ticket/call screen

- Add `Remote assistance` next to active support call controls.
- Hide/disable it when the ticket is not claimed by the operator or the support call is not active.
- Use the metadata endpoint to show available modes.
- Show pending consent, active, paused, and ended states.
- Render client page/component mirror and action controls only after consent.
- Show audit and command history tabs.

### Client web/mobile screen

- Global listener for `remote_assist.requested`.
- Consent sheet/modal visible above the current route.
- Persistent active-assistance banner.
- Operator identity and countdown.
- Pause, resume, stop access, and end controls.
- Strong visual indication around an operator-focused/highlighted component.
- Confirmation sheets for prepare/final actions.
- Clear terminal-state message after revoke/end/expiry.

### Admin screen

- Monitoring counters.
- Filterable session table.
- Session detail with audit timeline.
- Emergency revoke with required reason.

## 18. Route restrictions

Only registered LexGo client route families are allowed, including client portal/dashboard, marketplace, documents, subscription/pricing, support, messages, my works/documents, and profile routes.

Admin, call-center, authentication, payments, identity, security, internal, external, protocol-relative, and malformed routes are blocked by the backend. The client router must also reject a route not present in its own remote-assistance route registry.

## 19. Error handling

Use `detail.code` as the stable frontend discriminator.

Important codes:

| HTTP | Code | Frontend action |
|---|---|---|
| 428 | `remote_assist_two_factor_required` | Open operator 2FA setup; do not retry automatically |
| 403 | `remote_assist_permission_required` | Hide unavailable action and show access error |
| 403 | `remote_assist_assigned_operator_required` | Refresh ticket ownership |
| 409 | `remote_assist_session_already_active` | Open existing session using returned `session_id` |
| 409 | `remote_assist_consent_not_pending` | Refresh session |
| 409 | `remote_assist_ui_revision_conflict` | Refresh state; operator must retry intentionally |
| 409 | `remote_assist_ui_revision_stale` | Increment and republish client UI revision |
| 409 | `remote_assist_device_session_mismatch` | Stop UI immediately; access has been revoked |
| 403 | `remote_assist_secret_component_blocked` | Remove component from registry and report security telemetry |
| 403 | `remote_assist_personal_scope_required` | Ask client for a new properly scoped session; do not broaden silently |
| 403 | `remote_assist_sensitive_payload_blocked` | Remove forbidden data from the command; never bypass |
| 403 | `remote_assist_sensitive_route_blocked` | Do not navigate |
| 410 | `remote_assist_session_expired` | Close active UI and show expired state |
| 410 | `remote_assist_command_expired` | Do not execute; refresh command state |
| 429 | `remote_assist_rate_limit` | Respect `retry_after_seconds` |
| 413 | `remote_assist_command_too_large` | Reduce safe payload size |

Validation errors also return precise remote-assistance codes for invalid mode, scope, action, component, route, payload depth/type/size, consent version, pause/resume state, and WebSocket event.

## 20. Frontend command executor requirements

Implement one centralized executor, not command logic scattered across pages.

The executor must:

1. Verify active session and current device session.
2. Verify command sequence/idempotency has not already been processed.
3. Verify page ID and expected UI revision.
4. Resolve only through the registered component map.
5. Verify the component still permits the action.
6. Reject secret or unavailable components locally.
7. Execute through the page's public state/action adapter, never direct DOM mutation.
8. Run normal frontend validation and state updates.
9. Publish the next UI revision.
10. Send acknowledgement.
11. Store only command ID/status temporarily; do not persist command payloads containing personal values.

## 21. Suggested frontend interfaces

```ts
type RemoteAssistSensitivity = "normal" | "personal" | "secret";

type RemoteAssistElementAdapter = {
  componentId: string;
  label: string;
  sensitivity: RemoteAssistSensitivity;
  allowedActions: string[];
  getState: () => "empty" | "filled" | "invalid" | "disabled" | "selected" | "unselected" | "loading" | "ready" | "hidden";
  execute: (actionId: string, payload: Record<string, unknown>) => Promise<{ status: "executed" | "rejected" | "confirmation_required"; failureCode?: string }>;
};

type RemoteAssistPageAdapter = {
  pageId: string;
  route: string;
  getElements: () => RemoteAssistElementAdapter[];
};
```

Create page adapters for the workflows where support operators are expected to help first: subscription selection, marketplace service selection, document request, urgent lawyer request, profile basics, support, my works, and my documents.

## 22. Mobile implementation notes

- Use the same backend contract and semantic registry.
- Generate one stable runtime device-session ID per authenticated app session.
- Keep the active-assistance indicator in the root navigation shell.
- Route commands through navigation/state controllers, never view-coordinate taps.
- Suspend command execution when the app goes to background; send a pause or let backend inactivity pause the session.
- Republish page state after foregrounding.
- Do not expose native device controls, notification shade, other apps, filesystem, contacts, photos, or OS settings.

## 23. Acceptance checklist

- Operator without 2FA cannot request assistance.
- Operator cannot request assistance for another operator's ticket.
- Request fails without an active linked support call.
- Client sees the exact requested mode/scopes before consent.
- Client can deny, pause, resume, revoke, and end.
- Operator cannot send commands before consent or while paused.
- Guide mode cannot modify form values.
- Personal form control works only with `personal_form_fill` consent.
- Secret fields can never be controlled.
- External, admin, payment, identity, and security routes cannot be opened.
- Client state contains no raw field values.
- Stale UI revision rejects the command.
- Duplicate idempotency key returns the original command.
- Every command is acknowledged and shown in history.
- Confirmation-required actions cannot complete without client confirmation.
- Ticket transfer, ticket close, call end, expiry, or device change terminates access.
- Reconnect does not replay executed commands.
- Admin can monitor and emergency-revoke.
- Audit history displays actor, action, result metadata, and timestamps.
- Web and mobile clients implement the same security boundaries.

## 24. Deployment verification completed by backend

- Production health endpoint: `200`.
- Remote Assistance metadata endpoint: `200`.
- Runtime contract: 3 modes and 15 registered semantic actions.
- Remote Assistance API integration tests on server: `4/4 passed`.
- Full backend regression before final patch: `312/312 passed`.
- Admin dashboard live API regression: `200`.
- Production logs after deployment: no new error/traceback/500 entries.

The frontend can integrate this contract immediately. No frontend-side calculation or guessed permission/status logic is required.
# LexGo frontend contract: complaint rework, promotions, advertising activation, document settings, and remote assistance

Date: 2026-10-26  
Backend status: deployed to production and verified

## 1. Marketplace complaint rework

### Resolve endpoint

`POST /call-center/marketplace/complaints/{complaint_id}/resolve`

For a valid complaint that requires the seller to redo the work:

```json
{
  "action": "valid_rework",
  "note": "The fourth section must be completed",
  "evidence_ids": []
}
```

The backend performs the following transaction:

- order status becomes `in_progress`;
- settlement status becomes `rework_hold`;
- the original result is preserved in `details.rework_history`;
- a new rework deadline is created;
- the secure chat becomes active again;
- calls and chat follow the normal active-order permissions;
- the old rating and complaint windows are disabled;
- both parties receive persistent notifications;
- realtime events are sent to the client, seller, and call-center channels.

### Realtime event

Listen on the existing authenticated user socket `/ws/users/me`.

Event name:

`marketplace.complaint_resolved`

Payload:

```json
{
  "event": "marketplace.complaint_resolved",
  "complaint_id": "uuid",
  "order_id": "uuid",
  "work_id": "ADV-...",
  "service_title": "Service title",
  "resolution": "valid_rework",
  "resolution_note": "The fourth section must be completed",
  "resolved_at": "2026-10-26T09:30:00Z",
  "complaint_status": "rework_required",
  "order_status": "in_progress",
  "settlement_status": "rework_hold",
  "rework_deadline_at": "2026-10-27T09:30:00Z"
}
```

The same event is emitted to:

- `user:{client_user_id}`;
- `user:{seller_user_id}`;
- `role:call_center`.

On receipt, refresh the affected order in both list and detail views.

### Persistent notifications

The backend creates in-app, push, and Telegram notification rows for the client and seller. The notification metadata event is:

`marketplace_complaint_resolved`

For `valid_rework`, use the backend-provided notification title/body. The default title is `Ish qayta ochildi`.

### Order list and detail contract

Both endpoints expose the same `complaint` object:

- `GET /marketplace/me/orders`
- `GET /marketplace/me/orders/{order_id}`

```json
{
  "complaint": {
    "available": false,
    "deadline_at": null,
    "submitted": true,
    "complaint_id": "uuid",
    "active_complaint_id": "uuid",
    "latest_resolved_complaint_id": null,
    "url": null,
    "status": "rework_required",
    "resolution": "valid_rework",
    "resolution_note": "The fourth section must be completed",
    "resolved_at": "2026-10-26T09:30:00Z",
    "resolved_by_user_id": "uuid",
    "refund_amount": 0,
    "rework_required": true,
    "rework_iteration": 1,
    "rework_deadline_at": "2026-10-27T09:30:00Z"
  }
}
```

UI rules:

- show the `Qayta bajarishda` badge when `complaint.rework_required === true`;
- show the call-center note from `complaint.resolution_note`;
- use `complaint.rework_deadline_at` for the rework countdown;
- use `order.status`, `actions`, `chat_read_only`, `calls_enabled`, and `calls_allowed` as the source of truth;
- do not infer rework from settlement alone.

### Seller completes the rework

Use the existing endpoint:

`POST /marketplace/orders/{order_id}/complete-v2`

The seller must still satisfy the service checklist. A result text or result file is required.

After successful re-completion:

- order status becomes `completed`;
- settlement becomes `held` for the new feedback window;
- the previous complaint becomes `resolved` and stays in history;
- a fresh 15-minute rating window opens;
- a fresh 15-minute complaint window opens;
- the old complaint no longer blocks a new complaint;
- secure chat becomes read-only and calls close again.

The order `complaint` object keeps the previous ruling through `latest_resolved_complaint_id`, while:

- `available` becomes `true` during the new 15-minute window;
- `submitted` becomes `false` until the client submits another complaint;
- `url` contains the new complaint submission endpoint.

Completion realtime event:

`marketplace.order_completed`

Important fields include `rework_completed`, `rework_iteration`, `settlement_status`, `rating_deadline_at`, and `complaint_deadline_at`.

## 2. Studio MP09 promotions

### Runtime fields on Studio records

`GET /studio/constructors/MP09/records`

Each promotion record now includes runtime data:

```json
{
  "runtime_status": "scheduled | active | paused | expired | exhausted",
  "used_count": 37,
  "usage_limit": 100,
  "remaining": 63,
  "paused_at": null,
  "paused_by_user_id": null,
  "pause_reason": ""
}
```

`used_count` counts only purchases whose payment is confirmed as `paid`. Do not count pending or rejected requests on the frontend.

The record also exposes action URLs:

```json
{
  "actions": {
    "pause": "/admin/promotion-campaigns/{campaign_id}/pause",
    "resume": "/admin/promotion-campaigns/{campaign_id}/resume"
  }
}
```

### Pause and resume

`POST /admin/promotion-campaigns/{campaign_id}/pause`

```json
{
  "reason": "Temporary operational pause"
}
```

`POST /admin/promotion-campaigns/{campaign_id}/resume`

```json
{
  "reason": "Campaign continues"
}
```

Both operations are idempotent and audited. A reason of at least three characters is required.

Errors:

- `404 detail.code=promotion_campaign_not_found`;
- `422 detail.code=promotion_pause_reason_required`;
- `422 detail.code=promotion_resume_reason_required`.

Realtime admin events:

- `promotion.campaign_paused`;
- `promotion.campaign_resumed`.

### Subscription plan quote

Use this endpoint before showing a subscription checkout price:

`GET /subscription-plans/{plan_id}/quote?billing_period=monthly`

Allowed billing periods:

- `monthly`;
- `six_month`;
- `yearly`;
- `prepaid_yearly`.

Response:

```json
{
  "plan_id": "uuid",
  "plan_slug": "client-standard",
  "billing_period": "monthly",
  "months": 1,
  "base_amount": 99000,
  "discount_amount": 30000,
  "amount": 69000,
  "currency": "UZS",
  "campaign": {
    "id": "campaign-id",
    "title": "Autumn discount",
    "discount_type": "fixed",
    "discount_value": 30000,
    "ends_at": "2026-11-01T00:00:00Z"
  }
}
```

When no campaign applies, `discount_amount` is `0` and `campaign` is `null`.

The same `pricing` breakdown is returned by:

- `POST /subscription-plans/{plan_id}/purchase`;
- `POST /subscription-plans/{plan_id}/telegram-purchase-request`.

The backend stores the campaign and immutable price breakdown in payment/request metadata. The frontend must display backend amounts and must not recalculate discounts.

### MP09 backend preview

`POST /studio/constructors/MP09/preview`

In addition to normal Studio validation/diff data, the response contains:

```json
{
  "targets": [
    {
      "id": "uuid",
      "label": "Plan or advertising product",
      "base_price": 149000,
      "discount_amount": 29800,
      "final_price": 119200,
      "currency": "UZS"
    }
  ],
  "warnings": []
}
```

Possible warnings include:

- `target_not_found:{id}`;
- `target_type_invalid`;
- `final_price_zero:{id}`.

Always render backend `targets`; do not calculate the preview price in the browser.

## 3. Marketplace advertising activation

### Readiness

`GET /admin/marketplace/advertising-readiness`

Relevant response fields:

```json
{
  "ready": false,
  "mode": "test | active | paused",
  "activation_id": null,
  "activated_at": null,
  "activated_by": null,
  "paused_at": null,
  "reason": "",
  "clients": {
    "current": 104,
    "required": 500,
    "met": false,
    "excluded_nonproduction": 10
  },
  "rated_verified_sellers": {
    "current": 26,
    "required": 50,
    "met": false,
    "excluded_nonproduction": 4
  },
  "checkout_enabled": false
}
```

Demo, fixture, deleted-test, inactive, unverified, and unrated records are excluded from readiness counts.

### Activate

`POST /admin/marketplace/advertising-activation`

```json
{
  "reason": "Production advertising approved"
}
```

If readiness criteria are not met:

- HTTP `409`;
- `detail.code=marketplace_advertising_readiness_required`;
- `detail.readiness` contains the current readiness response.

Successful activation is audited and emits:

`marketplace.advertising_mode_changed`

### Pause

`POST /admin/marketplace/advertising-pause`

```json
{
  "reason": "Operational pause"
}
```

### Seller checkout gate

All promotion checkout entry points are blocked unless advertising mode is `active` and readiness remains valid.

In test/paused mode:

- HTTP `409`;
- `detail.code=marketplace_advertising_not_active`;
- `detail.mode` is `test` or `paused`.

When readiness later falls below production criteria:

- HTTP `409`;
- `detail.code=marketplace_advertising_not_ready`.

## 4. Document service settings

### Admin endpoints

- `GET /admin/document-service-settings`;
- `POST /admin/document-service-settings`;
- `POST /admin/document-service-settings/{settings_id}/publish`;
- `POST /admin/document-service-settings/{settings_id}/rollback`.

The admin GET response contains the authoritative JSON Schema in `contract`. Build the form from this schema or keep the frontend types synchronized with it.

### Payload contract

```json
{
  "allowed_formats": ["pdf", "doc", "docx"],
  "max_file_mb": 25,
  "included_pages": 10,
  "page_pricing": [
    {
      "min_pages": 11,
      "max_pages": 20,
      "amount": 150000
    }
  ],
  "extra_page_price": 15000,
  "modes": ["manual", "lawyer", "review", "analysis"],
  "plan_requirements": {
    "required": false,
    "plan_ids": [],
    "entitlement": "",
    "per_mode": {
      "analysis": {
        "required": true,
        "plan_ids": ["plan-id"],
        "entitlement": "ai_document_analysis"
      }
    }
  },
  "review_policy": {
    "enabled": true,
    "reviewer_type": "advokat",
    "sla_minutes": 1440
  },
  "download_policy": {
    "plan_required": false,
    "plan_ids": [],
    "entitlement": "",
    "formats": ["pdf", "docx"],
    "watermark": true
  },
  "currency": "UZS"
}
```

Allowed `reviewer_type` values:

- `lawyer`;
- `advokat`;
- `yurist`;
- `operator`;
- `admin`;
- `any`.

The backend also normalizes legacy aliases such as `call_center` to `operator` and `attorney` to `lawyer`.

### Runtime endpoint

`GET /document-service-settings/runtime`

The endpoint is public for the settings contract. When an Authorization header is supplied, it also returns per-mode access decisions:

```json
{
  "settings": {},
  "version": 2,
  "settings_id": "uuid",
  "access": {
    "manual": {
      "allowed": true,
      "mode": "manual",
      "rule": {}
    },
    "analysis": {
      "allowed": false,
      "code": "document_plan_not_allowed",
      "mode": "analysis",
      "plan_id": "uuid",
      "rule": {}
    }
  },
  "contract": {
    "plan_requirements": {},
    "review_policy": {},
    "download_policy": {}
  },
  "immutable_order_snapshot_required": true
}
```

Possible access codes:

- `document_mode_disabled`;
- `document_subscription_required`;
- `document_plan_not_allowed`;
- `document_entitlement_required`;
- `document_download_format_disabled`.

The backend now enforces these policies in manual requests, lawyer review, AI text/file analysis, analysis quotes, clean-source downloads, DOCX downloads, and PDF downloads. Frontend visibility must follow `access`, but backend enforcement remains authoritative.

## 5. Remote assistance 2FA compatibility

The remote-assistance backend now recognizes a staff account with a linked Telegram chat as 2FA-capable, matching the existing mandatory staff login flow and `/auth/me` state.

Endpoint:

`POST /call-center/support/tickets/{ticket_id}/remote-assist/sessions`

The `90 100 40 01` account is linked to Telegram, assigned to ticket `73d0cc67-3f6e-4dee-9f18-84f18ae6cf06`, and has active support calls. It no longer fails with `remote_assist_two_factor_required`.

The frontend does not need a contract change. Keep sending the existing body:

```json
{
  "call_id": "uuid",
  "mode": "guide | control | prepare",
  "requested_scopes": ["view_page_context", "highlight", "navigate", "form_fill"],
  "reason": "Client needs guided help",
  "duration_minutes": 20
}
```

Do not hide genuine backend errors after the 2FA gate. In particular, show assigned-operator, active-call, consent, or permission errors according to their existing `detail.code`.

## Verification

- Production deployment completed.
- Production HTTPS health returned `200`.
- Focused complaint/promotion/advertising/document settings API tests: `7/7` passed.
- Focused remote-assistance tests: `5/5` passed.
- Full backend regression suite on the server: `316/316` passed.
- Production read-only smoke checks passed for advertising readiness, document settings, document runtime access, subscription quote, and complaint queue.
# LexGo Marketplace Cancellation, Reassignment and Refund Frontend Contract

Date: 2026-10-26

## 1. Delivery status

The backend workflow is implemented and deployed to production.

Production base URL:

`https://lexgo.api.cognilabs.org`

The delivery includes:

- cancellation requests initiated by either the client or the currently assigned seller;
- a call-center review queue and detail contract;
- an optional, separate cancellation discussion chat;
- strict privacy for the original client-seller service chat;
- reassignment without a second payment;
- a new 30-minute acceptance window for the replacement seller;
- creation of a fresh private service chat only after the replacement seller accepts;
- full-refund approval through the current Telegram inline confirmation flow;
- realtime events, in-app notifications and push notifications;
- reassignment and refund history in the order timeline;
- idempotency protection for resolution actions;
- automatic closure of chats and calls after refund or final cancellation.

## 2. Non-negotiable privacy model

The normal service chat belongs only to:

- the client;
- the seller assigned to that exact service-chat generation.

The call-center operator must not open or read the private client-seller service chat. The replacement seller must not see messages exchanged with the previous seller.

When a seller is replaced:

1. The previous service room becomes read-only.
2. Active, scheduled or paused calls attached to that room are ended.
3. The replacement seller receives only the order/service context, not the previous private messages.
4. No new service chat exists while the replacement seller is considering the assignment.
5. A fresh private client-replacement-seller room is created only after acceptance.

The call center may create a separate cancellation discussion chat when communication is necessary. This room is not the service chat.

## 3. Main status flow

### 3.1 Cancellation request

`in_progress | started | accepted | paid` → `cancellation_review`

### 3.2 Reassignment

`cancellation_review` → `sent_to_seller`

During `sent_to_seller`:

- `assignment_status = waiting_seller_response`;
- `waiting_replacement_acceptance = true` for the client;
- the client-facing seller object is hidden until acceptance;
- payment remains paid;
- no additional payment is created;
- no new service chat is created;
- `acceptance_deadline_at` is 30 minutes after reassignment.

After replacement acceptance:

`sent_to_seller` → `accepted`

- `assignment_status = accepted`;
- the new seller becomes visible to the client;
- a fresh service chat opens;
- the existing payment remains unchanged.

If the replacement rejects or times out, the order returns to call-center attention. Do not show “lawyer search in progress” text to the client. Use `client_status_message` from the backend. The current neutral text is equivalent to “Call-center is reviewing your request.”

### 3.3 Refund

`cancellation_review` → `refund_pending` → `refunded`

While pending:

- `payment_status` remains `paid`;
- `refund.status = pending`;
- chat and calls are disabled;
- all linked service/cancellation rooms are read-only.

After Telegram inline approval:

- `order.status = refunded`;
- `order.payment_status = refunded`;
- `payment.status = refunded`;
- `refund.status = succeeded`;
- chats stay read-only;
- calls stay closed.

## 4. Request cancellation

### Endpoint

`POST /marketplace/orders/{order_id}/cancellation-review`

### Allowed actors

- order client;
- currently assigned seller.

### Body

```json
{
  "reason": "I cannot continue this service because ..."
}
```

`reason` is required and must contain 3–2000 characters.

### Success

HTTP `201` with the created cancellation-review record.

### Relevant errors

- `404 active_marketplace_order_not_found`
- `409 cancellation_review_already_open`

### Realtime

Call-center operators receive:

- personal channel event: `marketplace.cancellation_review_created`;
- call-center channel update;
- in-app notification;
- push notification;
- configured Telegram notification.

## 5. Call-center queue

### List

`GET /call-center/marketplace/cancellation-reviews?status=open&limit=50&offset=0`

Response:

```json
{
  "items": [],
  "total": 0,
  "count": 0,
  "limit": 50,
  "offset": 0
}
```

Each item includes the requester, requester role, reason, order context, checklist, additional-payment state and result files.

### Detail

`GET /call-center/marketplace/cancellation-reviews/{review_id}`

Important fields:

- `requester`
- `requester_role`
- `reason`
- `history[]`
- `parties`
- `resolution_options[]`
- `chat`
- `resolution`
- `context.order`
- `context.checklist`
- `context.additional_payment`
- `context.result_files`

## 6. Optional cancellation discussion chat

This room is created only when the operator decides communication is necessary.

### Create

`POST /call-center/marketplace/cancellation-reviews/{review_id}/chat`

```json
{
  "include_client": true,
  "include_current_seller": false,
  "title": "Cancellation clarification"
}
```

At least one of `include_client` or `include_current_seller` must be true.

The operator is always added. The replacement seller is never added automatically.

Success response includes:

- `room_id`
- `status`
- `read_only`
- `participant_user_ids`
- `messages_url`
- `close_url`

Repeated creation returns the existing room instead of creating a duplicate.

### Close

`POST /call-center/marketplace/cancellation-reviews/{review_id}/chat/close`

```json
{
  "note": "The issue was resolved"
}
```

Only a call-center operator can close this chat. The room becomes read-only for every participant.

### UI

- Label it as a cancellation/support discussion, never as the service chat.
- Show participants explicitly.
- Show a “Close discussion” action only to the call-center operator.
- After closure keep history visible but disable composer, upload and call actions.

## 7. Resolve a cancellation review

### Endpoint

`POST /call-center/marketplace/cancellation-reviews/{review_id}/resolve`

Send a unique `Idempotency-Key` header for every user-confirmed resolution action.

### Body

```json
{
  "action": "reassign",
  "note": "Internal operator note",
  "client_visible_reason": "The service will be continued by another specialist",
  "lawyer_user_id": "replacement-user-uuid",
  "amount": null
}
```

### Action values

#### `continue`

Restores the order to the status it had before cancellation review.

#### `new_price`

Uses `amount` and moves the order to the existing additional-payment path.

#### `cancel`

Allowed only for an unpaid order. A paid order returns `409 paid_order_requires_refund_action`.

#### `reassign`

Requires `lawyer_user_id` of an active external seller. It:

- closes the old private room and active calls;
- keeps the same order and payment;
- starts a new 30-minute acceptance window;
- records old seller, new seller, operator, timestamps and reasons;
- notifies the replacement seller and client in realtime.

#### `refund`

Creates one full-refund request. Repeated submissions with the same idempotency key return the previous result and never create a duplicate refund.

### Important errors

- `403 callcenter_role_required`
- `404 cancellation_review_not_found`
- `409 cancellation_review_already_resolved`
- `409 paid_order_requires_refund_action`
- `409 replacement_seller_must_differ`
- `422 resolution_action_invalid`
- `422 lawyer_invalid`

## 8. Replacement seller acceptance

### Accept

`POST /orders/{order_id}/accept`

No body is required.

The replacement seller can accept only while:

- the order belongs to that seller;
- order status is `sent_to_seller`;
- `acceptance_deadline_at` has not expired.

Acceptance of a paid reassigned order must never display or start another payment step.

After success, use the returned order state and refresh:

`GET /marketplace/me/orders/{order_id}`

### Decline

Use the existing seller decline endpoint:

`POST /orders/{order_id}/decline`

The declined/expired assignment returns to call-center escalation. The client continues to see the neutral backend `client_status_message`.

## 9. Client order detail contract

`GET /marketplace/me/orders/{order_id}`

Frontend must render from backend flags and must not derive permissions from status text.

Important fields:

- `status`
- `payment_status`
- `assignment_status`
- `acceptance_deadline_at`
- `waiting_replacement_acceptance`
- `client_status`
- `client_status_message`
- `lawyer`
- `secure_chat_room_id`
- `can_start_chat`
- `can_create_call`
- `calls_enabled`
- `chat_read_only`
- `reassignment_history[]`
- `resolution`

While waiting for replacement acceptance:

- `lawyer` is intentionally null for the client;
- show `client_status_message`;
- disable chat and calls;
- do not show the internal candidate identity.

After acceptance:

- `lawyer` contains the replacement seller;
- `secure_chat_room_id` points to the fresh private room;
- chat/call flags become enabled.

## 10. Reassignment history

The order response contains `reassignment_history[]`.

Client-visible entries include:

- previous seller summary;
- new seller summary after it is safe to expose;
- operator summary;
- `client_visible_reason`;
- reassigned timestamp;
- acceptance deadline;
- accepted timestamp;
- status.

Internal operator notes are removed from the client response.

Show a timeline row similar to:

“26 Oct 2026, 18:30 — Specialist changed by Call Center. Reason: …”

## 11. Timeline

`GET /marketplace/me/orders/{order_id}/timeline`

Response:

```json
{
  "order_id": "uuid",
  "items": [],
  "count": 0,
  "resolution": {}
}
```

Possible timeline `type` values relevant to this flow:

- `status`
- `assignment_resolution`
- `cancellation_review`
- `reassignment`
- `refund`

Each event contains its actor when available. Client responses exclude internal-only refund/operator fields.

## 12. Refund state

`GET /marketplace/me/orders/{order_id}/refund`

Example:

```json
{
  "order_id": "uuid",
  "refund": {
    "request_id": "uuid",
    "amount": 8000,
    "currency": "UZS",
    "status": "pending",
    "provider_mode": "manual",
    "provider_enabled": false,
    "created_at": "2026-10-26T15:59:59Z",
    "updated_at": "2026-10-26T15:59:59Z"
  },
  "provider_enabled": false,
  "realtime_events": [
    "marketplace.refund_processing",
    "marketplace.refund_approved",
    "marketplace.refund_rejected"
  ]
}
```

Status mapping:

- `pending`: waiting for Telegram/manual approval;
- `processing`: provider processing;
- `succeeded`: refund completed;
- `failed`: rejected or failed.

## 13. Realtime integration

Use the authenticated personal websocket:

`WS /ws/users/me`

Refresh the corresponding order, queue or room when any of these events arrives:

- `marketplace.cancellation_review_created`
- `marketplace.cancellation_chat_created`
- `marketplace.cancellation_chat_closed`
- `marketplace.cancellation_review_resolved`
- `marketplace.reassignment_started`
- `marketplace.assignment_received`
- `marketplace.reassignment_accepted`
- `marketplace.assignment_escalated`
- `marketplace.assignment_escalation_resolved`
- `marketplace.resolution_offered`
- `marketplace.resolution_selected`
- `marketplace.refund_processing`
- `marketplace.refund_approved`
- `marketplace.refund_rejected`
- `secure_chat.read_only`
- `secure_chat.message_created`
- `call.ended`

Do not poll continuously. Initial GET + websocket invalidation/refetch is the expected pattern.

## 14. Notification UI

Cancellation, reassignment, operator-chat and refund events are persisted as notifications and also delivered through realtime channels.

For desktop web, display a compact macOS-style animated notification card in the top-right corner:

- event icon;
- short title;
- one-line explanation;
- related order/work ID;
- click action that opens the exact review, order or room;
- auto-dismiss with notification-center persistence;
- unread badge count.

Do not expose internal reasons or hidden seller identity in client notifications.

## 15. Secure chat rules

All secure chat HTTP and websocket access is authorized by room membership.

- The client and current room seller can read the service room.
- Explicit participants can read the separate cancellation room.
- General staff permissions do not grant automatic access to private service messages.
- A replacement seller receives HTTP 403 for the previous room.
- A call-center operator receives HTTP 403 for a private service room unless explicitly added to a separate support/cancellation room.
- Read-only rooms reject new text, files and calls.

Frontend must treat HTTP 403 as a privacy boundary and must not retry with alternate staff endpoints.

## 16. Frontend acceptance checklist

- Cancellation can be requested by client and seller.
- Call-center queue updates without manual refresh.
- Operator can open an optional separate cancellation chat.
- Client and seller private service messages remain invisible to the operator.
- Replacement seller cannot see the original service chat.
- Reassignment does not create another payment.
- Client does not see the replacement seller until acceptance.
- Replacement seller sees Accept/Decline and a 30-minute deadline.
- Fresh chat appears only after acceptance.
- Client order detail updates immediately after acceptance.
- Reassignment history shows who, when and the client-visible reason.
- Refund pending disables chat and calls.
- Telegram approval updates the order to refunded in realtime.
- Closed rooms remain readable to their participants but cannot be modified.
- Repeated resolve/refund clicks do not duplicate operations.
- Neutral backend `client_status_message` is rendered instead of “searching for a lawyer.”

## 17. Production verification completed by backend

- Fresh production source and PostgreSQL backups were created before deployment.
- 43 focused marketplace workflow tests passed.
- 321 full server regression tests passed.
- Production HTTPS health returned HTTP 200.
- All 8 required OpenAPI paths are published.
- The cancellation resolve body is exposed as a typed OpenAPI schema.
- Production private-chat authorization returned HTTP 403 for the call-center operator.
- The repaired live order is in `refund_pending`, its chats are read-only, and chat/call flags are false.
- Telegram refund confirmation delivery succeeded for all configured approval chats.
- No new production traceback, unhandled exception or HTTP 500 appeared after deployment.
# LexGo CRM and Operator AI Copilot — Frontend Integration Contract

Date: 2026-10-26  
API base: `https://lexgo.api.cognilabs.org`  
OpenAPI: `GET /openapi.json`  
WebSocket: existing authenticated `GET /ws/users/me`

## 1. Delivery status

The CRM backend, permissions, realtime events, background exports, AI Copilot, customer/lead separation, audit timeline, duplicate review, operator assignment, and telephony adapter contract are deployed to production.

Production verification completed:

- API health: HTTP 200.
- CRM OpenAPI paths: 32.
- Typed CRM schemas: 27.
- Full server regression: 326/326 tests passed.
- CRM integration suite: 5/5 passed.
- Real production HTTP flow passed: customer creation, lead creation, atomic claim, timeline, scope/privacy, Excel export, OpenAI Copilot, list pagination, and cleanup.
- Real OpenAI Copilot response completed with six tool calls and structured operator output.
- Production logs after deployment: no new traceback/error/exception.

## 2. Core product model

The frontend must treat `customer` and `lead` as different entities.

- A customer is a unique person/company CRM profile.
- One customer may have unlimited leads.
- A new contact from the same customer creates a new lead, not a duplicate customer.
- Concurrent leads in the same category are valid.
- The backend only marks technically suspicious submissions created within 30 minutes as `duplicate_status=needs_review`; the operator decides whether they are actually duplicates.
- An existing LexGo account is linked through `customer.user_id`. A CRM customer may exist before registration and can be linked later.

Never merge customers automatically on the frontend. Customer merge is an explicit privileged action.

## 3. Permissions and visibility

Use `GET /crm/meta` after login. Build the CRM UI from `permissions`, `scope`, `revenue_visible`, `telephony`, statuses and metadata returned by the backend.

CRM permission codes:

- `crm.customers.view`
- `crm.customers.manage`
- `crm.customers.merge`
- `crm.leads.view`
- `crm.leads.manage`
- `crm.leads.claim`
- `crm.leads.assign`
- `crm.analytics.self`
- `crm.analytics.global`
- `crm.revenue.view`
- `crm.ai.use`
- `crm.calls.start`
- `crm.calls.recordings.view`
- `crm.exports.create`
- `crm.templates.manage`

Rules:

- Call-center and sales operators see their own leads plus the unassigned queue.
- Admin/manager/superadmin scope can see all leads where their role/permission allows it.
- Operators see only their own performance metrics. Revenue must never be shown to operators.
- Global analytics and paid revenue are superadmin-only.
- Customer merge is superadmin-only by default, or available to an operator only after explicit `crm.customers.merge` permission is granted.
- Do not infer actions from role names. Use `permissions` and each lead's `allowed_actions`.

## 4. Required frontend pages

### 4.1 CRM overview

Display:

- Unassigned queue count.
- My active leads.
- Status counts.
- Due/overdue next actions.
- My conversion and first-response metrics.
- Quick customer/lead search.

Endpoints:

- `GET /crm/meta`
- `GET /crm/leads?queue_only=true&limit=...&offset=...`
- `GET /crm/leads?mine_only=true&limit=...&offset=...`
- `GET /crm/me/metrics?date_from=&date_to=`

### 4.2 Customers

List:

`GET /crm/customers?q=&region=&status=active&limit=50&offset=0`

Response contains `items`, `total`, `limit`, `offset`. Show CRM public ID, name, primary contacts, region, total lead count and active lead count.

Create:

`POST /crm/customers`

```json
{
  "user_id": null,
  "name": "Client name",
  "preferred_language": "uz_latn",
  "region": "Toshkent",
  "source": "phone",
  "notes": "Internal note",
  "contacts": [
    {
      "contact_type": "phone",
      "value": "+998901234567",
      "label": "Main",
      "is_primary": true,
      "is_verified": false,
      "source": "operator"
    }
  ]
}
```

Detail:

`GET /crm/customers/{customer_id}`

The detail includes contacts, visible leads, linked LexGo orders, notes and activity count.

Update:

`PATCH /crm/customers/{customer_id}`

Contacts:

- `POST /crm/customers/{customer_id}/contacts`
- `PATCH /crm/customers/{customer_id}/contacts/{contact_id}`
- `DELETE /crm/customers/{customer_id}/contacts/{contact_id}` archives the contact.

Timeline:

`GET /crm/customers/{customer_id}/timeline?limit=100&offset=0`

Merge:

`POST /crm/customers/merge`

```json
{
  "target_customer_id": "customer-to-keep",
  "source_customer_ids": ["duplicate-customer-id"],
  "reason": "Verified same person"
}
```

Render merge only when `crm.customers.merge` exists. Show a destructive confirmation containing both profiles, affected leads and contacts.

### 4.3 Lead list

Use a list/table layout, not Kanban.

`GET /crm/leads`

Filters:

- `status`
- `score`
- `source`
- `category`
- `region`
- `q`
- `assigned_operator_user_id`
- `queue_only`
- `mine_only`
- `next_action_from`, `next_action_to`
- `created_from`, `created_to`
- `limit`, `offset`

Response contains `items`, `total`, `limit`, `offset`, and overall visible-scope `counts` by status.

Valid statuses:

1. `new`
2. `contacted`
3. `qualified`
4. `proposal`
5. `payment_pending`
6. `won`
7. `closed`

Use backend `allowed_actions` on every row/detail. Do not display unavailable buttons.

### 4.4 Lead create and detail

Create with existing customer:

`POST /crm/leads`

```json
{
  "customer_id": "uuid",
  "source": "phone",
  "title": "Contract review",
  "problem": "Full customer request",
  "category": "contracts",
  "region": "Toshkent",
  "urgency": "normal",
  "preferred_language": "uz_latn",
  "details": {},
  "next_action_at": null,
  "assigned_operator_user_id": null,
  "force_create": false
}
```

The same endpoint also accepts `client_user_id` or an inline `customer` object instead of `customer_id`.

Detail:

`GET /crm/leads/{lead_id}`

Important response fields:

- `work_id`: human-readable CRM lead ID.
- `customer`: compact customer/contact data.
- `status`, `score`, `urgency`, `source`, `category`, `region`.
- `assigned_operator`.
- `next_action_at`.
- `duplicate_status`, `duplicate_of_lead_id`.
- `converted_service_id`, `converted_order_id`.
- `watchers`.
- `allowed_actions`.
- `lock_version`.

All mutating lead actions that accept `expected_lock_version` must send the latest returned `lock_version`. On HTTP 409 with `detail.code=crm_lead_version_conflict`, reload the lead and ask the operator to retry against fresh data.

Update:

`PATCH /crm/leads/{lead_id}`

### 4.5 Queue, claim, assignment and transfer

- Atomic self-claim: `POST /crm/leads/{lead_id}/claim`
- Operators list: `GET /crm/operators?q=&limit=100`
- Assign: `POST /crm/leads/{lead_id}/assign`
- Transfer: `POST /crm/leads/{lead_id}/transfer`

Assign/transfer body:

```json
{
  "operator_user_id": "uuid",
  "reason": "Shift handover",
  "expected_lock_version": 3
}
```

Atomic claim can return HTTP 409 when another operator claimed the lead first. Refresh the queue immediately; do not show the lead as owned by the current operator.

### 4.6 Status transitions

`POST /crm/leads/{lead_id}/status`

```json
{
  "status": "contacted",
  "reason": "Client contacted",
  "next_action_at": "2026-10-27T09:00:00+05:00",
  "expected_lock_version": 2
}
```

Allowed transitions:

- `new` → `contacted`, `closed`
- `contacted` → `qualified`, `proposal`, `closed`
- `qualified` → `proposal`, `payment_pending`, `won`, `closed`
- `proposal` → `qualified`, `payment_pending`, `won`, `closed`
- `payment_pending` → `proposal`, `won`, `closed`
- `won` → `closed`
- `closed` → `new`

The backend returns HTTP 409 and `crm_status_transition_invalid` for an invalid transition. The `GET /crm/meta` response also returns the transition map; use it to build the status selector.

### 4.7 Duplicate review

When `duplicate_status=needs_review`, display a warning rather than blocking work.

`POST /crm/leads/{lead_id}/duplicate-resolution`

Not duplicate:

```json
{
  "decision": "not_duplicate",
  "reason": "Separate legal issue"
}
```

Confirmed duplicate:

```json
{
  "decision": "duplicate",
  "duplicate_of_lead_id": "uuid",
  "reason": "Repeated submission"
}
```

### 4.8 Timeline, notes and watchers

- Add activity: `POST /crm/leads/{lead_id}/activities`
- Lead timeline: `GET /crm/leads/{lead_id}/timeline?limit=100&offset=0`
- Add watcher: `POST /crm/leads/{lead_id}/watchers`
- Remove watcher: `DELETE /crm/leads/{lead_id}/watchers/{watcher_user_id}`

Activity types: `note`, `call_note`, `message`, `meeting`, `follow_up`, `document`, `system`.

Show actor, timestamp, title, body and payload. Do not edit timeline events: they are the audit history.

### 4.9 Service/order preparation

`POST /crm/leads/{lead_id}/conversion`

```json
{
  "service_id": "uuid-or-null",
  "package_id": null,
  "seller_user_id": null,
  "price": 100000,
  "currency": "UZS",
  "note": "Operator prepared this option"
}
```

This creates an `operator_draft` order with `payment_status=unpaid`. It does not silently buy, pay, send or assign anything. The frontend must show a review/confirmation step before the existing payment workflow is used.

If the CRM customer is not linked to a LexGo user, backend returns HTTP 409 with `crm_customer_account_required`.

## 5. Operator AI Copilot

The Copilot is advisory. It never sends a message, changes a lead, creates an order, or performs another write automatically.

Create job:

`POST /crm/leads/{lead_id}/ai/runs`

```json
{
  "run_type": "full_analysis",
  "language": "uz_latn",
  "instruction": "Analyze the case and prepare next actions"
}
```

Run types:

- `full_analysis`
- `summary`
- `qualification`
- `service_match`
- `draft_reply`
- `call_script`
- `follow_up`
- `offer`

Languages: `auto`, `uz_latn`, `uz_cyrl`, `ru`.

The create response is HTTP 202. Poll:

- `GET /crm/ai/runs/{run_id}`
- or `GET /crm/leads/{lead_id}/ai/runs?limit=20`

Statuses: `queued`, `running`, `completed`, `failed`.

Expected structured output may contain:

- `summary`
- `category`, `subcategory`
- `urgency`, `confidence`
- `risk_flags`
- `missing_information`
- `questions`
- `duplicate_probability`
- `service_candidates`
- `specialist_candidates`
- `reply_drafts`
- `call_script`
- `follow_up`
- `offer_draft`
- `next_action`
- `operator_warnings`
- `operator_confirmation_required`
- `auto_executed`

Render AI output as selectable suggestion cards. The operator must explicitly select what to apply.

Apply selected fields:

`POST /crm/ai/runs/{run_id}/apply`

```json
{
  "selected_paths": ["summary", "category", "urgency", "next_action.at"],
  "overrides": {
    "summary": "Operator-corrected final text"
  },
  "expected_lock_version": 4
}
```

The operator may edit every draft before applying or copying it. Message/call/offer drafts remain text until the operator uses an existing explicit send action.

The AI uses model-selected function calls for lead/customer history, duplicate candidates, internal service/package catalog, matching specialists and message templates. The UI must not implement trigger detection or duplicate AI logic.

Realtime events:

- `crm.ai.completed`
- `crm.ai.failed`

## 6. Operator templates

List:

`GET /crm/operator-templates?template_type=&language=&q=`

Create/manage permission: `crm.templates.manage`.

`POST /crm/operator-templates`

Template types: `chat`, `telegram`, `sms`, `call_script`, `follow_up`, `rejection`, `offer`.

Templates are operator aids. Selecting a template fills the editor; it must not send automatically.

## 7. Telephony contract

Metadata is returned by `GET /crm/meta` under `telephony`.

Prepare/start call:

`POST /crm/leads/{lead_id}/calls`

```json
{
  "contact_id": "optional-phone-contact-id",
  "direction": "outbound",
  "purpose": "Qualification call"
}
```

List calls:

`GET /crm/leads/{lead_id}/calls`

Complete provider callback/operator flow:

`POST /crm/calls/{call_id}/complete`

```json
{
  "status": "completed",
  "summary": "Call summary",
  "transcript": [],
  "recording_url": "",
  "metadata": {}
}
```

The provider adapter is ready, but production IP-telephony connection, recording and live transcription remain disabled until the actual provider is selected and credentials/webhook rules are supplied. When disabled, show the backend `telephony.enabled=false` state and do not fake a successful phone call.

Recording consent is mandatory. Recording/transcript fields are visible only when `recording_access=true`; do not infer or expose hidden URLs.

## 8. Metrics and analytics

Operator metrics:

`GET /crm/me/metrics?date_from=&date_to=`

Contains only the current operator's workload, conversion, status counts, first-response time and overdue next actions. `revenue_visible=false`.

Global analytics:

`GET /crm/analytics?date_from=&date_to=`

This is superadmin-only and includes all lead/source/operator aggregates and paid revenue. Do not render this page unless `crm.analytics.global` exists and `revenue_visible=true`.

## 9. Excel exports

Create:

`POST /crm/exports`

```json
{
  "scope": "leads",
  "date_from": null,
  "date_to": null,
  "status": null,
  "source": null,
  "assigned_operator_user_id": null,
  "q": null
}
```

Scopes: `leads`, `customers`, `activities`.

The job runs in the background:

1. Create returns HTTP 202 and `status_url`.
2. Poll `GET /crm/exports/{export_id}`.
3. When `status=ready`, use `download_url` or `GET /crm/exports/{export_id}/download`.
4. Listen for `crm.export.ready`.

Statuses: `queued`, `processing`, `ready`, `failed`, `expired`.

All date, status, source, operator and search filters are applied by the backend. The frontend must never export the current screen HTML or recalculate access scope.

## 10. Realtime behaviour

Keep the existing authenticated `/ws/users/me` connection open. CRM can emit:

- `crm.resync` immediately after socket connection.
- `crm.lead.created`
- `crm.lead.claimed`
- `crm.lead.assigned`
- `crm.lead.transferred`
- `crm.lead.status_changed`
- `crm.lead.watcher_added`
- `crm.lead.next_action_due`
- `crm.ai.completed`
- `crm.ai.failed`
- `crm.export.ready`
- `notification.created`

On `crm.resync`, refetch visible queue/list counters. For a lead-specific event, update the corresponding cache or refetch that lead. Do not append duplicate rows blindly.

Recommended query invalidation:

- `crm.lead.created`: queue, counts, customer detail when visible.
- `crm.lead.claimed`: queue and assignee's list.
- assignment/transfer/status events: lead detail, both relevant operator lists, metrics.
- AI events: run detail and lead AI history.
- export event: export job detail.

## 11. Error handling

Backend error bodies use `detail.code`. Important codes include:

- `crm_access_denied`
- `crm_permission_required`
- `crm_customer_not_found`
- `crm_lead_not_found`
- `crm_operator_scope_denied`
- `crm_operator_invalid`
- `crm_lead_already_claimed`
- `crm_lead_version_conflict`
- `crm_status_transition_invalid`
- `crm_duplicate_target_invalid`
- `crm_customer_account_required`
- `crm_ai_run_active`
- `crm_ai_run_not_completed`
- `crm_ai_path_invalid`
- `crm_export_scope_denied`
- `crm_export_not_ready`
- `crm_export_not_found`
- `crm_phone_contact_required`
- `crm_call_scope_denied`

Display the server message when available, but branch UI logic by `detail.code`, never by translated message text.

## 12. UI acceptance checklist

- Customer and lead are separate routes and entities.
- Customer detail can show multiple current and historical leads.
- Queue claim is atomic and handles HTTP 409.
- Lead pages always use backend `allowed_actions`.
- Every mutable lead form sends current `expected_lock_version`.
- Status selector follows `/crm/meta` transitions.
- Duplicate warning never silently deletes or merges data.
- Operator transfer requires a reason.
- Timeline is chronological and immutable in UI.
- Next-action date/time is clearly visible and overdue state is highlighted.
- AI is always review/edit/apply; no automatic side effects.
- Operator analytics never show revenue.
- Global revenue is superadmin-only.
- Excel exports use background-job polling and realtime completion.
- Realtime reconnect triggers a full CRM resync.
- All list screens use backend pagination/search/filtering.
- Telephony disabled state is handled honestly until provider integration is configured.

## 13. Backward compatibility

Legacy leads are linked to CRM customers by backend bootstrap without requiring frontend migration logic. Existing lead-compatible APIs outside `/crm` remain available. New CRM screens must use `/crm/*` as the source of truth for customer separation, assignment, AI, audit and metrics.