import { useDashCounts, useStudioText } from "@/entities/admin-studio";
import { CcHero } from "@/shared/ui/cc";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// Hero of the studio: drafts · awaiting approval · published as numbers, every workflow status as one stacked bar.
export function DashTiles() {
  const { t } = useT();
  const { status } = useStudioText();
  const c = useColors();
  const q = useDashCounts();
  const n = q.data?.counts ?? {};
  const waiting = (n.submitted ?? 0) + (n.in_review ?? 0);
  const val = (v?: number) => (q.data && v !== undefined ? String(v) : "—");
  const seg = (key: string, value: number | undefined, color: string, label: string) => ({ key, value: value ?? 0, color, label: `${label} ${value ?? 0}` });
  return (
    <CcHero
      stats={[{ value: val(n.draft), label: t("admStudio.dash.draft") }, { value: q.data ? String(waiting) : "—", label: t("admStudio.dash.waiting"), color: waiting ? c.warn : undefined }, { value: val(n.published), label: t("admStudio.dash.published"), color: c.ok }]}
      segments={[seg("d", n.draft, c.gray, t("admStudio.dash.draft")), seg("w", waiting, c.warn, t("admStudio.dash.waiting")), seg("a", n.approved, c.accent, status("approved")), seg("p", n.published, c.ok, t("admStudio.dash.published")), seg("c", n.changes_requested, c.err, t("admStudio.dash.changes"))]}
    />
  );
}
