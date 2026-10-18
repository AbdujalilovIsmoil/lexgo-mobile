import { Pill, type PillTone } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useSom } from "@/shared/lib/sel";
import { useT } from "@/shared/i18n";
import type { ProService, ServiceStatus } from "../model/types";

const TONE: Record<ServiceStatus, PillTone> = { active: "ok", paused: "warn", inactive: "gray" };
const TINT: Record<ServiceStatus, string> = { active: "#22C55E", paused: "#F59E0B", inactive: "#8A99AC" };

// One of the seller's services: name, price actually used, status and whether clients can see it.
export function ServiceRow({ item, onPress, waiting }: { item: ProService; onPress: () => void; waiting?: boolean }) {
  const { t } = useT();
  const som = useSom();
  return (
    <RowCard
      icon="briefcase"
      tint={TINT[item.status]}
      title={item.name || "—"}
      subtitle={item.effectivePrice ? som(item.effectivePrice) : t("sl6.noPrice")}
      meta={[item.categoryTitle, item.subcategory].filter(Boolean).join(" · ")}
      right={<Pill label={t(`sl6.status.${item.status}`)} tone={TONE[item.status]} small />}
      onPress={onPress}
    >
      {item.promotion ? <Pill label={t("sl6.promoted", { n: item.promotion.daysLeft })} tone="cy" icon="radio" small /> : null}
      {!item.promotion && waiting ? <Pill label={t("sl6.waiting")} tone="warn" icon="clock" small /> : null}
      {item.status === "active" && !item.visible ? <Pill label={t("sl6.hidden")} tone="warn" icon="eye-off" small /> : null}
    </RowCard>
  );
}
