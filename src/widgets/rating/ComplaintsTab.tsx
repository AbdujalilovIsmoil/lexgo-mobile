import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { matchesRef, ComplaintRowCard, useComplaints, type ComplaintItem } from "@/entities/rating";
import { useComplaintFilters, useComplaintSent } from "@/features/rating";
import { ComplaintDetailSheet } from "./ComplaintDetailSheet";
import { ComplaintFilters } from "./ComplaintFilters";
import { ComplaintNotes } from "./ComplaintNotes";
import { ComplaintProcess, ComplaintsHead } from "./ComplaintsHead";
import { useComplaintLive } from "./useComplaintLive";
import { PagedList } from "@/shared/ui/admin";
import { useSlicedList } from "@/shared/lib/pay/useSlicedList";
import { useT } from "@/shared/i18n";

type Props = { work?: string };

// The client's complaints (web: ClientComplaints) — written ones and those a low rating opened.
export function ComplaintsTab({ work = "" }: Props) {
  const { t } = useT();
  const q = useComplaints();
  const all = q.data?.items ?? [];
  const f = useComplaintFilters(all);
  const [open, setOpen] = useState<ComplaintItem | null>(null);
  const router = useRouter();
  const sentId = useComplaintSent((s) => s.id);
  const setSentId = useComplaintSent((s) => s.set);
  const [shownSent, setShownSent] = useState<string | null>(null);
  if (sentId && shownSent !== sentId) { // a complaint just filed on its page: clear the filters so it shows among all
    setShownSent(sentId);
    f.reset();
    setOpen(null);
  }
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
        joined
        keyExtractor={(c) => c.key}
        renderItem={(c, i) => <ComplaintRowCard item={c} first={i === 0} last={i === items.length - 1} onPress={() => setOpen(c)} />}
        empty={all.length ? { icon: "filter", title: t("pwc.filter.empty") } : { icon: "message-square", title: t("pwc.empty"), text: t("pwc.emptyText") }}
        footer={all.length ? <ComplaintProcess /> : null}
        header={
          <View>
            <ComplaintsHead all={all} onNew={() => { setSentId(null); router.push("/complaints/new"); }} />
            <ComplaintNotes sentId={sentId} missing={missing} partial={partial} onDismissSent={() => setSentId(null)} onDismissMissing={() => setMissing(false)} onRetry={() => void q.refetch()} />
            <ComplaintFilters f={f} />
          </View>
        }
      />
      <ComplaintDetailSheet item={open} onClose={() => setOpen(null)} />
    </>
  );
}
