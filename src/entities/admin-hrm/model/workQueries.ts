import { useQuery } from "@tanstack/react-query";
import { listDays, listSchedules, listTasks, type DayFilter, type TaskFilter } from "../api/workApi";
import { hrmKey } from "./keys";

export const useTasks = (f: TaskFilter) => useQuery({ queryKey: hrmKey("tasks", f), queryFn: () => listTasks(f) });
export const useDays = (f: DayFilter) => useQuery({ queryKey: hrmKey("days", f), queryFn: () => listDays(f) });
export const useSchedules = (employeeId: string, unitId: string) =>
  useQuery({ queryKey: hrmKey("schedules", employeeId, unitId), queryFn: () => listSchedules({ employee_id: employeeId, org_unit_id: unitId }) });
