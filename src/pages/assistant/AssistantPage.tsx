import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useNavigation, useRouter } from "expo-router";
import { AiOrb, GradientBox, IconButton, Text } from "@/shared/ui";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { restoreInstructor, useOverlay } from "@/features/instructor";
import { ChatView } from "@/widgets/instructor/ChatView";

// Full-screen assistant: header with the orb, the chat, the composer. When it starts pointing at something on
// a screen (a highlight step) it steps aside so the highlight is visible on the screen below.
export function AssistantPage() {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const nav = useNavigation();
  const guiding = useOverlay((o) => !!o.step);
  useEffect(() => { void restoreInstructor(); }, []);
  useEffect(() => { if (guiding && nav.isFocused()) router.back(); }, [guiding, nav, router]);
  return (
    <View style={[s.fill, { backgroundColor: c.canvas }]}>
      <GradientBox variant="dark" round={0} style={[s.head, { paddingTop: insets.top + HEADER_GAP }]}>
        <View style={s.orb}><AiOrb size={46} icon="compass" /></View>
        <View style={s.fill}>
          <Text variant="h4" tone="white" numberOfLines={1}>{t("ax2.title")}</Text>
          <Text variant="caption" style={s.sub} numberOfLines={1}>{t("ax2.subtitle")}</Text>
        </View>
        <IconButton icon="x" tone="glass" size={40} label={t("common.close")} onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
      </GradientBox>
      <KeyboardAvoidingView behavior="padding" style={s.fill}><ChatView /></KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  sub: { color: "#B7CDEC" },
  orb: { marginLeft: 8 },
});
