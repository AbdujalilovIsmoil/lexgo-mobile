import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAccess } from "@/entities/access";
import { moduleHref } from "./moduleHref";
import { useCurrentModule } from "./useCurrentModule";
import { useDrawer } from "./drawerStore";

// Jump to another module without growing the stack: the admin stack is reset to that module,
// so "back" still leads out of the admin area (to the hub tab), never through the modules visited.
// A module that is a tab of the role (a sales operator's funnel) leaves the admin area for that tab.
export function useModuleNav() {
  const router = useRouter();
  const current = useCurrentModule();
  const a = useAccess();
  const setOpen = useDrawer((s) => s.setOpen);
  const go = useCallback((key: string) => {
    setOpen(false);
    if (key === current) return;
    const href = moduleHref(key, a);
    setTimeout(() => {
      if (!href.startsWith("/manage/")) return router.navigate(href as never);
      if (router.canDismiss()) router.dismissAll();
      router.replace(href as never);
    }, 120);
  }, [a, current, router, setOpen]);
  const hub = useCallback(() => {
    setOpen(false);
    setTimeout(() => router.navigate((a.staff ? "/(tabs)/admin" : "/") as never), 120);
  }, [router, setOpen, a.staff]);
  return { current, go, hub };
}
