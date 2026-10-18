import { useT } from "@/shared/i18n";
import { fmtBytes } from "@/shared/cache";
import { Skeleton } from "@/shared/ui";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import type { useStorageInfo } from "./useStorageInfo";

// Where the space goes: saved screens/drafts (SQLite), the database file, downloaded documents.
export function SizeCard({ info }: { info: ReturnType<typeof useStorageInfo> }) {
  const { t } = useT();
  const d = info.data;
  return (
    <SectionCard title={t("nt3.sizeTitle")}>
      {!d ? (
        <Skeleton height={120} round={16} />
      ) : (
        <FactRows
          rows={[
            { label: t("nt3.rows"), value: `${d.cache.rows}` },
            { label: t("nt3.data"), value: fmtBytes(d.cache.bytes) },
            { label: t("nt3.dbFile"), value: fmtBytes(d.cache.dbBytes) },
            { label: t("nt3.files"), value: fmtBytes(d.files) },
            { label: t("nt3.total"), value: fmtBytes(Math.max(d.cache.dbBytes, d.cache.bytes) + d.files) },
          ]}
        />
      )}
    </SectionCard>
  );
}
