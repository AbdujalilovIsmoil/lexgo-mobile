import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";
import { Pill, Text, type PillTone } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { Risk } from "../model/types";

const TONE: Record<Risk["level"], PillTone> = { high: "err", medium: "warn", low: "ok" };

// One risk: severity pill (high / medium / low) and the text.
export function RiskRow({ risk }: { risk: Risk }) {
  const c = useColors();
  const { t } = useT();
  return (
    <View style={[s.row, { borderColor: c.glassLine, backgroundColor: c.glassFill }]}>
      <Pill label={t(`docs.level.${risk.level}`)} tone={TONE[risk.level]} small />
      <Text variant="small" style={s.text}>{risk.text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: { gap: 8, padding: 13, borderRadius: 16, borderWidth: 1, alignItems: "flex-start" },
  text: { alignSelf: "stretch" },
});
