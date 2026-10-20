import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useStudioAccess, useSummary, type EntityCard } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const ICON: Record<string, IconName> = { services: "briefcase", packages: "package" };
const TINT: Record<string, string> = { services: "#3B82F6", packages: "#8B5CF6" };

// The Services and Packages cards of the studio, numbers straight from the server's summary (never counted from a page): the total,
// active / inactive, and the incomplete ones (draft, changes requested, rejected) that open the list of drafts. The card opens the
// constructor's list, the plus creates.
export function EntityCards() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const a = useStudioAccess();
  const q = useSummary();
  const cards = q.data?.cards ?? [];
  if (!cards.length) return null;
  const list = (x: EntityCard, status = "") => router.push({ pathname: "/manage/studio/objects", params: { code: x.code, ...(status ? { status } : {}) } } as never);
  const create = (x: EntityCard) => router.push({ pathname: "/manage/studio/object", params: { code: x.code } } as never);
  return (
    <View style={s.row}>
      {cards.map((x) => {
        const tint = TINT[x.key] ?? c.accent;
        return (
          <PressableScale key={x.key} onPress={() => list(x)} accessibilityLabel={`${x.title}: ${x.total}`} style={[s.card, { backgroundColor: c.surface, borderColor: `${tint}55` }]}>
            <View style={s.head}>
              <View style={[s.ic, { backgroundColor: `${tint}22` }]}><Icon name={ICON[x.key] ?? "layers"} size={16} color={tint} /></View>
              <Text variant="small" weight="bold" numberOfLines={1} style={s.fill}>{x.title}</Text>
              {a.canEdit ? <PressableScale onPress={() => create(x)} hitSlop={8} accessibilityLabel={t("admStudioD.cards.create")} style={[s.plus, { backgroundColor: tint }]}><Icon name="plus" size={16} tone="white" /></PressableScale> : null}
            </View>
            <Text variant="h2" numberOfLines={1}>{x.total}</Text>
            <View style={s.stats}>
              <Text variant="caption" tone="gray">{x.active} {t("admStudioD.cards.active")}</Text>
              <Text variant="caption" tone="gray">{x.inactive} {t("admStudioD.cards.inactive")}</Text>
            </View>
            <PressableScale onPress={() => list(x, "draft")} disabled={!x.incomplete} hitSlop={6} style={[s.warn, { backgroundColor: x.incomplete ? `${c.warn}22` : c.surface2 }]}>
              <Text variant="caption" weight="bold" style={{ color: x.incomplete ? c.warn : c.gray2 }}>{x.incomplete} {t("admStudioD.cards.incomplete")}</Text>
            </PressableScale>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
  card: { flex: 1, minHeight: 172, borderRadius: 22, borderWidth: 1.5, padding: 14, gap: 6 },
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  fill: { flex: 1 },
  ic: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  plus: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  stats: { gap: 1 },
  warn: { alignSelf: "flex-start", marginTop: "auto", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
});
