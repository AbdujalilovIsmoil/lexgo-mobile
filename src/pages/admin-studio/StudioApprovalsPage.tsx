import { useState } from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Button, IconButton, Text, confirmDialog } from "@/shared/ui";
import { AdminPage, PagedList, SearchBox } from "@/shared/ui/admin";
import { StudioGate, byOrder, processOverdue, studioKeys, useApprovals, useRegistry, useStudioAccess, useStudioText, type StudioDetail } from "@/entities/admin-studio";
import { useSession } from "@/entities/session";
import { ApprovalCard, ApprovalFilterSheet, ApprovalSheet, BulkPublishSheet, NEEDS, NeedBar, QueueHead, StudioNav, buildRows, needOf, publishable, sectionOf, submittedOf, versionLabel, type Ctx, type Need, type QueueFilter } from "@/widgets/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

const asNeed = (v?: string): Need | "" => (NEEDS as string[]).includes(v ?? "") ? (v as Need) : "";

function Queue({ initial }: { initial: Need | "" }) {
  const { t } = useT();
  const { ctorName, group: groupName } = useStudioText();
  const a = useStudioAccess();
  const c = useColors();
  const me = useSession()?.user.id ?? "";
  const reg = useRegistry().data;
  const [need, setNeed] = useState<Need | "">(initial);
  const [f, setF] = useState<QueueFilter>({ group: "", code: "", status: "" });
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [open, setOpen] = useState<StudioDetail | null>(null);
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [bulk, setBulk] = useState(false);
  const overdue = useAdminMutation({ mutationFn: processOverdue, invalidate: [studioKeys.all], success: "admStudioD.approvals.overdueOk" });
  const query = useApprovals(f.code, f.status);
  const doneQ = useApprovals(f.code, "published");
  const ctorOf = (code: string) => a.constructors.find((x) => x.code === code) ?? null;
  const x: Ctx = { a, ctor: ctorOf, me };
  const groupOf = (code: string) => ctorOf(code)?.nav?.group ?? "";
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const keep = (d: StudioDetail) => (!f.group || groupOf(d.code) === f.group) && terms.every((w) => [d.title, d.code, ctorName(d.code), submittedOf(d).by, versionLabel(d), d.id].join(" ").toLowerCase().includes(w));
  const all = (query.data ?? []).filter(keep);
  const doneAll = (doneQ.data ?? []).filter(keep);
  const count = (n: Need | "") => all.filter((d) => needOf(d) && (!n || needOf(d) === n)).length;
  const counts = { review: count("review"), publish: count("publish"), returned: count("returned"), all: count("") };
  const mineCount = all.filter((d) => sectionOf(d, x) === "mine").length;
  const labels = {
    yours: (n: number) => t("admStudioD.appr.yours", { n }), others: t("admStudioD.appr.others"), done: t("admStudioD.appr.done"), doneHint: (n: number) => t("admStudioD.appr.doneHint", { n }),
    need: { mine: { review: t("admStudioD.appr.grp.mine.review"), publish: t("admStudioD.appr.grp.mine.publish"), returned: t("admStudioD.appr.grp.mine.returned") }, others: { review: t("admStudioD.appr.grp.others.review"), publish: t("admStudioD.appr.grp.others.publish"), returned: t("admStudioD.appr.grp.others.returned") }, done: { review: "", publish: "", returned: "" } },
  };
  const rows = buildRows(all, doneAll, x, labels, need, showDone);
  const ready = all.filter((d) => publishable(d, x));
  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((y) => y !== id) : [...p, id]));
  const stop = () => { setSelecting(false); setPicked([]); };
  const askOverdue = () => confirmDialog({ title: t("admStudioD.approvals.overdue"), message: t("admStudioD.approvals.overdueQ"), confirmLabel: t("adm.confirm"), cancelLabel: t("adm.cancel"), icon: "clock", onConfirm: async () => { await overdue.mutateAsync(); } });
  const groups = (reg?.groups ?? []).map((g) => ({ value: g.key, label: groupName(g.key, g.title) }));
  const codes = [...new Set([...a.constructors.filter((k) => k.approvalRequired).map((k) => k.code), ...all.map((d) => d.code)])].sort(byOrder).map((k) => ({ value: k, label: `${ctorName(k, ctorOf(k)?.title)} · ${k}`, group: groupOf(k) }));
  const activeFilters = [f.group, f.code, f.status].filter(Boolean).length;
  const tools = (
    <>
      {a.canPublish && ready.length ? <IconButton icon={selecting ? "x" : "check-square"} label={t("admStudioD.approvals.select")} onPress={() => (selecting ? stop() : setSelecting(true))} /> : null}
      {a.canReassign ? <IconButton icon="clock" label={t("admStudioD.approvals.overdue")} onPress={askOverdue} /> : null}
    </>
  );
  const titles = Object.fromEntries(all.map((d) => [d.id, d.title]));
  const total = rows.filter((r) => r.type === "item" && r.section !== "done").length;
  return (
    <AdminPage
      title={t("admStudioC.title")} subtitle={t(mineCount ? "admStudioD.appr.lead" : "admStudioD.appr.leadNewest")} right={tools}
      footer={selecting ? (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <Button title={t("admStudioD.approvals.selectAll")} variant="line" size="sm" onPress={() => setPicked(ready.map((d) => d.id))} />
          <Button title={t("admStudioD.approvals.publishN", { n: picked.length })} icon="upload-cloud" variant="gradient" disabled={!picked.length} onPress={() => setBulk(true)} style={{ flex: 1 }} />
        </View>
      ) : undefined}
    >
      <StudioNav current="approvals" />
      <PagedList
        skeletonHeight={110}
        data={rows}
        query={query}
        keyExtractor={(r) => r.key}
        renderItem={(r) => {
          if (r.type === "head") return <QueueHead title={r.title} count={r.count} hint={r.hint} tone={r.tone} sub={r.key.split(":").length > 2} open={r.tone === "done" ? showDone : undefined} onToggle={r.tone === "done" ? () => setShowDone((v) => !v) : undefined} />;
          const d = r.item;
          const can = publishable(d, x);
          const on = picked.includes(d.id);
          const pick = selecting && can && r.section !== "done";
          return (
            <View style={pick ? { borderRadius: 22, borderWidth: 2, borderColor: on ? c.accent : "transparent" } : undefined}>
              <ApprovalCard item={d} need={r.need} mine={r.section === "mine"} publishable={can && r.section !== "done"} onPress={() => (pick ? toggle(d.id) : selecting ? undefined : setOpen(d))} />
            </View>
          );
        }}
        empty={{ icon: "check-circle", title: t(need || activeFilters || q ? "admStudioD.appr.emptyOthers" : "admStudioD.appr.emptyAllTitle"), text: t(need || activeFilters || q ? "admStudioD.appr.emptyFiltered" : "admStudioD.appr.emptyAllText") }}
        header={
          <View style={{ gap: 10, paddingBottom: 6 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginHorizontal: -16 }}>
              <View style={{ flex: 1 }}><SearchBox value={q} onChangeText={setQ} placeholder={t("admStudioD.appr.search")} /></View>
              <View style={{ paddingRight: 16 }}><IconButton icon="sliders" label={t("admStudioD.appr.filters")} badge={activeFilters > 0} onPress={() => setFilters(true)} /></View>
            </View>
            <NeedBar value={need} onChange={setNeed} counts={counts} />
            <Text variant="caption" tone="gray">{t("admStudioD.appr.count", { n: total })}</Text>
          </View>
        }
      />
      <ApprovalSheet item={open} onClose={() => setOpen(null)} />
      <BulkPublishSheet ids={picked} titles={titles} visible={bulk} onClose={() => setBulk(false)} onDone={stop} />
      <ApprovalFilterSheet visible={filters} onClose={() => setFilters(false)} value={f} onApply={setF} groups={groups} codes={codes} />
    </AdminPage>
  );
}

// Approval queue, laid out as on the web: the task switch (review / publish / returned / all), search and the section / constructor / status
// sheet, "waiting for you" then "with others", and the recently published ones under "completed".
export default function StudioApprovalsPage() {
  const { t } = useT();
  const { need } = useLocalSearchParams<{ need?: string }>();
  return <StudioGate need="review" title={t("admStudioC.title")}><Queue initial={asNeed(need)} /></StudioGate>;
}
