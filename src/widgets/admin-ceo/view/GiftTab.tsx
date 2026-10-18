import { Gauge } from "@/shared/ui";
import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { SectionCard } from "@/shared/ui/admin";
import { CeoGifts } from "../CeoGifts";
import type { CeoCtx } from "../lib/useCeoCtx";

// "Sovg'a": the two headline rates as gauges, then every gift KPI as a tile.
export function GiftTab({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const { t, fmt } = x;
  const g = x.c?.giftKpis;
  return (
    <View style={{ gap: 14 }}>
      <SectionCard>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Gauge value={(g?.giftActivationRate ?? 0) / 100} text={fmt.pct(g?.giftActivationRate)} label={t("admCeo.kpi.giftActivation")} color="#EC4899" />
          <Gauge value={(g?.giftToPaidConversion ?? 0) / 100} text={fmt.pct(g?.giftToPaidConversion)} label={t("admCeo.kpi.giftToPaid")} color="#22C55E" />
        </View>
      </SectionCard>
      <CeoGifts x={x} onOpen={(d) => onOpen(d)} />
    </View>
  );
}
