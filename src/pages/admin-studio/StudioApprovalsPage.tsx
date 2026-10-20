import { useState } from "react";
import { View } from "react-native";
import { Button, Chip, IconButton, confirmDialog } from "@/shared/ui";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { StudioGate, byOrder, processOverdue, studioKeys, useApprovals, useStudioAccess, useStudioText, type StudioDetail } from "@/entities/admin-studio";
import { ApprovalCard, ApprovalFilters, ApprovalSheet, BulkPublishSheet, canPublishItem, isMine, submittedOf, versionLabel, waitingSince } from "@/widgets/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

function Queue() {
  const { t } = useT();
  const { ctorName } = useStudioText();
  const a = useStudioAccess();
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("");
  const [who, setWho] = useState("");
  const [q, setQ] = useState("");
  const c = useColors();
  const [open, setOpen] = useState<StudioDetail | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [bulk, setBulk] = useState(false);
  const overdue = useAdminMutation({ mutationFn: processOverdue, invalidate: [studioKeys.all], success: "admStudioD.approvals.overdueOk" });
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
  const ready = shown.filter((d) => canPublishItem(d, a, ctorOf(d.code)));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const stop = () => { setSelecting(false); setPicked([]); };
  const askOverdue = () => confirmDialog({ title: t("admStudioD.approvals.overdue"), message: t("admStudioD.approvals.overdueQ"), confirmLabel: t("adm.confirm"), cancelLabel: t("adm.cancel"), icon: "clock", onConfirm: async () => { await overdue.mutateAsync(); } });
  const tools = (
    <>
      {a.canPublish && ready.length ? <IconButton icon={selecting ? "x" : "check-square"} label={t("admStudioD.approvals.select")} onPress={() => (selecting ? stop() : setSelecting(true))} /> : null}
      {a.canReassign ? <IconButton icon="clock" label={t("admStudioD.approvals.overdue")} onPress={askOverdue} /> : null}
    </>
  );
  const titles = Object.fromEntries(all.map((d) => [d.id, d.title]));
  return (
    <AdminPage
      title={t("admStudioC.title")} subtitle={t("admStudioC.lead")} right={tools}
      footer={selecting ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Button title={t("admStudioD.approvals.selectAll")} variant="line" size="sm" onPress={() => setPicked(ready.map((d) => d.id))} />
          <Button title={t("admStudioD.approvals.publishN", { n: picked.length })} icon="upload-cloud" variant="gradient" disabled={!picked.length} onPress={() => setBulk(true)} style={{ flex: 1 }} />
        </View>
      ) : undefined}
    >
      <PagedList
        skeletonHeight={110}
        data={shown}
        query={query}
        keyExtractor={(d) => d.id}
        renderItem={(d) => {
          const publishable = canPublishItem(d, a, ctorOf(d.code));
          const on = picked.includes(d.id);
          const pick = selecting && publishable;
          return (
            <View style={pick ? { borderRadius: 22, borderWidth: 2, borderColor: on ? c.accent : "transparent" } : undefined}>
              <ApprovalCard item={d} mine={isMine(d, a, ctorOf(d.code))} publishable={publishable} onPress={() => (pick ? toggle(d.id) : selecting ? undefined : setOpen(d))} />
            </View>
          );
        }}
        empty={{ icon: "check-circle", title: t(code || status || who || q ? "admStudioC.empty.filteredTitle" : "admStudioC.empty.title"), text: t(code || status || who || q ? "admStudioC.empty.filteredText" : "admStudioC.empty.text") }}
        header={
          <View style={{ gap: 10, paddingBottom: 12 }}>
            <ApprovalFilters codes={codes.map((c) => ({ value: c, label: `${ctorName(c, ctorOf(c)?.title)} · ${c}` }))} code={code} onCode={setCode} status={status} onStatus={setStatus} who={who} onWho={setWho} q={q} onQ={setQ} counts={counts} total={full.length} />
            {mineCount > 0 && !who ? <View style={{ flexDirection: "row" }}><Chip icon="user-check" label={t("admStudioC.mineNote", { n: mineCount })} active onPress={() => setWho("mine")} /></View> : null}
          </View>
        }
      />
      <ApprovalSheet item={open} onClose={() => setOpen(null)} />
      <BulkPublishSheet ids={picked} titles={titles} visible={bulk} onClose={() => setBulk(false)} onDone={stop} />
    </AdminPage>
  );
}

// Approval queue: filters, oldest first, tap a card to review it (approve / request changes / reject / publish).
export default function StudioApprovalsPage() {
  const { t } = useT();
  return <StudioGate need="review" title={t("admStudioC.title")}><Queue /></StudioGate>;
}
