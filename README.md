# LexGo Task Management Frontend Contract

Date: 2026-10-20

API base URL: `https://lexgo.api.cognilabs.org`

Task API namespace: `/task-management`

This is a new internal task domain. Do not use the legacy `/tasks`, `/internal/me/tasks`, or `/internal/execution/tasks` endpoints for this UI.

## 1. Products to build

Build two independent frontends:

1. A Task Management section inside the existing LexGo web application.
2. A Telegram Mini App as a separate frontend project with a separate Vercel deployment.

Both products use the same `/task-management` APIs and the same four statuses.

## 2. Users and authorization

The backend returns effective permissions in `POST /auth/login -> user.permissions`.

Relevant permissions:

| Permission              | Meaning                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| `tasks.view`            | View all active tasks and task details                                                        |
| `tasks.manage`          | Create and edit tasks                                                                         |
| `tasks.assign`          | Add or remove assignees                                                                       |
| `tasks.status.work`     | Move assigned work from New to In Progress and from In Progress to Testing                    |
| `tasks.status.ready`    | Return a task from Testing or approve it as Ready                                             |
| `tasks.delete`          | Base delete permission; final delete availability is still controlled by `actions.can_delete` |
| `tasks.telegram.manage` | Manage the task Telegram integration                                                          |

Never infer an action from the user's primary role. Use `actions` returned for each task.

Configured access:

| User               | Access                                                                 |
| ------------------ | ---------------------------------------------------------------------- |
| Ulugbek Omonov     | Full system superadmin, full task access, the only task deletion grant |
| Saidbek Abduvaliev | View, create, edit, assign, return, approve Ready; cannot delete       |
| Akhmad             | View, create, edit, assign, return, approve Ready; cannot delete       |
| Kamron             | View all tasks; can move an assigned task to In Progress and Testing   |
| Ismoil             | View all tasks; can move an assigned task to In Progress and Testing   |

All five users can view all tasks, including unassigned tasks and tasks assigned to another user.

## 3. Status model

Use these exact backend values:

| Value         | UI label     |
| ------------- | ------------ |
| `new`         | Yangi        |
| `in_progress` | Bajarilmoqda |
| `testing`     | Testlanmoqda |
| `ready`       | Tayyor       |

Allowed transitions:

```text
new -> in_progress -> testing -> ready
                       |
                       -> in_progress with a required return comment
```

Only a user with `tasks.status.ready` can perform `testing -> ready` or `testing -> in_progress`.

The return comment is mandatory. Display it prominently in task history and to the assigned users.

## 4. Main page

The requested presentation is a list, not a Kanban board.

Recommended desktop structure:

- Main content: paginated task list.
- Right side: the four status filters and counts.
- Header: search, assignee filter, deadline date range, create button when permitted.
- Each row: task code, title, assignees, deadline, overdue indicator, status, updated time and available status action.
- Do not show a delete action unless `actions.can_delete === true`.

Recommended mobile structure:

- Statuses as a horizontal segmented control.
- Filters in a sheet.
- Tasks as compact list rows.
- Task action in a bottom sheet.

## 5. Metadata

### `GET /task-management/meta`

Returns status order, user capabilities and realtime event names.

Example:

```json
{
  "statuses": [
    { "value": "new", "label": "Yangi", "order": 1 },
    { "value": "in_progress", "label": "Bajarilmoqda", "order": 2 },
    { "value": "testing", "label": "Testlanmoqda", "order": 3 },
    { "value": "ready", "label": "Tayyor", "order": 4 }
  ],
  "capabilities": {
    "create": true,
    "assign": true,
    "approve_ready": true,
    "delete_ready": false
  },
  "realtime": {
    "ws_url": "/ws/users/me",
    "events": [
      "tasks.created",
      "tasks.updated",
      "tasks.assigned",
      "tasks.status_changed",
      "tasks.returned",
      "tasks.deleted"
    ]
  },
  "mini_app_configured": false
}
```

## 6. Assignment user select

### `GET /task-management/users`

Query parameters:

| Name     | Type    | Description                       |
| -------- | ------- | --------------------------------- |
| `q`      | string  | Search by name, LexGo ID or phone |
| `limit`  | integer | `1..100`, default `50`            |
| `offset` | integer | Pagination offset                 |

Response:

```json
{
  "items": [
    {
      "id": "user-uuid",
      "name": "Kamron",
      "lexgo_id": "LGC-12345678",
      "role": "client"
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0,
  "has_more": false
}
```

The displayed primary role is not the task authorization source. Task authorization comes from effective permissions and per-task actions.

Use a searchable multi-select. Send user UUID values in `assignee_user_ids` or `user_ids`.

## 7. List tasks

### `GET /task-management`

Query parameters:

| Name               | Type         | Values                                         |
| ------------------ | ------------ | ---------------------------------------------- |
| `status`           | string       | `new`, `in_progress`, `testing`, `ready`       |
| `assignee_user_id` | string       | User UUID, `me`, or `unassigned`               |
| `q`                | string       | Searches task code, title and description      |
| `deadline_from`    | ISO datetime | Inclusive lower boundary                       |
| `deadline_to`      | ISO datetime | Inclusive upper boundary                       |
| `include_deleted`  | boolean      | Only available to the authorized deletion user |
| `limit`            | integer      | `1..100`, default `30`                         |
| `offset`           | integer      | Pagination offset                              |

Response:

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
  }
}
```

Newest updates are returned first.

## 8. Task object

```json
{
  "id": "task-uuid",
  "task_code": "TSK-210740",
  "title": "Production deploy",
  "description": "Deploy and test the release",
  "status": "in_progress",
  "status_label": "Bajarilmoqda",
  "deadline_at": "2026-10-21T12:00:00+00:00",
  "is_overdue": false,
  "creator": {
    "id": "user-uuid",
    "name": "Akhmad",
    "lexgo_id": "LGC-12345678"
  },
  "assignees": [
    {
      "id": "user-uuid",
      "name": "Kamron",
      "lexgo_id": "LGC-23456789",
      "role": "client",
      "assigned_at": "2026-10-20T10:00:00+00:00"
    }
  ],
  "ready_by": null,
  "ready_at": null,
  "lock_version": 2,
  "created_at": "2026-10-20T10:00:00+00:00",
  "updated_at": "2026-10-20T10:05:00+00:00",
  "deleted_at": null,
  "delete_reason": "",
  "actions": {
    "can_edit": false,
    "can_assign": false,
    "can_delete": false,
    "can_change_status": true,
    "next_statuses": ["testing"],
    "is_assigned": true
  }
}
```

The UI must render action buttons from `actions.next_statuses`. Do not reconstruct transition rules on the frontend.

## 9. Create task

### `POST /task-management`

```json
{
  "title": "Release testing",
  "description": "Test API and client flows",
  "deadline_at": "2026-10-21T18:00:00+05:00",
  "assignee_user_ids": ["user-uuid-1", "user-uuid-2"]
}
```

`deadline_at` is required and must be in the future. Multiple assignees are supported. An empty list creates an unassigned task.

When an unassigned task is created, Akhmad receives a Telegram notification requesting assignment. All task users still see the task in the web list and through realtime invalidation.

Success status: `201 Created`.

## 10. Detail and audit history

### `GET /task-management/{task_id}`

Returns the full task object with a `history` array.

### `GET /task-management/{task_id}/history`

```json
{
  "items": [
    {
      "id": "history-uuid",
      "event_type": "returned",
      "from_status": "testing",
      "to_status": "in_progress",
      "comment": "The mobile flow must be retested",
      "payload": {},
      "actor": {
        "id": "user-uuid",
        "name": "Akhmad",
        "lexgo_id": "LGC-12345678"
      },
      "created_at": "2026-10-20T10:15:00+00:00"
    }
  ],
  "total": 1
}
```

Important event types:

- `created`
- `updated`
- `assignees_changed`
- `status_changed`
- `returned`
- `deleted`

## 11. Edit task

### `PATCH /task-management/{task_id}`

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "deadline_at": "2026-10-22T18:00:00+05:00",
  "expected_lock_version": 2
}
```

Only include fields being changed, but always include `expected_lock_version` from the latest task response.

## 12. Replace assignees

### `PUT /task-management/{task_id}/assignees`

```json
{
  "user_ids": ["user-uuid-1", "user-uuid-2"],
  "expected_lock_version": 3
}
```

This replaces the active assignee list. Sending an empty list makes the task unassigned and notifies Akhmad.

## 13. Change status

### `POST /task-management/{task_id}/status`

Forward transition:

```json
{
  "status": "testing",
  "comment": "",
  "expected_lock_version": 4
}
```

Return from Testing:

```json
{
  "status": "in_progress",
  "comment": "Login regression must be fixed and retested",
  "expected_lock_version": 5
}
```

The return modal must require a non-empty comment. Assigned users receive the comment through Telegram and see it in history.

When a task enters `testing`, Akhmad receives a Telegram notification.

Only Ulugbek, Saidbek and Akhmad can approve `testing -> ready`.

## 14. Delete task

### `DELETE /task-management/{task_id}`

Send a JSON body:

```json
{
  "reason": "Duplicate completed task",
  "expected_lock_version": 8
}
```

Rules:

- Only a `ready` task can be deleted.
- Only Ulugbek has the final deletion grant.
- Deletion is soft-delete.
- Audit history remains available to Ulugbek.
- The frontend must use `actions.can_delete`, not only `tasks.delete`.

## 15. Optimistic concurrency

Every mutable task response includes `lock_version`.

All edit, assignment, status and delete requests must send the latest value as `expected_lock_version`.

Conflict response:

```json
{
  "detail": {
    "code": "task_version_conflict",
    "message": "Task boshqa qurilmada yangilangan",
    "current_lock_version": 6
  }
}
```

On HTTP `409`:

1. Do not retry the mutation automatically.
2. Refetch `GET /task-management/{task_id}`.
3. Show that the task changed elsewhere.
4. Let the user review and repeat the action.

## 16. Realtime behavior

Connect to:

```text
wss://lexgo.api.cognilabs.org/ws/users/me?token=<access_token>
```

Task events:

- `tasks.created`
- `tasks.updated`
- `tasks.assigned`
- `tasks.status_changed`
- `tasks.returned`
- `tasks.deleted`

Example:

```json
{
  "event": "tasks.status_changed",
  "task_id": "task-uuid",
  "task_code": "TSK-210740",
  "status": "testing",
  "lock_version": 4,
  "updated_at": "2026-10-20T10:20:00+00:00",
  "resources": ["/task-management", "/task-management/task-uuid"]
}
```

On any task event:

1. Invalidate/refetch the list query.
2. Refetch the open task detail when `task_id` matches.
3. Preserve current filters and scroll position.
4. Do not append a guessed local object from the event; the event is an invalidation signal.

Use reconnect with exponential backoff. Refetch after every reconnect.

## 17. Telegram bot behavior

The task bot is separate from the existing OTP bot.

Backend behavior already implemented:

- Sends a task to newly assigned users.
- Sends unassigned task alerts only to Akhmad.
- Provides inline buttons for the recipient's currently allowed forward transition.
- Notifies Akhmad when a task enters Testing.
- Sends the mandatory return reason to assignees.
- Edits the existing Telegram task message when status changes.
- Sends the Ready-task daily group report at `23:00 Asia/Tashkent`.
- The daily report includes task code, title, assignees, approving user and completion time.

No Telegram bot token or webhook secret belongs in frontend code.

## 18. Telegram Mini App project

Create a separate frontend repository/project for the Mini App. Deploy it independently to Vercel.

Suggested environment variables:

```text
NEXT_PUBLIC_LEXGO_API_URL=https://lexgo.api.cognilabs.org
```

Do not add a bot token to Vercel.

### Authentication

Read raw init data from Telegram:

```ts
const initData = window.Telegram.WebApp.initData;
```

Send it without parsing or changing it:

### `POST /task-management/mini-app/auth`

```json
{
  "init_data": "query_id=...&user=...&auth_date=...&hash=..."
}
```

Response:

```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "expires_in": 2592000,
  "user": {
    "id": "user-uuid",
    "name": "Kamron",
    "lexgo_id": "LGC-12345678",
    "role": "client"
  },
  "capabilities": ["tasks.view", "tasks.status.work"]
}
```

Backend validates the Telegram signature and rejects initData older than ten minutes.

Use the returned JWT as:

```text
Authorization: Bearer <access_token>
```

### Mini App screens

The Mini App should contain:

1. All tasks.
2. My tasks.
3. Unassigned tasks.
4. Four status filters.
5. Task detail with deadline, assignees and history.
6. Available status action from `actions.next_statuses`.
7. Return comment modal for authorized managers.
8. Create/edit/assign controls only when backend capabilities allow them.

Use Telegram theme values and BackButton/MainButton APIs, but keep all authorization server-driven.

After Vercel deployment, provide the HTTPS Mini App URL to backend. Backend will set `TASKS_MINI_APP_URL` and update the Telegram bot menu/button.

## 19. Error handling

| HTTP  | Frontend behavior                                                         |
| ----- | ------------------------------------------------------------------------- |
| `401` | Clear session and open login; in Mini App rerun initData auth             |
| `403` | Hide denied action after refetch and show the backend message             |
| `404` | Remove missing task from the active list or show archived/not found state |
| `409` | Refetch due to transition/version conflict                                |
| `422` | Show field-level or business validation message                           |
| `503` | Show retry state; do not lose entered form data                           |

## 20. Acceptance checklist

- Task UI is list-based, not Kanban.
- Status controls appear on the right on desktop.
- All five configured users can view all tasks.
- Only task managers can create/edit/assign.
- Kamron and Ismoil can only advance tasks assigned to them through work statuses.
- Only Ulugbek, Saidbek and Akhmad can approve Ready.
- Returning from Testing requires a comment.
- Only Ulugbek sees and can execute delete.
- Ready is required before delete.
- Every mutation sends `expected_lock_version`.
- Realtime events invalidate both list and matching detail.
- Telegram Mini App is a separate Vercel project.
- Mini App auth sends untouched Telegram `initData` to backend.
- No bot secret is present in either frontend bundle.
