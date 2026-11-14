import { StyleSheet, View } from "react-native";
import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { useColors } from "@/shared/theme";
import { PressableScale, Text } from "@/shared/ui";

// A home section's heading: a blue Lucide glyph, the title in bold, and (optionally) a blue link with a chevron on the right.
export function SectionHead({ icon: Glyph, title, link, onLink }: { icon: LucideIcon; title: string; link?: string; onLink?: () => void }) {
  const c = useColors();
  return (
    <View style={s.row}>
      <Glyph size={22} color={c.accent} strokeWidth={2.2} />
      <Text variant="h4" weight="bold" numberOfLines={1} style={s.title}>{title}</Text>
      {link && onLink ? (
        <PressableScale onPress={onLink} hitSlop={10} accessibilityRole="link" style={s.link}>
          <Text variant="small" weight="bold" tone="accent">{link}</Text>
          <ChevronRight size={16} color={c.accent} strokeWidth={2.4} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 4 },
  title: { flex: 1, fontSize: 19, lineHeight: 24 },
  link: { flexDirection: "row", alignItems: "center", gap: 2 },
});
