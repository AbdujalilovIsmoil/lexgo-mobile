import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { ChevronRight, Info, type LucideIcon } from "lucide-react-native";
import { useTheme } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

// The building blocks the two tabs share: a section title with a line icon, a rounded panel and the support note at the bottom.
export function SectionTitle({ icon: Glyph, title, right }: { icon: LucideIcon; title: string; right?: ReactNode }) {
  const { colors: c } = useTheme();
  return (
    <View style={s.title}>
      <Glyph size={22} color={c.accent} strokeWidth={2} />
      <Text variant="h3" style={s.flex} numberOfLines={1}>{title}</Text>
      {right}
    </View>
  );
}

export function Panel({ children, style }: { children: ReactNode; style?: ViewStyle | ViewStyle[] }) {
  const { colors: c } = useTheme();
  return <View style={[s.panel, { backgroundColor: c.surface, borderColor: c.line }, style]}>{children}</View>;
}

// A round, softly tinted tile behind an icon.
export function IconTile({ icon: Glyph, color, size = 48 }: { icon: LucideIcon; color: string; size?: number }) {
  return (
    <View style={[s.tile, { width: size, height: size, borderRadius: size * 0.32, backgroundColor: `${color}1F` }]}>
      <Glyph size={size * 0.46} color={color} strokeWidth={2} />
    </View>
  );
}

export function HelpCard({ text }: { text: string }) {
  const { colors: c, dark } = useTheme();
  const router = useRouter();
  return (
    <PressableScale onPress={() => router.push("/support")} scale={0.98} accessibilityRole="button" accessibilityLabel={text}
      style={[s.help, { backgroundColor: dark ? c.surface : c.tint, borderColor: dark ? c.line : c.tint2 }]}>
      <Info size={22} color={c.accent} />
      <Text variant="small" tone="gray" style={s.flex}>{text}</Text>
      <ChevronRight size={20} color={c.accent} />
    </PressableScale>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  title: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 6 },
  panel: { borderRadius: 22, borderWidth: 1, padding: 16 },
  tile: { alignItems: "center", justifyContent: "center" },
  help: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, borderWidth: 1 },
});
