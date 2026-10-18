import { CcTiles } from "@/shared/ui/cc";
import type { PayrollEntry } from "@/entities/admin-hrm";
import { stLabel } from "@/entities/admin-hrm";
import { selectHaptic } from "@/shared/lib/haptics";
import { useT } from "@/shared/i18n";

const STATUSES = ["draft", "approved", "paid"];

// Status filter of the payroll list as count tiles: all / draft / approved / paid.
export function PayrollTiles({ items, value, onChange }: { items: PayrollEntry[]; value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  const opts = [{ value: "", label: t("admHrmQ.all"), count: items.length }, ...STATUSES.map((s) => ({ value: s, label: stLabel(t, s), count: items.filter((p) => p.status === s).length }))];
  return <CcTiles options={opts} value={value} onChange={(v) => { selectHaptic(); onChange(v); }} />;
}
