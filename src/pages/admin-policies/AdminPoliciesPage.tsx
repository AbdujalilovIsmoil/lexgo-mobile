import { useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import { polKeys, readinessOk, useReadiness, type PolicySection } from "@/entities/admin-policies";
import { PolicyBody, PolicyHero, PolicyHistorySheet, type PolicyTab } from "@/widgets/admin-policies";
import type { Dict } from "@/shared/lib/json";
import { AdminPage } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { toast } from "@/shared/ui";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";

// Platform policies: readiness hero, then one tab at a time (checklist, six policy sections, marketplace pricing,
// unverified switch + working-hours calendar). A pricing version from the history can be loaded back into the editor.
export default function AdminPoliciesPage() {
  const { t } = useT();
  const qc = useQueryClient();
  const insets = useInsets();
  const [tab, setTab] = useState<PolicyTab>("ready");
  const [history, setHistory] = useState<PolicySection | null>(null);
  const [seed, setSeed] = useState<Dict | null>(null);
  const [busy, setBusy] = useState(false);
  const waiting = (useReadiness().data?.items ?? []).filter((i) => !readinessOk(i.status)).length;
  const refresh = async () => {
    setBusy(true);
    await qc.invalidateQueries({ queryKey: polKeys.all });
    setBusy(false);
  };
  const load = (data: Dict, version: string) => {
    setHistory(null);
    setSeed(data);
    setTab("pricing");
    toast(version ? t("admPolD.loaded", { v: version }) : t("admPolD.loadedPlain"), "ok");
  };
  const tabs = (["ready", "policies", "pricing", "platform"] as PolicyTab[]).map((v) => ({ value: v, label: t(`admPolD.tabs.${v}`), count: v === "ready" && waiting ? waiting : undefined, alert: v === "ready" }));
  return (
    <AdminPage title={t("admHub.mod.policies.title")} subtitle={t("admPol.versioned")}>
      <ScrollView contentContainerStyle={{ paddingTop: 4, paddingBottom: insets.bottom + 24, gap: 12 }} refreshControl={<RefreshControl refreshing={busy} onRefresh={() => void refresh()} />} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={{ paddingHorizontal: 16 }}><PolicyHero /></View>
        <CcTiles options={tabs} value={tab} onChange={(v) => setTab(v as PolicyTab)} />
        <View style={{ paddingHorizontal: 16 }}><PolicyBody tab={tab} onHistory={setHistory} seed={seed} onSeedUsed={() => setSeed(null)} /></View>
      </ScrollView>
      <PolicyHistorySheet section={history} onClose={() => setHistory(null)} onLoad={load} />
    </AdminPage>
  );
}
