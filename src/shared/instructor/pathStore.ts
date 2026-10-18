import { create } from "zustand";

// The screen the user is on, kept by the assistant host (usePathname + the session role).
type PathState = { pathname: string; role: string; set: (pathname: string, role: string) => void };

export const usePathStore = create<PathState>((set) => ({ pathname: "/", role: "guest", set: (pathname, role) => set({ pathname, role }) }));

// TZ 9 shape: "/mobile/client/subscription" (role segment + the app route).
export function currentPath(): string {
  const { pathname, role } = usePathStore.getState();
  return `/mobile/${role}${pathname === "/" ? "" : pathname}`;
}

// "/services/abc/fill" → "screen:services-abc-fill"; "/" → "screen:home". A stable id for the whole screen.
export function screenId(pathname = usePathStore.getState().pathname): string {
  const slug = pathname.replace(/^\/+|\/+$/g, "").replace(/\//g, "-");
  return `screen:${slug || "home"}`;
}
