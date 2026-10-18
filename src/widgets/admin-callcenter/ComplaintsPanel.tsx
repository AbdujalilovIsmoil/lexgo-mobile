import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { soft, useCcLabel, useComplaints } from "@/entities/admin-callcenter";
import { useComplaintEvents } from "@/features/admin-callcenter";
import { PagedList } from "@/shared/ui/admin";
import { CcTiles } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { ComplaintTicket } from "./kit/ComplaintTicket";
import { ComplaintSheet } from "./ComplaintSheet";

// Quality complaints, opened by the backend on 1–2 star ratings; an operator rules on each once.
export function ComplaintsPanel() {
  const { t } = useT();
  const label = useCcLabel();
  const [status, setStatus] = useState("");
  const [openId, setOpenId] = useState("");
  const q = useComplaints(status);
  useComplaintEvents(false);
  const statuses = q.data?.statuses ?? [];
  const items = q.data?.items ?? [];
  const options = [{ value: "", label: t("adm.all"), count: q.data?.count ?? items.length }, ...statuses.map((s) => ({ value: s, label: label("admCcB.cStatus", s), count: items.filter((c) => c.status === s).length }))];
  return (
    <>
      <PagedList
        data={q.data?.items ?? []} query={soft(q)} keyExtractor={(c) => c.id} skeletonHeight={90}
        header={<View style={s.tiles}><CcTiles options={options} value={status} onChange={setStatus} /></View>}
        empty={{ icon: "alert-triangle", title: t("admCcB.cEmpty"), text: t("admCcB.cEmptyText") }}
        renderItem={(c) => <ComplaintTicket item={c} onPress={() => setOpenId(c.id)} />}
      />
      <ComplaintSheet id={openId} onClose={() => setOpenId("")} />
    </>
  );
}

const s = StyleSheet.create({ tiles: { marginHorizontal: -16, paddingBottom: 12 } });
