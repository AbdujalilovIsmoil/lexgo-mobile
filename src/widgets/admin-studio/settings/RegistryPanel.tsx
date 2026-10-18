import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { Button, Pill, Text, confirmDialog } from "@/shared/ui";
import { ChipBar, PagedList, RowCard, SearchBox } from "@/shared/ui/admin";
import { byOrder, ctorMeta, ctorTint, studioKeys, syncConstructors, useRegistry, useStudioText } from "@/entities/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { PanelHead } from "./PanelHead";

// The constructor registry as the server holds it (target, approval, required fields) and the "sync" action.
export function RegistryPanel({ bar }: { bar: ReactElement }) {
  const { t, ctorName, group } = useStudioText();
  const query = useRegistry();
  const [q, setQ] = useState("");
  const [grp, setGrp] = useState("");
  const [appr, setAppr] = useState("");
  const sync = useAdminMutation({ mutationFn: syncConstructors, invalidate: [studioKeys.all], success: "admStudioC.registry.synced" });
  const items = [...(query.data?.items ?? [])].sort((x, y) => byOrder(x.code, y.code));
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = items.filter((c) => (!grp || ctorMeta(c.code, c.category).group === grp) && (!appr || (appr === "yes") === c.approvalRequired) && terms.every((w) => [c.code, c.title, ctorName(c.code, c.title), c.runtime, ...c.required].join(" ").toLowerCase().includes(w)));
  const groups = [...new Set(items.map((c) => ctorMeta(c.code, c.category).group))];
  const ask = () => confirmDialog({ title: t("admStudioC.registry.confirmTitle"), message: `${t("admStudioC.registry.confirmText")}\n• ${t("admStudioC.registry.confirmP1")}\n• ${t("admStudioC.registry.confirmP2")}`, confirmLabel: t("admStudioC.registry.sync"), cancelLabel: t("adm.cancel"), icon: "refresh-cw", onConfirm: async () => void (await sync.mutateAsync()) });
  return (
    <PagedList
      data={shown}
      query={query}
      keyExtractor={(c) => c.code}
      renderItem={(c) => (
        <RowCard icon={ctorMeta(c.code, c.category).icon} tint={ctorTint(c.code, c.category)} title={ctorName(c.code, c.title)} subtitle={c.runtime || undefined} meta={`${c.code} · ${t("admStudioC.registry.fieldsN", { n: c.fieldCount })}`} right={<Pill label={t(c.approvalRequired ? "admStudioC.registry.approvalYes" : "admStudioC.registry.approvalNo")} tone={c.approvalRequired ? "blue" : "ok"} small />}>
          {c.required.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{c.required.slice(0, 6).map((f) => <Pill key={f} label={f} tone="gray" small />)}</View> : <Text variant="caption" tone="gray">{t("admStudioC.registry.noRequired")}</Text>}
        </RowCard>
      )}
      empty={{ icon: "layers", title: t("admStudioC.registry.emptyTitle"), text: t("admStudioC.registry.emptyText") }}
      header={
        <View style={{ gap: 12, paddingBottom: 12 }}>
          {bar}
          <PanelHead title={t("admStudioC.registry.title")} text={t("admStudioC.registry.lead", { n: items.length })}><Button title={t("admStudioC.registry.sync")} icon="refresh-cw" variant="gradient" size="sm" loading={sync.isPending} onPress={ask} /></PanelHead>
          <View style={{ gap: 8, marginHorizontal: -16 }}>
            <ChipBar options={[{ value: "", label: t("adm.all") }, ...groups.map((g) => ({ value: g, label: group(g) }))]} value={grp} onChange={setGrp} />
            <ChipBar options={[{ value: "", label: t("adm.all") }, { value: "yes", label: t("admStudioC.registry.approvalYes") }, { value: "no", label: t("admStudioC.registry.approvalNo") }]} value={appr} onChange={setAppr} />
            <SearchBox value={q} onChangeText={setQ} placeholder={t("admStudioC.registry.searchPh")} />
          </View>
        </View>
      }
    />
  );
}
