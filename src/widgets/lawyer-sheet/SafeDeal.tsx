import { StyleSheet, View } from "react-native";
import { GuaranteeRows, useServiceRuntime } from "@/entities/service-runtime";
import { useColors } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Beside the services: the guarantees the backend gives for the picked service (its runtime configuration — the query its page reads, one
// request per picked service, never one per row). Nothing is promised from the app's own texts: with no service, or none guaranteed, only
// the plain fact of how a purchase runs is shown.
export function SafeDeal({ serviceId }: { serviceId?: string }) {
  const c = useColors();
  const { t } = useT();
  const list = useServiceRuntime(serviceId).data?.guarantees ?? [];
  return (
    <View style={[s.box, { backgroundColor: c.okBg }]}>
      <View style={s.head}><Icon name="shield" size={18} color={c.ok} /><Text variant="small" weight="bold">{t(list.length ? "srt.g.title" : "srt.safe.title")}</Text></View>
      {list.length ? <GuaranteeRows items={list} reset={serviceId} /> : <Text variant="caption" tone="gray">{t("srt.safe.fact")}</Text>}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 16, padding: 14, gap: 8 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
});
