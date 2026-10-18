import { useCase } from "@/entities/pro-cases";
import { useT } from "@/shared/i18n";
import { useKept } from "@/shared/lib/useKept";
import { BottomSheet } from "@/shared/ui";
import { CaseDetail } from "./CaseDetail";

// A case opened as a bottom sheet (from a client card): the same summary and docs / tasks / events / history / AI tabs as the page.
export function CaseSheet({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { t } = useT();
  const kept = useKept(id);
  const item = useCase(kept ?? "").data;
  return (
    <BottomSheet visible={!!id} onClose={onClose} title={item?.number || t("aw4.title")} subtitle={item?.title} snaps={[0.88, 0.96]}>
      <CaseDetail id={kept ?? ""} inSheet />
    </BottomSheet>
  );
}
