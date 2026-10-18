import { RowCard, StatusPill } from "@/shared/ui/admin";
import { Icon } from "@/shared/ui";
import { fmtDateTime, mmss } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { csLabel } from "../lib/csLabel";
import type { AdminCall } from "../model/historyTypes";

// A meeting from the platform-wide history: creator, start time, length and head count.
export function AdminCallRow({ item, onPress }: { item: AdminCall; onPress: () => void }) {
  const { t, locale } = useT();
  const meta = [item.creatorName, fmtDateTime(item.startedAt, locale), item.durationSec ? mmss(item.durationSec * 1000) : ""].filter(Boolean).join(" · ");
  return (
    <RowCard
      icon={item.type === "audio" ? "phone" : "video"}
      tint={item.status === "active" ? "#22C55E" : "#64748B"}
      title={item.title || t("admMeet.untitled")}
      subtitle={meta}
      meta={`${item.participants} ${t("admMeet.peopleSuffix")}${item.workId ? ` · ${item.workId}` : ""}`}
      right={<><StatusPill status={item.status} label={csLabel(t, item.status)} /><Icon name="chevron-right" size={18} tone="gray" /></>}
      onPress={onPress}
    />
  );
}
