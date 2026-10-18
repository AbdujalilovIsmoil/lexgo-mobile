import { useState } from "react";
import type { ExportDef } from "@/entities/admin-export";
import { DateRangeBar, FormSheet, SelectField, useDateRange } from "@/shared/ui/admin";
import { Text } from "@/shared/ui";
import { humanizeSlug } from "@/shared/lib/format";
import { useKept } from "@/shared/lib/useKept";
import { useT } from "@/shared/i18n";
import { useRunExport } from "../model/useRunExport";

// Choose the period (and one filter, where the export has it), then download the workbook and share it.
export function ExportSheet({ def: current, onClose }: { def: ExportDef | null; onClose: () => void }) {
  const { t } = useT();
  const def = useKept(current);
  const bar = useDateRange("d30");
  const [filter, setFilter] = useState("");
  const run = useRunExport(onClose);
  const f = def?.filter;
  const picked = f?.options.includes(filter) ? filter : "";
  const label = (v: string) => (t(`${f?.i18n}.${v}`) === `${f?.i18n}.${v}` ? humanizeSlug(v) : t(`${f?.i18n}.${v}`));
  const options = f ? [{ value: "", label: t("adm.all") }, ...f.options.map((v) => ({ value: v, label: label(v) }))] : [];
  return (
    <FormSheet
      visible={!!current} onClose={onClose} title={def ? t(`ag2.exp.${def.key}`) : ""} subtitle={t("ag2.sheetHint")}
      onSubmit={def ? () => run.mutate({ def, q: { from: bar.range.from, to: bar.range.to, filter: picked } }) : undefined}
      submitLabel={t("ag2.download")} submitting={run.isPending}
    >
      {def?.dates ? <><Text variant="small" tone="gray">{t("ag2.period")}</Text><DateRangeBar bar={bar} withAll /></> : <Text variant="small" tone="gray">{t("ag2.noPeriod")}</Text>}
      {f ? <SelectField label={t(`ag2.by.${f.param}`)} value={picked} options={options} onChange={setFilter} /> : null}
    </FormSheet>
  );
}
