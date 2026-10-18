import { Text } from "@/shared/ui";

// Rating as filled / hollow stars (1..5).
export function Stars({ n, size = 15 }: { n: number; size?: number }) {
  const on = Math.max(0, Math.min(5, Math.round(n)));
  return <Text style={{ color: "#F59E0B", fontSize: size, letterSpacing: 1 }}>{"★".repeat(on)}<Text style={{ color: "#F59E0B55", fontSize: size }}>{"★".repeat(5 - on)}</Text></Text>;
}
