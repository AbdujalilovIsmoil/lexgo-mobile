import { useTabRole } from "@/widgets/tab-bar/useTabRole";
import { StaffHome } from "./StaffHome";
import { ClientHome } from "./ClientHome";

// Home tab: the client dashboard — for signed-in clients and for visitors alike (a visitor sees the same page, with a sign-in
// card where the personal blocks are); professionals start on their own Ish maydoni tab; superadmin/admin get the web /admin overview.
export function HomePage() {
  const staff = useTabRole() === "staff";
  return staff ? <StaffHome /> : <ClientHome />;
}
