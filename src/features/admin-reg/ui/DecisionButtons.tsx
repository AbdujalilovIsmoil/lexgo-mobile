import { Can } from "@/entities/access";
import { CcAction } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";
import { useDecision, type Target } from "../model/useDecision";

// Round reject / accept buttons under a pending request (needs users.manage, like the web's admin area).
export function DecisionButtons({ target }: { target: Target }) {
  const { t } = useT();
  const d = useDecision();
  return (
    <Can perm="users.manage">
      <CcAction icon="x" label={t("admReg.reject")} onPress={() => d.reject(target)} loading={d.busy} />
      <CcAction primary icon="check" label={t("admReg.accept")} onPress={() => d.accept(target)} loading={d.busy} />
    </Can>
  );
}
