import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { useDocVersions, type DocCan, type MyDoc } from "@/entities/my-document";

// Entry to the version history; hidden when there is nothing to version and nothing saved yet.
export function VersionsRow({ doc, can, onOpen }: { doc: MyDoc; can: DocCan; onOpen: () => void }) {
  const { t } = useT();
  const n = useDocVersions(doc.id).data?.length ?? 0;
  if (!n && !can.version) return null;
  return <RowCard icon="clock" title={t("dm4.versions")} subtitle={n ? t("dm4.versionCount", { n }) : t("dm4.versionNone")} onPress={onOpen} />;
}
