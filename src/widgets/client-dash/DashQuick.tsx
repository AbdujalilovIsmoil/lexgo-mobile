import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import {
  CarFront,
  ChevronRight,
  TriangleAlert,
  Zap,
} from "lucide-react-native";
import { PressableScale, Text } from "@/shared/ui";
import { palette, useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { cardShadow, noShadow } from "./DashTiles";

// Urgent help in one card split in two (the urgent advocate | car-accident advice), and the SOS chip under it (red, with an arrow, so it reads as a button).
export function DashQuick() {
  const { t } = useT();
  const router = useRouter();
  const { colors: c, dark, glass } = useTheme();
  // Icon and its ground are one colour family (see DashTiles).
  const warmIcon = dark ? palette.warning400 : palette.warning600;
  const warmTint = dark ? `${palette.warning400}26` : palette.warning50;
  return (
    <View style={s.wrap}>
      <View
        style={[
          s.card,
          {
            backgroundColor: dark ? c.surface : "#FFFFFF",
            borderColor: dark ? c.line : "#EEF2FA",
          },
          glass && noShadow,
        ]}
      >
        <PressableScale
          onPress={() => router.navigate("/urgent")}
          scale={0.97}
          style={s.half}
          accessibilityRole="button"
          accessibilityLabel={t("cdash.home.urgent")}
        >
          <View style={[s.urgent, { backgroundColor: warmTint }]}>
            <Zap size={20} color={warmIcon} />
            <View
              style={[
                s.dot,
                {
                  backgroundColor: c.ok,
                  borderColor: dark ? c.surface : "#FFFFFF",
                },
              ]}
            />
          </View>
          <View style={s.copy}>
            <Text
              variant="h4"
              weight="semibold"
              numberOfLines={2}
              maxFontSizeMultiplier={1.15}
              style={s.title}
            >
              {t("cdash.home.urgent")}
            </Text>
            <Text
              variant="caption"
              weight="regular"
              style={{ color: c.ok, fontSize: 12 }}
            >
              {t("cdash.home.allDay")}
            </Text>
          </View>
        </PressableScale>
        <View style={[s.split, { backgroundColor: c.line }]} />
        <PressableScale
          onPress={() =>
            router.navigate(
              "/urgent/new?service=traffic_accident_consultation" as never,
            )
          }
          scale={0.97}
          style={s.half}
          accessibilityRole="button"
          accessibilityLabel={t("cdash.home.crash")}
        >
          <View style={[s.crash, { backgroundColor: warmTint }]}>
            <CarFront size={17} color={warmIcon} />
          </View>
          <Text
            variant="h4"
            weight="semibold"
            numberOfLines={3}
            maxFontSizeMultiplier={1.15}
            style={[s.title, s.copy]}
          >
            {t("cdash.home.crash")}
          </Text>
        </PressableScale>
      </View>
      <PressableScale
        onPress={() => router.navigate("/sos")}
        hitSlop={6}
        scale={0.97}
        style={[
          s.sos,
          {
            backgroundColor: dark ? "rgba(192,57,43,0.16)" : "#FDECEA",
            borderColor: dark ? "rgba(192,57,43,0.4)" : "#F7C9C3",
          },
        ]}
        accessibilityRole="button"
      >
        <View style={s.sosIco}>
          <TriangleAlert size={13} color="#FFFFFF" />
        </View>
        <Text variant="small" weight="semibold" style={s.sosTx}>
          {t("cdash.home.sos")}
        </Text>
        <ChevronRight size={16} color="#C0392B" />
      </PressableScale>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { paddingHorizontal: 16, marginTop: 10, gap: 14 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    ...cardShadow,
  },
  half: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  split: { width: 1, alignSelf: "stretch", marginHorizontal: 12 },
  urgent: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: -1,
    right: -1,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
  },
  crash: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 14, lineHeight: 16 },
  sos: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingLeft: 5,
    paddingRight: 10,
    paddingVertical: 5,
  },
  sosIco: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D64534",
    alignItems: "center",
    justifyContent: "center",
  },
  sosTx: { color: "#C0392B" },
});
