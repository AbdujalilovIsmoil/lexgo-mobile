import { memo, useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { useInsets } from "@/shared/lib/insets";
import { BottomSheet } from "../sheet";
import { Icon } from "../Icon";
import { Input } from "../Input";
import { PressableScale } from "../PressableScale";
import { Text } from "../Text";

type Opt = { value: string; label: string; hint?: string };
type Props<T extends string> = { visible: boolean; onClose: () => void; title: string; options: { value: T; label: string; hint?: string }[]; value?: T; onPick: (v: T) => void; searchable?: boolean };

const Row = memo(function Row({ o, on, onPick }: { o: Opt; on: boolean; onPick: (v: string) => void }) {
  const c = useColors();
  return (
    <PressableScale onPress={() => onPick(o.value)} style={[s.row, { borderColor: on ? c.accent : c.line, backgroundColor: on ? c.tint : c.surface }]}>
      <View style={s.col}>
        <Text variant="body" weight="semibold">{o.label}</Text>
        {o.hint ? <Text variant="caption" tone="gray">{o.hint}</Text> : null}
      </View>
      {on ? <Icon name="check" size={18} tone="accent" /> : null}
    </PressableScale>
  );
});

// Pick one of many options in a drawer (regions, users, categories, works …). The list is virtualised: only the rows on
// screen exist, so a few hundred options open as fast as five.
export function OptionSheet<T extends string>({ visible, onClose, title, options, value, onPick, searchable }: Props<T>) {
  const { t } = useT();
  const insets = useInsets();
  const [q, setQ] = useState("");
  const needle = q.trim().toLowerCase();
  const shown = needle ? options.filter((o) => `${o.label} ${o.hint ?? ""}`.toLowerCase().includes(needle)) : options;
  return (
    <BottomSheet visible={visible} onClose={onClose} title={title} snaps={[0.6, 0.92]}>
      {searchable ? <View style={s.search}><Input value={q} onChangeText={setQ} placeholder={t("adm.search")} left={<Icon name="search" size={18} tone="gray" />} /></View> : null}
      <FlatList
        data={shown}
        keyExtractor={(o) => o.value}
        renderItem={({ item }) => <Row o={item} on={item.value === value} onPick={(v) => { onPick(v as T); onClose(); }} />}
        ItemSeparatorComponent={Gap}
        initialNumToRender={9}
        maxToRenderPerBatch={8}
        windowSize={5}
        removeClippedSubviews
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: insets.bottom + 24 }}
      />
    </BottomSheet>
  );
}

const Gap = () => <View style={{ height: 16 }} />;
const s = StyleSheet.create({
  search: { paddingHorizontal: 18, paddingBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5 },
  col: { flex: 1, gap: 2 },
});
