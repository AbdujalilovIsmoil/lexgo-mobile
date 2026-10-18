import { useState } from "react";
import { View } from "react-native";
import { useComplaints, useComplaintTargets, type ComplaintItem } from "@/entities/rating";
import { ComplaintSheet, useComplaintFilters } from "@/features/rating";
import { ComplaintDetailSheet, ComplaintFilters, ComplaintNotes, useComplaintLive } from "@/widgets/rating";
import { EmptyState } from "@/shared/ui";
import { ProfileSection, RowsSkeleton, ShowMore, useShowMore } from "@/shared/ui/profile";
import { useT } from "@/shared/i18n";
import { ComplaintExtras } from "./ComplaintExtras";
import { ComplaintsHero } from "./ComplaintsHero";
import { ComplaintTile } from "./ComplaintTile";

// The web "Shikoyatlar" inside the profile: hero + notes, then the list (GET /complaints and the quality complaints)
// with filters, ten cards at a time, the detail sheet and the new-complaint sheet (POST /complaints).
export function ComplaintsPanel() {
  const { t } = useT();
  const q = useComplaints();
  useComplaintTargets(true); // warm the "which work" list now, so the new-complaint sheet opens with it ready
  const all = q.data?.items ?? [];
  const f = useComplaintFilters(all);
  const [open, setOpen] = useState<ComplaintItem | null>(null);
  const [form, setForm] = useState(false);
  const [sentId, setSentId] = useState<string | null>(null);
  useComplaintLive(() => void q.refetch());
  const page = useShowMore(f.shown, `${f.kind}${f.stage}${f.q}`);
  const partial = q.data?.manualFailed ? "manual" : q.data?.qualityFailed ? "quality" : "";
  const add = () => { setSentId(null); setForm(true); };
  return (
    <View style={{ gap: 14 }}>
      <ComplaintsHero onNew={add} />
      <ComplaintExtras />
      <ComplaintNotes sentId={sentId} missing={false} partial={partial} onDismissSent={() => setSentId(null)} onDismissMissing={() => {}} onRetry={() => void q.refetch()} />
      <ProfileSection accent="amber" icon="message-square" title={t("py5.tab.complaints")} badge={q.data ? all.length : undefined} action={{ icon: "plus", label: t("pwc.new"), onPress: add }}>
        <ComplaintFilters f={f} />
        {q.isLoading ? <RowsSkeleton /> : !f.shown.length ? (
          <EmptyState compact icon={all.length ? "filter" : "message-square"} title={all.length ? t("pwc.filter.empty") : t("pwc.empty")} text={all.length ? undefined : t("pwc.emptyText")} />
        ) : (
          <View style={{ gap: 10 }}>
            {page.visible.map((c) => <ComplaintTile key={c.key} item={c} onPress={() => setOpen(c)} />)}
            <ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} />
          </View>
        )}
      </ProfileSection>
      <ComplaintDetailSheet item={open} onClose={() => setOpen(null)} />
      <ComplaintSheet visible={form} onClose={() => setForm(false)} onSent={(c) => { setSentId(c.workId); f.reset(); setOpen(null); }} />
    </View>
  );
}
