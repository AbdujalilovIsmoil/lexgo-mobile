import { useState } from "react";
import type { DetailRenderer, Service } from "@/entities/service";
import { BottomSheet, SheetScroll } from "@/shared/ui";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useT } from "@/shared/i18n";
import { PrepResults } from "./PrepResults";
import { PrepTypes, type PrepCard } from "./PrepTypes";

const KEYWORDS = ["shartnoma", "ariza", "shikoyat", "da'vo", "ishonchnoma", "ustav"];

// Document drafting in three levels: type grid → templates of that type → one template.
export function PrepSheet({ visible, onClose, renderDetail }: { visible: boolean; onClose: () => void; renderDetail: DetailRenderer }) {
  const { t, tList } = useT();
  const go = useSheetNavigate(onClose);
  const [type, setType] = useState<number | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const card = type != null ? tList<PrepCard>("modes.prep.cards")[type] : null;
  return (
    <BottomSheet visible={visible} onClose={onClose} title={type == null ? t("svc.modes.docPrep.title") : undefined} subtitle={type == null ? t("modes.ui.pickType") : undefined} snaps={[0.72, 0.93]}>
      <SheetScroll>
        {service ? renderDetail(service, () => setService(null), go) : card && type != null ? <PrepResults keyword={KEYWORDS[type]} card={card} onBack={() => setType(null)} onPick={setService} /> : <PrepTypes onPick={setType} />}
      </SheetScroll>
    </BottomSheet>
  );
}
