import { useState } from "react";
import { View } from "react-native";
import { Icon, Pill, PressableScale, Text } from "@/shared/ui";
import { FilePreview } from "@/shared/ui/preview";
import { FactRows, SectionCard } from "@/shared/ui/admin";
import { useUrgentLabels, type UrgentFile, type UrgentRequest } from "@/entities/urgent";
import { useT } from "@/shared/i18n";

// What the client asked: situation, areas, region, panel size and the files / voice notes attached.
export function DetailBody({ req }: { req: UrgentRequest }) {
  const { t } = useT();
  const label = useUrgentLabels();
  const [file, setFile] = useState<UrgentFile | null>(null);
  return (
    <>
      <SectionCard title={t("ug7.need")}>
        <Text variant="body">{req.need || t("ug7.noNeed")}</Text>
        {req.directions.length ? <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>{req.directions.map((d, i) => <Pill key={`${d}-${i}`} tone="cy" label={label.dir(d)} />)}</View> : null}
        <FactRows rows={[{ label: t("ug2.region"), value: label.region(req.region) }, { label: t("ug7.requestedN"), value: req.serviceKind === "second_opinion_group" ? String(req.lawyerCount || "") : "" }]} />
      </SectionCard>
      {req.files.length ? (
        <SectionCard title={t("ug7.attachments")}>
          {req.files.map((f, i) => (
            <PressableScale key={`${f.url}-${i}`} onPress={() => f.url && setFile(f)} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              <Icon name={f.voice ? "mic" : "file-text"} size={18} tone="accent" />
              <Text variant="small" weight="semibold" numberOfLines={1} style={{ flex: 1 }}>{f.name}</Text>
            </PressableScale>
          ))}
        </SectionCard>
      ) : null}
      <FilePreview visible={!!file} onClose={() => setFile(null)} file={file ? { path: file.url, name: file.name, mime: file.contentType || undefined } : null} />
    </>
  );
}
