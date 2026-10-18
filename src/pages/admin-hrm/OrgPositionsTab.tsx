import { PositionRow, useLocalPaged, usePositions, type Position } from "@/entities/admin-hrm";
import { OrgHero } from "@/widgets/admin-hrm";
import { PagedList } from "@/shared/ui/admin";
import { View } from "react-native";
import { useT } from "@/shared/i18n";

// Job positions of the organization under the org hero card; tap one to edit it.
export function OrgPositionsTab({ onOpen }: { onOpen: (p: Position) => void }) {
  const { t } = useT();
  const query = usePositions();
  const { items, query: paged } = useLocalPaged(query, query.data ?? []);
  return (
    <PagedList
      data={items} query={paged} keyExtractor={(p) => p.id} renderItem={(p, i) => <PositionRow index={i} item={p} onPress={() => onOpen(p)} />}
      header={<View style={{ marginBottom: 10 }}><OrgHero /></View>}
      empty={{ icon: "briefcase", title: t("admHrmB.noPositions") }} off={{ title: t("admHrmC.offTitle"), text: t("admHrmC.offText") }}
    />
  );
}
