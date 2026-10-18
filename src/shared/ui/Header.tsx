import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { useInsets } from "@/shared/lib/insets";
import { useRouter } from "expo-router";
import { useColors } from "@/shared/theme";
import { IconButton } from "./IconButton";
import { Text } from "./Text";
import { HeaderExtra, HeaderRight } from "./headerExtra";

type Props = { title?: string; right?: ReactNode; onBack?: () => void; transparent?: boolean; light?: boolean };

// Stack-screen header: 44px back button chip (the web's .burg size) + title.
export function Header({ title, right, onBack, transparent, light }: Props) {
  const c = useColors();
  const insets = useInsets();
  const router = useRouter();
  const fg = light ? "#fff" : c.ink;
  return (
    <>
    <View style={[s.bar, { paddingTop: insets.top + 6, backgroundColor: transparent ? "transparent" : c.bg }]}>
      <IconButton icon="chevron-left" tone={light ? "glass" : "tint"} onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/")))} />
      {title ? (
        <Text variant="h4" numberOfLines={1} style={[s.title, { color: fg }]}>
          {title}
        </Text>
      ) : (
        <View style={s.title} />
      )}
      <View style={s.right}>{right ?? <HeaderRight glass={light} />}</View>
    </View>
    {transparent || light ? null : <HeaderExtra />}
    </>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 14 },
  title: { flex: 1, textAlign: "center" },
  right: { width: 44, alignItems: "flex-end" },
});
