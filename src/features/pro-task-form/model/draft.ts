import { STAGES, stageOf, type CheckItem, type ProTask, type TaskStage } from "@/entities/pro-tasks";

export type Draft = {
  title: string;
  priority: string;
  due: string;
  caseId: string;
  description: string;
  checklist: CheckItem[];
  newItem: string; // text typed in the checklist's add row, not yet added
  stage: TaskStage;
  blocked: boolean;
};

export const draftOf = (task: ProTask | null, caseId = ""): Draft => ({
  title: task?.title ?? "",
  priority: task?.priority || "medium",
  due: task?.dueDate ?? "",
  caseId: task?.caseId ?? caseId,
  description: task?.description ?? "",
  checklist: task?.checklist ?? [],
  newItem: "",
  stage: task ? stageOf(task.status) : STAGES[0],
  blocked: task?.status === "blocked",
});

// Backend status of a draft: "blocked" overrides the stage.
export const statusOf = (d: Draft): string => (d.blocked ? "blocked" : d.stage);
