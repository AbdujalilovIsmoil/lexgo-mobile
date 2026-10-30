import type { Ref } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Icon, PressableScale, Segmented, singleLineText } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import type { TicketTab } from "@/entities/support";

// `newBox`: the new-chat button as a remote-assistance control (measured for the operator's outline).
type Props = { tab: TicketTab; onTab: (t: TicketTab) => void; query: string; onQuery: (q: string) => void; filters: boolean; counts: Record<TicketTab, string>; onNew: () => void; newBox?: { ref: Ref<View>; collapsable: false } };

// Over "my requests": the Active / Finished switch with counts and the new-request button, then a search over the loaded requests.
export function ListControls({ tab, onTab, query, onQuery, filters, counts, onNew, newBox }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      <View style={s.row}>
        <View style={s.flex}>
          {filters ? <Segmented<TicketTab> options={[{ value: "active", label: `${t("sp1.tabActive")}${counts.active}` }, { value: "closed", label: `${t("sp1.tabClosed")}${counts.closed}` }]} value={tab} onChange={onTab} /> : null}
        </View>
        <View {...newBox}>
          <PressableScale onPress={onNew} scale={0.95} accessibilityRole="button" accessibilityLabel={t("sp1.newTicket")} style={[s.plus, { backgroundColor: c.tint2 }]}>
            <Icon name="plus" size={20} tone="accent" />
          </PressableScale>
        </View>
      </View>
      {filters ? (
        <View style={[s.field, { backgroundColor: c.surface, borderColor: c.line }]}>
          <Icon name="search" size={18} tone="gray" />
          <TextInput value={query} onChangeText={onQuery} placeholder={t("sp1.searchPh")} placeholderTextColor={c.gray2} returnKeyType="search" accessibilityLabel={t("sp1.searchPh")} style={[s.input, { color: c.ink }, singleLineText]} />
          {query ? <PressableScale onPress={() => onQuery("")} hitSlop={8} accessibilityRole="button" accessibilityLabel={t("sp1.clearSearch")}><Icon name="x" size={16} tone="gray" /></PressableScale> : null}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10, marginBottom: 12 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  plus: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  field: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 50, borderRadius: 16, borderWidth: 1, paddingHorizontal: 14 },
  input: { flex: 1, minWidth: 0, fontSize: 15, paddingVertical: 10 },
});
