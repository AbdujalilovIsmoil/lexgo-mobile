import { useState } from "react";
import { View } from "react-native";
import type { Drill } from "@/entities/admin-dash";
import { Segmented } from "@/shared/ui";
import type { CeoCtx } from "../lib/useCeoCtx";
import { AudienceTab } from "./AudienceTab";
import { FunnelTab } from "./FunnelTab";
import { GiftTab } from "./GiftTab";
import { MoneyTab } from "./MoneyTab";

type Tab = "money" | "audience" | "funnel" | "gifts";

// The CEO screen: one switch, four focused views (money · audience · funnel · gifts) instead of a wall of tiles.
export function CeoTabs({ x, onOpen }: { x: CeoCtx; onOpen: (d: Drill) => void }) {
  const [tab, setTab] = useState<Tab>("money");
  const [w, setW] = useState(0);
  const o = (k: Tab) => ({ value: k, label: x.t(`admCeoV.tabs.${k}`) });
  return (
    <View style={{ gap: 14 }} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Segmented options={[o("money"), o("audience"), o("funnel"), o("gifts")]} value={tab} onChange={setTab} />
      {w > 0 && tab === "money" ? <MoneyTab x={x} w={w} onOpen={onOpen} /> : null}
      {tab === "audience" ? <AudienceTab x={x} onOpen={onOpen} /> : null}
      {tab === "funnel" ? <FunnelTab x={x} onOpen={onOpen} /> : null}
      {tab === "gifts" ? <GiftTab x={x} onOpen={onOpen} /> : null}
    </View>
  );
}
