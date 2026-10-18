import { View } from "react-native";
import { issueText } from "./issueText";
import type { Issue } from "@/entities/admin-policies";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Validation messages of one pricing block (errors in red, warnings in amber).
export function Issues({ items }: { items: Issue[] }) {
  const { t } = useT();
  if (!items.length) return null;
  return (
    <View style={{ gap: 4 }}>
      {items.map((i, k) => <Text key={`${i.path}-${i.code}-${k}`} variant="caption" tone={i.warn ? "warn" : "err"}>{issueText(i, t)}</Text>)}
    </View>
  );
}

export const bad = (issues: Issue[], path: string) => issues.some((i) => !i.warn && i.path === path);
export const under = (issues: Issue[], prefix: string) => issues.filter((i) => i.path === prefix || i.path.startsWith(`${prefix}.`));
