import { StyleSheet, View } from "react-native";
import { useColors } from "@/shared/theme";

export const INDENT = 16;

// Thin vertical guide lines, one per depth level, so a deep tree stays readable.
export function OrgGuides({ depth }: { depth: number }) {
  const c = useColors();
  return (
    <>
      {Array.from({ length: depth }, (_, i) => <View key={i} pointerEvents="none" style={[s.line, { left: i * INDENT + 6, backgroundColor: c.line }]} />)}
    </>
  );
}

const s = StyleSheet.create({ line: { position: "absolute", top: -6, bottom: -6, width: 2, borderRadius: 1 } });
