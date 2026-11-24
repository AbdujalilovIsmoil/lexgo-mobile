import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { Text } from "./Text";

const SOURCE = require("../../../assets/logo-small.png") as number;

// The Tezkor Himoya mark (a shield with "TH") of the headers, the sidebar and the sign-in screens. It sits on a white tile: the
// mark is black and blue, so on the dark navy bands it would disappear without it. If the picture cannot be drawn (a release build
// that lost it, a decode failure) a monogram takes its place, so the spot is never empty.
export function BrandLogo({ size = 40 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  const radius = Math.round(size * 0.3);
  const inner = Math.round(size * 0.9);
  return (
    <View accessible accessibilityLabel="Tezkor Himoya" style={[s.tile, { width: size, height: size, borderRadius: radius }]}>
      {failed ? (
        <Text weight="bold" style={[s.mono, { fontSize: size * 0.4 }]}>TH</Text>
      ) : (
        <Image source={SOURCE} resizeMode="contain" fadeDuration={0} onError={() => setFailed(true)} style={{ width: inner, height: inner }} />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  tile: { alignItems: "center", justifyContent: "center", overflow: "hidden", backgroundColor: "#FFFFFF", borderWidth: StyleSheet.hairlineWidth, borderColor: "rgba(11,31,69,0.14)" },
  mono: { color: "#0B1F45" },
});
