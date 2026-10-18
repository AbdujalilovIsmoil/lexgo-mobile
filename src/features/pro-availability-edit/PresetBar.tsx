import { StyleSheet, View } from "react-native";
import { presetOf, type PresetKind, type WeeklyDay } from "@/entities/pro-availability";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";

const KINDS: PresetKind[] = ["work", "daily", "full", "clear"];

// Short chips that rewrite the whole week in one tap; the one matching the current week is highlighted.
export function PresetBar({ weekly, onPick }: { weekly: WeeklyDay[]; onPick: (k: PresetKind) => void }) {
  const { t } = useT();
  const on = presetOf(weekly);
  return (
    <View accessibilityLabel={t("availUx.presets")} style={s.row}>
      {KINDS.map((k) => <Chip key={k} label={t(`availUx.preset.${k}`)} active={on === k} onPress={() => onPick(k)} />)}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", flexWrap: "wrap", gap: 8 } });
