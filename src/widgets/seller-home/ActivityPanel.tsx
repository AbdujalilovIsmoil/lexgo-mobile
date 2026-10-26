import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import type { CabinetNote } from "@/entities/pro-workspace";
import { useT } from "@/shared/i18n";
import { timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { Panel } from "./Panel";

const TOP = 5;

// "So'nggi faollik" of the web dashboard: the cabinet's five latest notifications, folded to the newest one's title; a row opens the
// notifications page. Nothing when the cabinet sent none.
export function ActivityPanel({ notes, i }: { notes: CabinetNote[]; i: number }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const top = [...notes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, TOP);
  if (!top.length) return null;
  const open = () => router.push("/notifications" as never);
  return (
    <Panel i={i} icon="activity" tint="#7A5CFF" title={t("shm.dash.recentActivity")} fold={top[0].title || top[0].body}>
      {top.map((n) => (
        <PressableScale key={n.id} onPress={open} scale={0.99} accessibilityRole="button" accessibilityLabel={n.title || n.body} style={[s.row, { borderColor: c.line }]}>
          <View style={[s.dot, { backgroundColor: c.accent }]} />
          <View style={s.flex}>
            <Text variant="small" weight="semibold" numberOfLines={1}>{n.title || n.body}</Text>
            {n.title && n.body ? <Text variant="caption" tone="gray" numberOfLines={2}>{n.body}</Text> : null}
          </View>
          {n.createdAt ? <Text variant="caption" tone="gray2">{timeAgo(n.createdAt, t)}</Text> : null}
        </PressableScale>
      ))}
    </Panel>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  dot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  flex: { flex: 1, gap: 2 },
});
