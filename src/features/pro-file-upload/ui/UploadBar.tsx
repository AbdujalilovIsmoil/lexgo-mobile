import { StyleSheet, View } from "react-native";
import { useT } from "@/shared/i18n";
import { Card, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/admin";
import type { UploadState } from "../model/useUpload";

// Progress of a running upload batch ("Uploading 2/3" + bar by bytes finished) with a cancel link.
export function UploadBar({ state, onCancel }: { state: UploadState; onCancel: () => void }) {
  const { t } = useT();
  if (!state.busy) return null;
  const pct = state.bytesTotal ? Math.min(1, state.bytesDone / state.bytesTotal) : 0;
  return (
    <Card style={s.card}>
      <View style={s.row}>
        <Text variant="small" weight="bold">{t("aw8.uploading", { i: state.index, n: state.total })}</Text>
        <Text variant="small" weight="bold" tone="accent" onPress={onCancel}>{t("adm.cancel")}</Text>
      </View>
      <ProgressBar value={Math.max(0.06, pct)} />
    </Card>
  );
}

const s = StyleSheet.create({ card: { padding: 12, gap: 8 }, row: { flexDirection: "row", justifyContent: "space-between" } });
