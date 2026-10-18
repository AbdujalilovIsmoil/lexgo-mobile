import { Segmented } from "@/shared/ui";
import { useT } from "@/shared/i18n";

export type ListView = "objects" | "records";

// Studio objects (drafts and workflow) vs the published catalogue of the constructor.
export function ViewSwitch({ value, onChange }: { value: ListView; onChange: (v: ListView) => void }) {
  const { t } = useT();
  return <Segmented options={[{ value: "objects", label: t("ntd.studioV2.viewObjects") }, { value: "records", label: t("ntd.studioV2.viewRecords") }]} value={value} onChange={onChange} />;
}
