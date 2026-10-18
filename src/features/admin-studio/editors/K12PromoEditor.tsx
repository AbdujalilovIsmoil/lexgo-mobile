import { View } from "react-native";
import { Card, Pill, Text } from "@/shared/ui";
import type { Dict } from "@/shared/lib/json";
import { useT } from "@/shared/i18n";
import { Block } from "../form/Block";
import { SchemaFields } from "../form/SchemaFields";
import { TextField } from "../form/TextField";
import type { EditorEntry, EditorProps, Errors } from "../form/types";
import { rec, str } from "../form/values";

const HANDLED = ["preview"];

function validateK12(payload: Dict): Errors {
  const out: Errors = {};
  if (!(Number(payload.price) > 0)) out.price = "@number";
  if (!(Number(payload.days) > 0)) out.days = "@number";
  return out;
}

// K12-PROMO promotion package: the schema fields plus the text a client sees, with a live preview.
function K12PromoEditor({ ctor, payload, onChange, errors, readOnly }: EditorProps) {
  const { t } = useT();
  const pv = rec(payload.preview);
  const set = (k: string, v: string) => onChange({ ...payload, preview: { title: str(pv.title), subtitle: str(pv.subtitle), cta_label: str(pv.cta_label), [k]: v } });
  return (
    <View style={{ gap: 14 }}>
      <SchemaFields ctor={ctor} payload={payload} onChange={onChange} errors={errors} readOnly={readOnly} exclude={HANDLED} />
      <Block title={t("admStudioB.k12.preview")} hint={t("admStudioB.k12.previewHint")}>
        <TextField label={t("admStudioB.k12.pTitle")} value={str(pv.title)} onChange={(v) => set("title", v)} readOnly={readOnly} />
        <TextField label={t("admStudioB.k12.pSub")} value={str(pv.subtitle)} onChange={(v) => set("subtitle", v)} readOnly={readOnly} />
        <TextField label={t("admStudioB.k12.pCta")} value={str(pv.cta_label)} onChange={(v) => set("cta_label", v)} readOnly={readOnly} />
        <Card tinted style={{ gap: 4 }}>
          <Text variant="body" weight="bold">{str(pv.title) || t("admStudioB.k12.pEmpty")}</Text>
          <Text variant="small" tone="gray">{str(pv.subtitle) || t("admStudioB.k12.pSubEmpty")}</Text>
          {str(pv.cta_label) ? <Pill label={str(pv.cta_label)} icon="check" /> : null}
        </Card>
      </Block>
    </View>
  );
}

export const K12_PROMO: EditorEntry = {
  Editor: K12PromoEditor,
  validate: validateK12,
  emptyPayload: () => ({ placement: "service_boost", price: 0, days: 7, boost_score: 1, requires_service: true, requires_banner: false, preview: { title: "", subtitle: "", cta_label: "" }, status: "active" }),
  handled: HANDLED,
};
