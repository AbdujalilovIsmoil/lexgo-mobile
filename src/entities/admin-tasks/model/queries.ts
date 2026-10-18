import { useQuery } from "@tanstack/react-query";
import { listTasks } from "../api/taskApi";

export const taskKeys = { all: ["admin-tasks"] as const };
export const useAdminTasks = (status: string) => useQuery({ queryKey: [...taskKeys.all, "list", status], queryFn: () => listTasks({ status }) });
