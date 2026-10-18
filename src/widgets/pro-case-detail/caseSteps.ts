// The life of a case, left to right; "archived" counts as everything done.
export const STEPS = ["new", "active", "investigation", "court", "appeal", "completed"] as const;
export const stepIndex = (status: string): number => (status === "archived" ? STEPS.length - 1 : Math.max(0, STEPS.indexOf(status as (typeof STEPS)[number])));
