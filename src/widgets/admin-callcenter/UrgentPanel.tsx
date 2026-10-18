import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { claimMode, soft, useClaimUrgent, useUrgentList, type UrgentRequest } from "@/entities/admin-callcenter";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { UrgentFilterSheet, useUrgentNav } from "@/features/admin-callcenter";
import { PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { UrgentDetailSheet } from "./UrgentDetailSheet";
import { UrgentTicket } from "./kit/UrgentTicket";

const TABS = ["", "open_pool", "claimed", "scheduled", "in_progress", "meeting_active", "completed", "cancelled"];
const status = (r: UrgentRequest) => r.status || "open_pool";

// Tezkor Advokat pool: status tabs with live counts, service / channel filters, claim, meeting, chat and the detail sheet.
export function UrgentPanel() {
  const { t } = useT();
  const { isFullAdmin } = useAccess();
  const meId = useSession()?.user.id ?? "";
  const [tab, setTab] = useState("");
  const [kind, setKind] = useState("");
  const [channel, setChannel] = useState("");
  const [filters, setFilters] = useState(false);
  const [openId, setOpenId] = useState("");
  const q = useUrgentList({ kind, channel });
  const claim = useClaimUrgent();
  const nav = useUrgentNav();
  const all = q.data ?? [];
  const options = TABS.map((v) => ({ value: v, label: v ? t(`admCc.stat.${v}`) : t("adm.all"), count: v ? all.filter((r) => status(r) === v).length : all.length }));
  const onClaim = (r: UrgentRequest) => claim.mutate(r.id, { onSuccess: () => setOpenId(r.id) });
  const header = (
    <View style={s.head}>
      <Button title={`${t("adm.filters")}${kind || channel ? " •" : ""}`} icon="sliders" size="sm" variant="line" style={s.btn} onPress={() => setFilters(true)} />
      <View style={s.tiles}><CcTiles options={options} value={tab} onChange={setTab} /></View>
    </View>
  );
  return (
    <>
      <PagedList
        data={tab ? all.filter((r) => status(r) === tab) : all} query={soft(q)} keyExtractor={(r) => r.id} header={header} skeletonHeight={110}
        empty={{ icon: "zap", title: t("admCc.urgentEmpty"), text: t("admCc.urgentEmptyText") }}
        renderItem={(r) => (
          <UrgentTicket item={r} onOpen={() => setOpenId(r.id)} canClaim={claimMode(r, meId, isFullAdmin) === "claim"} busy={(claim.isPending && claim.variables === r.id) || nav.meetingId === r.id} onClaim={() => onClaim(r)} onMeet={() => nav.startMeeting(r)} onChat={() => nav.openChat(r)} />
        )}
      />
      <UrgentFilterSheet visible={filters} onClose={() => setFilters(false)} kind={kind} channel={channel} onKind={setKind} onChannel={setChannel} />
      <UrgentDetailSheet id={openId} onClose={() => setOpenId("")} />
    </>
  );
}

const s = StyleSheet.create({ head: { gap: 10, paddingBottom: 12 }, btn: { alignSelf: "flex-start" }, tiles: { marginHorizontal: -16 } });
