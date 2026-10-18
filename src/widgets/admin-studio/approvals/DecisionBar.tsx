import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, toast } from "@/shared/ui";
import { FormInput, useAppForm } from "@/shared/form";
import { publishObject, reviewObject, studioKeys, useStudioText } from "@/entities/admin-studio";
import { useAdminMutation } from "@/shared/lib/useAdminMutation";
import { useInsets } from "@/shared/lib/insets";
import { useColors } from "@/shared/theme";
import { decisionSchema } from "./decisionSchema";

type Kind = "approve" | "changes_requested" | "reject" | "publish";
const KEY: Record<Kind, string> = { approve: "approve", changes_requested: "changes", reject: "reject", publish: "publish" };
type Props = { id: string; canAct: boolean; canPub: boolean; wait: string; stepName: string };

// Sticky footer of the approval sheet: Approve / Request changes / Reject, or Publish; the note comes inline.
export function DecisionBar({ id, canAct, canPub, wait, stepName }: Props) {
  const { t } = useStudioText();
  const c = useColors();
  const insets = useInsets();
  const [kind, setKind] = useState<Kind | null>(null);
  const needNote = kind === "changes_requested" || kind === "reject";
  const f = useAppForm(decisionSchema(needNote), { note: "" });
  const [seen, setSeen] = useState(id);
  if (seen !== id) {
    setSeen(id);
    setKind(null);
    f.reset({ note: "" });
  }
  const m = useAdminMutation({
    mutationFn: (v: { k: Kind; n: string }) => (v.k === "publish" ? publishObject(id, v.n) : reviewObject(id, v.k, v.n)),
    invalidate: [studioKeys.all],
    onSuccess: (_r, v) => (toast(t(`admStudioC.decide.${KEY[v.k]}.ok`), "ok"), setKind(null), f.reset({ note: "" })),
  });
  const send = f.handleSubmit((v) => kind && m.mutate({ k: kind, n: v.note }));
  const box = [s.bar, { borderTopColor: c.line, backgroundColor: c.surface, paddingBottom: insets.bottom + 10 }];
  if (!canAct && !canPub) return <View style={box}><Text variant="small" tone="gray">{wait}</Text></View>;
  if (!kind) {
    return (
      <View style={box}>
        {canPub ? <Button title={t("admStudio.actions.publish")} icon="upload-cloud" variant="gradient" full onPress={() => setKind("publish")} /> : null}
        {canAct ? (
          <View style={s.row}>
            <Button title={t("admStudioC.decide.approve.cta")} icon="check-circle" variant="gradient" onPress={() => setKind("approve")} style={s.fill} />
            <Button title={t("admStudioC.decide.changes.cta")} icon="rotate-ccw" variant="soft" onPress={() => setKind("changes_requested")} style={s.fill} />
            <Button title={t("admStudioC.decide.reject.cta")} icon="x-circle" variant="line" onPress={() => setKind("reject")} style={s.fill} />
          </View>
        ) : null}
      </View>
    );
  }
  const k = KEY[kind];
  return (
    <View style={box}>
      <Text variant="small" weight="bold">{t(`admStudioC.decide.${k}.title`)}</Text>
      <Text variant="caption" tone="gray">{t(`admStudioC.decide.${k}.text`, { step: stepName || "—" })}</Text>
      <FormInput control={f.control} name="note" placeholder={t(`admStudioC.decide.${k}.ph`)} multiline maxLength={2000} autoFocus style={{ minHeight: 64, textAlignVertical: "top" }} hint={needNote ? t("admStudioC.decide.needNote") : t("adm.optional")} />
      <View style={s.row}>
        <Button title={t("adm.cancel")} variant="line" disabled={m.isPending} onPress={() => setKind(null)} style={s.fill} />
        <Button title={t(`admStudioC.decide.${k}.cta`)} variant="gradient" loading={m.isPending} onPress={() => void send()} style={s.fill} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({ bar: { paddingHorizontal: 18, paddingTop: 10, borderTopWidth: 1, gap: 8 }, row: { flexDirection: "row", gap: 8 }, fill: { flex: 1 } });
