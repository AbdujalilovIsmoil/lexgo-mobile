import { StyleSheet, View } from "react-native";
import { Button, Icon, Text } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useInsets } from "@/shared/lib/insets";
import { useT } from "@/shared/i18n";
import type { DownloadPlan, SheetAction } from "@/entities/my-document";

type Props = { plan: DownloadPlan | null; action: SheetAction; busy: boolean; paying: boolean; onDownload: () => void; onAction: () => void; onDetail: () => void };
const ICON = { pay: "credit-card", rate: "star", review: "send" } as const;

// Why there is nothing to download; a closed format is said in the document service's words (TZ.md §4).
export const noFileText = (t: (key: string) => string, reason?: DownloadPlan["reason"]): string =>
  reason === "format" ? t("dset.code.document_download_format_disabled") : t(`docSheet.noFile.${reason || "none"}`);

// Sticky bar of the detail sheet: "Yuklab olish" (disabled with its reason when there is no file), "Batafsil", and the
// one contextual action (pay / rate / send for review) on its own line above when the flow allows it.
export function DocSheetBar({ plan, action, busy, paying, onDownload, onAction, onDetail }: Props) {
  const { t } = useT();
  const c = useColors();
  const insets = useInsets();
  const reason = plan && !plan.file ? noFileText(t, plan.reason) : "";
  return (
    <View style={[s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 12 }]}>
      {reason ? (
        <View style={s.reason} accessibilityLiveRegion="polite">
          <Icon name="info" size={15} color={c.gray} />
          <Text variant="caption" tone="gray" style={s.flex}>{reason}</Text>
        </View>
      ) : null}
      {action ? <Button title={t(`docSheet.act.${action}`)} icon={ICON[action]} variant={action === "pay" ? "gradient" : "soft"} full loading={paying} onPress={onAction} style={s.tall} /> : null}
      <View style={s.row}>
        <Button title={t("docSheet.download")} icon="download" full={false} loading={busy} disabled={!plan?.file} onPress={onDownload} style={[s.tall, s.main]} />
        <Button title={t("docSheet.detail")} icon="arrow-up-right" variant="line" onPress={onDetail} style={[s.tall, s.side]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: { gap: 10, paddingTop: 12, paddingHorizontal: 18, borderTopWidth: 1 },
  row: { flexDirection: "row", gap: 10 },
  reason: { flexDirection: "row", alignItems: "center", gap: 8 },
  flex: { flex: 1 },
  tall: { minHeight: 48 },
  main: { flex: 1.3 },
  side: { flex: 1 },
});
