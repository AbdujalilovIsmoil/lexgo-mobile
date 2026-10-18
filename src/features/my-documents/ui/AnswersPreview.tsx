import { Button, Card, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { useT } from "@/shared/i18n";
import type { useAnswersForm } from "../model/useAnswersForm";

// "How will it look": POST …/preview with the answers typed so far (nothing is saved).
export function AnswersPreview({ preview }: { preview: ReturnType<typeof useAnswersForm>["preview"] }) {
  const { t } = useT();
  const d = preview.data;
  return (
    <Card tinted style={{ gap: 10 }}>
      <Button title={d ? t("dm4.previewAgain") : t("dm4.previewRun")} icon="eye" variant="soft" size="sm" loading={preview.isPending} onPress={() => preview.mutate()} />
      {preview.isError ? <Text variant="small" tone="err">{t("dm4.previewFail")}</Text> : null}
      {d ? (
        <>
          <ProgressBar value={d.percent / 100} />
          <Text variant="caption" tone="gray">{t("dm4.percent", { n: Math.round(d.percent) })}</Text>
          {d.missing.length ? <Text variant="caption" tone="warn">{t("dm4.missing", { list: d.missing.map((m) => m.label).join(", ") })}</Text> : null}
          <Text variant="small" selectable>{d.text}</Text>
        </>
      ) : null}
    </Card>
  );
}
