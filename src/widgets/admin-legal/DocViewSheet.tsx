import { useState } from "react";
import { View } from "react-native";
import { useSlugName, type ConsentDoc, type DocSlot } from "@/entities/admin-legal";
import { ChipBar, FormSheet, StatusPill } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useAccess } from "@/entities/access";
import { useT } from "@/shared/i18n";
import { DocVersionActions } from "./DocVersionActions";

// All versions of one document: pick a version to read its text, with its date and active flag.
type Props = { slot: DocSlot | null; onClose: () => void; onNewVersion: (slot: DocSlot) => void; onEdit: (doc: ConsentDoc) => void };
export function DocViewSheet({ slot: current, onClose, onNewVersion, onEdit }: Props) {
  const { t, locale } = useT();
  const name = useSlugName();
  const slot = useKept(current);
  const [pick, setPick] = useState("");
  const doc = slot?.versions.find((d) => d.id === pick) ?? slot?.current;
  const can = useAccess().can("users.manage");
  return (
    <FormSheet visible={!!current} onClose={onClose} title={slot ? name(slot.slug) : ""} subtitle={doc ? `${doc.title} · v${doc.version}` : undefined} submitLabel={slot?.current ? t("admLegal.newVersion") : t("admLegal.publish")} onSubmit={slot ? () => onNewVersion(slot) : undefined} snaps={[0.8, 0.96]}>
      {slot && slot.versions.length > 1 ? <View style={{ marginHorizontal: -18 }}><ChipBar options={slot.versions.map((d) => ({ value: d.id, label: `v${d.version}` }))} value={doc?.id ?? ""} onChange={setPick} /></View> : null}
      {doc ? (
        <>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <StatusPill status={doc.active ? "active" : "inactive"} />
            <Text variant="caption" tone="gray">{fmtDateTime(doc.createdAt, locale)}{doc.major ? ` · ${t("admLegal.reaccept")}` : ""}</Text>
          </View>
          {can ? <DocVersionActions doc={doc} onEdit={() => onEdit(doc)} /> : null}
          <Text variant="small" selectable>{doc.body}</Text>
        </>
      ) : <Text variant="small" tone="gray">{t("admLegal.notPublished")}</Text>}
    </FormSheet>
  );
}
