import { Image, StyleSheet, View } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useRouter } from "expo-router";
import { GradientBox, IconButton, Text, FocusStatusBar } from "@/shared/ui";

type Props = { title: string; subtitle: string; back?: boolean };

// Compact brand panel on top of every auth screen (the auth "brand" column on the web).
export function AuthHero({ title, subtitle, back = true }: Props) {
  const insets = useInsets();
  const router = useRouter();
  return (
    <GradientBox variant="dark" round={0} style={[s.hero, { paddingTop: insets.top + HEADER_GAP }]}>
      <FocusStatusBar style="light" />
      <View style={s.top}>
        {back ? (
          <IconButton icon="chevron-left" tone="glass" onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/profile"))} />
        ) : (
          <View style={s.spacer} />
        )}
        <Image source={require("../../../assets/logo-small.png")} style={s.logo} />
        <View style={s.spacer} />
      </View>
      <Text variant="h2" tone="white" center>
        {title}
      </Text>
      <Text variant="small" center style={s.sub}>
        {subtitle}
      </Text>
    </GradientBox>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, gap: 8 },
  top: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  spacer: { width: 44, height: 44 },
  logo: { width: 48, height: 48, borderRadius: 14 },
  sub: { color: "#C4DEFF", maxWidth: 320, alignSelf: "center" },
});
