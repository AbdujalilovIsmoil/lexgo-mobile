import { View } from "react-native";
import { Chip } from "@/shared/ui";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { STUDIO_STATUSES, useStudioText } from "@/entities/admin-studio";

type Props = { status: string; onStatus: (v: string) => void; mine: boolean; onMine: (v: boolean) => void; q: string; onQ: (v: string) => void };

// Search, "assigned to me" and one tile per workflow status for the object list.
export function ObjectFilters({ status, onStatus, mine, onMine, q, onQ }: Props) {
  const { t, status: label } = useStudioText();
  return (
    <View style={{ gap: 10, marginHorizontal: -16 }}>
      <SearchBox value={q} onChangeText={onQ} placeholder={t("admStudio.list.searchPh")} />
      <CcTiles options={[{ value: "", label: t("adm.all") }, ...STUDIO_STATUSES.map((s) => ({ value: s as string, label: label(s) }))]} value={status} onChange={onStatus} />
      <View style={{ flexDirection: "row", paddingHorizontal: 16 }}><Chip icon="user" label={t("admStudio.list.mine")} active={mine} onPress={() => onMine(!mine)} /></View>
    </View>
  );
}
