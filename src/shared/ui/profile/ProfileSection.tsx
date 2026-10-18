import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useTheme } from "@/shared/theme";
import { Card } from "../Card";
import type { IconName } from "../Icon";
import { Text } from "../Text";
import { ACCENTS, type Accent } from "./accents";
import { HeadAction } from "./HeadAction";
import { IconTile } from "./IconTile";

type Props = { accent: Accent; icon: IconName; title: string; caption?: string; badge?: string | number; action?: { icon: IconName; label: string; onPress: () => void }; right?: ReactNode; children: ReactNode };

// One profile section: coloured icon tile, title (+ count badge), a round icon action at the right end (the title keeps the whole row, up to two lines), then the body.
export function ProfileSection({ accent, icon, title, caption, badge, action, right, children }: Props) {
  const { dark } = useTheme();
  const [from, to] = ACCENTS[accent];
  return (
    <Card padded={false} style={s.card}>
      <View style={s.head}>
        <IconTile accent={accent} icon={icon} />
        <View style={s.col}>
          <View style={s.line}>
            <Text variant="h4" numberOfLines={2} style={s.title}>{title}</Text>
            {badge !== undefined && badge !== "" ? (
              <View style={[s.badge, { backgroundColor: `${from}22` }]}><Text variant="caption" weight="bold" style={{ color: dark ? to : from }}>{badge}</Text></View>
            ) : null}
          </View>
          {caption ? <Text variant="caption" tone="gray" numberOfLines={2}>{caption}</Text> : null}
        </View>
        {action ? <HeadAction accent={accent} {...action} /> : null}
      </View>
      {right ? <View style={s.act}>{right}</View> : null}
      {children}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, gap: 14, borderRadius: 22 },
  head: { flexDirection: "row", alignItems: "center", gap: 12 },
  act: { alignItems: "flex-start" },
  col: { flex: 1, gap: 1 },
  line: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { flexShrink: 1 },
  badge: { minWidth: 22, height: 22, paddingHorizontal: 7, borderRadius: 11, alignItems: "center", justifyContent: "center" },
});
