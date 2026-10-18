import { isOpenGap, useGaps, useReglaments } from "@/entities/admin-aireg";
import { CcHero } from "@/shared/ui/cc";
import { fmtDate } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Headline: active reglaments out of all, unanswered questions and the last update, plus a status bar.
export function RegHero() {
  const { t, locale } = useT();
  const c = useColors();
  const list = useReglaments().data;
  const gaps = useGaps("open").data;
  if (list?.kind !== "ok") return null;
  const items = list.data;
  const open = gaps?.kind === "ok" ? gaps.data.filter(isOpenGap).length : null;
  const latest = items.map((r) => r.updatedAt).filter(Boolean).sort().pop();
  const n = (s: string) => items.filter((r) => r.status === s).length;
  return (
    <CcHero
      stats={[{ value: `${n("active")} / ${items.length}`, label: t("admAiReg.kpiActive") }, { value: open === null ? "—" : String(open), label: t("admAiReg.kpiGaps"), color: open ? c.warn : undefined }, { value: latest ? fmtDate(latest, locale) : "—", label: t("admAiReg.kpiUpdated") }]}
      segments={[{ key: "a", value: n("active"), color: c.ok, label: `${t("admAiReg.status.active")} ${n("active")}` }, { key: "d", value: n("draft"), color: c.warn, label: `${t("admAiReg.status.draft")} ${n("draft")}` }, { key: "r", value: n("archived"), color: c.gray2, label: `${t("admAiReg.status.archived")} ${n("archived")}` }]}
    />
  );
}
