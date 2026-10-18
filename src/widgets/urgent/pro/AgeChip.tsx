import { StyleSheet, View } from "react-native";
import { ageOf, stepOf, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { cap } from "@/shared/lib/pro/cap";
import { Icon, Text } from "@/shared/ui";
import { useHeat } from "./heat";

// The big "time since the request" chip: counts up live while the job is open, coloured by how long it has waited.
export function AgeChip({ req, big }: { req: UrgentRequest; big?: boolean }) {
  const { t } = useT();
  const { ms, edge: tone } = useHeat(req);
  if (Number.isNaN(ms)) return null;
  const a = ageOf(ms);
  const text = t(`ugx.age${cap(a.key)}`, { n: a.n, m: a.m });
  return (
    <View accessibilityLabel={`${t("ugx.since")}: ${text}`} style={[s.chip, big && s.big, { backgroundColor: `${tone}22`, borderColor: `${tone}55` }]}>
      <Icon name={stepOf(req) === 3 ? "check-circle" : stepOf(req) < 0 ? "x-circle" : "clock"} size={big ? 20 : 16} color={tone} />
      <Text variant={big ? "h4" : "body"} weight="bold" style={{ color: tone }}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  big: { gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
});
