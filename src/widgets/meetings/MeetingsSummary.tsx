import { StyleSheet, View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Calm header line of the screen: how many meetings are waiting and how many are past, plus a green pill while one runs.
export function MeetingsSummary({ live, upcoming, past }: { live: number; upcoming: number; past: number }) {
  const { t } = useT();
  return (
    <View style={s.row}>
      <Text variant="small" tone="gray" style={s.grow}>{t("meetUx.upN", { n: upcoming })}  ·  {t("meetUx.pastN", { n: past })}</Text>
      {live ? <Pill small tone="ok" live label={t("ms7.liveN", { n: live })} /> : null}
    </View>
  );
}

const s = StyleSheet.create({ row: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 28 }, grow: { flex: 1 } });
