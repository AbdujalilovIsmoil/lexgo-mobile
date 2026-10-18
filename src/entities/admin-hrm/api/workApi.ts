import { hrmPatch, hrmPost } from "./core";
import { hrmListAll } from "./opsAll";
import { normTask } from "./normWork";
import { normDay, normSchedule } from "./normOps";

export type TaskFilter = { q?: string; status?: string; project?: string; responsible_employee_id?: string; date_from?: string; date_to?: string };
export type TaskInput = { title: string; description: string; project: string; employeeId: string; unitId: string; priority: string; deadline: string };
export type ScheduleInput = { title: string; employeeId: string; unitId: string; weekly: { day: string; start: string; end: string }[] };
export type DayFilter = { employee_id?: string; date_from?: string; date_to?: string };

export const listTasks = async (f: TaskFilter) => (await hrmListAll("/execution/tasks", f)).map(normTask);
export const createTask = async (i: TaskInput) =>
  normTask(await hrmPost("/execution/tasks", {
    title: i.title, description: i.description, project: i.project || "internal", responsible_employee_id: i.employeeId || null, org_unit_id: i.unitId || null,
    priority: i.priority, deadline_at: i.deadline ? `${i.deadline}T18:00:00+05:00` : null, checklist: [], participants: [], attachments: [], meta: {},
  }));
export const setTaskStatus = (id: string, status: string) => hrmPatch(`/execution/tasks/${id}/status`, { status });
export const commentTask = (id: string, body: string) => hrmPost(`/execution/tasks/${id}/comments`, { body });

export const listSchedules = async (p: { employee_id?: string; org_unit_id?: string }) => (await hrmListAll("/time/schedules", p)).map(normSchedule);
export const createSchedule = async (i: ScheduleInput) =>
  normSchedule(await hrmPost("/time/schedules", {
    title: i.title, employee_id: i.employeeId || null, org_unit_id: i.unitId || null, schedule_type: "weekly", timezone: "Asia/Tashkent",
    weekly: i.weekly.map((w) => ({ ...w, break_minutes: 60 })), status: "active",
  }));
export const listDays = async (f: DayFilter) => (await hrmListAll("/time/attendance/days", f)).map(normDay);
// POST /internal/time/attendance/events — without employee_id the server uses the signed-in user's employee.
export const recordEvent = (type: string, employeeId?: string) =>
  hrmPost("/time/attendance/events", { event_type: type, ...(employeeId ? { employee_id: employeeId } : {}) });
