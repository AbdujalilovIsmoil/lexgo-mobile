import { useState } from "react";
import { View } from "react-native";
import { Button, Card, Icon, Pill, Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { fmtDateTime, timeAgo } from "@/shared/lib/format";
import { useColors } from "@/shared/theme";
import { DocStatus, FlowBadge, LATE_MS, type DocReq } from "@/entities/doc-queue";

type Props = { doc: DocReq; claiming: boolean; onClaim: () => void; onOpen?: () => void };

// One open pool request: client, service, a preview of the need, how long it has waited, and the claim button.
export function PoolCard({ doc, claiming, onClaim, onOpen }: Props) {
  const { t, locale } = useT();
  const c = useColors();
  const [open, setOpen] = useState(false);
  const [now] = useState(() => Date.now());
  const late = !!doc.createdAt && now - Date.parse(doc.createdAt) > LATE_MS;
  const files = doc.files.length;
  return (
    <Card style={{ gap: 8 }} onPress={onOpen}>
      <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
        <Text variant="body" weight="bold" style={{ flex: 1 }}>{doc.title || t("ad1.title")}</Text>
        <DocStatus status={doc.status} />
      </View>
      {doc.clientName ? <Text variant="small" tone="gray"><Icon name="user" size={13} tone="gray" /> {doc.clientName}</Text> : null}
      {doc.serviceName ? <Text variant="small" tone="gray">{t("ad2.service")}: {doc.serviceName}</Text> : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <FlowBadge flow={doc.flow} />
        {doc.requestedType ? <Pill label={doc.requestedType} tone="gray" icon="tag" small /> : null}
        {files ? <Pill label={t("ad2.files", { n: files })} tone="gray" icon="paperclip" small /> : null}
      </View>
      {doc.need ? <Text variant="small" numberOfLines={open ? undefined : 3}>{doc.need}</Text> : null}
      <Text variant="caption" style={{ color: late ? c.warn : c.gray2 }}>
        {late ? t("ad2.waiting", { ago: timeAgo(doc.createdAt, t) }) : `${timeAgo(doc.createdAt, t)} · ${fmtDateTime(doc.createdAt, locale)}`}
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
        {doc.need.length > 120 ? <Button title={open ? t("ad2.less") : t("ad2.more")} variant="line" size="sm" onPress={() => setOpen((v) => !v)} /> : null}
        <Button title={t("ad2.claim")} icon="check-circle" variant="gradient" size="sm" loading={claiming} disabled={!doc.canClaim} onPress={onClaim} style={{ marginLeft: "auto" }} />
      </View>
    </Card>
  );
}
