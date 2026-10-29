import { useEffect } from "react";
import { Platform } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { TabBar } from "@/widgets/tab-bar";
import { NativeTabsBar } from "@/widgets/tab-bar/NativeTabsBar";
import { allowedRoutes, homeRoute, systemBar } from "@/widgets/tab-bar/tabConfig";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { useTablet } from "@/shared/lib/useTablet";

// Every role's tab routes are declared; the bar shows only those of the current
// role (tabConfig). The AI tab hides the bar so its composer sits on the edge.
const ROUTES = ["index", "services", "works", "messages", "workspace", "requests", "clients", "lawyers", "orders", "profile"];

export default function TabsLayout() {
  const role = useTabRole();
  const router = useRouter();
  const segments = useSegments();
  const current = segments[0] === "(tabs)" ? (segments[1] ?? "index") : null;
  const first = homeRoute(role);
  const { tablet } = useTablet();

  // A route that does not belong to the role (after sign-out or a role switch) → the role's first tab.
  useEffect(() => {
    if (!current) return;
    const outside = !allowedRoutes(role).includes(current);
    const clientHome = current === "index" && first !== "index";
    if (outside || clientHome) router.replace(first === "index" ? "/" : (`/(tabs)/${first}` as never));
  }, [role, current, first, router]);

  // An iPad: the system tab bar (Liquid Glass on iOS 26) beside its sidebar. Phones, iPhone and Android alike, get the app's own bar below.
  if (systemBar(Platform.OS === "ios", tablet)) return <NativeTabsBar bar={current !== "ai"} />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, lazy: true, freezeOnBlur: true }}>
      {ROUTES.slice(0, 1).map((n) => <Tabs.Screen key={n} name={n} />)}
      <Tabs.Screen name="ai" options={{ tabBarStyle: { display: "none" } }} />
      {ROUTES.slice(1).map((n) => <Tabs.Screen key={n} name={n} />)}
    </Tabs>
  );
}
