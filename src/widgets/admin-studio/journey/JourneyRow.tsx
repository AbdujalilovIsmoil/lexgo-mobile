import { StyleSheet, View } from "react-native";
import { Card, Pill, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { tOr } from "@/shared/lib/pro/tOr";
import { timeAgo } from "@/shared/lib/format";
import type { Journey } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";

const TONE = { draft: "gray", in_progress: "blue", completed: "ok", abandoned: "err", archived: "gray" } as const;

// One journey: name, type and status, a progress bar and "3/9 steps".
export function JourneyRow({ item, onPress }: { item: Journey; onPress: () => void }) {
  const { t } = useT();
  const ago = timeAgo(item.updatedAt, t);
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={s.head}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.fill}>{item.title || tOr(t, `admStudioD.journeys.types.${item.type}`, item.type)}</Text>
        <Pill small tone={TONE[item.status as keyof typeof TONE] ?? "gray"} label={tOr(t, `admStudioD.journeys.status.${item.status}`, item.status)} />
      </View>
      <Text variant="caption" tone="gray">{tOr(t, `admStudioD.journeys.types.${item.type}`, item.type)}{ago ? ` · ${ago}` : ""}</Text>
      <ProgressBar value={item.percent / 100} />
      <Text variant="caption" tone="gray2">{t("admStudioD.journeys.progress", { done: item.done, total: item.total })}</Text>
    </Card>
  );
}

const s = StyleSheet.create({ card: { padding: 14, gap: 8 }, head: { flexDirection: "row", alignItems: "flex-start", gap: 8 }, fill: { flex: 1 } });
