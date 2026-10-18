import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useColors } from "@/shared/theme";

const SLOW_MS = 30_000;

// Covers the WebView while the document server loads the document; offers a retry when it takes too long.
export function EditorLoading({ onRetry }: { onRetry: () => void }) {
  const { t } = useT();
  const c = useColors();
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setSlow(true), SLOW_MS);
    return () => clearTimeout(id);
  }, []);
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bg, alignItems: "center", justifyContent: "center", gap: 14 }]}>
      <ActivityIndicator color={c.accent} size="large" />
      <Text variant="small" tone="gray">{slow ? t("ad5.slow") : t("ad5.opening")}</Text>
      {slow ? <Button title={t("common.retry")} icon="refresh-cw" variant="line" size="sm" onPress={onRetry} /> : null}
    </View>
  );
}
