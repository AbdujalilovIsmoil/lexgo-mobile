import { ScrollView, StyleSheet, View } from "react-native";
import { Chip, Icon, Input } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type CatOption = { value: string; label: string };
type Props = { cats: CatOption[]; cat: string; onCat: (v: string) => void; q: string; onQ: (v: string) => void; searchable: boolean };

// Web FilterBar: category chips (with counts) and a title search that appears from 7 courses.
export function AcademyFilters({ cats, cat, onCat, q, onQ, searchable }: Props) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={s.wrap}>
      {searchable ? <Input value={q} onChangeText={onQ} placeholder={t("cpd.academy.searchPh")} left={<Icon name="search" size={18} color={c.gray} />} returnKeyType="search" /> : null}
      {cats.length > 2 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
          {cats.map((o) => <Chip key={o.value} label={o.label} active={cat === o.value} onPress={() => onCat(o.value)} />)}
        </ScrollView>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({ wrap: { gap: 10 }, row: { gap: 8 } });
