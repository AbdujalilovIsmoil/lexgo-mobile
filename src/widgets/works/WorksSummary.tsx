import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { isOpenWork, workGroup, type Work } from "@/entities/work";
import { Icon, PressableScale, Reveal, Text, type IconName } from "@/shared/ui";
import { radius, useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The top of "Mening ishlarim": three live counters (in progress · finished · all) and the one pointer to the document
// archive ("Mening hujjatlarim"), since this list holds processes only.
export function WorksSummary({ works }: { works: Work[] }) {
  const c = useColors();
  const { t } = useT();
  const router = useRouter();
  const cells: { icon: IconName; n: number; k: string; tint: string }[] = [
    { icon: "activity", n: works.filter((w) => isOpenWork(w.status)).length, k: t("wks.active"), tint: c.accent },
    { icon: "check-circle", n: works.filter((w) => workGroup(w.status) === "done").length, k: t("wks.done"), tint: c.ok },
    { icon: "layers", n: works.length, k: t("wks.total"), tint: c.gray },
  ];
  return (
    <Reveal>
      <View style={s.col}>
        <View style={s.row}>
          {cells.map((x) => (
            <View key={x.k} style={[s.cell, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
              <Icon name={x.icon} size={16} color={x.tint} />
              <Text variant="h3">{x.n}</Text>
              <Text variant="caption" tone="gray" numberOfLines={1}>{x.k}</Text>
            </View>
          ))}
        </View>
        <PressableScale onPress={() => router.push("/documents" as never)} accessibilityRole="button" style={[s.link, { backgroundColor: c.tint }]}>
          <Icon name="file-text" size={16} color={c.accent} />
          <Text variant="small" weight="bold" tone="accent" style={s.flex}>{t("cl1.documentsLink")}</Text>
          <Icon name="arrow-right" size={15} color={c.accent} />
        </PressableScale>
      </View>
    </Reveal>
  );
}

const s = StyleSheet.create({
  col: { gap: 10, paddingBottom: 14 },
  row: { flexDirection: "row", gap: 10 },
  cell: { flex: 1, gap: 4, padding: 12, borderRadius: radius.rl, borderWidth: 1 },
  link: { flexDirection: "row", alignItems: "center", gap: 10, minHeight: 48, paddingHorizontal: 14, borderRadius: radius.r },
  flex: { flex: 1 },
});
