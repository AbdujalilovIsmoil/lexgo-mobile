import { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ServiceList, useServiceSearch, type DetailRenderer, type Service } from "@/entities/service";
import { BottomSheet, Button, SheetScroll, Steps, Text } from "@/shared/ui";
import { useSheetNavigate } from "@/shared/lib/useSheetNavigate";
import { useT } from "@/shared/i18n";
import { ActionBar } from "./ActionBar";
import { ReviewOutcomes } from "./ReviewOutcomes";

// Document review: what you get, how it works, matching services, and two
// actions (upload on the web, or hand the question to the AI).
export function ReviewSheet({ visible, onClose, renderDetail }: { visible: boolean; onClose: () => void; renderDetail: DetailRenderer }) {
  const { t, tList } = useT();
  const router = useRouter();
  const go = useSheetNavigate(onClose);
  const [service, setService] = useState<Service | null>(null);
  const { data, isFetching } = useServiceSearch("tekshirish");
  const ask = () => go(() => router.navigate({ pathname: "/(tabs)/ai", params: { q: t("modes.ui.aiReview") } }));
  return (
    <BottomSheet visible={visible} onClose={onClose} title={service ? undefined : t("svc.modes.docReview.title")} subtitle={service ? undefined : t("svc.modes.docReview.desc")} snaps={[0.72, 0.93]}>
      <View style={{ flex: 1 }}>
        <SheetScroll>
          {service ? renderDetail(service, () => setService(null), go) : (
            <>
              <Text variant="h4">{t("modes.ui.gets")}</Text>
              <ReviewOutcomes />
              <Text variant="h4">{t("modes.ui.how")}</Text>
              <Steps steps={tList<{ title: string; text: string }>("modes.review.flow")} />
              <Text variant="h4">{t("topics.services")}</Text>
              <ServiceList services={data} loading={isFetching && !data} onPick={setService} limit={3} />
            </>
          )}
        </SheetScroll>
        {service ? null : (
          <ActionBar>
            <Button title={t("modes.ui.upload")} onPress={() => go(() => router.push("/doc-analysis"))} variant="soft" icon="upload" style={{ flex: 1 }} />
            <Button title={t("modes.ui.ai")} onPress={ask} variant="gradient" icon="zap" style={{ flex: 1 }} />
          </ActionBar>
        )}
      </View>
    </BottomSheet>
  );
}
