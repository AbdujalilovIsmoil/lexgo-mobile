import { StyleSheet, View } from "react-native";
import type { Service } from "@/entities/service";
import { useDocSettings } from "@/entities/doc-settings";
import { EmptyState } from "@/shared/ui";
import { ShowMore, useShowMore } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { ServiceTile, type TileActions } from "./ServiceTile";

type Dl = { free: boolean; busy: string; error: { id: string; msg: string } | null };
type Props = { rows: Service[]; dl: Dl; act: (s: Service) => TileActions };

// The service cards of a direction or of the search results, ten at a time (a search may match a hundred); another result set starts
// again at the first ten. The document service settings (TZ.md §4) are read once here for every card's fill / advocate ways.
export function ServiceResults({ rows, dl, act }: Props) {
  const { t } = useT();
  const ds = useDocSettings();
  const page = useShowMore(rows, `${rows.length}:${rows[0]?.id ?? ""}`);
  if (!rows.length) return <EmptyState icon="search" title={t("csv.empty")} text={t("csv.emptyText")} compact />;
  const ways = { fill: ds.gate("manual").state, lawyer: ds.gate("lawyer").state };
  return (
    <View style={s.col}>
      {page.visible.map((sv) => <ServiceTile key={sv.id} service={sv} locked={dl.free} downloading={dl.busy === sv.id} error={dl.error?.id === sv.id ? dl.error.msg : undefined} ways={ways} {...act(sv)} />)}
      <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 } });
