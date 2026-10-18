import { asArr, asDict, asNum, asStr } from "@/shared/lib/json";
import { hrmGet, hrmList, hrmPost } from "./core";
import { normEmployee } from "./normPeople";
import { normApproval, normMessage, normTask } from "./normWork";
import { normDay, normKpi } from "./normOps";
import type { Today, MyKpis, Profile } from "../model/typesOps";

// GET /internal/me/today → today's attendance day (or null), today's tasks and the pending-approval counter.
export async function getToday(): Promise<Today> {
  const d = asDict(await hrmGet("/me/today"));
  return {
    date: asStr(d.date), name: normEmployee(d.employee).name, pendingApprovals: asNum(d.pending_approvals),
    attendance: d.attendance ? normDay(d.attendance) : null, tasks: asArr(d.tasks).map(normTask),
  };
}

export async function getProfile(): Promise<Profile> {
  const d = asDict(await hrmGet("/me/profile"));
  const u = asDict(d.user);
  return { name: asStr(u.name), phone: asStr(u.phone), employee: d.employee ? normEmployee(d.employee) : null };
}

export async function getMyKpis(): Promise<MyKpis> {
  const d = asDict(await hrmGet("/me/kpis"));
  return { period: asStr(d.period), score: asNum(d.score), items: asArr(d.items).map(normKpi) };
}

export const getMyTasks = async (p: { q?: string; status?: string }) => (await hrmList("/me/tasks", { ...p, limit: 100 })).map(normTask);
export const getMyAttendance = async (p: { date_from?: string; date_to?: string }) => (await hrmList("/me/attendance", p)).map(normDay);
export const getMyMessages = async () => (await hrmList("/me/messages", { limit: 100 })).map(normMessage);
export const getMyApprovals = async (status: string) => (await hrmList("/me/approvals", { status })).map(normApproval);

// POST /internal/messages — a direct message to one user (the server fills thread_id and the sender).
export const sendMessage = async (recipientId: string, body: string, subject = "") =>
  normMessage(await hrmPost("/messages", { recipient_user_id: recipientId, thread_type: "direct", thread_id: null, ...(subject ? { subject } : {}), body, attachments: [] }));

// POST /internal/approvals/{id}/decision — decision is "approved" or "rejected".
export const decideApproval = (id: string, decision: "approved" | "rejected", comment: string) =>
  hrmPost(`/approvals/${encodeURIComponent(id)}/decision`, { decision, comment });
