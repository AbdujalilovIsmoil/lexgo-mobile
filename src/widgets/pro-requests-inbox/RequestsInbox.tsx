import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { REQ_KINDS, RequestRow, useRequestCounts, useRequests, type ReqKind } from "@/entities/pro-requests";
import { useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";
import { useLocalPaged } from "@/shared/lib/pro/useLocalPaged";
import { Button, Segmented } from "@/shared/ui";
import { ChipBar } from "@/shared/ui/admin";
import { TabList } from "@/shared/ui/pro/TabList";

const MORE: Record<ReqKind, string> = { docs: "/pro/docs", urgent: "/pro/urgent", orders: "/pro/orders", meetings: "/meetings", pool: "/pro/docs/pool" };

// Unified inbox: one chip per module with live counts, the latest items of the chosen module,
// active / all filter, and a jump into the module's own screen. Mounting it keeps the tab badge live.
export function RequestsInbox({ bottomPad }: { bottomPad: number }) {
  const { t } = useT();
  const router = useRouter();
  const { callCenterLawyer } = useAccess();
  const { counts } = useRequestCounts(true);
  const kinds = REQ_KINDS.filter((k) => k !== "pool" || callCenterLawyer);
  const [kind, setKind] = useState<ReqKind>("docs");
  const [scope, setScope] = useState<"active" | "all">("active");
  const query = useRequests(kind);
  const rows = (query.data ?? []).filter((x) => scope === "all" || x.active);
  const { shown, query: paged } = useLocalPaged(rows, query, `${kind}|${scope}`);
  return (
    <TabList
      bottomPad={bottomPad}
      data={shown}
      query={paged}
      keyExtractor={(x) => `${x.kind}-${x.id}`}
      renderItem={(x) => <RequestRow item={x} onPress={() => router.push(x.route as never)} />}
      header={
        <View style={{ gap: 10, paddingBottom: 12 }}>
          <ChipBar options={kinds.map((k) => ({ value: k, label: t(`aw2.seg.${k}`), count: counts[k] }))} value={kind} onChange={setKind} />
          <Segmented options={[{ value: "active", label: t("aw2.active") }, { value: "all", label: t("aw2.all") }]} value={scope} onChange={setScope} />
          <Button title={t("aw2.openAll")} icon="external-link" size="sm" variant="soft" onPress={() => router.push(MORE[kind] as never)} />
        </View>
      }
      empty={{ icon: "inbox", title: t(`aw2.empty.${kind}`), text: t("aw2.emptyText") }}
      skeletonHeight={84}
    />
  );
}
