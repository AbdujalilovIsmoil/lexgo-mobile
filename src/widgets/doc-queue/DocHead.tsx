import { View } from "react-native";
import { Pill, Text } from "@/shared/ui";
import { FactRows } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import { DocStatus, FlowBadge, type DocReq } from "@/entities/doc-queue";

// Title, status chips and the key facts of the request (no phone number: the client is reached through chat / meeting).
export function DocHead({ doc }: { doc: DocReq }) {
  const { t, locale } = useT();
  return (
    <View style={{ gap: 12 }}>
      <Text variant="h3">{doc.title || doc.clientName}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <DocStatus status={doc.status} small={false} />
        <FlowBadge flow={doc.flow} />
        {doc.requestedType ? <Pill label={doc.requestedType} tone="gray" icon="tag" /> : null}
      </View>
      <FactRows rows={[
        { label: t("ad1.client"), value: doc.clientName },
        { label: t("ad1.service"), value: doc.serviceName },
        { label: t("ad1.template"), value: doc.templateName !== doc.serviceName ? doc.templateName : "" },
        { label: t("ad1.assigned"), value: doc.assignedName },
        { label: t("ad1.created"), value: fmtDateTime(doc.createdAt, locale) },
        { label: t("ad1.updated"), value: fmtDateTime(doc.updatedAt, locale) },
      ]} />
    </View>
  );
}
