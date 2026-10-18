import { useAccess } from "@/entities/access";
import { fourStepsDone, roleLabel, useRegDetail, type SellerRequest } from "@/entities/admin-reg";
import { useDecision } from "@/features/admin-reg";
import { FormSheet, QueryBoundary } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { ActivityCard } from "./ActivityCard";
import { FourStepCard } from "./FourStepCard";
import { ProofDocs } from "./ProofDocs";
import { RegFacts } from "./RegFacts";

// Everything an admin needs to decide: sign-up data, four-step verification, proof documents, activity.
export function RegDetailSheet({ item, onClose }: { item: SellerRequest | null; onClose: () => void }) {
  const { t } = useT();
  const r = useKept(item);
  const q = useRegDetail(r?.id ?? null);
  const d = q.data;
  const decide = useDecision(onClose);
  const can = useAccess().can("users.manage") && r?.status === "pending";
  const target = { id: r?.id ?? "", name: r?.name ?? "" };
  const blocked = !!d && !fourStepsDone(d);
  return (
    <FormSheet
      visible={!!item}
      onClose={onClose}
      title={r?.name || t("admRegB.detailTitle")}
      subtitle={r ? roleLabel(t, r.role) : undefined}
      onSubmit={can ? () => decide.accept(target) : undefined}
      submitLabel={t("admReg.accept")}
      disabled={!d || blocked || decide.busy}
      secondary={can ? { label: t("admReg.reject"), onPress: () => decide.reject(target) } : undefined}
      snaps={[0.8, 0.95]}
    >
      <QueryBoundary query={q}>
        {d ? (
          <>
            <RegFacts d={d} />
            <FourStepCard d={d} />
            {can && blocked ? <Text variant="small" tone="warn">{t("admRegB.fourBlocked")}</Text> : null}
            <ProofDocs docs={d.docs} />
            <ActivityCard d={d} />
          </>
        ) : null}
      </QueryBoundary>
    </FormSheet>
  );
}
