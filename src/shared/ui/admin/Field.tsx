import type { ReactNode } from "react";
import { View } from "react-native";
import { Text } from "../Text";

// Label + control + hint/error, for controls that are not a plain text input.
export function Field({ label, hint, error, children }: { label?: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text variant="small" tone="gray" style={{ marginLeft: 4 }}>{label}</Text> : null}
      {children}
      {error ? <Text variant="caption" tone="err" style={{ marginLeft: 4 }}>{error}</Text> : hint ? <Text variant="caption" tone="gray2" style={{ marginLeft: 4 }}>{hint}</Text> : null}
    </View>
  );
}
