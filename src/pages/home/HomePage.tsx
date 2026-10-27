import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { ClientHome } from "./ClientHome";

// Home tab: the client dashboard — for signed-in clients and for visitors alike (a visitor sees the same page, with a sign-in
// card where the personal blocks are). A professional starts on their own Ish maydoni tab: the tab bar opens on this one first and the
// tabs layout moves them on at once, so for them it renders nothing (it used to build the client's dashboard and ask for a client's
// works, entitlements and profile on every professional's start).
export function HomePage() {
  return useTabRole() === "seller" ? null : <ClientHome />;
}
