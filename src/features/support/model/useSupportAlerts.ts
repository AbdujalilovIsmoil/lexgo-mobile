import { usePathname } from "expo-router";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { supportEventOf } from "@/entities/support";
import { useUserEvents } from "@/shared/realtime";
import { tapHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";
import { toast } from "@/shared/ui";

const clip = (s: string) => (s.length > 90 ? `${s.slice(0, 89).trimEnd()}…` : s);

// A short toast when the operator answers, joins or closes one of my chats while that chat is not
// on screen. Call-center / staff accounts have their own queue alerts, so they are skipped.
export function useSupportAlerts(): void {
  const { t } = useT();
  const path = usePathname();
  const me = useSession()?.user.id ?? "";
  const a = useAccess();
  useUserEvents("support.", (raw) => {
    const e = supportEventOf(raw);
    if (!e || !me || a.callCenter || a.staff || decodeURIComponent(path) === `/support/${e.ticketId}`) return;
    const m = e.messages[0];
    if (e.kind === "message" && m && m.senderUserId !== me && m.content) toast(t("sp1.alertMessage", { name: m.senderName || t("sp4.roles.operator"), text: clip(m.content) }), "info");
    else if (e.kind === "claimed" && e.ticket?.operatorName) toast(t("sp1.alertClaimed", { name: e.ticket.operatorName }), "info");
    else if (e.kind === "closed") toast(t("sp1.alertClosed"), "info");
    else return;
    tapHaptic();
  });
}
