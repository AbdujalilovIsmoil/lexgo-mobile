import { View } from "react-native";
import { Pill } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDateTime } from "@/shared/lib/format";
import type { DocReq } from "../model/types";
import { DocStatus } from "./DocStatus";
import { FlowBadge } from "./FlowBadge";

// One request in "my requests": title, client · service, last change, status + flow chips.
export function DocRow({ doc, onPress }: { doc: DocReq; onPress: () => void }) {
  const { t, locale } = useT();
  const sub = [doc.clientName, doc.serviceName].filter(Boolean).join(" · ");
  return (
    <RowCard title={doc.title || doc.clientName || t("ad1.title")} subtitle={sub} meta={fmtDateTime(doc.updatedAt || doc.createdAt, locale)} icon="file-text" onPress={onPress}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
        <DocStatus status={doc.status} />
        <FlowBadge flow={doc.flow} />
        {doc.requestedType ? <Pill label={doc.requestedType} tone="gray" icon="tag" small /> : null}
      </View>
    </RowCard>
  );
}
