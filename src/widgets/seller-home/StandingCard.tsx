import { Fragment } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useMyRating } from "@/entities/lawyer";
import { useProfileCompleteness, type SectionKey } from "@/entities/pro-profile";
import { useSecurityProfile } from "@/entities/security";
import { fmtRating } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { Fade } from "./Fade";

function Bar({ value, color }: { value: number; color: [string, string] }) {
  const c = useColors();
  const w = `${Math.max(0, Math.min(100, value))}%` as const;
  return (
    <View style={[s.track, { backgroundColor: c.line }]}>
      <LinearGradient colors={color} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={[s.fill, { width: w }]} />
    </View>
  );
}

// Where the professional stands: the profile's completeness and the rating (score out of five, with the review count) as two bars; a tap
// opens the profile or the rating breakdown.
export function StandingCard({ i }: { i: number }) {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const { percent, ready } = useProfileCompleteness();
  const r = useMyRating(true).data;
  if (!ready && !r) return null;
  const score = r?.rated ? `${fmtRating(r.rating, locale)} · ${t("shm.ws.reviews", { n: r.reviews })}` : r?.unratedText || t("rt3.unrated");
  return (
    <Fade i={i}>
      <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        {ready ? (
          <PressableScale onPress={() => router.push("/pro/profile" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${t("shm.dash.completeness")}: ${percent}%`} style={s.part}>
            <View style={s.line}><Text variant="body" weight="semibold" style={s.flex}>{t("shm.dash.completeness")}</Text><Text variant="body" weight="bold">{`${percent}%`}</Text></View>
            <Bar value={percent} color={["#173A86", "#2E6BE6"]} />
          </PressableScale>
        ) : null}
        {r ? (
          <PressableScale onPress={() => router.push("/pro/stats" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${t("shm.ws.reputation")}: ${score}`} style={s.part}>
            <View style={s.line}><Text variant="body" weight="semibold" style={s.flex}>{t("shm.ws.reputation")}</Text><Text variant="body" weight="bold" numberOfLines={1} style={[s.score, { color: r.rated ? c.ok : c.gray }]}>{score}</Text></View>
            <Bar value={r.rated ? (r.rating / 5) * 100 : 0} color={["#16A34A", "#4ADE80"]} />
          </PressableScale>
        ) : null}
      </View>
    </Fade>
  );
}

type Row = { key: string; icon: IconName; tint: string; title: string; sub: string; to: string | { pathname: string; params: Record<string, string> } };

// The two things worth a minute today: finishing the profile (how many parts are left; it opens the first missing one) and the account's
// security (whether two-step sign-in is on). Each comes from the backend; a row whose data is not there yet is left out.
export function NextSteps({ i }: { i: number }) {
  const { t } = useT();
  const c = useColors();
  const router = useRouter();
  const { sections, ready } = useProfileCompleteness();
  const sec = useSecurityProfile().data;
  const missing = sections.filter((x) => !x.done);
  const first: SectionKey | undefined = missing[0]?.key;
  const rows: Row[] = [];
  if (ready && sections.length) rows.push(missing.length
    ? { key: "profile", icon: "award", tint: c.accent, title: t("shm.ws.topRank"), sub: t("shm.ws.sectionsLeft", { n: missing.length }), to: first ? { pathname: "/pro/profile", params: { section: first } } : "/pro/profile" }
    : { key: "profile", icon: "award", tint: c.ok, title: t("shm.ws.profileDone"), sub: t("shm.ws.profileDoneSub"), to: "/pro/profile" });
  if (sec) rows.push({ key: "security", icon: "shield", tint: sec.twoFactorEnabled ? c.ok : c.warn, title: t("shm.ws.security"), sub: t(sec.twoFactorEnabled ? "shm.ws.twoFaOn" : "shm.ws.twoFaOff"), to: "/security" });
  if (!rows.length) return null;
  return (
    <Fade i={i}>
      <View style={[s.list, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        {rows.map((x, k) => (
          <Fragment key={x.key}>
            {k ? <View style={[s.rule, { backgroundColor: c.line }]} /> : null}
            <PressableScale onPress={() => router.push(x.to as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${x.title}, ${x.sub}`} style={s.row}>
              <View style={[s.ico, { backgroundColor: `${x.tint}1F` }]}><Icon name={x.icon} size={19} color={x.tint} /></View>
              <View style={s.txt}>
                <Text variant="body" weight="bold" numberOfLines={2}>{x.title}</Text>
                <Text variant="small" tone="gray" numberOfLines={2}>{x.sub}</Text>
              </View>
              <Icon name="chevron-right" size={18} color={c.gray} />
            </PressableScale>
          </Fragment>
        ))}
      </View>
    </Fade>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: radius.rl, borderWidth: 1, padding: 16, gap: 16 },
  part: { gap: 8 },
  line: { flexDirection: "row", alignItems: "center", gap: 10 },
  flex: { flex: 1 },
  score: { flexShrink: 1 },
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
  list: { borderRadius: radius.rl, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 16 },
  rule: { height: StyleSheet.hairlineWidth, marginLeft: 72 },
  ico: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, minWidth: 0, gap: 2 },
});
