import { useEffect, useState } from "react";
import { Platform, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Icon, PressableScale } from "@/shared/ui";
import { useMotionOn } from "@/shared/lib/useMotionOn";
import { useTheme } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { freshAiChat } from "@/features/ai-chat";
import { usePickForAnalysis } from "@/features/doc-analysis";
import { HERO_OVERLAP } from "./DashHero";

const EDGE = 2; // the border's width: the light runs in this rim
const RADIUS = 20;
const TURN_MS = 3600;

// The problem field on the hero's bottom edge. A question (the send button that replaces the clip once something is typed, or the keyboard's
// send) opens a new AI chat and asks it there (`?q=`); the paper clip picks a document and opens the AI document analysis with it (the AI
// chat takes text only).
// Its border is a light that runs round the field: a gradient streak turning behind the field, seen only through the 2 pt rim. It turns
// only while Home is on view and the app in front (useMotionOn); otherwise the rim rests on its plain blue.
export function DashAsk() {
  const { t } = useT();
  const { colors: c, dark } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [w, setW] = useState(0);
  const on = useMotionOn();
  const turn = useSharedValue(0);
  useEffect(() => {
    if (!on) return;
    turn.set(withRepeat(withTiming(turn.get() + 1, { duration: TURN_MS, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(turn);
  }, [on, turn]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${turn.get() * 360}deg` }] }));
  const attach = usePickForAnalysis();
  const go = () => {
    freshAiChat(); // a question from Home starts its own conversation
    router.navigate({ pathname: "/(tabs)/ai", params: q.trim() ? { q: q.trim() } : {} });
    setQ(""); // asked: the field is empty again when Home comes back
  };
  const rest = dark ? c.line : "#BFE0FF";
  return (
    <View style={[s.shadow, { backgroundColor: rest }]}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={[s.rim, { backgroundColor: rest }]}>
        {w ? (
          <Animated.View pointerEvents="none" style={[s.spinner, { width: w * 1.2, height: w * 1.2, left: -w * 0.1, top: -w * 0.6 + 30 }, spin]}>
            <LinearGradient colors={[rest, rest, "#2F6BFF", "#00CFE8", "#8B6CF2", rest, rest]} locations={[0, 0.36, 0.45, 0.5, 0.56, 0.64, 1]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        ) : null}
        <View style={[s.box, { backgroundColor: dark ? c.surface : "#FFFFFF" }]}>
          <Ionicons name="sparkles" size={18} color="#2F6BFF" />
          <TextInput value={q} onChangeText={setQ} onSubmitEditing={go} submitBehavior="submit" returnKeyType="send" multiline numberOfLines={2} placeholder={t("cdash.home.askPh")} placeholderTextColor={c.gray2} style={[s.input, { color: c.ink }]} accessibilityLabel={t("cdash.home.askPh")} />
          {q.trim() ? (
            <PressableScale onPress={go} hitSlop={8} style={[s.clip, s.send]} accessibilityRole="button" accessibilityLabel={t("cdash.home.send")}>
              <Icon name="arrow-up" size={20} color="#FFFFFF" />
            </PressableScale>
          ) : (
            <PressableScale onPress={() => void attach()} hitSlop={8} style={s.clip} accessibilityRole="button" accessibilityLabel={t("cdash.home.attach")}>
              <Icon name="paperclip" size={20} tone="gray" />
            </PressableScale>
          )}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  shadow: {
    marginHorizontal: 16, marginTop: -HERO_OVERLAP, zIndex: 2, borderRadius: RADIUS,
    ...Platform.select({ ios: { shadowColor: "#2F6BFF", shadowOpacity: 0.22, shadowRadius: 18, shadowOffset: { width: 0, height: 8 } }, default: { elevation: 6 } }),
  },
  rim: { borderRadius: RADIUS, padding: EDGE, overflow: "hidden" },
  spinner: { position: "absolute" },
  box: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: RADIUS - EDGE, paddingLeft: 16, paddingRight: 6, minHeight: 56 - EDGE * 2 },
  clip: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  send: { borderRadius: 20, backgroundColor: "#1668F0" },
  input: { flex: 1, minWidth: 0, fontSize: 15, lineHeight: 20, maxHeight: 64, paddingTop: 12, paddingBottom: 12, textAlignVertical: "center" }, // two lines: the example question in the placeholder fits whole
});
