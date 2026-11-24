import { Image, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";
import type { useSplashTimeline } from "../model/useSplashTimeline";

const SOURCE = require("../../../../assets/logo.png") as number;

type Props = {
  size: number;
  t: ReturnType<typeof useSplashTimeline>;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
};

// The logo: the Tezkor Himoya shield on a white tile. It fades and pops in, floats gently and tilts with the finger.
export function LogoCanvas({ size, t, tx, ty }: Props) {
  const style = useAnimatedStyle(() => {
    const float = Math.sin(t.time.value * Math.PI * 16) * 5;
    return {
      opacity: t.fill.value,
      transform: [
        { translateX: tx.value * 16 },
        { translateY: ty.value * 16 + float },
        { rotate: `${tx.value * 0.08}rad` },
        { scale: t.pop.value },
      ],
    };
  });
  return (
    <Animated.View style={[s.tile, { width: size, height: size, borderRadius: size * 0.22 }, style]}>
      <Image source={SOURCE} resizeMode="contain" style={{ width: size, height: size }} />
    </Animated.View>
  );
}

const s = StyleSheet.create({
  tile: { backgroundColor: "#FFFFFF", overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 24, shadowOffset: { width: 0, height: 12 }, elevation: 12 },
});
