# LexGo Studio Services and Packages V2

## 1. Scope

This contract describes the production frontend integration for:

- Studio service and package construction.
- Studio price option construction.
- Lawyer and legal consultant service activation.
- Lawyer and legal consultant package activation.
- Client direct service purchase.
- Client package purchase.
- Call center assisted purchase inside an assigned support ticket.
- Telegram inline payment confirmation.
- Supplemental payment requests.
- Support escalation, replacement selections, and refunds.
- Marketplace result delivery.
- The 15-minute rating and complaint window.

Do not infer business rules in the frontend. Render fields, prices, eligibility, actions, and deadlines returned by the backend.

## 2. Studio Navigation

`GET /studio/constructors`

The backend returns ten ordered groups. Render them in the returned `order` and never sort alphabetically.

1. `services_packages` — Services and packages
2. `documents_texts` — Documents and texts
3. `process_quality` — Process and quality
4. `communications` — Communication and notifications
5. `finance_tariffs` — Finance and tariffs
6. `security_access` — Security and access
7. `operations` — Operations
8. `integrations` — Integrations
9. `system_reference` — System and reference data
10. `advertising` — Advertising

The former Marketplace group is now `services_packages`. Advertising is intentionally separate and last.

## 3. Services and Packages Constructors

The required order inside `services_packages` is:

1. `K01` — Category and client situation
2. `K02` — Ordinary service
3. `K29` — Price-increasing options
4. `K03-M` — Service package

The frontend must show this sequence and dependency state from the constructor catalog.

### 3.1 K01 Category

Create categories before services. Use the reference endpoints returned by the constructor schema for parent/category selectors.

### 3.2 K02 Ordinary Service

Only Studio creates services. Lawyers and legal consultants cannot create a new service.

Important fields:

- `title`
- `category_id`
- `description`
- `client_value`
- `base_price`
- `max_price`
- `seller_requirements`
- `delivery_minutes`
- `executor_type`
- `is_active`

`service_id` is context-managed. On create, do not ask for an existing service ID. On edit, open the selected record through constructor records/form context and let the backend inject the ID.

`max_price` is the maximum price a seller may choose for this service. The seller may lower the price but may never exceed the backend maximum.

### 3.3 K29 Price Options

K29 attaches optional price-increasing choices to either one service or one package.

The schema is nested:

```json
{
  "target_type": "service",
  "service_id": "uuid",
  "title": "Service options",
  "sections": [
    {
      "id": "location",
      "title": "Location",
      "description": "Optional location-related additions",
      "sort_order": 1,
      "options": [
        {
          "id": "tashkent-lawyer",
          "label": "A lawyer from Tashkent is required",
          "description": "Adds the configured amount",
          "adjustment_type": "fixed",
          "value": 100000,
          "sort_order": 1
        },
        {
          "id": "urgent",
          "label": "Urgent execution",
          "adjustment_type": "percent",
          "value": 20,
          "sort_order": 2
        }
      ]
    }
  ],
  "is_active": true
}
```

All option controls are multi-select. Never render radio buttons or a single-select control.

Every section is optional. The client may buy the base service/package without selecting any option.

Allowed adjustment types:

- `fixed`: add a fixed UZS amount.
- `percent`: add a percentage of the base price.

Options only increase the price. The backend rejects negative values, unknown IDs, duplicate IDs, and unsupported adjustment types.

For package options use:

```json
{
  "target_type": "package",
  "package_id": "uuid"
}
```

### 3.4 K03-M Package

A package may contain:

- Existing Studio services in `components`.
- Free-form package content in `custom_items`.
- Both at the same time.

The package must contain exactly three independent variants in `tiers`:

- `BASIC`
- `STANDARD`
- `PREMIUM`

Each tier has its own price, title, description, duration, and included content. Prices may be lower or higher than the sum of component services. The frontend must not impose a calculated upper or lower bound.

Example:

```json
{
  "package_code": "BUSINESS-LEGAL",
  "title": "Business legal support",
  "category_id": "uuid",
  "components": [
    {
      "service_id": "uuid",
      "kind": "mandatory",
      "quantity": 1
    }
  ],
  "custom_items": [
    {
      "title": "Monthly legal risk summary",
      "description": "Prepared by the assigned specialist",
      "required": true
    }
  ],
  "tiers": [
    {
      "tier": "BASIC",
      "title": "Basic",
      "price": 500000,
      "duration": "7 days",
      "included": ["One consultation"]
    },
    {
      "tier": "STANDARD",
      "title": "Standard",
      "price": 900000,
      "duration": "14 days",
      "included": ["Consultation", "Document review"]
    },
    {
      "tier": "PREMIUM",
      "title": "Premium",
      "price": 1500000,
      "duration": "30 days",
      "included": ["Priority support", "Extended verification specialist"]
    }
  ],
  "is_active": true
}
```

## 4. Client Price Option APIs

### 4.1 Service Options

`GET /marketplace/services/{service_id}/price-options`

Response essentials:

```json
{
  "target_type": "service",
  "target_id": "uuid",
  "base_price": 100000,
  "currency": "UZS",
  "selection_type": "multi_select",
  "all_optional": true,
  "sections": []
}
```

### 4.2 Service Quote

`POST /marketplace/services/{service_id}/quote`

```json
{
  "lawyer_user_id": "uuid",
  "selected_option_ids": ["tashkent-lawyer", "urgent"]
}
```

Use `quote.total_price` as the only authoritative total. Show `quote.breakdown` to explain every increase.

### 4.3 Package Options

`GET /marketplace/service-packages/{package_id}/price-options`

Package options include:

- Options attached directly to the package.
- Options attached to package component services.

Option IDs are globally unique within the returned package form.

### 4.4 Package Quote

`POST /marketplace/service-packages/{package_id}/quote`

```json
{
  "selected_option_ids": ["option-a", "option-b"]
}
```

The response uses the same quote format as the service quote.

## 5. Seller Role

Applicable roles:

- `advokat`
- `yurist`
- Supported organization seller accounts where the existing seller management API grants access

### 5.1 Ordinary Services

Use the existing endpoints:

- `GET /lawyers/me/services/manage`
- `POST /lawyers/me/services/manage`
- `PATCH /lawyers/me/services/{service_id}`
- `PATCH /lawyers/me/services/{service_id}/status`
- `DELETE /lawyers/me/services/{service_id}`

The seller selects a Studio-created service and may set a lower price. Backend validation rejects a price over the allowed maximum.

Do not show a Create Service action to a seller.

### 5.2 Packages

`GET /lawyers/me/packages/manage`

Returns all active Studio packages with:

- `enabled`
- `status`
- `price_editable=false`
- `eligibility`
- package details

Enable a package:

`POST /lawyers/me/packages/{package_id}/enable`

Enable or disable an already selected package:

`PATCH /lawyers/me/packages/{package_id}/status`

```json
{
  "status": "active"
}
```

or:

```json
{
  "status": "disabled"
}
```

The seller cannot change a package price or package content.

## 6. Package Seller Matching

`GET /service-packages/{package_id}/eligible-sellers?limit=30&offset=0`

Only sellers who explicitly enabled this package are returned.

Current matching rules:

- BASIC: an enabled active seller may be shown; extended LexGo verification is optional.
- STANDARD: an enabled active seller may be shown and is ranked by rating, completed trust signals, and experience.
- PREMIUM: the seller must have extended LexGo verification.

Use each item’s `package_purchase_url`. Do not construct another path.

Sort order is authoritative from the backend.

## 7. Client Purchase Flows

### 7.1 Ordinary Service

Required order:

1. Client chooses a lawyer/legal consultant.
2. Client opens that seller’s enabled services.
3. Client fetches service price options.
4. Client selects zero or more options.
5. Client requests a quote.
6. Client submits the purchase request.

Purchase endpoint:

`POST /marketplace/lawyers/{lawyer_user_id}/services/{service_id}/purchase-request`

```json
{
  "selected_option_ids": ["option-a", "option-b"],
  "note": "Client request",
  "preferred_channel": "chat",
  "preferred_time": "2026-10-15T10:00:00+05:00"
}
```

### 7.2 Package

Required order:

1. Client chooses package and BASIC/STANDARD/PREMIUM tier.
2. Client fetches eligible sellers.
3. Client chooses one seller.
4. Client fetches package options.
5. Client selects zero or more options.
6. Client requests a quote.
7. Client submits the package purchase request.

Purchase endpoint:

`POST /marketplace/service-packages/{package_id}/lawyers/{lawyer_user_id}/purchase-request`

Request body is the same as the ordinary service purchase request.

One seller fulfills one package order.

## 8. Telegram Payment Confirmation

Both service and package purchases initially return:

- order with `status=pending_payment`
- payment with `status=pending`
- purchase request with `status=pending`
- `next_status=admin_telegram_confirm_required`

The backend sends inline approval to configured approver chats.

After approval:

- order becomes `paid`
- payment becomes `paid`
- a secure chat is created
- client receives `marketplace.order_paid`
- seller receives `marketplace.order_paid`

After rejection:

- order becomes `cancelled`
- payment becomes `cancelled`
- both parties receive realtime status updates

Listen on the existing authenticated user WebSocket. Do not poll payment status continuously.

## 9. Call Center Assisted Purchase

The operator may act only inside an open support ticket assigned to that operator.

`POST /call-center/support/tickets/{ticket_id}/assist/marketplace-purchase-request`

Ordinary service:

```json
{
  "lawyer_user_id": "uuid",
  "service_id": "uuid",
  "selected_option_ids": [],
  "note": "Operator entered client request"
}
```

Package:

```json
{
  "lawyer_user_id": "uuid",
  "package_id": "uuid",
  "selected_option_ids": [],
  "note": "Operator entered client request"
}
```

Send exactly one of `service_id` or `package_id`.

The payment request belongs to the client, not the operator. Telegram approval and realtime client updates use the same purchase flow.

## 10. Seller Work Execution

Seller orders:

`GET /marketplace/me/orders?role_view=seller`

Client orders:

`GET /marketplace/me/orders?role_view=client`

The order payload contains:

- secure chat URL
- call creation URL
- selected options and quote snapshot
- package snapshot when applicable
- completion URL
- result text/files after completion
- rating state and rating URL

The seller may work through secure chat and calls. The backend does not require a specific work channel.

## 11. Supplemental Payment

If the client purchased without required optional additions, the assigned seller may select only options configured by Studio.

`POST /marketplace/me/orders/{order_id}/additional-payment-request`

```json
{
  "selected_option_ids": ["studio-option-id"],
  "note": "This option is required for the requested scope"
}
```

Rules:

- Unknown IDs are rejected.
- The new total must be greater than the already paid order total.
- The order changes to `waiting_payment`.
- Work is paused.
- Telegram inline confirmation is sent.
- The request is valid for 24 hours.
- At 21 hours, operators receive an expiration warning.
- At 24 hours, the backend creates a support ticket and emits `marketplace.additional_payment_escalated`.

Realtime events:

- `marketplace.additional_payment_requested`
- `marketplace.additional_payment_approved`
- `marketplace.additional_payment_rejected`
- `marketplace.additional_payment_escalated`

After approval, the order returns to the previous work status and the new total becomes authoritative.

## 12. Operator Resolution

Inside the assigned support ticket:

`POST /call-center/support/tickets/{ticket_id}/assist/marketplace-additional-payment/{request_id}/resolve`

### 12.1 Replace Options and Resend

```json
{
  "action": "replace_options",
  "selected_option_ids": ["replacement-option-id"]
}
```

The backend cancels the previous pending payment, recalculates the total, creates a new pending payment, resets the 24-hour period, and resends Telegram confirmation.

### 12.2 Full Refund

```json
{
  "action": "full_refund",
  "reason": "Client and operator agreed to cancel"
}
```

### 12.3 Partial Refund

```json
{
  "action": "partial_refund",
  "amount": 100000,
  "reason": "Scope was reduced"
}
```

Refunds require Telegram inline approval. Listen for:

- `marketplace.refund_approved`
- `marketplace.refund_rejected`

## 13. Completion

`POST /marketplace/me/orders/{order_id}/complete`

The assigned seller must provide at least one of:

- non-empty `result_text`
- one or more entries in `result_files`

Example:

```json
{
  "result_text": "The consultation and written conclusion are complete.",
  "result_files": [
    {
      "file_id": "uuid",
      "file_name": "legal-conclusion.pdf",
      "download_url": "/secure-files/uuid"
    }
  ]
}
```

The backend rejects empty completion with `marketplace_result_required`.

Client acceptance is not required. Completion immediately opens the rating/complaint window.

## 14. Rating and Complaint

After completion, read:

```json
{
  "rating": {
    "can_rate": true,
    "deadline_at": "2026-10-14T12:15:00Z"
  },
  "rating_url": "/marketplace/me/orders/{order_id}/rating"
}
```

Submit:

`POST /marketplace/me/orders/{order_id}/rating`

```json
{
  "rating": 1,
  "comment": "The result did not cover the agreed scope"
}
```

Rules:

- Rating must be from 1 to 5.
- It is available for 15 minutes after seller completion.
- It can be submitted once.
- After 15 minutes, backend returns `rating_window_closed`.
- A rating of 1 or 2 automatically creates a call center quality complaint.
- The rating updates the seller’s aggregate marketplace rating.

The comment is optional for normal ratings but should be requested in the UI for low ratings.

## 15. Error Handling

Important error codes:

- `marketplace_order_already_active`
- `marketplace_package_order_already_active`
- `package_seller_not_eligible`
- `package_not_available_for_seller`
- `unknown_price_options`
- `duplicate_price_option`
- `negative_price_adjustment_forbidden`
- `additional_payment_must_increase_price`
- `additional_payment_not_allowed`
- `marketplace_result_required`
- `rating_window_closed`
- `ticket_closed`

Display the backend message. Do not replace these business errors with a generic failure message.

## 16. Frontend State Rules

- Render all option groups as checkbox multi-select groups.
- Empty selection is valid.
- Recalculate only by calling the quote endpoint.
- Disable purchase while quote request is pending.
- Submit the exact `selected_option_ids` used for the latest quote.
- Use backend totals; never calculate money locally.
- Hide seller price controls for packages.
- Hide service/package creation from seller roles.
- Show package enable/disable controls to eligible sellers.
- PREMIUM must show extended verification requirements returned by backend.
- Use WebSocket events to update payment, order, supplemental payment, refund, and completion state.
- Show rating countdown from backend `deadline_at` and still handle backend rejection because client clocks are not authoritative.

## 17. Role Matrix

### Studio Worker

- Creates categories, services, options, and package tiers.
- Uses Studio approval and publish workflow.
- Cannot bypass backend validation.

### Studio Reviewer/Publisher/Superadmin

- Reviews and publishes constructor versions.
- Controls runtime catalog output.
- Manages approval routes according to assigned permission.

### Lawyer or Legal Consultant

- Selects and prices an existing ordinary service within backend limits.
- Enables/disables existing packages.
- Cannot create catalog services.
- Cannot edit package price/content.
- Receives paid orders only.
- May request additional payment using Studio options.
- Must provide text or file evidence to complete.

### Client

- Selects seller then ordinary service.
- Selects package tier then eligible seller for package flow.
- May select multiple optional additions.
- Receives Telegram-confirmed payment state in realtime.
- Receives result inside the system.
- Has 15 minutes to rate or submit a low-rating complaint.

### Call Center Operator

- Acts only inside an open assigned support ticket.
- Can select an ordinary service or package for the client.
- Can replace supplemental selections.
- Can request full or partial refund.
- Cannot silently confirm payment or refund; Telegram approval is required.

## 18. Acceptance Checklist

- Ten Studio groups appear in backend order.
- Services and Packages is first.
- Advertising is last and separate.
- K01, K02, K29, K03-M appear in that sequence.
- K29 sections render as multi-select checkboxes.
- Zero, one, or many options can be selected.
- Quote breakdown and final total match backend.
- Seller cannot create a service.
- Seller service price cannot exceed backend maximum.
- Seller cannot edit package price.
- Disabled packages do not return the seller in eligible sellers.
- BASIC and STANDARD work without extended verification.
- PREMIUM requires extended verification.
- Service and package purchases wait for Telegram confirmation.
- Paid order opens secure chat for client and seller.
- Call center action is blocked outside an assigned open ticket.
- Supplemental request pauses work and expires after 24 hours.
- Operator can replace options or start Telegram-approved refund.
- Completion is blocked without result text/files.
- Rating works only during the 15-minute window.
- A 1–2 rating creates a quality complaint.

# LexGo Studio Services and Packages V2

## 1. Scope

This contract describes the production frontend integration for:

- Studio service and package construction.
- Studio price option construction.
- Lawyer and legal consultant service activation.
- Lawyer and legal consultant package activation.
- Client direct service purchase.
- Client package purchase.
- Call center assisted purchase inside an assigned support ticket.
- Telegram inline payment confirmation.
- Supplemental payment requests.
- Support escalation, replacement selections, and refunds.
- Marketplace result delivery.
- The 15-minute rating and complaint window.

Do not infer business rules in the frontend. Render fields, prices, eligibility, actions, and deadlines returned by the backend.

## 2. Studio Navigation

`GET /studio/constructors`

The backend returns ten ordered groups. Render them in the returned `order` and never sort alphabetically.

1. `services_packages` — Services and packages
2. `documents_texts` — Documents and texts
3. `process_quality` — Process and quality
4. `communications` — Communication and notifications
5. `finance_tariffs` — Finance and tariffs
6. `security_access` — Security and access
7. `operations` — Operations
8. `integrations` — Integrations
9. `system_reference` — System and reference data
10. `advertising` — Advertising

The former Marketplace group is now `services_packages`. Advertising is intentionally separate and last.

## 3. Services and Packages Constructors

The required order inside `services_packages` is:

1. `K01` — Category and client situation
2. `K02` — Ordinary service
3. `K29` — Price-increasing options
4. `K03-M` — Service package

The frontend must show this sequence and dependency state from the constructor catalog.

### 3.1 K01 Category

Create categories before services. Use the reference endpoints returned by the constructor schema for parent/category selectors.

### 3.2 K02 Ordinary Service

Only Studio creates services. Lawyers and legal consultants cannot create a new service.

Important fields:

- `title`
- `category_id`
- `description`
- `client_value`
- `base_price`
- `max_price`
- `seller_requirements`
- `delivery_minutes`
- `executor_type`
- `is_active`

`service_id` is context-managed. On create, do not ask for an existing service ID. On edit, open the selected record through constructor records/form context and let the backend inject the ID.

`max_price` is the maximum price a seller may choose for this service. The seller may lower the price but may never exceed the backend maximum.

### 3.3 K29 Price Options

K29 attaches optional price-increasing choices to either one service or one package.

The schema is nested:

```json
{
  "target_type": "service",
  "service_id": "uuid",
  "title": "Service options",
  "sections": [
    {
      "id": "location",
      "title": "Location",
      "description": "Optional location-related additions",
      "sort_order": 1,
      "options": [
        {
          "id": "tashkent-lawyer",
          "label": "A lawyer from Tashkent is required",
          "description": "Adds the configured amount",
          "adjustment_type": "fixed",
          "value": 100000,
          "sort_order": 1
        },
        {
          "id": "urgent",
          "label": "Urgent execution",
          "adjustment_type": "percent",
          "value": 20,
          "sort_order": 2
        }
      ]
    }
  ],
  "is_active": true
}
```

All option controls are multi-select. Never render radio buttons or a single-select control.

Every section is optional. The client may buy the base service/package without selecting any option.

Allowed adjustment types:

- `fixed`: add a fixed UZS amount.
- `percent`: add a percentage of the base price.

Options only increase the price. The backend rejects negative values, unknown IDs, duplicate IDs, and unsupported adjustment types.

For package options use:

```json
{
  "target_type": "package",
  "package_id": "uuid"
}
```

### 3.4 K03-M Package

A package may contain:

- Existing Studio services in `components`.
- Free-form package content in `custom_items`.
- Both at the same time.

The package must contain exactly three independent variants in `tiers`:

- `BASIC`
- `STANDARD`
- `PREMIUM`

Each tier has its own price, title, description, duration, and included content. Prices may be lower or higher than the sum of component services. The frontend must not impose a calculated upper or lower bound.

Example:

```json
{
  "package_code": "BUSINESS-LEGAL",
  "title": "Business legal support",
  "category_id": "uuid",
  "components": [
    {
      "service_id": "uuid",
      "kind": "mandatory",
      "quantity": 1
    }
  ],
  "custom_items": [
    {
      "title": "Monthly legal risk summary",
      "description": "Prepared by the assigned specialist",
      "required": true
    }
  ],
  "tiers": [
    {
      "tier": "BASIC",
      "title": "Basic",
      "price": 500000,
      "duration": "7 days",
      "included": ["One consultation"]
    },
    {
      "tier": "STANDARD",
      "title": "Standard",
      "price": 900000,
      "duration": "14 days",
      "included": ["Consultation", "Document review"]
    },
    {
      "tier": "PREMIUM",
      "title": "Premium",
      "price": 1500000,
      "duration": "30 days",
      "included": ["Priority support", "Extended verification specialist"]
    }
  ],
  "is_active": true
}
```

## 4. Client Price Option APIs

### 4.1 Service Options

`GET /marketplace/services/{service_id}/price-options`

Response essentials:

```json
{
  "target_type": "service",
  "target_id": "uuid",
  "base_price": 100000,
  "currency": "UZS",
  "selection_type": "multi_select",
  "all_optional": true,
  "sections": []
}
```

### 4.2 Service Quote

`POST /marketplace/services/{service_id}/quote`

```json
{
  "lawyer_user_id": "uuid",
  "selected_option_ids": ["tashkent-lawyer", "urgent"]
}
```

Use `quote.total_price` as the only authoritative total. Show `quote.breakdown` to explain every increase.

### 4.3 Package Options

`GET /marketplace/service-packages/{package_id}/price-options`

Package options include:

- Options attached directly to the package.
- Options attached to package component services.

Option IDs are globally unique within the returned package form.

### 4.4 Package Quote

`POST /marketplace/service-packages/{package_id}/quote`

```json
{
  "selected_option_ids": ["option-a", "option-b"]
}
```

The response uses the same quote format as the service quote.

## 5. Seller Role

Applicable roles:

- `advokat`
- `yurist`
- Supported organization seller accounts where the existing seller management API grants access

### 5.1 Ordinary Services

Use the existing endpoints:

- `GET /lawyers/me/services/manage`
- `POST /lawyers/me/services/manage`
- `PATCH /lawyers/me/services/{service_id}`
- `PATCH /lawyers/me/services/{service_id}/status`
- `DELETE /lawyers/me/services/{service_id}`

The seller selects a Studio-created service and may set a lower price. Backend validation rejects a price over the allowed maximum.

Do not show a Create Service action to a seller.

### 5.2 Packages

`GET /lawyers/me/packages/manage`

Returns all active Studio packages with:

- `enabled`
- `status`
- `price_editable=false`
- `eligibility`
- package details

Enable a package:

`POST /lawyers/me/packages/{package_id}/enable`

Enable or disable an already selected package:

`PATCH /lawyers/me/packages/{package_id}/status`

```json
{
  "status": "active"
}
```

or:

```json
{
  "status": "disabled"
}
```

The seller cannot change a package price or package content.

## 6. Package Seller Matching

`GET /service-packages/{package_id}/eligible-sellers?limit=30&offset=0`

Only sellers who explicitly enabled this package are returned.

Current matching rules:

- BASIC: an enabled active seller may be shown; extended LexGo verification is optional.
- STANDARD: an enabled active seller may be shown and is ranked by rating, completed trust signals, and experience.
- PREMIUM: the seller must have extended LexGo verification.

Use each item’s `package_purchase_url`. Do not construct another path.

Sort order is authoritative from the backend.

## 7. Client Purchase Flows

### 7.1 Ordinary Service

Required order:

1. Client chooses a lawyer/legal consultant.
2. Client opens that seller’s enabled services.
3. Client fetches service price options.
4. Client selects zero or more options.
5. Client requests a quote.
6. Client submits the purchase request.

Purchase endpoint:

`POST /marketplace/lawyers/{lawyer_user_id}/services/{service_id}/purchase-request`

```json
{
  "selected_option_ids": ["option-a", "option-b"],
  "note": "Client request",
  "preferred_channel": "chat",
  "preferred_time": "2026-10-15T10:00:00+05:00"
}
```

### 7.2 Package

Required order:

1. Client chooses package and BASIC/STANDARD/PREMIUM tier.
2. Client fetches eligible sellers.
3. Client chooses one seller.
4. Client fetches package options.
5. Client selects zero or more options.
6. Client requests a quote.
7. Client submits the package purchase request.

Purchase endpoint:

`POST /marketplace/service-packages/{package_id}/lawyers/{lawyer_user_id}/purchase-request`

Request body is the same as the ordinary service purchase request.

One seller fulfills one package order.

## 8. Telegram Payment Confirmation

Both service and package purchases initially return:

- order with `status=pending_payment`
- payment with `status=pending`
- purchase request with `status=pending`
- `next_status=admin_telegram_confirm_required`

The backend sends inline approval to configured approver chats.

After approval:

- order becomes `paid`
- payment becomes `paid`
- a secure chat is created
- client receives `marketplace.order_paid`
- seller receives `marketplace.order_paid`

After rejection:

- order becomes `cancelled`
- payment becomes `cancelled`
- both parties receive realtime status updates

Listen on the existing authenticated user WebSocket. Do not poll payment status continuously.

## 9. Call Center Assisted Purchase

The operator may act only inside an open support ticket assigned to that operator.

`POST /call-center/support/tickets/{ticket_id}/assist/marketplace-purchase-request`

Ordinary service:

```json
{
  "lawyer_user_id": "uuid",
  "service_id": "uuid",
  "selected_option_ids": [],
  "note": "Operator entered client request"
}
```

Package:

```json
{
  "lawyer_user_id": "uuid",
  "package_id": "uuid",
  "selected_option_ids": [],
  "note": "Operator entered client request"
}
```

Send exactly one of `service_id` or `package_id`.

The payment request belongs to the client, not the operator. Telegram approval and realtime client updates use the same purchase flow.

## 10. Seller Work Execution

Seller orders:

`GET /marketplace/me/orders?role_view=seller`

Client orders:

`GET /marketplace/me/orders?role_view=client`

The order payload contains:

- secure chat URL
- call creation URL
- selected options and quote snapshot
- package snapshot when applicable
- completion URL
- result text/files after completion
- rating state and rating URL

The seller may work through secure chat and calls. The backend does not require a specific work channel.

## 11. Supplemental Payment

If the client purchased without required optional additions, the assigned seller may select only options configured by Studio.

`POST /marketplace/me/orders/{order_id}/additional-payment-request`

```json
{
  "selected_option_ids": ["studio-option-id"],
  "note": "This option is required for the requested scope"
}
```

Rules:

- Unknown IDs are rejected.
- The new total must be greater than the already paid order total.
- The order changes to `waiting_payment`.
- Work is paused.
- Telegram inline confirmation is sent.
- The request is valid for 24 hours.
- At 21 hours, operators receive an expiration warning.
- At 24 hours, the backend creates a support ticket and emits `marketplace.additional_payment_escalated`.

Realtime events:

- `marketplace.additional_payment_requested`
- `marketplace.additional_payment_approved`
- `marketplace.additional_payment_rejected`
- `marketplace.additional_payment_escalated`

After approval, the order returns to the previous work status and the new total becomes authoritative.

## 12. Operator Resolution

Inside the assigned support ticket:

`POST /call-center/support/tickets/{ticket_id}/assist/marketplace-additional-payment/{request_id}/resolve`

### 12.1 Replace Options and Resend

```json
{
  "action": "replace_options",
  "selected_option_ids": ["replacement-option-id"]
}
```

The backend cancels the previous pending payment, recalculates the total, creates a new pending payment, resets the 24-hour period, and resends Telegram confirmation.

### 12.2 Full Refund

```json
{
  "action": "full_refund",
  "reason": "Client and operator agreed to cancel"
}
```

### 12.3 Partial Refund

```json
{
  "action": "partial_refund",
  "amount": 100000,
  "reason": "Scope was reduced"
}
```

Refunds require Telegram inline approval. Listen for:

- `marketplace.refund_approved`
- `marketplace.refund_rejected`

## 13. Completion

`POST /marketplace/me/orders/{order_id}/complete`

The assigned seller must provide at least one of:

- non-empty `result_text`
- one or more entries in `result_files`

Example:

```json
{
  "result_text": "The consultation and written conclusion are complete.",
  "result_files": [
    {
      "file_id": "uuid",
      "file_name": "legal-conclusion.pdf",
      "download_url": "/secure-files/uuid"
    }
  ]
}
```

The backend rejects empty completion with `marketplace_result_required`.

Client acceptance is not required. Completion immediately opens the rating/complaint window.

## 14. Rating and Complaint

After completion, read:

```json
{
  "rating": {
    "available": true,
    "closed": false,
    "reason": "",
    "deadline_at": "2026-10-14T12:15:00Z",
    "remaining_seconds": 900
  },
  "rating_url": "/marketplace/me/orders/{order_id}/rating"
}
```

Submit:

`POST /marketplace/me/orders/{order_id}/rating`

```json
{
  "rating": 1,
  "comment": "The result did not cover the agreed scope"
}
```

Rules:

- Rating must be from 1 to 5.
- It is available for 15 minutes after seller completion.
- It can be submitted once.
- Render the rating action only while `rating.available` is `true`.
- Use `remaining_seconds` for the countdown, but always treat the backend deadline as authoritative.
- After 15 minutes, backend returns `rating_window_closed`.
- A rating of 1 or 2 automatically creates a call center quality complaint.
- The rating updates the seller’s aggregate marketplace rating.

The comment is optional for normal ratings but should be requested in the UI for low ratings.

## 15. Error Handling

Important error codes:

- `marketplace_order_already_active`
- `marketplace_package_order_already_active`
- `package_seller_not_eligible`
- `package_not_available_for_seller`
- `unknown_price_options`
- `duplicate_price_option`
- `negative_price_adjustment_forbidden`
- `additional_payment_must_increase_price`
- `additional_payment_not_allowed`
- `marketplace_result_required`
- `rating_window_closed`
- `ticket_closed`

Display the backend message. Do not replace these business errors with a generic failure message.

## 16. Frontend State Rules

- Render all option groups as checkbox multi-select groups.
- Empty selection is valid.
- Recalculate only by calling the quote endpoint.
- Disable purchase while quote request is pending.
- Submit the exact `selected_option_ids` used for the latest quote.
- Use backend totals; never calculate money locally.
- Hide seller price controls for packages.
- Hide service/package creation from seller roles.
- Show package enable/disable controls to eligible sellers.
- PREMIUM must show extended verification requirements returned by backend.
- Use WebSocket events to update payment, order, supplemental payment, refund, and completion state.
- Show rating countdown from backend `deadline_at` and still handle backend rejection because client clocks are not authoritative.

## 17. Role Matrix

### Studio Worker

- Creates categories, services, options, and package tiers.
- Uses Studio approval and publish workflow.
- Cannot bypass backend validation.

### Studio Reviewer/Publisher/Superadmin

- Reviews and publishes constructor versions.
- Controls runtime catalog output.
- Manages approval routes according to assigned permission.

### Lawyer or Legal Consultant

- Selects and prices an existing ordinary service within backend limits.
- Enables/disables existing packages.
- Cannot create catalog services.
- Cannot edit package price/content.
- Receives paid orders only.
- May request additional payment using Studio options.
- Must provide text or file evidence to complete.

### Client

- Selects seller then ordinary service.
- Selects package tier then eligible seller for package flow.
- May select multiple optional additions.
- Receives Telegram-confirmed payment state in realtime.
- Receives result inside the system.
- Has 15 minutes to rate or submit a low-rating complaint.

### Call Center Operator

- Acts only inside an open assigned support ticket.
- Can select an ordinary service or package for the client.
- Can replace supplemental selections.
- Can request full or partial refund.
- Cannot silently confirm payment or refund; Telegram approval is required.

## 18. Acceptance Checklist

- Ten Studio groups appear in backend order.
- Services and Packages is first.
- Advertising is last and separate.
- K01, K02, K29, K03-M appear in that sequence.
- K29 sections render as multi-select checkboxes.
- Zero, one, or many options can be selected.
- Quote breakdown and final total match backend.
- Seller cannot create a service.
- Seller service price cannot exceed backend maximum.
- Seller cannot edit package price.
- Disabled packages do not return the seller in eligible sellers.
- BASIC and STANDARD work without extended verification.
- PREMIUM requires extended verification.
- Service and package purchases wait for Telegram confirmation.
- Paid order opens secure chat for client and seller.
- Call center action is blocked outside an assigned open ticket.
- Supplemental request pauses work and expires after 24 hours.
- Operator can replace options or start Telegram-approved refund.
- Completion is blocked without result text/files.
- Rating works only during the 15-minute window.
- A 1–2 rating creates a quality complaint.
