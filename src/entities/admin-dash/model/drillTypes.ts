import type { DashFilter, DrillMetric, Point } from "./types";

// What a stat tile's drill-down sheet shows: the headline number plus sections.
export type DrillRow = { label: string; value: string; n?: number; sub?: string; tone?: "ok" | "bad" | "muted" };
export type DrillSection =
  | { kind: "bars" | "list"; title?: string; rows: DrillRow[]; empty?: string }
  | { kind: "kv"; title?: string; rows: DrillRow[] }
  | { kind: "series"; title?: string; points: Point[]; format?: (n: number) => string; empty?: string };
export type Drill = {
  title: string;
  value?: string;
  sub?: string;
  note?: string;
  demo?: boolean;
  link?: { module: string; label: string }; // opens /manage/<module> when the user may see it
  detail?: { metric: DrillMetric; filter: DashFilter }; // real records loaded from the backend
  sections: DrillSection[];
};
