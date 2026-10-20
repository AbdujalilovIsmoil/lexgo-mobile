# Studio Service Builder Frontend Integration

Date: 2026-10-20

## Scope

This contract covers the Studio service/package summary cards and the K02 service creation flow.

The K02 service form now owns the service-specific configuration that previously required separate workflow/checklist constructors:

- service-specific price factor values
- completion checklist
- existing and inline service rules
- existing and inline client guarantees
- explicit business-day deadline behavior
- OpenAI-generated discovery terms

K08 and K09 remain available for legacy records and consultation flows. Do not show them as required steps in the new marketplace service journey.

## Authentication

All `/studio/*` endpoints require a bearer token and Studio access.

```http
Authorization: Bearer <access_token>
```

## 1. Studio Dashboard Cards

Request:

```http
GET /studio/objects/summary
```

Use `entity_cards` to render the Services and Packages cards. Do not calculate these counts from paginated record lists.

```json
{
  "entity_cards": [
    {
      "key": "services",
      "title": "Xizmatlar",
      "constructor_code": "K02",
      "total": 120,
      "active_count": 110,
      "inactive_count": 10,
      "incomplete_count": 4,
      "studio_object_count": 124,
      "list_url": "/studio/constructors/K02/records",
      "incomplete_url": "/studio/constructors/K02/records?source=studio&status=draft",
      "create_url": "/studio/constructors/K02/form-context?mode=create"
    }
  ]
}
```

Card behavior:

- Primary count: `total`.
- Secondary values: `active_count`, `inactive_count`, and `incomplete_count`.
- Clicking the card opens `list_url`.
- Clicking the incomplete count opens `incomplete_url`.
- Create action opens `create_url`.
- `incomplete_count` includes `draft`, `changes_requested`, and `rejected` Studio objects.
- `total` is the runtime entity count. `studio_object_count` is the Studio authoring record count; these values are intentionally separate.

## 2. Load the K02 Form Contract

Always load the backend schema instead of maintaining a hardcoded K02 form:

```http
GET /studio/constructors/K02
```

For create/edit context use the existing form-context endpoint supplied by the constructor response.

The relevant K02 fields are:

- `title`
- `category_id`
- `description`
- `client_value`
- `usage_steps`
- `base_price`
- `max_price`
- `seller_requirements`
- `duration_value`
- `duration_unit`
- `duration_calendar`
- `template_mode`
- `template_source`
- `document_template_id`
- `price_factor_ids`
- `price_factor_overrides`
- `checklist_template_id`
- `completion_checklist`
- `rule_ids`
- `inline_rules`
- `guarantee_ids`
- `inline_guarantees`
- `negotiation_allowed`
- `discovery_terms`
- `executor_type`
- `is_active`

Backend-generated nested IDs must not be shown as editable inputs. Preserve returned IDs during edit.

## 3. Reference Select Endpoints

All reference endpoints support `q`, `limit`, and `offset`.

```http
GET /studio/reference/service-categories?q=&limit=50&offset=0
GET /studio/reference/price-factors?q=&limit=50&offset=0
GET /studio/reference/service-rules?q=&limit=50&offset=0
GET /studio/reference/client-guarantees?q=&limit=50&offset=0
GET /studio/reference/checklists?q=&limit=50&offset=0
GET /studio/reference/document-templates?q=&limit=50&offset=0
```

The common response contract is:

```json
{
  "key": "price-factors",
  "items": [
    {
      "id": "factor-id",
      "value": "factor-id",
      "label": "Shoshilinch bajarish"
    }
  ],
  "total": 1,
  "count": 1,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

Use `value` as the submitted identifier and `label` as visible text.

## 4. Price Factors and Per-Service Overrides

`price_factor_ids` selects existing Studio price factors.

`price_factor_overrides` changes a selected factor only for the current service. It does not modify the shared factor.

Example:

```json
{
  "price_factor_ids": ["urgent-factor", "complexity-factor"],
  "price_factor_overrides": {
    "urgent-factor": {
      "adjustment_type": "fixed",
      "value": 75000
    },
    "complexity-factor": {
      "adjustment_type": "percent",
      "value": 20
    }
  }
}
```

Frontend rules:

- Show override controls only for factors in `price_factor_ids`.
- `adjustment_type` is `fixed` or `percent`.
- `value` must be nonnegative.
- Percent must not exceed 100.
- Removing a factor must also remove its entry from `price_factor_overrides` before submit.
- An override is optional. Without it, the shared factor value is used.

Backend validation codes:

- `reference_not_found`
- `factor_not_selected`
- `invalid_type`
- `invalid_option`
- `invalid_value`
- `maximum`

## 5. Completion Checklist

Use `completion_checklist` for the new service flow. `checklist_template_id` is retained only as a legacy/template shortcut.

Each checklist row supports:

```json
{
  "id": "check_generated_id",
  "title": "Hujjatlarni tekshirish",
  "description": "Barcha ilovalarni tekshiring",
  "required": true,
  "verification_methods": ["checkbox", "comment", "image", "file"],
  "comment_required": true,
  "image_required": false,
  "file_required": true
}
```

Editor behavior:

- Add/remove/reorder checklist rows locally.
- `checkbox` is mandatory for every row and cannot be disabled.
- Other proof methods are `comment`, `image`, and `file`.
- Each selected proof method has its own required/optional switch.
- A required switch cannot be enabled when its method is not selected.
- Do not ask the user to type `id`; backend generates it on create.
- Preserve `id` on edit.

Validation codes:

- `checkbox_required`
- `verification_method_missing`

## 6. Rules

`rule_ids` contains existing shared rules selected from:

```http
GET /studio/reference/service-rules
```

`inline_rules` creates rules scoped only to this service:

```json
{
  "rule_ids": ["existing-rule-id"],
  "inline_rules": [
    {
      "id": "rule_generated_id",
      "title": "Maxfiylik",
      "body": "Mijoz ma'lumotlari maxfiy saqlanadi."
    }
  ]
}
```

Inline rules must not be shown in the shared rule selector. Backend excludes them from `/studio/reference/service-rules`.

When published rule assignments change, enabled seller capabilities can move to `rules_pending`. Sellers must accept the current applicable rules before the service can be enabled again.

## 7. Guarantees

`guarantee_ids` selects guarantees from:

```http
GET /studio/reference/client-guarantees
```

`inline_guarantees` creates guarantees visible only on this service:

```json
{
  "guarantee_ids": ["shared-guarantee-id"],
  "inline_guarantees": [
    {
      "id": "guarantee_generated_id",
      "title": "Bepul qayta ko'rib chiqish",
      "description": "Natija bir marta bepul qayta ko'rib chiqiladi."
    }
  ]
}
```

Do not add inline guarantees to the global guarantee library UI.

## 8. Duration and Business Days

Fields:

```json
{
  "duration_value": 2,
  "duration_unit": "day",
  "duration_calendar": "business_days"
}
```

`duration_calendar` values:

- `calendar`: normal calendar time.
- `business_days`: Monday through Friday only.

For `business_days`, Saturday and Sunday are skipped by the backend. The deadline starts when the seller accepts/starts the order, not when the service is viewed or purchased.

Runtime response includes:

```json
{
  "duration": {
    "value": 2,
    "unit": "day",
    "calendar": "business_days",
    "starts_on": "seller_acceptance",
    "business_weekdays": [1, 2, 3, 4, 5],
    "business_days_label": "Monday-Friday"
  }
}
```

## 9. OpenAI Discovery Term Suggestions

Request:

```http
POST /studio/services/discovery-terms/suggest
Content-Type: application/json
```

```json
{
  "title": "Shartnoma tahlili",
  "description": "Shartnomani huquqiy xavflar bo'yicha tekshirish",
  "client_value": "Xavflar va tavsiyalar hisoboti",
  "category_id": "category-id",
  "usage_steps": ["Hujjatni yuboring", "Natijani oling"],
  "inline_rules": [],
  "inline_guarantees": [],
  "discovery_terms": []
}
```

Success:

```json
{
  "suggestions": ["shartnoma tahlili", "шартнома таҳлили", "анализ договора"],
  "by_language": {
    "uz_latn": ["shartnoma tahlili"],
    "uz_cyrl": ["шартнома таҳлили"],
    "ru": ["анализ договора"]
  },
  "auto_saved": false,
  "requires_user_confirmation": true,
  "provider": "openai",
  "model": "configured-model"
}
```

Frontend behavior:

- Enable the suggestion action after `title` and `description` are present.
- Show loading and retry states.
- Render suggestions as selectable items.
- Never save suggestions automatically.
- Add only user-confirmed values to `discovery_terms`.
- Keep manual entry available.
- Do not generate local hardcoded suggestions when this request fails.

Error handling:

- `422 service_context_required`: title or description is missing.
- `503 ai_provider_unavailable`: OpenAI is not configured.
- `502 ai_generation_failed`: provider request failed.
- `502 ai_response_invalid`: provider returned invalid JSON.
- `502 ai_response_empty`: provider returned no usable terms.

## 10. Validation and Save Flow

Before create/update, validate with:

```http
POST /studio/constructors/K02/validate
```

Send the same payload that will be saved.

```json
{
  "title": "Shartnoma tahlili",
  "category_id": "category-id",
  "description": "Shartnomani huquqiy tekshirish",
  "duration_value": 2,
  "duration_unit": "day",
  "duration_calendar": "business_days",
  "price_factor_ids": ["complexity-factor"],
  "price_factor_overrides": {
    "complexity-factor": {"adjustment_type": "percent", "value": 20}
  },
  "completion_checklist": [
    {
      "title": "Huquqiy xavflarni tekshirish",
      "required": true,
      "verification_methods": ["checkbox", "comment"],
      "comment_required": true,
      "image_required": false,
      "file_required": false
    }
  ],
  "rule_ids": [],
  "inline_rules": [],
  "guarantee_ids": [],
  "inline_guarantees": [],
  "discovery_terms": ["shartnoma tahlili"]
}
```

Validation response:

```json
{
  "ok": false,
  "errors": [
    {
      "field": "completion_checklist[0].verification_methods",
      "code": "checkbox_required",
      "message": "Har bir bandda checkbox tasdiqlash usuli bo'lishi shart"
    }
  ]
}
```

Map each `field` path to the exact nested control and show the backend `message` beside it. Do not replace precise backend errors with one generic toast.

Create:

```http
POST /studio/objects
```

```json
{
  "constructor_code": "K02",
  "payload": {"...": "validated K02 payload"}
}
```

Use the existing Studio version, submit, approval, and publish endpoints for subsequent lifecycle actions.

## 11. Marketplace Runtime Preview

After publication, the effective configuration is available at:

```http
GET /marketplace/services/{service_id}/runtime-configuration?placement=service_detail
```

Use this endpoint for client-facing service details and seller configuration previews. It returns the effective values after shared definitions and service overrides are combined:

- duration policy
- template requirements
- pricing factors
- usage steps
- negotiation availability
- seller minimum requirements
- rules
- guarantees
- checklist preview

Do not rebuild effective factor values on the frontend.

## 12. Order Checklist Runtime

When the seller starts a paid order:

```http
POST /marketplace/orders/{order_id}/start
```

Backend snapshots the current service checklist into the order. Later Studio edits do not alter an already-started order.

Read checklist:

```http
GET /marketplace/orders/{order_id}/checklist
```

Update one row:

```http
PATCH /marketplace/orders/{order_id}/checklist/{item_id}
```

```json
{
  "status": "done",
  "comment": "Tekshirildi",
  "images": [{"id": "image-file-id", "name": "proof.jpg"}],
  "files": [{"id": "document-file-id", "name": "result.docx"}]
}
```

Allowed statuses:

- `pending`
- `done`
- `skipped_with_reason`

Rules:

- `skipped_with_reason` requires `comment`.
- `comment_required` requires `comment` for `done`.
- `image_required` requires at least one item in `images`.
- `file_required` requires at least one item in `files`.
- A skipped row remains visible to the client with its reason.
- Required checklist rows must be done or skipped with a reason before completion.

Upload attachments through the `file_upload.url` returned by the checklist endpoint, then place returned file metadata in `images` or `files`.

Realtime channel:

```text
order:{order_id}
```

Handle event:

```json
{
  "event": "marketplace.checklist_updated",
  "order_id": "order-id",
  "item": {},
  "items": []
}
```

Replace local checklist state with the event `items` array so seller and client progress remains synchronized.

## 13. Compatibility Rules

- Existing services that use `checklist_template_id` continue to work.
- New service forms should write `completion_checklist` directly.
- If an edit payload omits both checklist fields, backend preserves the existing checklist.
- Sending `completion_checklist: []` intentionally clears the service checklist.
- Existing K08/K09 records remain readable; do not require them in the new service creation UI.
- Preserve all backend-generated nested IDs during edit and resubmission.

## 14. Required Frontend Acceptance Tests

1. Summary renders service/package total, active, inactive, and incomplete counts from `entity_cards`.
2. Clicking incomplete count opens the backend-provided incomplete URL.
3. Selecting a factor allows a local override; removing it removes the override payload.
4. Percent above 100 is blocked and the backend field error is rendered.
5. Checklist cannot remove checkbox.
6. Comment, image, and file can each be selected and independently marked required.
7. Existing shared rules and guarantees are searchable with paginated reference endpoints.
8. Inline rule/guarantee creation does not add items to shared selectors.
9. Business-day UI explicitly says Monday-Friday.
10. AI suggestions require user confirmation and are not auto-saved.
11. A started order receives a frozen checklist snapshot.
12. Required image/file/comment evidence blocks row completion until supplied.
13. Realtime checklist updates replace stale local state for both client and seller.
