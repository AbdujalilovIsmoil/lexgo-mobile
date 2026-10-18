import { useState } from "react";
import { View } from "react-native";
import { useCategories, type OverlaidCategory } from "@/entities/admin-services";
import { CategoryFormSheet, useSheetTarget } from "@/features/admin-services";
import { ChipBar, QueryBoundary } from "@/shared/ui/admin";
import { BottomSheet, Button, SheetScroll } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { CategoryTicket } from "./CategoryTicket";
import { useCategoryActions } from "./useCategoryActions";

// Category panel in a drawer: create, round buttons rename / hide / restore / reset override. Hidden ones sit behind a chip.
export function CategoriesSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { t } = useT();
  const q = useCategories();
  const form = useSheetTarget<{ cat: OverlaidCategory | null }>();
  const [view, setView] = useState<"visible" | "hidden">("visible");
  const act = useCategoryActions();
  const all = q.data ?? [];
  const hidden = all.filter((c) => c.hidden);
  const shown = view === "hidden" && hidden.length ? hidden : all.filter((c) => !c.hidden);
  const opts = [{ value: "visible" as const, label: t("admSvc.catVisible", { n: all.length - hidden.length }) }, { value: "hidden" as const, label: t("admSvc.catHiddenChip", { n: hidden.length }) }];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("admSvc.catTitle")} subtitle={t("admSvc.catNote")} snaps={[0.7, 0.94]}>
      <SheetScroll>
        <Button title={t("admSvc.catCreate")} icon="plus" onPress={() => form.open({ cat: null })} />
        {hidden.length ? <View style={{ marginHorizontal: -18 }}><ChipBar options={opts} value={view} onChange={setView} /></View> : null}
        <QueryBoundary query={q}>
          {shown.map((c) => <CategoryTicket key={c.id} cat={c} act={act} onEdit={() => form.open({ cat: c })} />)}
        </QueryBoundary>
      </SheetScroll>
      {form.target ? <CategoryFormSheet key={form.key} visible={form.visible} category={form.target.cat} onClose={form.close} /> : null}
    </BottomSheet>
  );
}
