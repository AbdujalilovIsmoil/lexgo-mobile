import { useRouter } from "expo-router";
import { useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";
import type { ActionItem } from "@/shared/ui/admin";

// The operator's tools beyond the four tabs (TZ 3.6): urgent advocate pool, quality complaints, own call logs and
// notification sending — each only when the account's role / permission allows it (the server stays final).
export function useCcTools(): ActionItem[] {
  const { t } = useT();
  const router = useRouter();
  const a = useAccess();
  const item = (key: string, icon: ActionItem["icon"], path: string): ActionItem => ({ key, icon, label: t(`cc1.tools.${key}`), onPress: () => router.push(path as never) });
  const ops = a.callCenter || a.callCenterOperator;
  return [
    ...(ops ? [item("urgent", "zap", "/cc/urgent"), item("complaints", "alert-triangle", "/cc/complaints"), item("calls", "phone-call", "/cc/calls")] : []),
    ...(a.can("notifications.manage") ? [item("notify", "send", "/cc/notify")] : []),
  ];
}
