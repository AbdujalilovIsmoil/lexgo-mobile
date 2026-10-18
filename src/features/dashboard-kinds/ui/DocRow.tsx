import { WorkStatusPill, useWorkText } from "@/entities/work";
import type { DocItem } from "@/entities/client-stats";
import { RowCard } from "@/shared/ui/admin";

// One document of the archive: title, the server's next step, translated status.
export function DocRow({ doc, onPress }: { doc: DocItem; onPress: () => void }) {
  const text = useWorkText();
  return (
    <RowCard icon="file-text" tint="#00A6E6" title={doc.title} subtitle={doc.nextAction ? text.next(doc.nextAction) : undefined} onPress={onPress}>
      <WorkStatusPill status={doc.status} label={doc.statusLabel} />
    </RowCard>
  );
}
