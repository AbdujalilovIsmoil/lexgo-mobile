import { StyleSheet, View } from "react-native";
import { PressableScale, Text, type IconName, Icon } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { summaryOf, type DocTab } from "@/entities/doc-queue";

const ICON: Record<string, IconName> = { work: "edit-3", fresh: "inbox", sent: "check-circle" };

// Three compact tiles above the list (in progress · new · sent) with the live count; a tap jumps to that tab.
export function SummaryStrip({ counts, tab, onTab }: { counts: Record<string, number>; tab: DocTab; onTab: (t: DocTab) => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.row}>
      {summaryOf(counts).map((x) => {
        const on = tab === x.tab;
        return (
          <PressableScale key={x.key} haptic={false} onPress={() => { selectHaptic(); onTab(x.tab); }} accessibilityRole="button" accessibilityState={{ selected: on }} accessibilityLabel={`${t(`proDocSheet.summary.${x.key}`)}: ${x.n}`} style={[s.tile, { backgroundColor: on ? c.tint2 : c.surface, borderColor: on ? c.accent : c.line }]}>
            <View style={s.top}>
              <Icon name={ICON[x.key]} size={15} color={on ? c.accentStrong : c.gray} />
              <Text variant="h3" style={{ color: on ? c.accentStrong : c.ink }}>{x.n}</Text>
            </View>
            <Text variant="caption" tone="gray" numberOfLines={1}>{t(`proDocSheet.summary.${x.key}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingHorizontal: 16 },
  tile: { flex: 1, gap: 2, minHeight: 66, paddingHorizontal: 12, paddingVertical: 10, borderRadius: radius.r, borderWidth: 1.5 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
});
