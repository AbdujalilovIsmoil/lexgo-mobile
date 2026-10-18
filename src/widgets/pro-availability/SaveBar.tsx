import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Button, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { reason: string | null; saving: boolean; onSave: () => void; onCancel: () => void };

// Sticky footer content, shown only while there are unsaved changes; Save is off with a one-line reason while invalid.
export function SaveBar({ reason, saving, onSave, onCancel }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={s.col}>
      {reason ? <Text variant="caption" numberOfLines={2} style={{ color: c.err }}>{reason}</Text> : null}
      <View style={s.row}>
        <Button title={t("availUx.cancel")} variant="line" onPress={onCancel} disabled={saving} style={s.btn} />
        <Button title={t("availUx.save")} loading={saving} disabled={!!reason} onPress={onSave} style={s.btn} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 8 }, row: { flexDirection: "row", gap: 10 }, btn: { flex: 1 } });
