import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import {
  commentTask, createKpi, createPayroll, createSchedule, createTask, decideApproval, hrmKeys, recordEvent, sendMessage, setTaskStatus,
  type KpiInput, type PayrollInput, type ScheduleInput, type TaskInput,
} from "@/entities/admin-hrm";

const refresh = [hrmKeys.all];

export const useCreateTask = () => useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (i: TaskInput) => createTask(i) });
export const useTaskStatus = () => useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (v: { id: string; status: string }) => setTaskStatus(v.id, v.status) });
export const useTaskComment = () => useAdminMutation({ invalidate: refresh, success: "admHrmC.commentSent", mutationFn: (v: { id: string; body: string }) => commentTask(v.id, v.body) });
export const useCreateSchedule = () => useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (i: ScheduleInput) => createSchedule(i) });
export const useCreateKpi = () => useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (i: KpiInput) => createKpi(i) });
export const useCreatePayroll = () => useAdminMutation({ invalidate: refresh, success: "adm.saved", mutationFn: (i: PayrollInput) => createPayroll(i) });

// Attendance event for the signed-in user, or for `employeeId` when a manager records it for someone else.
export const useAttendanceEvent = () =>
  useAdminMutation({ invalidate: refresh, success: "admHrm.eventSaved", mutationFn: (v: { type: string; employeeId?: string }) => recordEvent(v.type, v.employeeId) });

export const useSendMessage = () =>
  useAdminMutation({ invalidate: refresh, success: "admHrm.sent", mutationFn: (v: { to: string; body: string; subject?: string }) => sendMessage(v.to, v.body, v.subject) });

export const useDecide = () =>
  useAdminMutation({ invalidate: refresh, success: "admHrm.decided", mutationFn: (v: { id: string; decision: "approved" | "rejected"; comment: string }) => decideApproval(v.id, v.decision, v.comment) });
