import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useInstructorTarget } from "@/shared/instructor";

const BADGES: { key: string; icon: IconName }[] = [
  { key: "badge247", icon: "clock" },
  { key: "badgePrivate", icon: "shield" },
  { key: "badgeFast", icon: "phone" },
];

// "Qanday ishlaydi": three steps on a vertical timeline, then "Nega LexGo SOS?" as three tiles side by side.
export function SosInfo() {
  const c = useColors();
  const { t } = useT();
  const mark = useInstructorTarget("sos:how", { label: t("cxSos.howTitle"), type: "section" });
  return (
    <View {...mark} style={s.col}>
      <Text variant="h4">{t("cxSos.howTitle")}</Text>
      <View style={s.steps}>
        <View style={[s.line, { backgroundColor: c.line }]} />
        {[1, 2, 3].map((n) => (
          <View key={n} style={s.row}>
            <View style={[s.num, { backgroundColor: "#E11D48" }]}><Text variant="caption" weight="bold" tone="white">{n}</Text></View>
            <Text variant="small" style={s.fill}>{t(`cxSos.step${n}`)}</Text>
          </View>
        ))}
      </View>
      <Text variant="h4" style={s.why}>{t("cxSos.whyTitle")}</Text>
      <View style={s.tiles}>
        {BADGES.map((b) => (
          <View key={b.key} style={[s.tile, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
            <View style={[s.ico, { backgroundColor: c.tint2 }]}><Icon name={b.icon} size={18} color={c.accent} /></View>
            <Text variant="caption" weight="semibold" center>{t(`cxSos.${b.key}`)}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 14, marginTop: 6 },
  steps: { gap: 18, paddingLeft: 2 },
  line: { position: "absolute", left: 14, top: 14, bottom: 14, width: 2 },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  fill: { flex: 1 },
  why: { marginTop: 8 },
  tiles: { flexDirection: "row", gap: 10 },
  tile: { flex: 1, alignItems: "center", gap: 8, padding: 12, borderRadius: radius.r, borderWidth: 1 },
  ico: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
