import { useState } from "react";
import { fetchDocs } from "@/entities/client-stats";
import { DocRow, useKindNav } from "@/features/dashboard-kinds";
import { usePaged } from "@/shared/lib/usePaged";
import { useT } from "@/shared/i18n";
import { PagedList } from "@/shared/ui/admin";
import { KindChips } from "./KindChips";

type Filter = "all" | "file_ready";

// Counter "Hujjatlar": the document archive, paged by the server; "ready" filters on file_ready.
export function DocsKind() {
  const { t } = useT();
  const nav = useKindNav();
  const [filter, setFilter] = useState<Filter>("all");
  const { items, query } = usePaged(["client-stats", "docs-list", filter], ({ limit, offset }) => fetchDocs({ limit, offset, status: filter === "all" ? undefined : filter }).then((p) => ({ items: p.items, total: p.total, hasMore: offset + p.items.length < p.total })));
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(d) => d.id}
      header={<KindChips<Filter> value={filter} onChange={setFilter} options={[{ value: "all", label: t("cl7.filters.all") }, { value: "file_ready", label: t("cl7.filters.ready") }]} />}
      empty={{ icon: "file-text", title: t("cl7.empty.documents"), text: t("cl7.empty.documentsText") }}
      renderItem={(d) => <DocRow doc={d} onPress={() => nav.doc(d.id)} />}
    />
  );
}
