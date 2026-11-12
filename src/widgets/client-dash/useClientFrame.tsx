import { useMemo, type ReactNode } from "react";
import { useSession } from "@/entities/session";
import { useTheme } from "@/shared/theme";
import { PageFrameContext } from "@/shared/ui/admin";
import { HOME_BG } from "./DashBackdrop";

// The frame of an inner page (the screens of Profile and Home): the pinned SecondaryHeader on the light Home ground, spread into
// AdminPage / TabPage. The same for a client and a professional; the dark theme keeps the canvas.
export function useClientFrame(): { secondary: boolean; ground?: string } {
  const { dark } = useTheme();
  return { secondary: true, ground: dark ? undefined : HOME_BG };
}

// A professional's inner pages (everything that is not a bottom tab) all take that frame by default: AdminPage reads it from here. A
// client's pages are left as they are — each one asks for the frame itself.
export function ProPageFrame({ children }: { children: ReactNode }) {
  const role = useSession()?.user.role;
  const { dark } = useTheme();
  const seller = !!role && role !== "client";
  const value = useMemo(() => (seller ? { secondary: true, ground: dark ? undefined : HOME_BG } : {}), [seller, dark]);
  return <PageFrameContext.Provider value={value}>{children}</PageFrameContext.Provider>;
}
