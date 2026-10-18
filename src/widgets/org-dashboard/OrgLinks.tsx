import { useRouter } from "expo-router";
import { ListRow } from "@/shared/ui";
import { SectionCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { IconName } from "@/shared/ui";

// Where the owner continues: member roster, workload, and the organization's meetings, documents and clients.
const LINKS: { key: string; icon: IconName; path: string }[] = [
  { key: "members", icon: "users", path: "/org/members" },
  { key: "workload", icon: "bar-chart-2", path: "/org/workload" },
  { key: "meetings", icon: "video", path: "/meetings" },
  { key: "documents", icon: "file-text", path: "/documents" },
  { key: "clients", icon: "user-check", path: "/clients" },
];

export function OrgLinks() {
  const { t } = useT();
  const router = useRouter();
  return (
    <SectionCard title={t("og2.sections")}>
      {LINKS.map((l) => <ListRow key={l.key} icon={l.icon} title={t(`og2.link.${l.key}`)} sub={t(`og2.link.${l.key}Sub`)} onPress={() => router.push(l.path as never)} />)}
    </SectionCard>
  );
}
