import { useSession } from "@/entities/session";
import { useTheme } from "@/shared/theme";
import { HOME_BG } from "./DashBackdrop";

// The frame of a client's inner page (the screens of Profile and Home): the pinned SecondaryHeader on the light Home ground, spread into
// AdminPage / TabPage. A professional (shared pages: support, payments, settings…) and the dark theme keep the plain frame.
export function useClientFrame(): { secondary: boolean; ground?: string } {
  const role = useSession()?.user.role;
  const { dark } = useTheme();
  const seller = !!role && role !== "client";
  return { secondary: !seller, ground: seller || dark ? undefined : HOME_BG };
}
