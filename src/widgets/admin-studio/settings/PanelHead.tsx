import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "@/shared/ui";

// Title and one line of explanation for a settings panel, with its actions underneath.
export function PanelHead({ title, text, children }: { title: string; text?: string; children?: ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <Text variant="h4">{title}</Text>
      {text ? <Text variant="small" tone="gray">{text}</Text> : null}
      {children ? <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>{children}</View> : null}
    </View>
  );
}
