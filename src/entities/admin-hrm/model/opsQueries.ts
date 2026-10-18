import { useQuery } from "@tanstack/react-query";
import { getAnalytics, getPayrollSummary, listKpis, listPayroll } from "../api/opsApi";
import { hrmKey } from "./keys";

export const useKpis = (employeeId: string, period: string) =>
  useQuery({ queryKey: hrmKey("kpis", employeeId, period), queryFn: () => listKpis({ employee_id: employeeId, period }) });
export const usePayroll = (employeeId: string, period: string) =>
  useQuery({ queryKey: hrmKey("payroll", employeeId, period), queryFn: () => listPayroll({ employee_id: employeeId, period }) });
export const usePayrollSummary = (period: string) => useQuery({ queryKey: hrmKey("payroll-sum", period), queryFn: () => getPayrollSummary(period) });
export const useAnalytics = (from: string, to: string) =>
  useQuery({ queryKey: hrmKey("analytics", from, to), queryFn: () => getAnalytics({ date_from: from, date_to: to }) });
