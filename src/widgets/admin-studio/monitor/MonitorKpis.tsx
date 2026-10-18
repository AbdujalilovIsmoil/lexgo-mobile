import { KpiGrid, KpiTile } from "@/shared/ui/admin";
import { useStudioText, type StudioMonitoring } from "@/entities/admin-studio";

// Online now · sessions · users · saves · objects created · sent for approval (GET /admin/studio/monitoring summary).
export function MonitorKpis({ data, loading }: { data?: StudioMonitoring; loading: boolean }) {
  const { t, duration } = useStudioText();
  const s = data?.summary;
  const v = (n?: number) => (s ? String(n ?? 0) : "—");
  return (
    <KpiGrid>
      <KpiTile icon="radio" tint="#22C55E" label={t("admStudioC.mon.online")} value={v(s?.online)} loading={loading} />
      <KpiTile icon="layers" label={t("admStudioC.mon.sessions")} value={v(s?.sessions)} loading={loading} />
      <KpiTile icon="users" tint="#8B5CF6" label={t("admStudioC.mon.users")} value={v(s?.users)} loading={loading} />
      <KpiTile icon="save" tint="#F59E0B" label={t("admStudioC.mon.saves")} value={v(s?.saves)} hint={s?.seconds ? t("admStudioC.mon.time", { v: duration(s.seconds) }) : undefined} loading={loading} />
      <KpiTile icon="plus-square" tint="#06B6D4" label={t("admStudioC.mon.objects")} value={v(s?.objects)} loading={loading} />
      <KpiTile icon="send" tint="#EC4899" label={t("admStudioC.mon.submitted")} value={v(s?.submitted)} loading={loading} />
    </KpiGrid>
  );
}
