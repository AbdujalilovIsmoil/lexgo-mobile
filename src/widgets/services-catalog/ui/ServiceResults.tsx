import { StyleSheet, View } from "react-native";
import type { Service } from "@/entities/service";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ServiceTile, type TileActions } from "./ServiceTile";

type Dl = { free: boolean; busy: string; error: { id: string; msg: string } | null };
type Props = { rows: Service[]; dl: Dl; act: (s: Service) => TileActions };

// The service cards of a direction or of the search results.
export function ServiceResults({ rows, dl, act }: Props) {
  const { t } = useT();
  if (!rows.length) return <EmptyState icon="search" title={t("csv.empty")} text={t("csv.emptyText")} compact />;
  return (
    <View style={s.col}>
      {rows.map((sv) => <ServiceTile key={sv.id} service={sv} locked={dl.free} downloading={dl.busy === sv.id} error={dl.error?.id === sv.id ? dl.error.msg : undefined} {...act(sv)} />)}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 } });
