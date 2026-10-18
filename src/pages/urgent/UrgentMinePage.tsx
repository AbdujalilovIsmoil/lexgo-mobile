import { useRouter } from "expo-router";
import { AdminPage, PagedList } from "@/shared/ui/admin";
import { ClientRow, detailHref, useMine } from "@/entities/urgent";
import { useT } from "@/shared/i18n";

// /urgent/requests — "Mening so'rovlarim": the client's own Tezkor advokat requests (GET /urgent-advokat/requests/me).
export default function UrgentMinePage() {
  const { t } = useT();
  const router = useRouter();
  const mine = useMine();
  return (
    <AdminPage title={t("ug1.mine")}>
      <PagedList
        data={mine.data ?? []} query={mine} keyExtractor={(r) => r.id} skeletonHeight={120}
        empty={{ icon: "zap", title: t("ug1.mineEmpty"), text: t("ug1.mineEmptyText"), actionLabel: t("ug1.title"), onAction: () => router.navigate("/urgent") }}
        renderItem={(r) => <ClientRow item={r} onPress={() => router.push(detailHref("client", r.id))} />}
      />
    </AdminPage>
  );
}
