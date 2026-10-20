import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./Text";

const SOURCE = require("../../../assets/logo-small.png") as number;

// The LexGo mark of the headers, the sidebar and the sign-in screens. It sits on a dark navy tile: the left half of the mark is
// near white, so on a light page it would melt into the background. If the picture cannot be drawn (a release build that lost
// it, a decode failure) a monogram takes its place, so the spot is never empty.
export function BrandLogo({ size = 40 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.3);
  const inner = Math.round(size * 0.82);
  return (
    <View accessible accessibilityLabel="LexGo" style={[s.tile, { width: size, height: size, borderRadius: radius }]}>
      {failed ? (
        <Text weight="bold" style={[s.mono, { fontSize: size * 0.4 }]}>LG</Text>
      ) : (
        <Image source={SOURCE} resizeMode="contain" fadeDuration={0} onError={() => setFailed(true)} style={{ width: inner, height: inner }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tile: { alignItems: "center", justifyContent: "center", backgroundColor: "#0B2A6B", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(255,255,255,0.18)" },
  mono: { color: "#FFFFFF" },
});
