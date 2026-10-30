import { useEffect } from "react";
import { Platform } from "react-native";
import { Tabs, useRouter, useSegments } from "expo-router";
import { TabBar } from "@/widgets/tab-bar";
import { NativeTabsBar } from "@/widgets/tab-bar/NativeTabsBar";
import { allowedRoutes, homeRoute } from "@/widgets/tab-bar/tabConfig";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { registerOverlayPage } from "@/widgets/tab-bar/tabOverlay";
import { ProfilePage } from "@/pages/profile/ProfilePage";
import { LawyersPage } from "@/pages/lawyers/LawyersPage";
import { OrdersPage } from "@/pages/orders/OrdersPage";

// Every role's tab routes are declared; the bar shows only those of the current
// role (tabConfig). The AI tab hides the bar so its composer sits on the edge.
// iOS: these open over the open tab, under the real system bar (see tabOverlay).
registerOverlayPage("profile", ProfilePage);
registerOverlayPage("lawyers", LawyersPage);
registerOverlayPage("orders", OrdersPage);

const ROUTES = ["index", "services", "works", "messages", "workspace", "requests", "clients", "lawyers", "orders", "profile"];

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

  // iOS: the system tab bar (Liquid Glass on iOS 26). Android keeps the flat bar below.
  if (Platform.OS === "ios") return <NativeTabsBar bar={current !== "ai"} />;
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, lazy: true, freezeOnBlur: true }}>
      {ROUTES.slice(0, 1).map((n) => <Tabs.Screen key={n} name={n} />)}
      <Tabs.Screen name="ai" options={{ tabBarStyle: { display: "none" } }} />
      {ROUTES.slice(1).map((n) => <Tabs.Screen key={n} name={n} />)}
    </Tabs>
  );
}
