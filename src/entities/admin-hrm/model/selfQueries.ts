import { useQuery } from "@tanstack/react-query";
import { getMyApprovals, getMyAttendance, getMyKpis, getMyMessages, getMyTasks, getProfile, getToday } from "../api/selfApi";
import { hrmKey } from "./keys";

export const useToday = () => useQuery({ queryKey: hrmKey("today"), queryFn: getToday });
export const useProfile = () => useQuery({ queryKey: hrmKey("profile"), queryFn: getProfile });
export const useMyKpis = () => useQuery({ queryKey: hrmKey("my-kpis"), queryFn: getMyKpis });
export const useMyMessages = () => useQuery({ queryKey: hrmKey("my-messages"), queryFn: getMyMessages });
export const useMyTasks = (q: string, status: string) => useQuery({ queryKey: hrmKey("my-tasks", q, status), queryFn: () => getMyTasks({ q, status }) });
export const useMyApprovals = (status: string) => useQuery({ queryKey: hrmKey("my-approvals", status), queryFn: () => getMyApprovals(status) });
export const useMyAttendance = (from: string, to: string) =>
  useQuery({ queryKey: hrmKey("my-attendance", from, to), queryFn: () => getMyAttendance({ date_from: from, date_to: to }) });
