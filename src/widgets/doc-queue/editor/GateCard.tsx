import type { ReactNode } from "react";
import { View } from "react-native";
import { Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";

type Props = { icon: IconName; title: string; text?: string; tone?: "accent" | "warn"; children?: ReactNode };

// Centered card for the editor's non-editing states: take the work first, editor closed, sent, loading failed.
export function GateCard({ icon, title, text, tone = "accent", children }: Props) {
  const c = useColors();
  const color = tone === "warn" ? c.warn : c.accent;
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: 28 }}>
      <View style={{ width: 64, height: 64, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: tone === "warn" ? c.warnBg : c.tint2 }}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text variant="h4" center>{title}</Text>
      {text ? <Text variant="small" tone="gray" center>{text}</Text> : null}
      <View style={{ gap: 10, alignSelf: "stretch", alignItems: "center" }}>{children}</View>
    </View>
  );
}
