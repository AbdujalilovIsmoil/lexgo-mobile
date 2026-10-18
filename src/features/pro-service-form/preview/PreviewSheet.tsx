import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { MarketCard } from "@/entities/lawyer";
import { usePromoStatus } from "@/entities/promotion";
import type { ProSeller, ProService } from "@/entities/pro-service";
import { SpecialistPreview } from "@/widgets/specialist-profile";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { BottomSheet, Segmented, SheetScroll } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { PickedService } from "../types";
import { previewLawyer } from "./previewLawyer";

type View_ = "market" | "profile";
type Props = { visible: boolean; onClose: () => void; subtitle: string; seller: ProSeller; sellerId: string; region: string; items: ProService[]; editingId: string; picked: PickedService | null; price: number; note: string };

// "Mijozlar shunday ko'radi": the REAL client screens for this seller — the card in the marketplace list and the specialist's page —
// filled with the seller's own data and the service of the form (first, highlighted). Placeholders stand in until a service is picked.
export function PreviewSheet({ visible, onClose, subtitle, seller, sellerId, region, items, editingId, picked, price, note }: Props) {
  const { t } = useT();
  const [view, setView] = useState<View_>("market");
  useSheetReset(visible, () => setView("market"));
  const typed = price > 0 ? price : (picked?.catalogPrice ?? 0);
  const draft = {
    id: editingId || picked?.id || "preview",
    title: picked?.name || t("proSvc.preview.phService"),
    category: picked?.category || t("proSvc.preview.phCategory"),
    price: typed,
    catalogPrice: picked?.catalogPrice ?? 0,
    note,
  };
  // What is running today shows in the preview too: the gold TOP card and the boosted services clients see as sponsored.
  const running = usePromoStatus().data?.items ?? [];
  const boost = { profile: running.some((r) => r.placement === "profile_boost"), services: new Set(running.filter((r) => r.placement === "service_boost").map((r) => r.serviceId)) };
  const lawyer = previewLawyer(seller, sellerId, region, items, draft, !!editingId, boost);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("proSvc.preview.title")} subtitle={subtitle} snaps={[0.94]}>
      <View style={s.switch} accessibilityLabel={t("proSvc.preview.views")}>
        <Segmented<View_> value={view} onChange={setView} options={[{ value: "market", label: t("proSvc.preview.viewMarket"), icon: "grid" }, { value: "profile", label: t("proSvc.preview.viewProfile"), icon: "user" }]} />
      </View>
      <SheetScroll contentContainerStyle={s.body}>
        {view === "market" ? <MarketCard lawyer={lawyer} onPress={() => undefined} /> : <SpecialistPreview lawyer={lawyer} selected={draft.id} />}
      </SheetScroll>
    </BottomSheet>
  );
}

const s = StyleSheet.create({ switch: { paddingHorizontal: 18, paddingTop: 4 }, body: { paddingTop: 14 } });
