import { SectionCard, FactRows } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocReq } from "@/entities/doc-queue";

// What the client asked for, in their own words, and the answers they filled in.
export function DocNeed({ doc }: { doc: DocReq }) {
  const { t } = useT();
  return (
    <SectionCard title={t("ad1.need")}>
      <Text variant="body" selectable>{doc.need || "—"}</Text>
      <FactRows rows={doc.answers.map((a) => ({ label: a.label, value: a.value }))} />
    </SectionCard>
  );
}
