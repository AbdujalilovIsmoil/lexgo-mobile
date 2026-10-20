import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Button, Icon, PressableScale, Segmented, Text } from "@/shared/ui";
import { useStudioAccess, useSummary, type EntityCard } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const TINT: Record<string, string> = { services: "#3B82F6", packages: "#8B5CF6" };

// "Services and packages" as one card with a switch between the two, instead of two half-width cards: the total in the system, then
// active / inactive / incomplete as three numbers (the incomplete one opens the drafts), how many records Studio holds, and the two actions
// — open the list, create a new one. All numbers are the server's summary, never counted from a page.
export function EntityCards() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const a = useStudioAccess();
  const cards = useSummary().data?.cards ?? [];
  const [pick, setPick] = useState("");
  if (!cards.length) return null;
  const x: EntityCard = cards.find((k) => k.key === pick) ?? cards[0];
  const tint = TINT[x.key] ?? c.accent;
  const list = (status = "") => router.push({ pathname: "/manage/studio/objects", params: { code: x.code, ...(status ? { status } : {}) } } as never);
  const stat = (label: string, n: number, color: string, onPress?: () => void) => (
    <PressableScale onPress={onPress} disabled={!onPress || !n} accessibilityLabel={`${label}: ${n}`} style={[s.stat, { backgroundColor: c.surface2 }]}>
      <Text variant="h3" style={{ color: n ? color : c.gray2 }}>{n}</Text>
      <Text variant="caption" tone="gray" numberOfLines={1}>{label}</Text>
      {onPress && n ? <View style={s.go}><Icon name="arrow-up-right" size={13} color={color} /></View> : null}
    </PressableScale>
  );
  return (
    <View style={[s.card, { backgroundColor: c.surface, borderColor: c.line }]}>
      <View style={[s.wash, { backgroundColor: `${tint}1F` }]} />
      <Text variant="h4">{t("admStudioD.entity.title")}</Text>
      <Segmented options={cards.map((k) => ({ value: k.key, label: `${t(`admStudioD.cards.${k.key}`)} · ${k.total}` }))} value={x.key} onChange={setPick} />
      <View accessible accessibilityLabel={t("admStudioD.entity.aria", { name: x.title, total: x.total, active: x.active, inactive: x.inactive, incomplete: x.incomplete })} style={s.head}>
        <View style={s.fill}>
          <Text variant="caption" tone="gray">{t("admStudioD.entity.total")}</Text>
          <Text variant="h2" style={s.big}>{x.total}</Text>
        </View>
        <Text variant="caption" tone="gray">{t("admStudioD.entity.studio", { n: x.studioObjects })}</Text>
      </View>
      <View style={s.stats}>
        {stat(t("admStudioD.cards.active"), x.active, c.ok)}
        {stat(t("admStudioD.cards.inactive"), x.inactive, c.gray)}
        {stat(t("admStudioD.cards.incomplete"), x.incomplete, c.warn, () => list("draft"))}
      </View>
      <View style={s.actions}>
        <Button title={t("admStudioD.entity.open")} icon="list" variant="soft" onPress={() => list()} style={s.fill} />
        {a.canEdit ? <Button title={t(x.key === "packages" ? "admStudioD.entity.newPackage" : "admStudioD.entity.newService")} icon="plus" variant="gradient" onPress={() => router.push({ pathname: "/manage/studio/object", params: { code: x.code } } as never)} style={s.fill} /> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 14, overflow: "hidden" },
  wash: { position: "absolute", top: -80, right: -60, width: 220, height: 200, borderRadius: 110 },
  head: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 10 },
  fill: { flex: 1 },
  big: { fontSize: 36, lineHeight: 42 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, minHeight: 72, borderRadius: 14, padding: 12, gap: 2, justifyContent: "center" },
  go: { position: "absolute", top: 8, right: 8 },
  actions: { flexDirection: "row", gap: 10 },
});
