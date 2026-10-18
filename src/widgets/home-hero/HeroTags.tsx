import { StyleSheet, View } from "react-native";
import { Pill } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { useHomeStats } from "@/features/home-stats";

// Hero chips: lawyer and region counts come from the backend; the free-requests chip is policy text.
export function HeroTags() {
  const { t } = useT();
  const live = useHomeStats();
  const tags = [live.lawyers ? t("home.tagLawyers", { n: live.lawyers }) : "", live.regions ? t("home.tagRegions", { n: live.regions }) : "", t("home.freeTag")].filter(Boolean);
  return (
    <View style={s.row}>
      {tags.map((tag) => <Pill key={tag} label={tag} tone="glass" icon="check" small />)}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 },
});
