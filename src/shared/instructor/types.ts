export type Rect = { x: number; y: number; width: number; height: number };

// An element a screen has put on the assistant's map. `measure` is evaluated on demand (layout may move).
export type TargetEntry = {
  id: string;
  label: string;
  type: string;
  measure: () => Promise<Rect | null>;
  focus?: () => void;
};

// What is sent to the backend for each visible target (TZ 9: visible_targets + labelled objects).
export type TargetDecl = { ai_id: string; type: string; label: string; route: string };
export type VisibleTarget = { id: string; label: string; type: string; inView: boolean };
