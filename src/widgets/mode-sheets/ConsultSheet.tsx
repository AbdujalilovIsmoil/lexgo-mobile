import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import type { DetailRenderer } from "@/entities/service";
import { BottomSheet, Button, SheetScroll, Text } from "@/shared/ui";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useT } from "@/shared/i18n";
import { ActionBar } from "./ActionBar";
import { ConsultLawyers } from "./ConsultLawyers";
import { ConsultOptions, type ConsultCard } from "./ConsultOptions";
import { ConsultResults } from "./ConsultResults";

// Consultation: pick a format (price on the card), see matching lawyers, book.
export function ConsultSheet({ visible, onClose, renderDetail }: { visible: boolean; onClose: () => void; renderDetail: DetailRenderer }) {
  const { t, tList } = useT();
  const router = useRouter();
  const go = useSheetNavigate(onClose);
  const [pick, setPick] = useState(0);
  const [list, setList] = useState(false);
  const card = tList<ConsultCard>("modes.consult.cards")[pick];
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("svc.modes.consultation.title")} subtitle={t("modes.ui.pickConsult")} snaps={[0.72, 0.93]}>
      <View style={{ flex: 1 }}>
        <SheetScroll>
          {list ? <ConsultResults card={card} onBack={() => setList(false)} navigate={go} renderDetail={renderDetail} /> : <>
          <ConsultOptions value={pick} onChange={setPick} />
          <Text variant="small" tone="gray">{t("modes.consult.info")}</Text>
          <ConsultLawyers onOpen={(l) => go(() => router.push({ pathname: "/specialist/[id]", params: { id: l.userId || l.id } }))} />
          </>}
        </SheetScroll>
        {list ? null : <ActionBar>
          <View style={{ flex: 1 }}><Text variant="h4" tone="accent">{card ? `${card.price} ${card.unit}` : ""}</Text><Text variant="caption" tone="gray" numberOfLines={1}>{card?.title}</Text></View>
          <Button title={t("modes.ui.consultWith")} onPress={() => setList(true)} variant="gradient" icon="arrow-right" iconRight />
        </ActionBar>}
      </View>
    </BottomSheet>
  );
}
