import { StyleSheet, View } from "react-native";
import { radius, useColors } from "@/shared/theme";
import { Icon, type IconName } from "./Icon";
import { Text } from "./Text";
import { Button } from "./Button";

type Props = {
  icon?: IconName;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
};

export function EmptyState({ icon = "inbox", title, text, actionLabel, onAction, compact }: Props) {
  const c = useColors();
  return (
    <View style={[s.wrap, compact && s.compact]}>
      <View style={[s.icon, { backgroundColor: c.tint2 }]}>
        <Icon name={icon} size={26} tone="accent" />
      </View>
      <Text variant="h4" center>
        {title}
      </Text>
      {text ? (
        <Text variant="small" tone="gray" center style={s.text}>
          {text}
        </Text>
      ) : null}
      {actionLabel && onAction ? <Button title={actionLabel} onPress={onAction} variant="soft" size="sm" style={s.btn} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 24, gap: 8 },
  compact: { paddingVertical: 24 },
  icon: { width: 60, height: 60, borderRadius: radius.rl, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  text: { maxWidth: 300 },
  btn: { marginTop: 10, alignSelf: "center" },
});
