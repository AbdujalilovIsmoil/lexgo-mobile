import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { DocReq } from "@/entities/doc-queue";
import { useClaim } from "@/features/doc-pool";
import { GateCard } from "./GateCard";

// The editor answers 409 until the work is taken from the pool: offer the claim (race-safe) instead of an error.
export function ClaimGate({ doc }: { doc: DocReq }) {
  const { t } = useT();
  const claim = useClaim();
  return (
    <GateCard icon="inbox" title={t("ad5.claimTitle")} text={t("ad5.claimText")}>
      <Button title={t("ad2.claim")} icon="check-circle" variant="gradient" loading={claim.isPending} onPress={() => claim.mutate(doc.id)} />
    </GateCard>
  );
}
