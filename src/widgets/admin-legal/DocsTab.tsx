import { useMemo, useState } from "react";
import { buildSlots, bump, DocSlotRow, useDocs, type ConsentDoc, type DocSlot } from "@/entities/admin-legal";
import { DocFormSheet } from "@/features/admin-legal";
import { useAccess } from "@/entities/access";
import { PagedList } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { DocViewSheet } from "./DocViewSheet";
import { DocsHeader, type DocFilter } from "./DocsHeader";

// The required legal documents (and any extra slugs) with their versions; tap one to read it or publish a new version.
export function DocsTab({ newDoc, onNewHandled }: { newDoc: boolean; onNewHandled: () => void }) {
  const { t } = useT();
  const q = useDocs();
  const can = useAccess().can("users.manage");
  const [view, setView] = useState<DocSlot | null>(null);
  const [edit, setEdit] = useState<Partial<ConsentDoc> | null>(null);
  const [inPlace, setInPlace] = useState(false);
  const [filter, setFilter] = useState<DocFilter>("");
  const [search, setSearch] = useState("");
  const fresh = useMemo(() => (newDoc ? { slug: "", version: "1.0", title: "", body: "", active: true } : null), [newDoc]);
  const slots = useMemo(() => buildSlots(q.data ?? []), [q.data]);
  const words = search.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = slots.filter((s) => (!filter || s.state === filter) && words.every((w) => `${s.slug} ${s.current?.title ?? ""} ${t(`admLegal.slugs.${s.slug}`)}`.toLowerCase().includes(w)));
  const startVersion = (s: DocSlot) => {
    const cur = s.current;
    setView(null);
    setInPlace(false);
    setTimeout(() => setEdit(cur ? { ...cur, version: bump(cur.version) } : { slug: s.slug, version: "1.0", title: t(`admLegal.slugs.${s.slug}`), body: "", active: true }), 340);
  };
  return (
    <>
      <PagedList data={shown} query={q} keyExtractor={(s) => s.slug} skeletonHeight={104} off={{ title: t("admLegalC.off404"), text: t("admLegalC.off404Text") }}
        renderItem={(s) => <DocSlotRow slot={s} canEdit={can} onPress={() => setView(s)} onNew={() => startVersion(s)} />}
        header={q.data ? <DocsHeader slots={slots} filter={filter} onFilter={setFilter} q={search} onQ={setSearch} /> : null}
        empty={{ icon: "file-text", title: slots.length ? t("admLegalC.noResults") : t("admLegal.empty") }} />
      <DocViewSheet slot={view} onClose={() => setView(null)} onNewVersion={startVersion} onEdit={(d) => { setView(null); setInPlace(true); setTimeout(() => setEdit(d), 340); }} />
      <DocFormSheet seed={edit ?? fresh} edit={inPlace} onClose={() => { setEdit(null); onNewHandled(); }} />
    </>
  );
}
