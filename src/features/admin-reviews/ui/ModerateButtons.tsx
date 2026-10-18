import { Can } from "@/entities/access";
import { CcAction } from "@/shared/ui/cc";
import { useT } from "@/shared/i18n";

// Round reject / approve buttons of a pending review (lawyers.verify); the page opens the moderation sheet.
export function ModerateButtons({ onPick }: { onPick: (status: "approved" | "rejected") => void }) {
  const { t } = useT();
  return (
    <Can perm="lawyers.verify">
      <CcAction icon="x" label={t("admRev.reject")} onPress={() => onPick("rejected")} />
      <CcAction primary icon="check" label={t("admRev.approve")} onPress={() => onPick("approved")} />
    </Can>
  );
}
