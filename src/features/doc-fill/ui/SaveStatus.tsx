import { StyleSheet, View } from "react-native";
import type { SaveState } from "@/entities/doc-form";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// The server autosave in words (README §7.3): Saving… / Saved / "Not saved — Retry". The typed text is kept either way.
export function SaveStatus({ state, onRetry }: { state: SaveState; onRetry: () => void }) {
  const { t } = useT();
  if (state === "idle") return null;
  return (
    <View style={s.row} accessibilityLiveRegion="polite">
      {state === "error" ? (
        <PressableScale onPress={onRetry} hitSlop={8} accessibilityRole="button" style={s.row}>
          <Icon name="refresh-cw" size={13} color="#E5484D" />
          <Text variant="caption" weight="semibold" tone="err">{t("dcf.saveRetry")}</Text>
        </PressableScale>
      ) : (
        <>
          <Icon name={state === "saved" ? "check" : "loader"} size={13} tone="gray" />
          <Text variant="caption" tone="gray">{t(state === "saved" ? "dcf.saved" : "dcf.saving")}</Text>
        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end" } });
