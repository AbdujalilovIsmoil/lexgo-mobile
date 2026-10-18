import type { Linked } from "@/entities/pro-clients";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { tOr } from "@/shared/lib/pro/tOr";
import { Text } from "@/shared/ui";
import { RowCard, StatusPill } from "@/shared/ui/admin";

type Props = { rows: (Linked & { type?: string })[]; icon: "briefcase" | "shopping-bag" | "credit-card" | "file-text" | "clock"; onOpen?: (id: string) => void };

// Shared rows of a client's cases / orders / payments / documents / timeline.
export function LinkedList({ rows, icon, onOpen }: Props) {
  const { t, locale } = useT();
  if (!rows.length) return <Text variant="small" tone="gray" center>{t("aw3.tabEmpty")}</Text>;
  return (
    <>
      {rows.map((r) => (
        <RowCard key={`${r.type ?? ""}${r.id}`} icon={icon} title={r.type ? `${tOr(t, `aw3.type.${r.type}`, r.type)}: ${r.title}` : r.title} subtitle={r.sub} meta={fmtDate(r.at, locale)} right={r.status ? <StatusPill status={r.status} /> : undefined} onPress={onOpen ? () => onOpen(r.id) : undefined} />
      ))}
    </>
  );
}
