import { StyleSheet, View } from "react-native";
import type { FlatSubcat, ServiceCategory } from "@/entities/service";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { FamilyStrip } from "./FamilyStrip";
import { CardGrid } from "./CardGrid";
import { SubcatCard } from "./SubcatCard";

type Props = {
  flat: FlatSubcat[]; all: number; cats: ServiceCategory[]; fam: string; onFam: (id: string) => void;
  perCat: Map<string, number>; totalServices: number; onOpen: (cat: string, name: string) => void;
};

// First screen: the four areas as a strip, then one flat list of every direction.
export function DirectionCards({ flat, all, cats, fam, onFam, perCat, totalServices, onOpen }: Props) {
  const { t } = useT();
  return (
    <View style={s.col}>
      <FamilyStrip cats={cats} value={fam} onChange={onFam} subs={perCat} subTotal={all} svcTotal={totalServices} />
      {flat.length ? <CardGrid>{flat.map((x, i) => <SubcatCard key={`${x.cat}-${x.name}`} name={x.name} count={x.n} index={i} family={x.catName} samples={x.samples} onPress={() => onOpen(x.cat, x.name)} />)}</CardGrid> : <EmptyState icon="briefcase" title={t("csv.empty")} text={t("csv.emptyText")} compact />}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 } });
