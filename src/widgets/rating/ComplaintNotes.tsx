import { View } from "react-native";
import { Button, Card, Icon, PressableScale, Text, type IconName } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

type Props = { sentId: string | null; missing: boolean; partial: "manual" | "quality" | ""; onDismissSent: () => void; onDismissMissing: () => void; onRetry: () => void };

function Note({ icon, tone, children, onClose, action }: { icon: IconName; tone: string; children: React.ReactNode; onClose?: () => void; action?: React.ReactNode }) {
  return (
    <Card tinted style={{ flexDirection: "row", gap: 10, alignItems: "flex-start", padding: 12 }}>
      <Icon name={icon} size={18} color={tone} />
      <View style={{ flex: 1, gap: 4 }}>{children}{action}</View>
      {onClose ? <PressableScale onPress={onClose} hitSlop={10}><Icon name="x" size={16} tone="gray" /></PressableScale> : null}
    </Card>
  );
}

// Status notes above the list: "complaint sent" (dismissable), "link not found", "list incomplete".
export function ComplaintNotes({ sentId, missing, partial, onDismissSent, onDismissMissing, onRetry }: Props) {
  const { t } = useT();
  const c = useColors();
  return (
    <View style={{ gap: 10, paddingBottom: sentId !== null || missing || partial ? 12 : 0 }}>
      {sentId !== null ? (
        <Note icon="check-circle" tone={c.ok} onClose={onDismissSent}>
          <Text variant="small" weight="bold">{t("pwc.sent")}</Text>
          {sentId ? <Text variant="caption" tone="gray">{t("pwc.sentRef")} {sentId}</Text> : null}
          <Text variant="caption" tone="gray">{t("pwc.sentNext")}</Text>
        </Note>
      ) : null}
      {missing ? <Note icon="info" tone={c.accent} onClose={onDismissMissing}><Text variant="small">{t("pwc.linkMissing")}</Text></Note> : null}
      {partial ? (
        <Note icon="alert-triangle" tone={c.warn} action={<Button title={t("pwc.retry")} icon="refresh-cw" variant="line" size="sm" onPress={onRetry} style={{ alignSelf: "flex-start" }} />}>
          <Text variant="small">{t(partial === "manual" ? "pwc.partialManual" : "pwc.partialQuality")}</Text>
        </Note>
      ) : null}
    </View>
  );
}
