import { WorkRow, isOpenWork, useWorks } from "@/entities/work";
import { useKindNav } from "@/features/dashboard-kinds";
import { useT } from "@/shared/i18n";
import { PreviewList } from "./PreviewList";

type Props = { go: (fn: () => void) => void };

// Drawer rows of "Faol ishlar": the five most recently changed unfinished works.
export function WorksPreview({ go }: Props) {
  const { t } = useT();
  const nav = useKindNav();
  const works = useWorks();
  const items = works.items.filter((w) => isOpenWork(w.status)).slice(0, 5);
  return <PreviewList query={works} items={items} keyOf={(w) => w.id || w.workId} empty={{ icon: "briefcase", title: t("cl1.empty"), text: t("cl6.works.none") }} render={(w) => <WorkRow work={w} onPress={() => go(() => nav.work(w.workId || w.id))} />} />;
}
