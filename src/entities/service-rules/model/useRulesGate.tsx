import { useCallback, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RulesSheet } from "../ui/RulesSheet";
import { refreshRules } from "./queries";
import type { ServiceRule } from "./types";

// Which rules the sheet shows: one service's (`focus` = the missing ones a configuration or a 409 named, `extra` = rules the
// list may not carry), or every rule of the seller when no service is given.
export type RulesTarget = { serviceId?: string; focus?: string[]; extra?: ServiceRule[] };
export type RulesGate = { open: (t?: RulesTarget) => void; sheet: ReactNode };

// One rules sheet for a screen. Render `sheet` once, inside the sheet that is on top (a native modal is presented only from
// the one on screen). Opening it for named rules reads the rules and configurations again: a refusal means they are stale.
export function useRulesGate(): RulesGate {
  const qc = useQueryClient();
  const [s, setS] = useState<RulesTarget & { visible: boolean }>({ visible: false });
  const open = useCallback(
    (t: RulesTarget = {}) => {
      if (t.focus?.length) refreshRules(qc);
      setS({ ...t, visible: true });
    },
    [qc],
  );
  const sheet = <RulesSheet visible={s.visible} onClose={() => setS((x) => ({ ...x, visible: false }))} serviceId={s.serviceId} focus={s.focus} extra={s.extra} />;
  return { open, sheet };
}
