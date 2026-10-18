import { asDict, asStr } from "@/shared/lib/json";
import { workKind } from "../model/kind";
import type { Work, WorkPerson } from "../model/types";

// Only name and role of a person: the backend also sends phones, which stay unread.
export function normPerson(v: unknown): WorkPerson | null {
  const d = asDict(v);
  const name = asStr(d.name) || [asStr(d.first_name), asStr(d.last_name)].filter(Boolean).join(" ");
  return name ? { name, role: asStr(d.role).toLowerCase() } : null;
}

export function normWork(v: unknown): Work {
  const d = asDict(v);
  const type = asStr(d.type);
  return {
    id: asStr(d.id),
    workId: asStr(d.work_id),
    type,
    kind: workKind(type),
    title: asStr(d.title) || asStr(d.document_title),
    status: asStr(d.status).toLowerCase(),
    statusLabel: asStr(d.status_label),
    serviceKind: asStr(d.service_kind),
    assignee: normPerson(d.assigned_lawyer),
    operator: normPerson(d.operator),
    hasChat: Boolean(d.has_chat),
    hasMeeting: Boolean(d.has_meeting),
    nextAction: asStr(d.next_action),
    documentRequestId: asStr(d.document_request_id),
    createdAt: asStr(d.created_at),
    updatedAt: asStr(d.updated_at),
  };
}
