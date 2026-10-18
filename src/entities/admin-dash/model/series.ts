import type { DashFilter, Point } from "./types";

const day = (v: string) => (/^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : "");

// The backend ignores the date filter on trends, so the app cuts the series itself (as the web does).
export function trimSeries(points: Point[], f: DashFilter): Point[] {
  if (!f.from && !f.to) return points;
  return points.filter((p) => {
    const d = day(p.label);
    return d ? (!f.from || d >= f.from) && (!f.to || d <= f.to) : false;
  });
}
