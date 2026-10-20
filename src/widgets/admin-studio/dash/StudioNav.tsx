import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useStudioAccess, type StudioAccess } from "@/entities/admin-studio";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type StudioSection = "home" | "approvals" | "monitoring" | "settings";
const ITEMS: { key: StudioSection; icon: IconName; path: string; need: (a: StudioAccess) => boolean }[] = [
  { key: "home", icon: "home", path: "/manage/studio", need: (a) => a.any },
  { key: "approvals", icon: "check-circle", path: "/manage/studio/approvals", need: (a) => a.canReview },
  { key: "monitoring", icon: "activity", path: "/manage/studio/monitoring", need: (a) => a.isAdmin },
  { key: "settings", icon: "settings", path: "/manage/studio/settings", need: (a) => a.isAdmin },
];

// The studio's sections, as on the web: Home, Approvals, Monitoring, Settings — the ones the role may open, the current one lit.
// Moving between them replaces the screen, so "back" still leaves the studio.
export function StudioNav({ current }: { current: StudioSection }) {
  const { t } = useT();
  const c = useColors();
  const a = useStudioAccess();
  const router = useRouter();
  const items = ITEMS.filter((x) => x.need(a));
  if (items.length < 2) return null;
  return (
    <View style={s.row} accessibilityRole="tablist">
      {items.map((x) => {
        const on = x.key === current;
        return (
          <PressableScale key={x.key} haptic={false} scale={0.96} accessibilityRole="tab" accessibilityState={{ selected: on }} onPress={() => !on && router.replace(x.path as never)} style={[s.tab, { backgroundColor: on ? c.accent : c.surface2 }]}>
            <Icon name={x.icon} size={17} color={on ? "#FFFFFF" : c.gray} />
            <Text variant="caption" weight="bold" numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8} style={{ color: on ? "#FFFFFF" : c.ink }}>{t(`admStudio.tabs.${x.key}`)}</Text>
          </PressableScale>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  tab: { flex: 1, minHeight: 58, borderRadius: 16, alignItems: "center", justifyContent: "center", gap: 4, paddingHorizontal: 4 },
});
