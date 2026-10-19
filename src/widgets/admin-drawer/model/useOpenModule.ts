import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useAccess, useRecentModules } from "@/entities/access";
import { moduleHref } from "./moduleHref";

// Open a module from the hub (a tile or the recent rail) and remember it; a module that is a tab of the role switches to that tab.
export function useOpenModule() {
  const router = useRouter();
  const a = useAccess();
  const add = useRecentModules((s) => s.add);
  return useCallback((key: string) => {
    add(key);
    const href = moduleHref(key, a);
    if (href.startsWith("/manage/")) router.push(href as never);
    else router.navigate(href as never);
  }, [a, add, router]);
}
