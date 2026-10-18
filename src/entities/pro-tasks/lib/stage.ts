import { todayKey } from "@/shared/lib/pro/dates";
import type { ProTask, TaskStage } from "../model/types";

export const STAGES: TaskStage[] = ["todo", "doing", "review", "done"];
const LEGACY: Record<string, TaskStage> = {
  todo: "todo", new: "todo", open: "todo", pending: "todo", blocked: "todo",
  doing: "doing", in_progress: "doing", active: "doing",
  review: "review", quality_check: "review",
  done: "done", completed: "done", closed: "done",
};
const RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };

export const stageOf = (status: string): TaskStage => LEGACY[status.toLowerCase()] ?? "todo";
export const isBlocked = (t: ProTask): boolean => t.status === "blocked";
export const isDone = (t: ProTask): boolean => stageOf(t.status) === "done";
export const isOverdue = (t: ProTask): boolean => !!t.dueDate && !isDone(t) && t.dueDate < todayKey();

// Overdue first, then priority, then the nearest due date.
export function sortTasks(list: ProTask[]): ProTask[] {
  return [...list].sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || (RANK[a.priority] ?? 1) - (RANK[b.priority] ?? 1) || (a.dueDate || "9").localeCompare(b.dueDate || "9"));
}

// Neighbouring stage in board order; null at either end.
export const stepStage = (stage: TaskStage, dir: 1 | -1): TaskStage | null => STAGES[STAGES.indexOf(stage) + dir] ?? null;
