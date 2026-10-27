import { useState } from "react";
import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ResultView, type Draft, type DocSchema, type FillSource, type GeneratedDoc } from "@/entities/doc-form";
import { IconButton, Screen, confirmDialog } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { PlanGateSheet } from "@/features/plan-gate";
import { useKeyboardOpen } from "@/shared/lib/doc/useKeyboardOpen";
import { useT } from "@/shared/i18n";
import { trackDoc } from "@/shared/analytics";
import { useDocFill } from "../model/useDocFill";
import { DraftBanner } from "./DraftBanner";
import { FillBody } from "./FillBody";
import { FillFooter } from "./FillFooter";
import { PreviewSheet } from "./PreviewSheet";
import { SaveStatus } from "./SaveStatus";

type Props = { source: FillSource; userId: string; schema: DocSchema; draft?: Draft; initialDoc?: GeneratedDoc | null };

// Manual document fill: section wizard → review → server-built file. Used for a catalogue service and for a template's document request.
export function FillFlow({ source, userId, schema, draft, initialDoc }: Props) {
  const { t } = useT();
  const router = useRouter();
  const f = useDocFill({ source, userId, schema, draft, initialDoc });
  const kb = useKeyboardOpen();
  const [preview, setPreview] = useState(false);
  const [banner, setBanner] = useState(!!draft && Object.values(draft.answers).some(Boolean));
  const { wiz } = f;
  const askClear = () => confirmDialog({ title: t("dc2.clearTitle"), message: t("dc2.clearText"), confirmLabel: t("dc2.draftClear"), cancelLabel: t("common.cancel"), danger: true, onConfirm: f.clear });
  const footer = f.doc || kb ? undefined : (
    <FillFooter first={wiz.step === 0} review={wiz.review} canGenerate={wiz.problems.length === 0} busy={f.gen.isPending} onBack={wiz.back} onNext={wiz.next} onGenerate={() => f.gen.mutate()} />
  );
  const right = f.doc ? undefined : (
    <>
      <IconButton icon="trash-2" size={40} onPress={askClear} label={t("dc2.draftClear")} />
      <IconButton icon="eye" size={40} onPress={() => { setPreview(true); if (source.meta) trackDoc("document_preview_opened", { ...source.meta, mode: "self" }); }} label={t("dc4.previewTitle")} />
    </>
  );
  return (
    <AdminPage title={schema.title} subtitle={f.doc ? t("dc4.ready") : t("dc2.step", { i: wiz.step + 1, n: wiz.last + 1 })} right={right} footer={footer}>
      <Screen key={wiz.step + (f.doc ? "r" : "")} topInset={false} contentContainerStyle={s.content} keyboardDismissMode="on-drag">
        {f.doc ? (
          <ResultView doc={f.doc} onNew={() => router.replace("/(tabs)/services")} onOpenDocs={() => router.push(`/documents/${f.doc?.requestId}` as never)} />
        ) : (
          <>
            {banner && draft ? <DraftBanner at={draft.at} onClear={() => { f.clear(); setBanner(false); }} onHide={() => setBanner(false)} /> : null}
            {source.save ? <SaveStatus state={f.saveState} onRetry={f.retrySave} /> : null}
            <FillBody f={f} schema={schema} source={source} />
          </>
        )}
      </Screen>
      <PreviewSheet visible={preview} onClose={() => setPreview(false)} source={source} wire={f.wire} />
      <PlanGateSheet gate={f.plan} onClose={f.closePlan} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ content: { gap: 14, paddingTop: 4 } });
