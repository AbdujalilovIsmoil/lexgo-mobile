import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Button, Icon, Text, type IconName } from "@/shared/ui";

// A titled block inside a tab: the title with an "add" button at its right edge.
export function SectionHead({ title, onAdd, busy, label }: { title: string; onAdd?: () => void; busy?: boolean; label?: string }) {
  const { t } = useT();
  return (
    <View style={s.head}>
      <Text variant="h4" style={s.title}>{title}</Text>
      {onAdd ? <Button title={label ?? t("csd.add")} icon="plus" size="sm" variant="soft" loading={busy} onPress={onAdd} /> : null}
    </View>
  );
}

// "Nothing here yet" in the same dashed-tile look in every tab.
export function EmptyTile({ icon, text, onPress, action }: { icon: IconName; text: string; onPress?: () => void; action?: string }) {
  const c = useColors();
  return (
    <View style={[s.empty, { borderColor: c.line, backgroundColor: c.surface2 }]}>
      <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={icon} size={22} tone="accent" /></View>
      <Text variant="small" tone="gray" center>{text}</Text>
      {onPress && action ? <Button title={action} icon="plus" size="sm" variant="soft" onPress={onPress} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  title: { flex: 1 },
  empty: { alignItems: "center", gap: 10, padding: 22, borderRadius: 20, borderWidth: 1.5, borderStyle: "dashed" },
  ico: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
});
