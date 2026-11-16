import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { timeAgo } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { eventText } from "../model/text";
import { CATEGORY_ICON, type Notification } from "../model/types";

type Props = { item: Notification; onPress?: () => void; onOpen?: () => void };

// One folded event as a white card (Adliya): the category's icon on a soft blue tile, the title in bold, one grey line (the text · when),
// and a red dot while it is unread. `onOpen` (a deep-link target the viewer can open) shows a small arrow button; tapping the card itself
// opens the detail sheet.
export function NotificationRow({ item, onPress, onOpen }: Props) {
  const { colors: c, dark, glass } = useTheme();
  const { t } = useT();
  const text = eventText(item, t);
  const when = timeAgo(item.createdAt, t);
  const line = [text.body || t(`notif.cats.${item.category}`), when].filter(Boolean).join(" · ");
  return (
    <PressableScale onPress={onPress} scale={0.985} haptic={false} style={[s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]} accessibilityLabel={item.read ? text.title : `${text.title}, ${t("nt1.unread")}`}>
      <View style={[s.icon, { backgroundColor: c.tint2 }]}>
        <Icon name={(CATEGORY_ICON[item.category] ?? "bell") as IconName} size={21} color={c.accent} />
      </View>
      <View style={s.col}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.title}>{text.title}</Text>
        <Text variant="small" tone="gray" numberOfLines={3} style={s.sub}>{line}</Text>
      </View>
      {!item.read ? <View style={s.dot} /> : null}
      {onOpen ? (
        <PressableScale onPress={onOpen} hitSlop={10} accessibilityLabel={t("nt1.open")} style={[s.go, { backgroundColor: c.tint2 }]}>
          <Icon name="arrow-up-right" size={16} color={c.accent} />
        </PressableScale>
      ) : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18, borderWidth: 1 },
  icon: { width: 50, height: 50, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, minWidth: 0, gap: 3 },
  title: { fontSize: 16, lineHeight: 21 },
  sub: { fontSize: 14, lineHeight: 19 },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#E5484D" },
  go: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
