import { View } from "react-native";
import { Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import type { JourneyStep, StudioConstructor } from "@/entities/admin-studio";
import { K02Checklist } from "../editors/k02/K02Checklist";
import { K02Duration } from "../editors/k02/K02Duration";
import { K02Factors } from "../editors/k02/K02Factors";
import { K02Guarantees, K02Rules } from "../editors/k02/K02Inline";
import { K02Template } from "../editors/k02/K02Template";
import { K02Terms } from "../editors/k02/K02Terms";
import { SchemaField } from "../form/SchemaField";
import type { Errors } from "../form/types";

type Props = { step: JourneyStep; ctor: StudioConstructor | null; payload: Dict; onChange: (p: Dict) => void; errors: Errors; readOnly: boolean };

// The service's own blocks by step; every other step (a package's, or one the server added) draws the schema fields it owns.
const BASE = ["title", "category_id", "description", "client_value", "usage_steps"];
const PRICE = ["base_price", "max_price"];

export function StepForm({ step, ctor, payload, onChange, errors, readOnly }: Props) {
  const { t } = useT();
  const p = { payload, onChange, errors, readOnly };
  const field = (key: string) => {
    const f = ctor?.fields.find((x) => x.key === key);
    return f ? <SchemaField key={key} f={f} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} /> : null;
  };
  if (step.formCode === "K02") {
    switch (step.key) {
      case "category": return <View style={{ gap: 14 }}>{BASE.map(field)}<K02Terms {...p} /></View>;
      case "pricing": return <View style={{ gap: 14 }}>{PRICE.map(field)}<K02Factors {...p} /></View>;
      case "requirements": return <View style={{ gap: 14 }}>{field("seller_requirements")}{field("negotiation_allowed")}</View>;
      case "duration": return <K02Duration {...p} />;
      case "template": return <K02Template {...p} />;
      case "checklist": return <K02Checklist {...p} />;
      case "rules": return <K02Rules {...p} />;
      case "guarantees": return <K02Guarantees {...p} />;
      default: break;
    }
  }
  const own = step.fields.map(field).filter(Boolean);
  return own.length ? <View style={{ gap: 14 }}>{own}</View> : <Text variant="small" tone="gray">{t("admStudioD.create.stepOtherText")}</Text>;
}
