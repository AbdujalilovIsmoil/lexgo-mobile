import { StyleSheet, View } from "react-native";
import { Button, Icon, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

export type LockKind = "claim" | "other" | "closed" | "notClient" | "missing" | "unavailable" | "error";
const ICON: Record<LockKind, IconName> = { claim: "lock", other: "lock", closed: "lock", notClient: "user-x", missing: "info", unavailable: "info", error: "alert-circle" };

// Why the assist panel cannot be used right now (not claimed, someone else's, closed, not a client …).
export function AssistLock({ kind, text, onRetry }: { kind: LockKind; text?: string; onRetry?: () => void }) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={[s.box, { backgroundColor: c.surface2 }]}>
      <Icon name={ICON[kind]} size={26} tone="accent" />
      <Text variant="h4" center>{t(`admSupB.lock.${kind}Title`)}</Text>
      <Text variant="small" tone="gray" center>{text ?? t(`admSupB.lock.${kind}Text`)}</Text>
      {onRetry ? <Button title={t("common.retry")} variant="soft" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}

const s = StyleSheet.create({ box: { alignItems: "center", gap: 10, padding: 24, borderRadius: 20, margin: 16 } });
