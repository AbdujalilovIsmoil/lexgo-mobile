import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { brandFace } from "../lib/brandStyle";

type Props = { brand: string; last4: string; expires?: string; isDefault?: boolean; corner?: ReactNode };

// A mini bank card: brand gradient, chip, •••• last4, expiry and the "default" tag.
export function CardFace({ brand, last4, expires, isDefault, corner }: Props) {
  const { t } = useT();
  return (
    <LinearGradient colors={[...brandFace(brand)]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.card}>
      <View style={s.orb1} /><View style={s.orb2} />
      <View style={s.row}>
        <Text variant="h4" tone="white" style={s.brand}>{brand.toUpperCase()}</Text>
        <View style={s.tags}>{isDefault ? <Pill label={t("py6.default")} tone="glass" small /> : null}{corner}</View>
      </View>
      <View style={s.chip} />
      <Text variant="h3" tone="white" style={s.num}>•••• •••• •••• {last4.padEnd(4, "•")}</Text>
      <Text variant="caption" style={s.exp}>{expires || "MM/YY"}</Text>
    </LinearGradient>
  );
}

const s = StyleSheet.create({
  card: { borderRadius: 18, padding: 16, gap: 10, overflow: "hidden", minHeight: 150, justifyContent: "space-between" },
  orb1: { position: "absolute", right: -30, top: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.09)" },
  orb2: { position: "absolute", right: 40, bottom: -50, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.06)" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  tags: { flexDirection: "row", alignItems: "center", gap: 10 },
  brand: { letterSpacing: 1.5, fontStyle: "italic" },
  chip: { width: 34, height: 25, borderRadius: 6, backgroundColor: "rgba(255,214,102,0.85)" },
  num: { letterSpacing: 1.5 },
  exp: { color: "rgba(255,255,255,0.8)", letterSpacing: 1 },
});
