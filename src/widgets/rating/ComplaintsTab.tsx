import { useState } from "react";
import { View } from "react-native";
import { matchesRef, ComplaintRowCard, useComplaints, type ComplaintItem } from "@/entities/rating";
import { ComplaintSheet, useComplaintFilters } from "@/features/rating";
import { ComplaintDetailSheet } from "./ComplaintDetailSheet";
import { ComplaintFilters } from "./ComplaintFilters";
import { ComplaintNotes } from "./ComplaintNotes";
import { ComplaintsHead } from "./ComplaintsHead";
import { useComplaintLive } from "./useComplaintLive";
import { PagedList } from "@/shared/ui/admin";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

type Props = { work?: string; about?: string; openNew?: boolean };

// The client's complaints (web: ClientComplaints) — written ones and those a low rating opened.
export function ComplaintsTab({ work = "", about = "", openNew = false }: Props) {
  const { t } = useT();
  const q = useComplaints();
  const all = q.data?.items ?? [];
  const f = useComplaintFilters(all);
  const [open, setOpen] = useState<ComplaintItem | null>(null);
  const [form, setForm] = useState(openNew || !!about);
  const [sentId, setSentId] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [seen, setSeen] = useState("");
  if (work && q.data && seen !== work) {
    setSeen(work);
    const hit = all.find((x) => matchesRef(x, work));
    if (hit) setOpen(hit);
    else if (!q.data.manualFailed && !q.data.qualityFailed) setMissing(true);
  }
  useComplaintLive(() => void q.refetch());
  const { items, query } = useSlicedList(f.shown, q, `${f.kind}${f.stage}${f.q}`);
  const partial = q.data?.manualFailed ? "manual" : q.data?.qualityFailed ? "quality" : "";
  return (
    <>
      <PagedList
        data={items}
        query={query}
        flat
        keyExtractor={(c) => c.key}
        renderItem={(c) => <ComplaintRowCard item={c} onPress={() => setOpen(c)} />}
        empty={all.length ? { icon: "filter", title: t("pwc.filter.empty") } : { icon: "message-square", title: t("pwc.empty"), text: t("pwc.emptyText") }}
        header={
          <View>
            <ComplaintsHead all={all} onNew={() => { setSentId(null); setForm(true); }} />
            <ComplaintNotes sentId={sentId} missing={missing} partial={partial} onDismissSent={() => setSentId(null)} onDismissMissing={() => setMissing(false)} onRetry={() => void q.refetch()} />
            <ComplaintFilters f={f} />
            <View style={{ height: 10 }} />
          </View>
        }
      />
      <ComplaintDetailSheet item={open} onClose={() => setOpen(null)} />
      <ComplaintSheet visible={form} onClose={() => setForm(false)} relatedRef={about} onSent={(c) => { setSentId(c.workId); f.reset(); setOpen(null); }} />
    </>
  );
}
