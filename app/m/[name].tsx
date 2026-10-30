import { Suspense, lazy, type ComponentType } from "react";
import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";
import { StackTabBar } from "@/widgets/tab-bar/StackTabBar";

// The tab pages as ordinary stack screens (see widgets/tab-bar/tabReach): reached when a link points at a tab the system bar does not show.
// The client's pages keep a bar at the bottom (StackTabBar), so every tab is one tap away there too; the AI chat needs the whole screen.
const PAGES: Record<string, ComponentType> = {
  index: lazy(() => import("../(tabs)/index")),
  services: lazy(() => import("../(tabs)/services")),
  works: lazy(() => import("../(tabs)/works")),
  messages: lazy(() => import("../(tabs)/messages")),
  workspace: lazy(() => import("../(tabs)/workspace")),
  requests: lazy(() => import("../(tabs)/requests")),
  clients: lazy(() => import("../(tabs)/clients")),
  lawyers: lazy(() => import("../(tabs)/lawyers")),
  orders: lazy(() => import("../(tabs)/orders")),
  profile: lazy(() => import("../(tabs)/profile")),
  ai: lazy(() => import("../(tabs)/ai")),
};

export default function TabAsStack() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const Page = PAGES[name ?? ""];
  if (!Page) return <NotFoundPage />;
  return (
    <View style={{ flex: 1 }}>
      <Suspense fallback={null}><Page /></Suspense>
      {name === "ai" ? null : <StackTabBar />}
    </View>
  );
}
