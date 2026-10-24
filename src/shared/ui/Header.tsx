import { type ReactNode } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { HEADER_GAP, useInsets } from "@/shared/lib/insets";
import { useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { ChromeFrame } from "./ChromeFrame";
import { backIcon } from "./Icon";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { HeaderExtra, HeaderRight } from "./headerExtra";

type Props = { title?: string; right?: ReactNode; onBack?: () => void; transparent?: boolean; light?: boolean };

// Stack-screen header: 44px back button chip (the web's .burg size) + title — centred on iOS, beside the back arrow on Android (Material).
export function Header({ title, right, onBack, transparent, light }: Props) {
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const fg = light ? "#fff" : c.ink;
  const plain = transparent || light; // over a hero: no glass frame, no banner
  return (
    <ChromeFrame off={plain}>
    <View style={[s.bar, { paddingTop: insets.top + HEADER_GAP, backgroundColor: plain || Platform.OS === "ios" ? "transparent" : c.canvas }]}>
      <IconButton icon={backIcon} tone={light ? "glass" : "tint"} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))} />
      {title ? (
        <Text variant="h4" numberOfLines={1} style={[s.title, { color: fg }]}>
          {title}
        </Text>
      ) : (
        <View style={s.title} />
      )}
      <View style={s.right}>{right ?? <HeaderRight glass={light} />}</View>
    </View>
    {plain ? null : <HeaderExtra />}
    </ChromeFrame>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12 },
  title: { flex: 1, textAlign: Platform.OS === "android" ? "left" : "center" },
  right: { width: 44, alignItems: "flex-end" },
});
