import { View } from "react-native";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Text } from "@/shared/ui";
import { useStudioText } from "@/entities/admin-studio";

type Props = { q: string; onQ: (v: string) => void; groups: { value: string; count: number; title: string }[]; group: string; onGroup: (v: string) => void; total: number };

// Catalogue search and one tile per group (services and packages · documents · … in server order) with its constructor count.
export function DashFilters({ q, onQ, groups, group, onGroup, total }: Props) {
  const { t, group: label } = useStudioText();
  const all = groups.reduce((n, g) => n + g.count, 0);
  return (
    <View style={{ gap: 10, marginHorizontal: -16 }}>
      <Text variant="h4" style={{ paddingHorizontal: 16 }}>{t("admStudio.dash.catalog")} · {total}</Text>
      <SearchBox value={q} onChangeText={onQ} placeholder={t("admStudio.dash.searchPh")} />
      <CcTiles options={[{ value: "", label: t("adm.all"), count: all }, ...groups.map((g) => ({ value: g.value, label: label(g.value, g.title), count: g.count }))]} value={group} onChange={onGroup} />
    </View>
  );
}
