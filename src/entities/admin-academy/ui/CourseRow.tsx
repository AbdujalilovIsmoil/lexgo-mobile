import { RowCard, StatusPill } from "@/shared/ui/admin";
import { humanizeSlug } from "@/shared/lib/format";
import { fmtMoney } from "@/shared/lib/money";
import { useT } from "@/shared/i18n";
import type { Course } from "../model/types";

// One course: title, category / level, lessons and length, price; draft or active as a pill.
export function CourseRow({ item, onPress }: { item: Course; onPress: () => void }) {
  const { t } = useT();
  return (
    <RowCard
      icon="book-open" tint="#8B5CF6" title={item.title} subtitle={[humanizeSlug(item.category), humanizeSlug(item.level)].filter(Boolean).join(" · ")}
      meta={`${t("ag6.course.lessons", { n: item.lessons })} · ${t("ag6.course.minutes", { n: item.minutes })} · ${item.price ? `${fmtMoney(item.price)} ${t("adm.currency")}` : t("ag6.course.free")}`}
      right={<StatusPill status={item.status} />} onPress={onPress}
    />
  );
}
