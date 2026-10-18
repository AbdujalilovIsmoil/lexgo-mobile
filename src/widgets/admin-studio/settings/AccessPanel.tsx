import { useState, type ReactElement } from "react";
import { View } from "react-native";
import { Button, confirmDialog } from "@/shared/ui";
import { ChipBar, FormSheet, PagedList, SearchBox } from "@/shared/ui/admin";
import { STUDIO_ROLES, byOrder, saveGrant, studioKeys, useGrants, useStudioAccess, useStudioText, type StudioGrant } from "@/entities/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { GrantRow } from "./GrantRow";
import { GrantSheet } from "./GrantSheet";
import { PanelHead } from "./PanelHead";
import { RoleLegend } from "./RoleLegend";

// Who may work in the studio: grants list with filters, grant / edit / pause / resume.
export function AccessPanel({ bar }: { bar: ReactElement }) {
  const { t, role } = useStudioText();
  const query = useGrants();
  const a = useStudioAccess();
  const [roleF, setRoleF] = useState("");
  const [stateF, setStateF] = useState("");
  const [q, setQ] = useState("");
  const [sheet, setSheet] = useState<{ grant: StudioGrant | null } | null>(null);
  const [legend, setLegend] = useState(false);
  const toggle = useAdminMutation({ mutationFn: (g: StudioGrant) => saveGrant({ id: g.id, userId: g.userId, roles: g.roles, codes: g.codes, active: !g.active }), invalidate: [[...studioKeys.all, "grants"]], success: "admStudioC.access.saved" });
  const items = query.data ?? [];
  const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const shown = items.filter((g) => (!roleF || g.roles.includes(roleF)) && (!stateF || (stateF === "active") === g.active) && terms.every((w) => [g.userName, g.phone, g.userId, g.lexgoId, ...g.roles.map(role), ...g.codes].join(" ").toLowerCase().includes(w)));
  const askPause = (g: StudioGrant) => confirmDialog({ title: t("admStudioC.access.pauseTitle"), message: t("admStudioC.access.pauseText", { name: g.userName || g.phone }), confirmLabel: t("admStudioC.access.pause"), cancelLabel: t("adm.cancel"), icon: "pause-circle", onConfirm: async () => void (await toggle.mutateAsync(g)) });
  const codes = a.constructors.map((c) => c.code).sort(byOrder);
  return (
    <>
      <PagedList
        data={shown}
        query={query}
        keyExtractor={(g) => g.id || g.userId}
        renderItem={(g) => <GrantRow g={g} busy={toggle.isPending && toggle.variables?.id === g.id} onEdit={() => setSheet({ grant: g })} onToggle={() => (g.active ? askPause(g) : toggle.mutate(g))} />}
        empty={{ icon: "lock", title: t("admStudioC.access.emptyTitle"), text: t("admStudioC.access.emptyText") }}
        header={
          <View style={{ gap: 12, paddingBottom: 12 }}>
            {bar}
            <PanelHead title={t("admStudioC.access.title")} text={t("admStudioC.access.lead")}><Button title={t("admStudioC.access.grant")} icon="user-plus" variant="gradient" size="sm" onPress={() => setSheet({ grant: null })} /><Button title={t("admStudioC.roleInfo.title")} icon="info" variant="soft" size="sm" onPress={() => setLegend(true)} /></PanelHead>
            <View style={{ gap: 8, marginHorizontal: -16 }}>
              <ChipBar options={[{ value: "", label: t("adm.all") }, ...STUDIO_ROLES.map((r) => ({ value: r as string, label: role(r), count: items.filter((g) => g.roles.includes(r)).length }))]} value={roleF} onChange={setRoleF} />
              <ChipBar options={[{ value: "", label: t("adm.all") }, { value: "active", label: t("admStudioC.access.active") }, { value: "paused", label: t("admStudioC.access.paused") }]} value={stateF} onChange={setStateF} />
              <SearchBox value={q} onChangeText={setQ} placeholder={t("admStudioC.access.searchPh")} />
            </View>
          </View>
        }
      />
      <FormSheet visible={legend} onClose={() => setLegend(false)} title={t("admStudioC.roleInfo.title")}><RoleLegend /></FormSheet>
      <GrantSheet visible={!!sheet} grant={sheet?.grant ?? null} grants={items} codes={codes} onClose={() => setSheet(null)} />
    </>
  );
}
