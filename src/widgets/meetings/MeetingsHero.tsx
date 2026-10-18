import { StyleSheet, View } from "react-native";
import { GradientBox, Icon, PressableScale, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { live: number; canCreate: boolean; onStart: (type: "video" | "audio") => void };

// Top of the meetings screen: how many are live and two big start buttons (video / audio).
export function MeetingsHero({ live, canCreate, onStart }: Props) {
  const { t } = useT();
  return (
    <GradientBox variant="dark" style={s.box}>
      <View style={s.top}>
        <View style={s.badge}><Icon name="video" size={20} tone="white" /></View>
        <View style={s.fill}>
          <Text variant="h4" tone="white">{t("ms7.title")}</Text>
          <Text variant="caption" style={s.sub}>{live ? t("ms7.liveN", { n: live }) : t("ms7.heroSub")}</Text>
        </View>
      </View>
      {canCreate ? (
        <View style={s.row}>
          {(["video", "audio"] as const).map((k) => (
            <PressableScale key={k} onPress={() => onStart(k)} scale={0.95} accessibilityRole="button" style={[s.btn, k === "video" ? s.pri : s.glass]}>
              <Icon name={k === "video" ? "video" : "phone"} size={20} tone="white" />
              <Text variant="small" weight="bold" tone="white" numberOfLines={1}>{t(k === "video" ? "ms7.quickVideo" : "ms7.quickAudio")}</Text>
            </PressableScale>
          ))}
        </View>
      ) : null}
    </GradientBox>
  );
}

const s = StyleSheet.create({
  box: { padding: 16, gap: 14 },
  top: { flexDirection: "row", alignItems: "center", gap: 12 },
  fill: { flex: 1 },
  sub: { color: "#B7CDEC" },
  badge: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50, borderRadius: 25 },
  pri: { backgroundColor: "#1668F0" },
  glass: { backgroundColor: "rgba(255,255,255,0.16)", borderWidth: 1, borderColor: "rgba(255,255,255,0.28)" },
});
