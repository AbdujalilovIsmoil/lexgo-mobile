import { Image, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradient } from "@/shared/theme";
import { initials } from "@/shared/lib/format";
import { Text } from "./Text";

type Props = { name: string; uri?: string; size?: number; square?: boolean; colors?: readonly [string, string, ...string[]] };

// Gradient monogram like the web's .advcard__ava fallback (`colors` picks another gradient).
export function Avatar({ name, uri, size = 48, square, colors = gradient.primary }: Props) {
  const r = square ? Math.round(size * 0.3) : size / 2;
  if (uri) return <Image accessibilityRole="image" accessibilityLabel={name} source={{ uri }} style={{ width: size, height: size, borderRadius: r }} />;
  return (
    <LinearGradient accessible accessibilityRole="image" accessibilityLabel={name} colors={[...colors]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.box, { width: size, height: size, borderRadius: r }]}>
      <View>
        <Text tone="white" style={{ fontFamily: "Onest_800ExtraBold", fontSize: size * 0.36, lineHeight: size * 0.44 }}>
          {initials(name) || "?"}
        </Text>
      </View>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  box: { alignItems: "center", justifyContent: "center" },
});
