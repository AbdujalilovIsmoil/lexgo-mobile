import type { Dict } from "@/shared/lib/json";
import { blankLike } from "@/entities/admin-policies";
import { Field } from "@/shared/ui/admin";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { ObjectGroup, type RenderNode } from "./ObjectGroup";

// A list of objects (price bands …): one group per row, rows can be removed and a blank row added.
export function ObjectList({ label, value, onChange, renderNode }: { label: string; value: Dict[]; onChange: (v: Dict[]) => void; renderNode: RenderNode }) {
  const { t } = useT();
  return (
    <Field label={`${label} · ${value.length}`}>
      {value.map((row, i) => (
        <ObjectGroup key={i} defaultOpen label={`#${i + 1}`} value={row} renderNode={renderNode} onChange={(r) => onChange(value.map((x, j) => (j === i ? r : x)))} onRemove={() => onChange(value.filter((_, j) => j !== i))} />
      ))}
      <Button title={t("admPol.addRow")} icon="plus" variant="soft" size="sm" onPress={() => onChange([...value, blankLike(value[0]) as Dict])} />
    </Field>
  );
}
