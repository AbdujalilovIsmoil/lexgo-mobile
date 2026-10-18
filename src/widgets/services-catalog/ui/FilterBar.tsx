import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Icon, Input, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { FilterSelect, type FilterField } from "./FilterSelect";

type Props = { q: string; onQ: (v: string) => void; fields: FilterField[]; count?: string; dirty: boolean; onReset: () => void };

// One filter row for every screen of the catalogue: search, the filters that screen can honestly
// answer, a reset and the result count.
export function FilterBar({ q, onQ, fields, count, dirty, onReset }: Props) {
  const { t } = useT();
  return (
    <View style={s.col}>
      <Input
        placeholder={t("csv.search")}
        value={q}
        onChangeText={onQ}
        maxLength={120}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        left={<Icon name="search" size={18} tone="gray" />}
        right={q ? <PressableScale onPress={() => onQ("")} hitSlop={10}><Icon name="x-circle" size={18} tone="gray" /></PressableScale> : undefined}
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
        {fields.map((f) => <FilterSelect key={f.key} field={f} />)}
        {dirty ? <Chip label={t("csv.filterClear")} icon="x" onPress={onReset} /> : null}
      </ScrollView>
      {count ? <Text variant="caption" tone="gray">{count}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
  row: { gap: 8, paddingRight: 8 },
});
