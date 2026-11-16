import { Platform, StyleSheet, View } from "react-native";
import { GuaranteeRows, useServiceRuntime } from "@/entities/service-runtime";
import { useTheme } from "@/shared/theme";
import { Icon, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Beside the services: the guarantees the backend gives for the picked service (its runtime configuration — the query its page reads, one
// request per picked service, never one per row). Nothing is promised from the app's own texts: with no service, or none guaranteed, only
// the plain fact of how a purchase runs is shown.
export function SafeDeal({ serviceId }: { serviceId?: string }) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const list = useServiceRuntime(serviceId).data?.guarantees ?? [];
  return (
    <View style={[s.box, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.head}><Icon name="shield" size={17} color={c.ink} /><Text variant="body" weight="bold" style={s.title}>{t(list.length ? "srt.g.title" : "srt.safe.title")}</Text></View>
      {list.length ? <GuaranteeRows items={list} reset={serviceId} /> : <View style={s.row}><Icon name="check" size={15} color={c.ok} /><Text variant="small" style={s.flex}>{t("srt.safe.fact")}</Text></View>}
    </View>
  );
}

const s = StyleSheet.create({
  box: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 10 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 15.5, lineHeight: 21 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  flex: { flex: 1 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
