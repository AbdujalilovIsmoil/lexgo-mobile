import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";

const TOOLS = [
  { k: "cases", icon: "briefcase", route: "/pro/cases" }, { k: "calendar", icon: "calendar", route: "/pro/calendar" },
  { k: "tasks", icon: "check-square", route: "/pro/tasks" }, { k: "files", icon: "folder", route: "/pro/files" },
  { k: "stats", icon: "bar-chart-2", route: "/pro/stats" }, { k: "referrals", icon: "gift", route: "/pro/referrals" },
] as const;

// Shortcuts into the professional tools (cases, calendar, tasks, files, statistics, referrals).
export function ToolsGrid() {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  return (
    <SectionCard title={t("aw1.tools.title")}>
      <View style={s.grid}>
        {TOOLS.map((x) => (
          <PressableScale key={x.k} onPress={() => router.push(x.route as never)} style={[s.item, { backgroundColor: c.surface2 }]}>
            <Icon name={x.icon} size={20} tone="accent" />
            <Text variant="caption" weight="semibold" center numberOfLines={1}>{t(`aw1.tools.${x.k}`)}</Text>
          </PressableScale>
        ))}
      </View>
    </SectionCard>
  );
}

const s = StyleSheet.create({ grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, item: { width: "31.5%", alignItems: "center", gap: 6, paddingVertical: 14, borderRadius: 16 } });
