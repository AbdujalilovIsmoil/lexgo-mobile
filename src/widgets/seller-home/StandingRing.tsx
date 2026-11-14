import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import Svg, { Circle } from "react-native-svg";
import { ChartColumn, Star } from "lucide-react-native";
import { useMyRating } from "@/entities/lawyer";
import { useProfileCompleteness } from "@/entities/pro-profile";
import { fmtRating } from "@/shared/lib/format";
import { radius, useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { SectionHead } from "./SectionHead";

const SIZE = 84;
const STROKE = 8;

function Ring({ percent, color, track }: { percent: number; color: string; track: string }) {
  const r = (SIZE - STROKE) / 2;
  const len = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(100, percent));
  return (
    <View style={s.ring}>
      <Svg width={SIZE} height={SIZE} style={StyleSheet.absoluteFill}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke={track} strokeWidth={STROKE} fill="none" />
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={r} stroke={color} strokeWidth={STROKE} fill="none" strokeLinecap="round" strokeDasharray={`${(len * p) / 100} ${len}`} transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`} />
      </Svg>
      <Text variant="h4" weight="bold">{`${Math.round(p)}%`}</Text>
    </View>
  );
}

// "Profil va reyting": one card — on the left the profile's completeness as a ring with the hint to fill it in (opens the profile), on the
// right the rating with a star (score and review count, or "not rated yet"; opens the statistics).
export function StandingRing() {
  const { t, locale } = useT();
  const c = useColors();
  const router = useRouter();
  const { percent, ready } = useProfileCompleteness();
  const r = useMyRating(true).data;
  if (!ready && !r) return null;
  const score = r?.rated ? t("shm.home2.rated", { score: fmtRating(r.rating, locale), n: r.reviews }) : r?.unratedText || t("rt3.unrated");
  return (
    <View style={s.col}>
      <SectionHead icon={ChartColumn} title={t("shm.home2.profileRating")} />
      <View style={[s.card, { backgroundColor: c.glassFill, borderColor: c.glassLine }]}>
        <PressableScale onPress={() => router.push("/pro/profile" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${t("shm.dash.completeness")}: ${percent}%`} style={s.left}>
          <Ring percent={ready ? percent : 0} color={c.accent} track={c.line} />
          <View style={s.txt}>
            <Text variant="body" weight="bold" numberOfLines={1}>{t("shm.dash.completeness")}</Text>
            <Text variant="caption" tone="gray" numberOfLines={3}>{t("shm.dash.completenessHint")}</Text>
          </View>
        </PressableScale>
        <View style={[s.sep, { backgroundColor: c.line }]} />
        <PressableScale onPress={() => router.push("/pro/stats" as never)} scale={0.99} accessibilityRole="button" accessibilityLabel={`${t("shm.ws.statRating")}: ${score}`} style={s.right}>
          <Star size={26} color="#F5A524" strokeWidth={2} fill={r?.rated ? "#F5A524" : "transparent"} />
          <View style={s.txt}>
            <Text variant="body" weight="bold" numberOfLines={1}>{t("shm.ws.statRating")}</Text>
            <Text variant="caption" tone="gray" numberOfLines={2}>{score}</Text>
          </View>
        </PressableScale>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 12 },
  card: { flexDirection: "row", alignItems: "center", borderRadius: radius.rl, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 14 },
  left: { flex: 1.35, flexDirection: "row", alignItems: "center", gap: 12 },
  right: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, paddingLeft: 14 },
  sep: { width: 1, alignSelf: "stretch", marginVertical: 6 },
  ring: { width: SIZE, height: SIZE, alignItems: "center", justifyContent: "center" },
  txt: { flex: 1, minWidth: 0, gap: 3 },
});
