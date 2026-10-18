import { useCallback, useMemo, useState, type ReactNode } from "react";
import { RulesSheet } from "../ui/RulesSheet";
import { pendingCount } from "../lib/normalize";
import { useServiceRules } from "./queries";

export type RulesGate = { pending: number; blocked: boolean; loading: boolean; error: boolean; open: () => void; sheet: ReactNode };

// For a screen that activates services: `blocked` while rules are pending (use i18n svcRules.rulesLockReason /
// rulesLockAction on the disabled button), `open()` shows the sheet, `sheet` must be rendered once. On a load
// error `blocked` stays false: the server re-checks when the service is switched on (web behaviour).
export function useRulesGate(serviceId?: string): RulesGate {
  const q = useServiceRules(serviceId);
  const [visible, setVisible] = useState(false);
  const open = useCallback(() => setVisible(true), []);
  const pending = pendingCount(q.data);
  const sheet = useMemo(() => <RulesSheet visible={visible} onClose={() => setVisible(false)} serviceId={serviceId} />, [visible, serviceId]);
  return { pending, blocked: pending > 0, loading: q.isPending, error: q.isError, open, sheet };
}
