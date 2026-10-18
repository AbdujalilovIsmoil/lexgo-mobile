import { useState } from "react";
import { docTypeApplies, useDocTypes } from "@/entities/admin-support";
import { Input } from "@/shared/ui";
import { SelectField } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";

const CUSTOM = "__custom__";

type Props = { visible: boolean; hasTemplate: boolean; value: string; onChange: (v: string) => void };

// Optional "kind of document" line: one of the backend's list, or the operator's own words.
export function DocTypeField({ visible, hasTemplate, value, onChange }: Props) {
  const { t } = useT();
  const types = useDocTypes(visible);
  const [pick, setPick] = useState("");
  const o = types.data;
  if (!docTypeApplies(o, hasTemplate ? "template_lawyer_assisted" : "custom_from_scratch") || !o) return null;
  const choose = (v: string) => { setPick(v); onChange(v === CUSTOM || v === "none" ? "" : v); };
  const options = [{ value: "none", label: t("admSupC.doc.typeNone") }, ...o.items.map((x) => ({ value: x, label: x })), ...(o.custom ? [{ value: CUSTOM, label: t("admSupC.doc.typeOwn") }] : [])];
  return (
    <>
      <SelectField label={t("admSupC.doc.type")} value={pick || "none"} options={options} onChange={choose} />
      {pick === CUSTOM ? <Input value={value} onChangeText={(v) => onChange(v.trim() ? v : "")} placeholder={t("admSupC.doc.typeOwnPh")} maxLength={120} /> : null}
    </>
  );
}
