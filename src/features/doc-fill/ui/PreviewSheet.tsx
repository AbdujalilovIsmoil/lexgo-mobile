import { View } from "react-native";
import { usePreview, PreviewText } from "@/entities/doc-form";
import { BottomSheet, EmptyState, ErrorView, SheetScroll, Skeleton, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { useT } from "@/shared/i18n";

type Props = { visible: boolean; onClose: () => void; serviceId: string; wire: Record<string, string> };

// "How does it look so far": the server fills the template with the current answers.
export function PreviewSheet({ visible, onClose, serviceId, wire }: Props) {
  const { t } = useT();
  const q = usePreview(serviceId, wire, visible);
  return (
    <BottomSheet visible={visible} onClose={onClose} title={t("dc4.previewTitle")} subtitle={t("dc4.previewSub")} snaps={[0.7, 0.94]}>
      <SheetScroll>
        {q.isError ? <ErrorView error={q.error} onRetry={() => void q.refetch()} compact /> : !q.data ? (
          <View style={{ gap: 10 }}><Skeleton height={18} /><Skeleton height={180} round={16} /></View>
        ) : q.data.text ? (
          <>
            <Text variant="small" tone="gray">{t("dc4.complete", { n: q.data.percent })}</Text>
            <ProgressBar value={q.data.percent / 100} />
            <PreviewText text={q.data.text} />
          </>
        ) : <EmptyState icon="file-text" title={t("dc4.previewEmpty")} compact />}
      </SheetScroll>
    </BottomSheet>
  );
}
