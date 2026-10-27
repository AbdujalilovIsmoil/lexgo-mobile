import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/shared/api";
import { claimGift, giftsKey, type GiftClaim } from "@/entities/profile-extras";
import { entitlementKeys } from "@/entities/plan";
import { FormSheet } from "@/shared/ui/admin";
import { Text, toast } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { fmtDate } from "@/shared/lib/format";
import { errorHaptic, successHaptic } from "@/shared/lib/haptics";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useT } from "@/shared/i18n";
import { claimSchema } from "./claimSchema";
import { lxCodeFrom } from "@/shared/lib/pasted";

// Claim a gift with its code: starts the subscription term for the signed-in user.
export function ClaimSheet({ visible, onClose, initial = "" }: { visible: boolean; onClose: () => void; initial?: string }) {
  const { t, locale } = useT();
  const qc = useQueryClient();
  const f = useAppForm(claimSchema, { code: initial });
  const [done, setDone] = useState<GiftClaim | null>(null);
  useSheetReset(visible, () => { f.reset({ code: initial }); setDone(null); });
  const m = useMutation({
    mutationFn: (code: string) => claimGift(code),
    onSuccess: (r) => {
      successHaptic();
      setDone(r);
      void qc.invalidateQueries({ queryKey: giftsKey });
      void qc.invalidateQueries({ queryKey: entitlementKeys.all });
    },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.detail ? e.detail : t("py8.claim.error"), "err");
    },
  });
  const submit = f.handleSubmit((v) => m.mutate(v.code));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("py8.claim.title")} subtitle={done ? undefined : t("py8.claim.lead")} submitLabel={done ? t("py8.done") : t("py8.claim.cta")} submitting={m.isPending} onSubmit={done ? onClose : () => void submit()}>
      {done ? (
        <>
          <Text variant="h4">{t("py8.claim.okTitle")}</Text>
          <Text variant="small" tone="gray">{t("py8.claim.okText", { to: fmtDate(done.endsAt, locale) || "—" })}</Text>
        </>
      ) : (
        <FormInput control={f.control} name="code" label={t("py8.claim.code")} format={lxCodeFrom} autoCapitalize="characters" autoCorrect={false} placeholder="LX-12345678" />
      )}
    </FormSheet>
  );
}
