import { View } from "react-native";
import { outcomeKind, type AuditEntry } from "@/entities/admin-audit";
import { SearchBox } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

type Props = { rows: AuditEntry[]; q: string; onQ: (v: string) => void; kind: string; onKind: (v: string) => void };

// Search inside the loaded log plus outcome tiles (all / successful / failed) with counts.
export function AuditSearch({ rows, q, onQ, kind, onKind }: Props) {
  const { t } = useT();
  const n = (k: string) => (k === "all" ? rows.length : rows.filter((r) => outcomeKind(r) === k).length);
  const opts = [["all", "adm.all"], ["ok", "admAuditB.okLabel"], ["bad", "admAuditB.failed"]].map(([v, l]) => ({ value: v, label: t(l), count: n(v), alert: v === "bad" }));
  return (
    <View style={{ gap: 10, marginHorizontal: -16 }}>
      <SearchBox value={q} onChangeText={onQ} placeholder={t("admAuditB.searchPh")} />
      <CcTiles options={opts} value={kind} onChange={onKind} />
    </View>
  );
}
