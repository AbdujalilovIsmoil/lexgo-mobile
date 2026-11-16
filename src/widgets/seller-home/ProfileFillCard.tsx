import { Platform, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { isAdvocate, useProfileCompleteness, type SectionKey } from "@/entities/pro-profile";
import { PressableScale, Text } from "@/shared/ui";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// "Profil to'liqligi" as a light card (Adliya, the profile page): the title and the percent, a bar, and the parts still missing in one grey
// line. A tap opens the professional profile on the first missing part. The same number as the home's ring card (useProfileCompleteness).
// `onBand`: inside the navy profile band — a glass box with white type, no outer margins.
export function ProfileFillCard({ onBand }: { onBand?: boolean } = {}) {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  const { sections, percent, ready, profile } = useProfileCompleteness();
  if (!ready || !sections.length) return null;
  const missing = sections.filter((x) => !x.done);
  const lawyer = !isAdvocate(profile.data?.sellerType ?? "");
  const part = (k: SectionKey) => t(`shm.dash.part.${k === "license" && lawyer ? "diploma" : k}`);
  const hint = missing.length ? `${t("shm.dash.completeLeft", { n: missing.length })} · ${missing.map((x) => part(x.key)).join(", ")}` : t("shm.dash.completeDone");
  const open = () => router.push((missing[0] ? { pathname: "/pro/profile", params: { section: missing[0].key } } : "/pro/profile") as never);
  return (
    <PressableScale onPress={open} scale={0.98} accessibilityRole="button" accessibilityLabel={`${t("shm.dash.completeness")}: ${percent}%`} style={onBand ? [s.card, s.band] : [s.card, { backgroundColor: dark || glass ? c.surface : "#FFFFFF", borderColor: dark || glass ? c.line : "#E6EBF3" }, !glass && s.shadow]}>
      <View style={s.head}>
        <Text variant="body" weight="bold" style={[s.title, onBand && s.white]}>{t("shm.dash.completeness")}</Text>
        <Text variant="body" weight="bold" style={[s.title, onBand && s.white]}>{`${percent}%`}</Text>
      </View>
      <View style={[s.track, { backgroundColor: onBand ? "rgba(255,255,255,0.18)" : dark || glass ? c.surface2 : "#E6EBF3" }]}>
        <View style={[s.fill, { width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: percent >= 100 ? (onBand ? "#4ADE80" : c.ok) : onBand ? "#FFFFFF" : c.accent }]} />
      </View>
      <Text variant="small" tone={onBand ? undefined : "gray"} numberOfLines={2} style={[s.hint, onBand && s.dim]}>{hint}</Text>
    </PressableScale>
  );
}

const s = StyleSheet.create({
  card: { marginHorizontal: 16, marginTop: 16, padding: 18, gap: 12, borderRadius: 22, borderWidth: 1 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 17, lineHeight: 22 },
  band: { marginHorizontal: 0, marginTop: 0, padding: 14, gap: 10, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", borderColor: "rgba(255,255,255,0.14)" },
  white: { color: "#FFFFFF", fontSize: 15.5 },
  dim: { color: "#AFC0E0", fontSize: 13 },
  track: { height: 9, borderRadius: 5, overflow: "hidden" },
  fill: { height: 9, borderRadius: 5 },
  hint: { fontSize: 14, lineHeight: 20 },
  shadow: Platform.select({ ios: { shadowColor: "#0B1A33", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } }, default: { elevation: 1 } })!,
});
