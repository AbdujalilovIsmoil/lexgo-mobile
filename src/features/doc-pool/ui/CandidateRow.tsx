import { StyleSheet, View } from "react-native";
import { Avatar, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import type { Candidate } from "@/entities/doc-queue";

// A selectable advocate: name, kind · region, rating, current workload.
export function CandidateRow({ cand, picked, onPress }: { cand: Candidate; picked: boolean; onPress: () => void }) {
  const c = useColors();
  const { t } = useT();
  const sub = [cand.callCenter ? t("ad2.callCenter") : cand.kind, cand.region].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} style={[s.row, { borderColor: picked ? c.accent : c.line, backgroundColor: picked ? c.tint : c.surface }]}>
      <Avatar name={cand.name || "?"} size={38} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="body" weight="semibold" numberOfLines={1}>{cand.name}</Text>
        <Text variant="caption" tone="gray" numberOfLines={1}>{sub}</Text>
      </View>
      <View style={{ alignItems: "flex-end", gap: 1 }}>
        {cand.rating > 0 ? <Text variant="caption" weight="semibold">★ {cand.rating.toFixed(1)}</Text> : null}
        <Text variant="caption" tone="gray2">{t("ad2.workload", { n: cand.workload })}</Text>
      </View>
      {picked ? <Icon name="check-circle" size={20} color={c.accent} /> : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, borderRadius: 16, borderWidth: 1.5 } });
