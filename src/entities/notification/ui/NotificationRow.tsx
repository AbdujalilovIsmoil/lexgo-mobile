import { StyleSheet, View } from "react-native";
import { brand, radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { timeAgo } from "@/shared/lib/format";
import { useT } from "@/shared/i18n";
import { eventText } from "../model/text";
import { CATEGORY_COLOR, CATEGORY_ICON, type Notification } from "../model/types";

type Props = { item: Notification; onPress?: () => void; onOpen?: () => void };

// One folded event as a card: a tinted category tile, title + text, a footer with the category and the time.
// Unread cards get a blue spine and a tinted surface. `onOpen` (a deep-link target the viewer can open) shows the
// round arrow; tapping the card itself opens the detail sheet.
export function NotificationRow({ item, onPress, onOpen }: Props) {
  const c = useColors();
  const { t } = useT();
  const text = eventText(item, t);
  const tone = CATEGORY_COLOR[item.category] ?? c.accent;
  return (
    <PressableScale onPress={onPress} scale={0.985} haptic={false} style={[s.card, { borderColor: item.read ? c.line : brand.b600, backgroundColor: item.read ? c.surface : c.tint }]} accessibilityLabel={text.title}>
      {!item.read ? <View style={s.spine} /> : null}
      <View style={[s.icon, { backgroundColor: `${tone}26` }]}>
        <Icon name={(CATEGORY_ICON[item.category] ?? "bell") as IconName} size={19} color={tone} />
      </View>
      <View style={s.col}>
        <Text variant="body" weight={item.read ? "semibold" : "bold"} numberOfLines={2}>{text.title}</Text>
        {text.body ? <Text variant="small" tone="gray" numberOfLines={3}>{text.body}</Text> : null}
        <View style={s.foot}>
          <View style={[s.pill, { backgroundColor: `${tone}1F` }]}><Text variant="caption" weight="semibold" style={{ color: tone }}>{t(`notif.cats.${item.category}`)}</Text></View>
          <Text variant="caption" tone="gray2">{timeAgo(item.createdAt, t)}</Text>
        </View>
      </View>
      {onOpen ? (
        <PressableScale onPress={onOpen} hitSlop={10} accessibilityLabel={t("nt1.open")} style={[s.go, { backgroundColor: brand.b600 }]}>
          <Icon name="arrow-up-right" size={16} tone="white" />
        </PressableScale>
      ) : null}
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "flex-start", gap: 12, padding: 14, borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  spine: { position: "absolute", left: 0, top: 0, bottom: 0, width: 4, backgroundColor: brand.b600 },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 4 },
  foot: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 2 },
  pill: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 2 },
  go: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", alignSelf: "center" },
});
