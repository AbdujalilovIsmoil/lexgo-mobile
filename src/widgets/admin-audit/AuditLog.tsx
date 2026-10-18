import { useMemo, useState } from "react";
import { View } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { AuditRow, filterAudit, useChain, useShown, type AuditEntry } from "@/entities/admin-audit";
import type { useAuditFilters } from "@/features/admin-audit";
import { PagedList } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { AuditDetailSheet } from "./AuditDetailSheet";
import { AuditFilterBar } from "./AuditFilterBar";
import { AuditFilterSheet } from "./AuditFilterSheet";
import { AuditHero } from "./AuditHero";
import { AuditSearch } from "./AuditSearch";

// The tamper-evident log: hero, search + outcome tiles, folded filters, records a screenful at a time and their detail sheet.
export function AuditLog({ f, q }: { f: ReturnType<typeof useAuditFilters>; q: UseQueryResult<AuditEntry[]> }) {
  const { t } = useT();
  const rows = useMemo(() => q.data ?? [], [q.data]);
  const chain = useChain(rows);
  const states = useMemo(() => new Map(rows.map((r, i) => [r, chain.states[i]])), [rows, chain]);
  const [kind, setKind] = useState("all");
  const [s, setS] = useState("");
  const word = useDebounced(s, 250);
  const view = useMemo(() => filterAudit(rows, kind, word), [rows, kind, word]);
  const { items, query } = useShown(view, q);
  const [open, setOpen] = useState<AuditEntry | null>(null);
  const [filtering, setFiltering] = useState(false);
  const summary = !rows.length ? "" : !chain.hashed ? t("admAudit.noHashes") : chain.total ? `${t("admAudit.chainSummary", { linked: chain.linked, total: chain.total })} ${t("admAudit.chainNote")}` : t("admAudit.chainNote");
  return (
    <>
      <PagedList
        data={items}
        query={query}
        keyExtractor={(e) => e.id || e.eventHash}
        renderItem={(e) => <AuditRow item={e} hashed={chain.hashed > 0} state={states.get(e)} onOpen={setOpen} />}
        skeletonHeight={110}
        off={{ title: t("admAuditB.off"), text: t("admAuditB.offText") }}
        empty={{ icon: "shield", title: rows.length ? t("admAuditB.noMatch") : t("admAudit.empty"), text: rows.length ? undefined : t("admAudit.emptyText") }}
        header={
          <View style={{ gap: 12, paddingBottom: 12 }}>
            <AuditHero rows={rows} chain={chain} />
            <AuditSearch rows={rows} q={s} onQ={setS} kind={kind} onKind={setKind} />
            <AuditFilterBar f={f} onOpen={() => setFiltering(true)} />
            <Text variant="caption" tone="gray2">{t("admAudit.appendOnly")}{summary ? `\n${summary}` : ""}</Text>
          </View>
        }
      />
      <AuditFilterSheet visible={filtering} value={f.text} onClose={() => setFiltering(false)} onApply={f.setText} />
      <AuditDetailSheet item={open} state={open ? states.get(open) : undefined} onClose={() => setOpen(null)} />
    </>
  );
}
