import { useEffect } from "react";
import { Tabs, useRouter, useSegments } from "expo-router";
import { TabBar } from "@/widgets/tab-bar";
import { allowedRoutes, homeRoute } from "@/widgets/tab-bar/tabConfig";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";

// Every role's tab routes are declared; the bar shows only those of the current
// role (tabConfig). The AI tab hides the bar so its composer sits on the edge.
const ROUTES = ["index", "services", "works", "messages", "workspace", "requests", "clients", "leads", "csupport", "cclients", "cmeetings", "lawyers", "orders", "admin", "hrm", "notifs", "profile"];

export default function TabsLayout() {
  const role = useTabRole();
  const router = useRouter();
  const segments = useSegments();
  const current = segments[0] === "(tabs)" ? (segments[1] ?? "index") : null;
  const first = homeRoute(role);

  // A route that does not belong to the role (after sign-out or a role switch) → the role's first tab.
  useEffect(() => {
    if (!current) return;
    const outside = !allowedRoutes(role).includes(current);
    const clientHome = current === "index" && first !== "index";
    if (outside || clientHome) router.replace(first === "index" ? "/" : (`/(tabs)/${first}` as never));
  }, [role, current, first, router]);

  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, lazy: true }}>
      {ROUTES.slice(0, 1).map((n) => <Tabs.Screen key={n} name={n} />)}
      <Tabs.Screen name="ai" options={{ tabBarStyle: { display: "none" } }} />
      {ROUTES.slice(1).map((n) => <Tabs.Screen key={n} name={n} />)}
    </Tabs>
  );
}
