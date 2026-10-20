import { useState } from "react";
import { FormSheet, SelectField } from "@/shared/ui/admin";
import { Input } from "@/shared/ui";
import { tOr } from "@/shared/lib/pro/tOr";
import { useJourneyDefs, useStartJourney, type Journey } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";

// Start a journey: its type (the server's definitions) and a working name.
export function NewJourneySheet({ visible, onClose, onStarted }: { visible: boolean; onClose: () => void; onStarted: (j: Journey) => void }) {
  const { t } = useT();
  const defs = useJourneyDefs();
  const start = useStartJourney();
  const [type, setType] = useState("");
  const [title, setTitle] = useState("");
  const types = (defs.data ?? []).map((d) => ({ value: d.type, label: tOr(t, `admStudioD.journeys.types.${d.type}`, d.type) }));
  const picked = type || types[0]?.value || "";
  const go = () => start.mutate({ type: picked, title: title.trim() }, { onSuccess: (j) => { setTitle(""); setType(""); onClose(); onStarted(j); } });
  return (
    <FormSheet visible={visible} onClose={onClose} title={t("admStudioD.journeys.new")} onSubmit={go} submitLabel={t("admStudioD.journeys.start")} submitting={start.isPending} disabled={!picked || !title.trim()}>
      <SelectField label={t("admStudioD.journeys.type")} value={picked} options={types} onChange={setType} />
      <Input label={t("admStudioD.journeys.name")} value={title} onChangeText={setTitle} placeholder={t("admStudioD.journeys.namePh")} maxLength={120} />
    </FormSheet>
  );
}
