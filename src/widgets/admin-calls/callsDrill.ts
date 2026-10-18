import type { Drill } from "@/entities/admin-dash";
import type { CallsCtx } from "./useCallsCtx";

// Every call tile opens the same breakdown (facts, calls per day, top agents) under its own headline.
export function callsDrill(x: CallsCtx, title: string, value: string, sub?: string): Drill {
  const { t, fmt, a, rate } = x;
  return {
    title, value, sub, demo: x.demo,
    sections: [
      { kind: "kv", rows: [
        { label: t("admCalls.answered"), value: String(a.answered), tone: "ok" }, { label: t("admCalls.missed"), value: String(a.missed), tone: "bad" },
        { label: t("admCalls.answerRate"), value: `${rate}%` }, { label: t("admDashB.drill.missRate"), value: `${100 - rate}%` }, { label: t("admCalls.avg"), value: fmt.mmss(a.avgDurationSec) },
      ] },
      { kind: "series", title: t("admCalls.byDay"), points: x.byDay, empty: t("admCalls.noData") },
      { kind: "bars", title: t("admCalls.topAgents"), rows: a.topAgents.map((g) => ({ label: g.name, value: String(g.calls), n: g.calls })), empty: t("admCalls.noAgents") },
    ],
    link: { module: "callcenter", label: t("admDashB.drill.goCallCenter") },
  };
}
