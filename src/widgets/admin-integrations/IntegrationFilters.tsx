import { View } from "react-native";
import { integrationTone, type Integration } from "@/entities/admin-integrations";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { items: Integration[]; q: string; onQ: (v: string) => void; tone: string; onTone: (v: string) => void };

// Search by name plus count tiles per health state (all / working / waiting / error / off).
export function IntegrationFilters({ items, q, onQ, tone, onTone }: Props) {
  const { t } = useT();
  const count = (k: string) => (k === "all" ? items.length : items.filter((i) => integrationTone(i) === k).length);
  const opts = ["all", "ok", "warn", "err", "gray"].filter((k) => k === "all" || k === tone || count(k) > 0).map((k) => ({ value: k, label: t(k === "all" ? "adm.all" : `admIntB.tone.${k}`), count: count(k), alert: k === "err" }));
  return (
    <View style={{ gap: 10, marginHorizontal: -16 }}>
      <SearchBox value={q} onChangeText={onQ} placeholder={t("admIntB.searchPh")} />
      <CcTiles options={opts} value={tone} onChange={onTone} />
    </View>
  );
}
