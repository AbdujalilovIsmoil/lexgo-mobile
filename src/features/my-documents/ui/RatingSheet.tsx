import { StyleSheet, View } from "react-native";
import { Icon, PressableScale, Text, toast } from "@/shared/ui";
import { FormInput, useAppForm, useFieldError } from "@/shared/form";
import { FormSheet } from "@/shared/ui/admin";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { ApiError } from "@/shared/api";
import { selectHaptic, successHaptic, errorHaptic } from "@/shared/lib/haptics";
import { useSheetReset } from "@/shared/lib/useSheetReset";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { docKeys, rateDoc } from "@/entities/my-document";
import { docRatingSchema } from "./docRatingSchemas";

type Props = { docId: string; visible: boolean; onClose: () => void };

// POST …/rating. Up to 2 stars the backend opens a quality complaint, so the text for it is asked here.
export function RatingSheet({ docId, visible, onClose }: Props) {
  const { t } = useT();
  const c = useColors();
  const qc = useQueryClient();
  const tr = useFieldError();
  const f = useAppForm(docRatingSchema, { stars: 0, comment: "", complaint: "" });
  const stars = f.watch("stars");
  useSheetReset(visible, () => f.reset({ stars: 0, comment: "", complaint: "" }));
  const m = useMutation({
    mutationFn: (v: { stars: number; comment: string; complaint: string }) => rateDoc(docId, v.stars, v.comment, v.stars <= 2 ? v.complaint : ""),
    onSuccess: (workId) => { successHaptic(); toast(workId ? t("dm6.complaintSent") : t("dm6.rateThanks"), "ok"); void qc.invalidateQueries({ queryKey: docKeys.all }); onClose(); },
    onError: (e) => {
      errorHaptic();
      toast(e instanceof ApiError && e.status === 409 ? t("dm6.rateClosed") : e instanceof ApiError && e.detail ? e.detail : t("dm6.rateFail"), "err");
      if (e instanceof ApiError && e.status === 409) void qc.invalidateQueries({ queryKey: docKeys.all });
    },
  });
  const submit = f.handleSubmit((v) => m.mutate(v));
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("dm6.rateTitle")} onSubmit={() => void submit()} submitLabel={t("dm6.rateSend")} submitting={m.isPending} snaps={[0.62, 0.92]}>
      <View style={s.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <PressableScale key={n} haptic={false} accessibilityLabel={t("dm6.starN", { n })} onPress={() => { selectHaptic(); f.setValue("stars", n, { shouldValidate: true }); }}>
            <Icon name="star" size={40} color={n <= stars ? "#F59E0B" : c.line} />
          </PressableScale>
        ))}
      </View>
      <Text variant="small" tone={f.formState.errors.stars ? "err" : "gray"} center>{f.formState.errors.stars ? tr(f.formState.errors.stars.message) : stars ? t(`dm6.word.${stars}`) : t("dm6.rateHint")}</Text>
      <FormInput control={f.control} name="comment" label={t("dm6.commentLabel")} placeholder={t("dm6.commentPh")} maxLength={500} multiline />
      {stars > 0 && stars <= 2 ? <FormInput control={f.control} name="complaint" label={t("dm6.complaintLabel")} placeholder={t("dm6.complaintPh")} hint={t("dm6.complaintHint")} maxLength={2000} multiline /> : null}
    </FormSheet>
  );
}

const s = StyleSheet.create({ stars: { flexDirection: "row", justifyContent: "center", gap: 10, paddingVertical: 8 } });
