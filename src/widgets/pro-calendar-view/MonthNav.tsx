import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { Chip, IconButton, Text } from "@/shared/ui";

type Props = { year: number; month: number; onStep: (delta: number) => void; onToday: () => void };

// "Oktabr 2026" with previous / next month buttons and a jump back to today.
export function MonthNav({ year, month, onStep, onToday }: Props) {
  const { t, tList } = useT();
  return (
    <View style={s.row}>
      <IconButton icon="chevron-left" size={38} onPress={() => onStep(-1)} />
      <Text variant="h4" center style={s.title}>{`${tList("aw11.months")[month] ?? ""} ${year}`}</Text>
      <IconButton icon="chevron-right" size={38} onPress={() => onStep(1)} />
      <Chip label={t("aw6.today")} onPress={onToday} />
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8 }, title: { flex: 1 } });
