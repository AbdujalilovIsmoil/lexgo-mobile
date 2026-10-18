import { Platform } from "react-native";
import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { LiquidBar } from "./LiquidBar";
import { FlatBar } from "./FlatBar";

// Liquid glass on iOS, the original flat bar on Android.
// It is hidden on screens that ask for it (the AI chat).
export function TabBar(props: BottomTabBarProps) {
  const { state, descriptors } = props;
  const opts = descriptors[state.routes[state.index].key]?.options;
  if ((opts?.tabBarStyle as { display?: string } | undefined)?.display === "none") return null;
  return Platform.OS === "ios" ? <LiquidBar {...props} /> : <FlatBar {...props} />;
}
