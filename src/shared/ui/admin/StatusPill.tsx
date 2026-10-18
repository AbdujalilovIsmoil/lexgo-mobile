import { useT } from "@/shared/i18n";
import { humanizeSlug } from "@/shared/lib/format";
import { Pill, type PillTone } from "../Pill";

const TONE: Record<string, PillTone> = {
  approved: "ok", paid: "ok", active: "ok", completed: "ok", published: "ok", resolved: "ok", done: "ok", connected: "ok", ok: "ok", claimed: "ok",
  pending: "warn", new: "warn", waiting: "warn", review: "warn", reviewed: "blue", draft: "warn", scheduled: "warn", unpaid: "warn", degraded: "warn",
  in_progress: "blue", open: "blue", open_pool: "blue", todo: "blue",
  rejected: "err", failed: "err", cancelled: "err", blocked: "err",
};

// Any backend status as a coloured pill: translated when known (admSt.*), else tidied.
export function StatusPill({ status, label, small = true }: { status: string; label?: string; small?: boolean }) {
  const { t } = useT();
  const key = status.trim().toLowerCase();
  const text = label ?? (t(`admSt.${key}`) !== `admSt.${key}` ? t(`admSt.${key}`) : humanizeSlug(status));
  return <Pill label={text} tone={TONE[key] ?? "gray"} small={small} />;
}
