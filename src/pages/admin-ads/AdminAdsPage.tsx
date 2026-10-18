import { useState } from "react";
import { AdRow, useAds, type Ad } from "@/entities/admin-ads";
import { AdFormSheet, useSheetTarget } from "@/features/admin-ads";
import { AdsHeader, useAdDelete } from "@/widgets/admin-ads";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { IconButton } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ExportButton } from "@/features/admin-export";

// Ads & promotions: hero + status tiles + search over the ad products, create, edit (free-text status) and confirmed soft delete.
export default function AdminAdsPage() {
  const { t } = useT();
  const form = useSheetTarget<{ ad: Ad | null }>();
  const query = useAds();
  const remove = useAdDelete();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const all = query.data ?? [];
  const needle = search.trim().toLowerCase();
  const rows = all.filter((a) => (!status || a.status === status) && (!needle || `${a.title} ${a.description} ${a.recordType}`.toLowerCase().includes(needle)));
  return (
    <AdminPage title={t("admHub.mod.ads.title")} right={<><ExportButton id="promotions" /><IconButton icon="plus" size={40} label={t("adm.add")} onPress={() => form.open({ ad: null })} /></>}>
      <PagedList
        data={rows}
        query={query}
        keyExtractor={(a) => a.id}
        skeletonHeight={110}
        renderItem={(a) => <AdRow item={a} onEdit={() => form.open({ ad: a })} onDelete={() => remove(a)} />}
        empty={{ icon: "radio", title: t(all.length ? "admAdsB.noMatch" : "admAds.empty"), text: all.length ? undefined : t("admAds.emptyText") }}
        off={{ title: t("admAdsB.off"), text: t("admAdsB.offText") }}
        header={all.length ? <AdsHeader ads={all} search={search} onSearch={setSearch} status={status} onStatus={setStatus} /> : null}
      />
      {form.target ? <AdFormSheet key={form.key} ad={form.target.ad} visible={form.visible} onClose={form.close} /> : null}
    </AdminPage>
  );
}
