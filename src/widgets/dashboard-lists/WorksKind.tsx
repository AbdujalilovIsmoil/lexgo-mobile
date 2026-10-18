import { useWorks, useWorksRealtime } from "@/entities/work";
import { useKindNav } from "@/features/dashboard-kinds";
import type { GroupFilter } from "@/features/work-filters";
import { useInsets } from "@/shared/lib/insets";
import { WorksList } from "@/widgets/works";

const GROUPS: GroupFilter[] = ["open", "queue", "active", "review", "done", "all"];

// Counter "Faol ishlar": the works list preset to everything not finished yet.
export function WorksKind() {
  const nav = useKindNav();
  const works = useWorks();
  const insets = useInsets();
  useWorksRealtime();
  return <WorksList works={works} onOpen={(w) => nav.work(w.workId || w.id)} bottom={insets.bottom + 24} groups={GROUPS} initialGroup="open" />;
}
