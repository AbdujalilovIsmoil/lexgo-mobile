import type { Drill } from "@/entities/admin-dash";
import type { DashCtx } from "../lib/useDashCtx";
import { barsOf as bars } from "./shared";

// "Sifat" drawer: the four quality numbers, flagged issues by severity and the flagged records themselves.
export function drillQuality(x: DashCtx): Drill {
  const { t, fmt, q } = x;
  const d = (k: string) => t(`admDashB.drill.${k}`);
  const sev = new Map<string, number>();
  for (const f of q?.flagged ?? []) sev.set(f.severity, (sev.get(f.severity) ?? 0) + 1);
  return {
    title: t("admDashC.crm.quality"), value: fmt.rating(q?.avgRating), sub: `${d("flagged")}: ${fmt.int(q?.flagged.length ?? 0)}`, note: d("constNote"),
    sections: [
      { kind: "kv", rows: [{ label: d("rating"), value: fmt.rating(q?.avgRating) }, { label: d("sla"), value: fmt.pct(q?.responseSlaPct) }, { label: d("complaints"), value: fmt.pct(q?.complaintRate), tone: "bad" }, { label: d("resolved"), value: fmt.pct(q?.resolvedPct), tone: "ok" }] },
      bars(x, d("flagged"), [...sev].map(([label, value]) => ({ label, value })), x.label.severity),
      { kind: "list", title: d("flagged"), rows: (q?.flagged ?? []).map((f) => ({ label: f.title, value: x.label.severity(f.severity), sub: f.detail, tone: f.severity === "high" ? "bad" : "muted" })) },
    ],
  };
}
