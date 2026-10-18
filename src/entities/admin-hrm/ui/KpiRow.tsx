import { memo } from "react";
import { View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import { ProgressBar } from "@/shared/ui/admin";
import { CcTicket } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import type { Kpi } from "../model/typesOps";

export const kpiTint = (score: number) => (score >= 90 ? "#22C55E" : score >= 60 ? "#F59E0B" : "#EF4444");

// One KPI metric ticket: score-coloured strip, score badge, actual vs target bar with the weight.
function Row({ item, who, index = 0 }: { item: Kpi; who: string; index?: number }) {
  const c = useColors();
  const tint = kpiTint(item.score);
  const pct = item.target ? item.actual / item.target : 0;
  return (
    <Animated.View entering={FadeInUp.delay(Math.min(index, 8) * 40)}>
      <CcTicket
        tint={tint} icon="target" title={item.title} subtitle={[who, item.period].filter(Boolean).join(" · ")}
        badge={<Text variant="h3" style={{ color: tint }}>{Math.round(item.score)}</Text>}
        chips={
          <View style={{ flex: 1, gap: 6 }}>
            <ProgressBar value={pct} color={tint} />
            <Text variant="caption" style={{ color: c.gray }}>{`${item.actual} / ${item.target} · ${item.weight}%`}</Text>
          </View>
        }
      />
    </Animated.View>
  );
}

export const KpiRow = memo(Row);
