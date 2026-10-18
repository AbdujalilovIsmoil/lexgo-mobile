import { useColors } from "@/shared/theme";
import { kindTone, type JournalKind, type KindTone } from "@/entities/security";

// Foreground / soft-fill pair of a journal kind, from theme tokens (so both themes work).
export function useToneColors() {
  const c = useColors();
  const map: Record<KindTone, { fg: string; bg: string }> = {
    accent: { fg: c.accent, bg: c.tint2 },
    ok: { fg: c.ok, bg: c.okBg },
    cy: { fg: c.cyText, bg: c.cyBg },
    warn: { fg: c.warn, bg: c.warnBg },
    gray: { fg: c.gray, bg: c.surface2 },
    err: { fg: c.err, bg: c.errBg },
  };
  return (kind: JournalKind, failed = false) => map[failed ? "err" : kindTone(kind)];
}
