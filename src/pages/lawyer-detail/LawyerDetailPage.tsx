import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useLawyer } from "@/entities/lawyer";
import { LawyerSheetBody, LawyerSheetSkeleton, type LawyerTab } from "@/widgets/lawyer-sheet";
import { BottomSheet, EmptyState, ErrorView } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// A transparent route: the previous screen stays visible behind the sheet.
// Drag the handle down, or tap the dark area, to go back.
export function LawyerDetailPage() {
  const { t } = useT();
  const router = useRouter();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const initialTab: LawyerTab = tab === "services" || tab === "results" || tab === "info" ? tab : "about";
  const [open, setOpen] = useState(true);
  const { data, isLoading, error, refetch } = useLawyer(id ?? "");
  const leave = () => {
    setOpen(false);
    router.back();
  };
  return (
    <View style={s.fill}>
      <BottomSheet native={false} visible={open} onClose={leave} snaps={[0.64, 0.93]}>
        {isLoading ? <LawyerSheetSkeleton /> : error ? <ErrorView error={error} onRetry={() => void refetch()} compact /> : data ? <LawyerSheetBody lawyer={data} initialTab={initialTab} onLeave={(fn) => { leave(); setTimeout(fn, 380); }} /> : <EmptyState icon="user-x" title={t("lawyers.detail.notFound")} compact />}
      </BottomSheet>
    </View>
  );
}

const s = StyleSheet.create({
  fill: { flex: 1 },
});
