import { Pressable } from "react-native";
import type { UseQueryResult } from "@tanstack/react-query";
import { workRefValue, type WorkRef } from "@/entities/rating";
import { Field, SelectField } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Optional "which work is it about" picker with the web's loading / error / nothing-to-pick states.
export function RelatedWorkField({ q, value, onChange }: { q: UseQueryResult<WorkRef[]>; value: string; onChange: (v: string) => void }) {
  const { t } = useT();
  const label = `${t("py5.form.related").replace(/\s*\(.*\)$/, "")} ${t("pwc.form.optional")}`;
  if (q.isLoading) return <Field label={label}><Text variant="small" tone="gray">{t("pwc.form.relatedLoading")}</Text></Field>;
  if (q.isError) return <Field label={label}><Pressable onPress={() => void q.refetch()} accessibilityRole="button" accessibilityLabel={t("pwc.retry")}><Text variant="small" tone="gray">{t("pwc.form.relatedError")} <Text variant="small" tone="accent" weight="bold">{t("pwc.retry")}</Text></Text></Pressable></Field>;
  if (!q.data?.length) return null;
  const opts = [{ value: "", label: t("py5.form.relatedNone") }, ...q.data.map((w) => ({ value: workRefValue(w), label: w.title || w.workId, hint: w.workId }))];
  return <SelectField label={label} value={value} onChange={onChange} searchable options={opts} />;
}
