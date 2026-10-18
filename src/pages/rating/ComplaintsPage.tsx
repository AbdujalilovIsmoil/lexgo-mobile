import { ComplaintsTab, RatingsTab, WarrantyTab } from "@/widgets/rating";
import { AdminPage } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

export type ComplaintsTabKey = "complaints" | "ratings" | "warranty";

// Complaints, the client's ratings and the LexGo warranty (TZ 25) are three separate pages (three sidebar rows): this
// shows only the one asked for, titled after it, so ratings never carry complaint chrome and vice versa.
type Props = { initial?: ComplaintsTabKey; work?: string; about?: string; openNew?: boolean };

export function ComplaintsPage({ initial = "complaints", work, about, openNew }: Props) {
  const { t } = useT();
  return (
    <AdminPage title={t(`py5.tab.${initial}`)}>
      {initial === "complaints" ? <ComplaintsTab work={work} about={about} openNew={openNew} /> : initial === "ratings" ? <RatingsTab /> : <WarrantyTab />}
    </AdminPage>
  );
}
