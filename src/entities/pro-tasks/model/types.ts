export type TaskStage = "todo" | "doing" | "review" | "done";
export type CheckItem = { text: string; done: boolean };

export type ProTask = {
  id: string;
  title: string;
  status: string; // backend value: todo · doing · review · blocked · done
  priority: string; // low · medium · high
  dueDate: string; // YYYY-MM-DD or ""
  caseId: string;
  caseTitle: string;
  description: string;
  checklist: CheckItem[];
  updatedAt: string;
};

// Body of POST /tasks and PATCH /tasks/{id} (every key optional on PATCH).
export type TaskInput = {
  title?: string;
  priority?: string;
  due_date?: string | null;
  case_id?: string | null;
  case_title?: string;
  description?: string;
  checklist?: CheckItem[];
};
