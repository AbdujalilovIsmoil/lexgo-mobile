import { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useSocketState } from "@/shared/realtime";
import { Button, Pill, toast } from "@/shared/ui";
import { ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";
import { claimMode, detailHref, filterList, STATUSES, UrgentRow, useClaim, useQueue, type UrgentRequest } from "@/entities/urgent";
import { useAccess } from "@/entities/access";
import { useSession } from "@/entities/session";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";
import { Bleed } from "./Bleed";
import { CcFilterSheet } from "./CcFilterSheet";
import { RowActions } from "./RowActions";

const st = (r: UrgentRequest) => r.status || "open_pool";
// SLA breaches first, then the fresh pool, then everything else newest first.
const order = (r: UrgentRequest) => (r.slaBreached ? 0 : st(r) === "open_pool" ? 1 : 2);

// /cc/urgent: the whole pool with live status counts, search, kind / channel filters, claim and quick open.
export function CcQueue() {
  const { t } = useT();
  const router = useRouter();
  const { isFullAdmin } = useAccess();
  const meId = useSession()?.user.id ?? "";
  const live = useSocketState() === "online";
  const [tab, setTab] = useState("");
  const [kind, setKind] = useState("");
  const [channel, setChannel] = useState("");
  const [text, setText] = useState("");
  const [sheet, setSheet] = useState(false);
  const search = useDebounced(text, 250);
  const q = useQueue({ kind, channel });
  const claim = useClaim(() => toast(t("ug10.taken"), "err"));
  const all = useMemo(() => filterList(q.data ?? [], "", search), [q.data, search]);
  const data = useMemo(() => all.filter((r) => !tab || st(r) === tab).sort((a, b) => order(a) - order(b) || Date.parse(b.createdAt) - Date.parse(a.createdAt)), [all, tab]);
  const options = ["", ...STATUSES].map((v) => ({ value: v, label: v ? t(`ug4.status.${v}`) : t("adm.all"), count: v ? all.filter((r) => st(r) === v).length : all.length }));
  const open = (r: UrgentRequest) => router.push(detailHref("cc", r.id));
  const take = (r: UrgentRequest) => claim.mutate(r.id, { onSuccess: () => open(r) });
  const header = (
    <View style={{ gap: 10, paddingBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <Button title={`${t("adm.filters")}${kind || channel ? " •" : ""}`} icon="sliders" size="sm" variant="line" onPress={() => setSheet(true)} />
        <Pill small tone={live ? "ok" : "warn"} icon={live ? "wifi" : "wifi-off"} label={t(live ? "ug6.liveOn" : "ug6.liveOff")} />
      </View>
      <Bleed><SearchBox value={text} onChangeText={setText} placeholder={t("ug6.search")} /></Bleed>
      <Bleed><ChipBar options={options} value={tab} onChange={setTab} /></Bleed>
    </View>
  );
  return (
    <>
      <PagedList
        data={data} query={q} keyExtractor={(r) => r.id} header={header} skeletonHeight={150} empty={{ icon: "zap", title: t("ug6.empty"), text: t("ug6.emptyText") }}
        renderItem={(r) => (
          <UrgentRow item={r} staff onPress={() => open(r)}>
            <RowActions item={r} onOpen={() => open(r)} claim={claimMode(r, meId, isFullAdmin) === "claim" ? { busy: claim.isPending && claim.variables === r.id, run: () => take(r) } : undefined} />
          </UrgentRow>
        )}
      />
      <CcFilterSheet visible={sheet} onClose={() => setSheet(false)} kind={kind} channel={channel} onKind={setKind} onChannel={setChannel} />
    </>
  );
}
