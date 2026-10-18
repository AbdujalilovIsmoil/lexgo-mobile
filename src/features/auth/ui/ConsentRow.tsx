import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { selectHaptic } from "@/shared/lib/haptics";
import type { ConsentDoc } from "@/entities/auth-consent";
import { ConsentSheet } from "./ConsentSheet";

type Props = { value: boolean; onChange: (v: boolean) => void; docs: ConsentDoc[]; error?: string };

// One tick for the sign-up documents (offer, privacy, personal data, rules …); "Read" opens them.
export function ConsentRow({ value, onChange, docs, error }: Props) {
  const { t } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={s.wrap}>
      <PressableScale haptic={false} onPress={() => { selectHaptic(); onChange(!value); }} style={s.row}>
        <Icon name={value ? "check-square" : "square"} size={24} color={error ? c.err : value ? c.accent : c.gray} />
        <Text variant="small" style={s.text}>{t("au1.agree")}</Text>
      </PressableScale>
      <PressableScale haptic={false} onPress={() => setOpen(true)} hitSlop={6} style={s.read}>
        <Text variant="small" tone="accent" weight="bold">{t("au1.readDocs")}</Text>
      </PressableScale>
      {error ? <Text variant="caption" tone="err" style={s.read}>{error}</Text> : null}
      <ConsentSheet visible={open} onClose={() => setOpen(false)} docs={docs} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { gap: 4 },
  row: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  text: { flex: 1, paddingTop: 2 },
  read: { marginLeft: 34 },
});
