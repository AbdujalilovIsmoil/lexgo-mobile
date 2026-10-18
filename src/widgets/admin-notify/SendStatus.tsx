import { View } from "react-native";
import type { Progress } from "@/features/admin-notify";
import { ProgressBar } from "@/shared/ui/admin";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Live progress of a running send with a Stop button (people already reached keep their notification).
export function SendStatus({ progress, onStop }: { progress: Progress; onStop: () => void }) {
  const { t } = useT();
  return (
    <View style={{ gap: 8 }}>
      <ProgressBar value={progress.done / Math.max(1, progress.total)} />
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Text variant="small" tone="gray">{t("admNtf.progress", { done: progress.done, total: progress.total })}</Text>
        <Button title={t("admNtf.stop")} icon="square" variant="line" size="sm" onPress={onStop} />
      </View>
    </View>
  );
}
