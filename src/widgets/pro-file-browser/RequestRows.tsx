import { useDocRequests } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { timeAgo } from "@/shared/lib/format";
import { Pill, Text } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";


// Documents this professional asked clients for: waiting or uploaded (tap an uploaded one to preview it).
export function RequestRows({ onPreview }: { onPreview: (path: string, name: string, mime: string) => void }) {
  const { t } = useT();
  const q = useDocRequests();
  const rows = q.data ?? [];
  if (!rows.length) return <Text variant="small" tone="gray" center>{t("aw8.emptyReq")}</Text>;
  return (
    <>
      {rows.map((r) => (
        <RowCard key={r.id} icon={r.status === "fulfilled" ? "check-circle" : "clock"} tint={r.status === "fulfilled" ? "#22C55E" : "#F59E0B"} title={r.title} subtitle={r.fileName || r.message} meta={timeAgo(r.createdAt, t)}
          right={<Pill small tone={r.status === "fulfilled" ? "ok" : "warn"} label={t(`aw8.req.${r.status === "fulfilled" ? "fulfilled" : "requested"}`)} />}
          onPress={r.fileUrl ? () => onPreview(r.fileUrl, r.fileName || r.title, r.mime) : undefined} />
      ))}
    </>
  );
}
