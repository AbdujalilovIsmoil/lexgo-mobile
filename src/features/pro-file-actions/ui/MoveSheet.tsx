import { descendants, type Folder } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { OptionSheet } from "@/shared/ui/admin";

type Props = { visible: boolean; onClose: () => void; folders: Folder[]; exclude?: string; current: string; onPick: (folderId: string) => void };

// Destination picker: the root plus every folder (a folder cannot go into itself or its descendants).
export function MoveSheet({ visible, onClose, folders, exclude, current, onPick }: Props) {
  const { t } = useT();
  const blocked = exclude ? descendants(folders, exclude) : new Set<string>();
  const options = [{ value: "root", label: t("aw8.root") }, ...folders.filter((f) => !blocked.has(f.id)).map((f) => ({ value: f.id, label: f.name }))];
  return <OptionSheet visible={visible} onClose={onClose} title={t("aw8.moveTitle")} options={options} value={current || "root"} onPick={(v) => onPick(v === "root" ? "" : v)} searchable={options.length > 8} />;
}
