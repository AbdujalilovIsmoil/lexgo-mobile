import { Suspense, lazy, type ComponentType } from "react";
import { useLocalSearchParams } from "expo-router";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

// The tab pages as ordinary stack screens (see widgets/tab-bar/tabReach): reached when a link points at a tab the system bar does not show.
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
  return <Suspense fallback={null}><Page /></Suspense>;
}
