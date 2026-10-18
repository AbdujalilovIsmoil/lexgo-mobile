import type { ProofDoc } from "@/entities/admin-reg";
import { useT } from "@/shared/i18n";
import { Block } from "./Block";
import { ProofDocRow } from "./ProofDocRow";

export function ProofDocs({ docs }: { docs: ProofDoc[] }) {
  const { t } = useT();
  if (!docs.length) return null;
  return (
    <Block title={t("admRegB.documents")}>
      {docs.map((d) => <ProofDocRow key={d.id} doc={d} />)}
    </Block>
  );
}
