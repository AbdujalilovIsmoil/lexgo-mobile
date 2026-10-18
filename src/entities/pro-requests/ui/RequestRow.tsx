import { useT } from "@/shared/i18n";
import { fmtDateTime, timeAgo } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { tOr } from "@/shared/lib/pro/tOr";
import { RowCard, StatusPill } from "@/shared/ui/admin";
import { statusLabel } from "../lib/label";
import type { ReqItem } from "../model/types";

const ICON = { docs: "file-text", pool: "inbox", urgent: "zap", orders: "shopping-bag", meetings: "video" } as const;

// One request: kind icon (amber when it needs action), title, client + extra, age and status.
export function RequestRow({ item, onPress }: { item: ReqItem; onPress: () => void }) {
  const { t, locale } = useT();
  const extra =
    item.kind === "orders" ? `${fmtMoney(item.amount)} ${t("adm.currency")}`
    : item.kind === "meetings" ? tOr(t, `aw2.call.${item.detail}`, item.detail)
    : item.kind === "urgent" ? [tOr(t, `aw2.channel.${item.detail}`, item.detail), fmtDateTime(item.when, locale)].filter(Boolean).join(" · ")
    : item.detail;
  return (
    <RowCard
      icon={ICON[item.kind]}
      tint={item.action ? "#F59E0B" : "#3B82F6"}
      title={item.title || t(`aw2.untitled.${item.kind}`)}
      subtitle={[item.client, extra].filter(Boolean).join(" · ")}
      meta={timeAgo(item.at, t)}
      right={<StatusPill status={item.status} label={statusLabel(t, item.status)} />}
      onPress={onPress}
    />
  );
}
