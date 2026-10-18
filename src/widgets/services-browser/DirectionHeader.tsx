import { ScrollView, StyleSheet, View } from "react-native";
import type { ServiceCategory } from "@/entities/service";
import { Chip, Icon, Input } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { category: ServiceCategory; q: string; onQ: (v: string) => void; sub: string; onSub: (v: string) => void };

// Search inside the direction + one scrolling row of its subdirections.
export function DirectionHeader({ category, q, onQ, sub, onSub }: Props) {
  const { t } = useT();
  return (
    <View style={s.wrap}>
      <View style={s.pad}><Input placeholder={t("modes.ui.searchIn")} value={q} onChangeText={onQ} left={<Icon name="search" size={18} tone="gray" />} returnKeyType="search" clearButtonMode="while-editing" /></View>
      {category.subcategories.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
          <Chip label={t("svc.all")} active={!sub} onPress={() => onSub("")} />
          {category.subcategories.map((sc) => <Chip key={sc.title} label={`${sc.title} · ${sc.servicesCount}`} active={sc.title === sub} onPress={() => onSub(sc.title)} />)}
        </ScrollView>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 10, paddingBottom: 10 },
  pad: { paddingHorizontal: 18 },
  row: { gap: 8, paddingHorizontal: 18 },
});
