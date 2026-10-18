import { StyleSheet, View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const ITEMS: [string, IconName][] = [["trust1", "shield"], ["trust2", "clock"], ["trust3", "check"]];

// .cdhero__trust: three reassurance chips under the field.
export function DashTrust() {
  const { t } = useT();
  return (
    <View style={s.row}>
      {ITEMS.map(([k, icon]) => (
        <View key={k} style={s.item}>
          <Icon name={icon} size={15} color="#00CFE8" />
          <Text variant="small" style={s.txt}>{t(`cdash.${k}`)}</Text>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", columnGap: 18, rowGap: 8, marginTop: 4 },
  item: { flexDirection: "row", alignItems: "center", gap: 7 },
  txt: { color: "#C4DEFF" },
});
