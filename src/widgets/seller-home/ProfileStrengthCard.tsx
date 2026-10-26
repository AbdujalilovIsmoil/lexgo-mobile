import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { isAdvocate, useProfileCompleteness, type SectionKey } from "@/entities/pro-profile";
import { radius } from "@/shared/theme";
import { Button, Icon, PressableScale, ProgressRing, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

const ICON: Record<SectionKey, IconName> = { personal: "user", photo: "camera", kind: "briefcase", license: "award", experience: "trending-up", region: "map-pin", organization: "home" };
const tint = (pct: number) => (pct >= 100 ? "#22C55E" : pct >= 50 ? "#00CFE8" : "#F5C451");

// "Profil to'liqligi" on the professional's home (the web dashboard's ring card): the percent in a ring whose halo keeps circling until the
// profile is complete, the parts still missing as short chips (each opens its form on the profile page) and the way to the profile.
// The percent is the profile page's own (useProfileCompleteness), so both screens always show the same number.
export function ProfileStrengthCard({ i }: { i: number }) {
  const { t } = useT();
  const router = useRouter();
  const { sections, percent, ready, profile } = useProfileCompleteness();
  if (!ready || !sections.length) return null;
  const done = percent >= 100;
  const missing = sections.filter((x) => !x.done);
  const color = tint(percent);
  const lawyer = !isAdvocate(profile.data?.sellerType ?? "");
  const part = (k: SectionKey) => t(`shm.dash.part.${k === "license" && lawyer ? "diploma" : k}`);
  const open = (section?: SectionKey) => router.push((section ? { pathname: "/pro/profile", params: { section } } : "/pro/profile") as never);
  return (
    <Fade i={i}>
      <LinearGradient colors={["#0B1F45", "#123A86"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
        <View style={s.glow} pointerEvents="none" />
        <View style={s.row}>
          <ProgressRing value={percent / 100} color={color} size={88} stroke={8} halo={!done} label={`${t("shm.dash.completeness")}: ${percent}%`}>
            {done ? <Icon name="check" size={28} color={color} /> : <Text variant="h3" tone="white">{`${percent}%`}</Text>}
          </ProgressRing>
          <View style={s.copy}>
            <Text variant="h4" tone="white">{t("shm.dash.completeness")}</Text>
            <Text variant="small" style={s.hint}>{t(done ? "shm.dash.completeDone" : "shm.dash.completenessHint")}</Text>
          </View>
        </View>
        {missing.length ? (
          <View style={s.chips}>
            <Text variant="caption" weight="semibold" style={s.left}>{t("shm.dash.completeLeft", { n: missing.length })}</Text>
            {missing.map((x) => (
              <PressableScale key={x.key} onPress={() => open(x.key)} accessibilityRole="button" accessibilityLabel={part(x.key)} style={s.chip}>
                <Icon name={ICON[x.key]} size={13} color="#FFFFFF" />
                <Text variant="caption" weight="bold" tone="white" numberOfLines={1}>{part(x.key)}</Text>
              </PressableScale>
            ))}
          </View>
        ) : null}
        <Button title={t(done ? "shm.dash.completeCta" : "shm.dash.completeFill")} icon="arrow-right" iconRight size="sm" variant={done ? "glass" : "gradient"} onPress={() => open(missing[0]?.key)} style={s.cta} />
      </LinearGradient>
    </Fade>
  );
}

const s = StyleSheet.create({
  card: { padding: 16, gap: 14, borderRadius: radius.rl, overflow: "hidden" },
  glow: { position: "absolute", width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(0,207,232,0.10)", right: -60, top: -70 },
  row: { flexDirection: "row", alignItems: "center", gap: 16 },
  copy: { flex: 1, gap: 4 },
  hint: { color: "rgba(255,255,255,0.78)" },
  chips: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  left: { color: "rgba(255,255,255,0.7)" },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)" },
  cta: { alignSelf: "flex-start" },
});
