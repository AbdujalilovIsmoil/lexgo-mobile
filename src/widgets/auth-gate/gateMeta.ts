import type { AccountGate } from "@/entities/session";
import type { IconName } from "@/shared/ui";

type Tone = "warn" | "err";
export const GATE_META: Record<Exclude<AccountGate, "ok">, { icon: IconName; tone: Tone }> = {
  pending: { icon: "clock", tone: "warn" },
  blocked: { icon: "slash", tone: "err" },
  deleted: { icon: "trash-2", tone: "err" },
  rejected: { icon: "x-circle", tone: "err" },
  restricted: { icon: "alert-triangle", tone: "warn" },
};
