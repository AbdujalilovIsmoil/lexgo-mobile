import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import type { Approval, Message, Task } from "../model/typesWork";

export function normTask(v: unknown): Task {
  const d = asDict(v);
  return {
    id: asStr(d.id), code: asStr(d.work_code), title: asStr(d.title), description: asStr(d.description), project: asStr(d.project),
    priority: asStr(d.priority, "normal"), status: asStr(d.status, "new"), responsibleId: asStr(d.responsible_employee_id),
    responsibleName: asStr(asDict(d.responsible_employee).display_name), unitId: asStr(d.org_unit_id), deadline: asStr(d.deadline_at),
    createdAt: asStr(d.created_at), completedAt: asStr(d.completed_at),
    checklist: asArr(d.checklist).map((c) => ({ title: asStr(asDict(c).title), done: asDict(c).done === true })),
    progress: asNum(asDict(d.meta).progress_percent, -1),
  };
}

export function normApproval(v: unknown): Approval {
  const d = asDict(v);
  return {
    id: asStr(d.id), type: asStr(d.approval_type), title: asStr(d.title), targetType: asStr(d.target_type),
    requesterId: asStr(d.requester_user_id), approverId: asStr(d.approver_user_id), status: asStr(d.status, "pending"),
    comment: asStr(d.decision_comment), payload: asDict(d.payload), decidedAt: asStr(d.decided_at), createdAt: asStr(d.created_at),
  };
}

export function normMessage(v: unknown): Message {
  const d = asDict(v);
  return {
    id: asStr(d.id), threadType: asStr(d.thread_type, "direct"), senderId: asStr(d.sender_user_id), recipientId: asStr(d.recipient_user_id),
    subject: asStr(d.subject), body: asStr(d.body), status: asStr(d.status), readAt: asStr(d.read_at), createdAt: asStr(d.created_at),
  };
}
