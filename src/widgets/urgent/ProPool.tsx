import type { ReactElement } from "react";
import { useRouter } from "expo-router";
import { View } from "react-native";
import { PagedList } from "@/shared/ui/admin";
import { toast } from "@/shared/ui";
import { detailHref, UrgentRow, useClaim, useQueue, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";
import { RowActions } from "./RowActions";

// The open urgent pool a call-center lawyer may take work from. Claiming is a race: a 409 means somebody was faster.
export function ProPool({ header }: { header?: ReactElement }) {
  const { t } = useT();
  const router = useRouter();
  const q = useQueue({ status: "open_pool" });
  const claim = useClaim(() => toast(t("ug10.taken"), "err"));
  const open = (r: UrgentRequest) => router.push(detailHref("pro", r.id, true));
  const take = (r: UrgentRequest) => claim.mutate(r.id, { onSuccess: () => router.push(detailHref("pro", r.id, true)) });
  return (
    <PagedList
      data={(q.data ?? []).filter((r) => (r.status || "open_pool") === "open_pool")} query={q} keyExtractor={(r) => r.id} skeletonHeight={150}
      header={header ? <View style={{ paddingBottom: 12 }}>{header}</View> : null}
      empty={{ icon: "inbox", title: t("ug5.poolEmpty"), text: t("ug5.poolEmptyText") }}
      renderItem={(r) => <UrgentRow item={r} staff onPress={() => open(r)}><RowActions item={r} onOpen={() => open(r)} claim={{ busy: claim.isPending && claim.variables === r.id, run: () => take(r) }} /></UrgentRow>}
    />
  );
}
