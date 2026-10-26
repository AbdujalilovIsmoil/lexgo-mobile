import type { BottomTabBarProps } from "expo-router/build/layouts/Tabs";
import { FlatBar } from "./FlatBar";

// Android's bar (iOS uses the system bar: NativeTabsBar). It is hidden on screens that ask for it (the AI chat).
export function TabBar(props: BottomTabBarProps) {
  const { state, descriptors } = props;
  const opts = descriptors[state.routes[state.index].key]?.options;
  if ((opts?.tabBarStyle as { display?: string } | undefined)?.display === "none") return null;
  return <FlatBar {...props} />;
}
