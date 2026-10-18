import { useState } from "react";
import { View } from "react-native";
import { Chip } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { StudioGate, byOrder, useApprovals, useStudioAccess, useStudioText, type StudioDetail } from "@/entities/admin-studio";
import { ApprovalCard, ApprovalFilters, ApprovalSheet, canPublishItem, isMine, submittedOf, versionLabel, waitingSince } from "@/widgets/admin-studio";
import { useT } from "@/shared/i18n";

function Queue() {
  const { t } = useT();
  const { ctorName } = useStudioText();
  const a = useStudioAccess();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [who, setWho] = useState("");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<StudioDetail | null>(null);
  const query = useApprovals(code, status);
  const all = query.data ?? [];
  const full = useApprovals(code, "").data ?? all;
  const ctorOf = (c: string) => a.constructors.find((x) => x.code === c) ?? null;
  const codes = [...new Set([...a.constructors.filter((c) => c.approvalRequired).map((c) => c.code), ...all.map((i) => i.code).filter(Boolean)])].sort(byOrder);
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = all
    .filter((d) => (!who || isMine(d, a, ctorOf(d.code))) && terms.every((w) => [d.title, d.code, ctorName(d.code), submittedOf(d).by, versionLabel(d), d.id].join(" ").toLowerCase().includes(w)))
    .sort((x, y) => waitingSince(x) - waitingSince(y));
  const counts = full.reduce<Record<string, number>>((m, d) => ({ ...m, [d.status]: (m[d.status] ?? 0) + 1 }), {});
  const mineCount = all.filter((d) => isMine(d, a, ctorOf(d.code))).length;
  return (
    <AdminPage title={t("admStudioC.title")} subtitle={t("admStudioC.lead")}>
      <PagedList
        skeletonHeight={110}
        data={shown}
        query={query}
        keyExtractor={(d) => d.id}
        renderItem={(d) => <ApprovalCard item={d} mine={isMine(d, a, ctorOf(d.code))} publishable={canPublishItem(d, a, ctorOf(d.code))} onPress={() => setOpen(d)} />}
        empty={{ icon: "check-circle", title: t(code || status || who || q ? "admStudioC.empty.filteredTitle" : "admStudioC.empty.title"), text: t(code || status || who || q ? "admStudioC.empty.filteredText" : "admStudioC.empty.text") }}
        header={
          <View style={{ gap: 10, paddingBottom: 12 }}>
            <ApprovalFilters codes={codes.map((c) => ({ value: c, label: `${ctorName(c, ctorOf(c)?.title)} · ${c}` }))} code={code} onCode={setCode} status={status} onStatus={setStatus} who={who} onWho={setWho} q={q} onQ={setQ} counts={counts} total={full.length} />
            {mineCount > 0 && !who ? <View style={{ flexDirection: "row" }}><Chip icon="user-check" label={t("admStudioC.mineNote", { n: mineCount })} active onPress={() => setWho("mine")} /></View> : null}
          </View>
        }
      />
      <ApprovalSheet item={open} onClose={() => setOpen(null)} />
    </AdminPage>
  );
}

// Approval queue: filters, oldest first, tap a card to review it (approve / request changes / reject / publish).
export default function StudioApprovalsPage() {
  const { t } = useT();
  return <StudioGate need="review" title={t("admStudioC.title")}><Queue /></StudioGate>;
}
