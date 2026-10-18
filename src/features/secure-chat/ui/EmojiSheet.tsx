import { useState } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { BottomSheet, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { EMOJI } from "../lib/emojis";

// Built-in emoji picker in a drawer; tapping an emoji inserts it and keeps the drawer open (pick several).
export function EmojiSheet({ visible, onClose, onPick }: { visible: boolean; onClose: () => void; onPick: (e: string) => void }) {
  const { t } = useT();
  const c = useColors();
  const [cat, setCat] = useState(0);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("ms3.emoji")} snaps={[0.46, 0.7]}>
      <View style={s.tabs}>
        {EMOJI.map((g, i) => (
          <PressableScale key={g.icon} haptic={false} onPress={() => setCat(i)} style={[s.tab, { backgroundColor: i === cat ? c.tint2 : "transparent" }]}><Text style={s.big}>{g.icon}</Text></PressableScale>
        ))}
      </View>
      <FlatList key={cat} data={EMOJI[cat].items} numColumns={7} keyExtractor={(e) => e} contentContainerStyle={s.grid} keyboardShouldPersistTaps="always"
        renderItem={({ item }) => <PressableScale haptic={false} scale={0.85} onPress={() => onPick(item)} style={s.cell}><Text style={s.big}>{item}</Text></PressableScale>} />
    </BottomSheet>
  );
}

const s = StyleSheet.create({
  tabs: { flexDirection: "row", gap: 6, paddingHorizontal: 14, paddingBottom: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 14 },
  grid: { paddingHorizontal: 10, paddingBottom: 30 },
  cell: { flex: 1, alignItems: "center", paddingVertical: 8 },
  big: { fontSize: 26, lineHeight: 34 },
});
