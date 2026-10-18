import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Avatar } from "../Avatar";
import { Card } from "../Card";
import { Icon, type IconName } from "../Icon";
import { Text } from "../Text";

type Props = {
  title: string;
  subtitle?: string;
  meta?: string;
  icon?: IconName;
  avatar?: string; // a person's name → initials
  tint?: string; // accent colour of the icon box
  right?: ReactNode;
  onPress?: () => void;
  children?: ReactNode; // extra content under the text (pills, buttons)
};

// One record in an admin list: leading icon/avatar, title, subtitle, meta, trailing slot.
export function RowCard({ title, subtitle, meta, icon, avatar, tint, right, onPress, children }: Props) {
  const c = useColors();
  const accent = tint ?? c.accent;
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={s.row}>
        {avatar ? <Avatar name={avatar} size={42} /> : icon ? <View style={[s.icon, { backgroundColor: `${accent}22` }]}><Icon name={icon} size={19} color={accent} /></View> : null}
        <View style={s.col}>
          <Text variant="body" weight="bold" numberOfLines={2}>{title}</Text>
          {subtitle ? <Text variant="small" tone="gray" numberOfLines={2}>{subtitle}</Text> : null}
          {meta ? <Text variant="caption" tone="gray2" numberOfLines={1}>{meta}</Text> : null}
        </View>
        {right}
        {onPress && !right ? <Icon name="chevron-right" size={18} tone="gray" /> : null}
      </View>
      {children ? <View style={s.extra}>{children}</View> : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  icon: { width: 42, height: 42, borderRadius: radius.r, alignItems: "center", justifyContent: "center" },
  col: { flex: 1, gap: 2 },
  extra: { marginTop: 10, gap: 8 },
});
