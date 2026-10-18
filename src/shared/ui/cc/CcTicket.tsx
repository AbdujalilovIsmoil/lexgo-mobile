import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { Card } from "../Card";
import { Icon, type IconName } from "../Icon";
import { Text } from "../Text";
import { Avatar } from "../Avatar";
import { useColors } from "@/shared/theme";

type Props = { tint: string; icon?: IconName; avatar?: string; title: string; subtitle?: string; badge?: ReactNode; chips?: ReactNode; actions?: ReactNode; onPress?: () => void; titleLines?: number };

// New call-center row: colour strip on the left (red = needs attention), one-line title, a badge on the
// right, chips under it and round action buttons — no big labelled buttons.
export function CcTicket({ tint, icon, avatar, title, subtitle, badge, chips, actions, onPress, titleLines = 1 }: Props) {
  const c = useColors();
  return (
    <Card padded={false} onPress={onPress} style={s.card}>
      <View style={[s.strip, { backgroundColor: tint }]} />
      <View style={s.body}>
        <View style={s.top}>
          {avatar ? <Avatar name={avatar} size={40} /> : <View style={[s.icon, { backgroundColor: `${tint}22` }]}><Icon name={icon ?? "inbox"} size={18} color={tint} /></View>}
          <View style={s.fill}>
            <Text variant="body" weight="bold" numberOfLines={titleLines}>{title}</Text>
            {subtitle ? <Text variant="caption" style={{ color: c.gray }} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          {badge}
        </View>
        {chips || actions ? <View style={s.bottom}><View style={s.chips}>{chips}</View>{actions ? <View style={s.actions}>{actions}</View> : null}</View> : null}
      </View>
    </Card>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: "row", overflow: "hidden" },
  strip: { width: 5 },
  body: { flex: 1, padding: 12, gap: 10 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1, gap: 1 },
  icon: { width: 40, height: 40, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  bottom: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 8 },
  chips: { flexGrow: 1, flexShrink: 0, maxWidth: "100%", flexDirection: "row", flexWrap: "wrap", gap: 6 },
  actions: { flexDirection: "row", gap: 8, marginLeft: "auto" },
});
