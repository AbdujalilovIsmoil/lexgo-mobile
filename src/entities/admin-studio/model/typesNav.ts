import type { StudioConstructor } from "./types";

// Where a constructor sits in the catalogue (GET /studio/constructors → groups[].constructors[].navigation + status).
export type CtorNav = {
  group: string;
  step: number;
  steps: number;
  before: string[];
  recommended: string[];
  next: string[];
  availability: string;
  missing: string[];
  completed: boolean;
  records: number;
  contextFields: string[];
};

// One of the ten ordered groups; `items` keep the order the backend sent.
export type StudioGroup = { key: string; title: string; order: number; description: string; completed: number; total: number; progress: number; next: string; items: StudioConstructor[] };

// A catalogue row of a constructor: a published runtime record or a studio object.
export type StudioRecord = { id: string; title: string; status: string; source: string; objectId: string; runtimeType: string; updatedAt: string };
// GET /studio/constructors/{code}/form-context — the seed of a form (initial payload + the ids the object is attached to).
export type FormContext = { mode: string; title: string; payload: Record<string, unknown>; targetId: string; targetType: string };
