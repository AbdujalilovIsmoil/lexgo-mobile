import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAccess } from "@/entities/access";
import { useCurrentModule } from "./useCurrentModule";
import { useDrawer } from "./drawerStore";

// Jump to another module without growing the stack: the admin stack is reset to that module,
// so "back" still leads out of the admin area (to the hub tab), never through the modules visited.
export function useModuleNav() {
  const router = useRouter();
  const current = useCurrentModule();
  const staff = useAccess().staff;
  const setOpen = useDrawer((s) => s.setOpen);
  const go = useCallback((key: string) => {
    setOpen(false);
    if (key === current) return;
    setTimeout(() => {
      if (router.canDismiss()) router.dismissAll();
      router.replace(`/manage/${key}` as never);
    }, 120);
  }, [current, router, setOpen]);
  const hub = useCallback(() => {
    setOpen(false);
    setTimeout(() => router.navigate((staff ? "/(tabs)/admin" : "/") as never), 120);
  }, [router, setOpen, staff]);
  return { current, go, hub };
}
