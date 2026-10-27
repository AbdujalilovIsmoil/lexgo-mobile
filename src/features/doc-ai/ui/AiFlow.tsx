import { StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { ResultView, type Draft } from "@/entities/doc-form";
import { Screen } from "@/shared/ui";
import { AdminPage } from "@/shared/ui/admin";
import { PlanGateSheet } from "@/features/plan-gate";
import { useKeyboardOpen } from "@/shared/lib/doc/useKeyboardOpen";
import { useT } from "@/shared/i18n";
import { useDocAi } from "../model/useDocAi";
import { AiFooter } from "./AiFooter";
import { AiQuestions } from "./AiQuestions";
import { NeedStep } from "./NeedStep";

type Props = { serviceId: string; userId: string; title: string; draft?: Draft };

// AI-assisted document: need → questions → generate. Result is the server's file.
export function AiFlow({ serviceId, userId, title, draft }: Props) {
  const { t } = useT();
  const router = useRouter();
  const f = useDocAi({ serviceId, userId, draft });
  const kb = useKeyboardOpen();
  const { wiz, sections } = f;
  const stage = !sections ? "need" : wiz.review ? "review" : "section";
  const busy = f.questions.isPending || f.generate.isPending;
  const onBack = () => (wiz.step === 0 ? f.backToNeed() : wiz.back());
  const footer = f.doc || kb ? undefined : (
    <AiFooter stage={stage} busy={busy} needOk={f.needOk} onQuestions={() => f.questions.mutate()} onBack={onBack} onNext={wiz.next} onGenerate={() => f.generate.mutate()} />
  );
  return (
    <AdminPage title={title} subtitle={f.doc ? t("dc4.ready") : t("dc5.subtitle")} footer={footer}>
      <Screen key={stage + wiz.step + (f.doc ? "r" : "")} topInset={false} contentContainerStyle={s.content} keyboardDismissMode="on-drag">
        {f.doc ? (
          <ResultView doc={f.doc} onNew={() => router.replace("/(tabs)/services")} onOpenDocs={() => router.push(`/documents/${f.doc?.requestId}` as never)} />
        ) : sections ? (
          <AiQuestions f={f} sections={sections} answers={f.answers} />
        ) : (
          <NeedStep serviceId={serviceId} title={title} need={f.need} extra={f.extra} language={f.language} onNeed={f.setNeed} onExtra={f.setExtra} onLanguage={f.setLanguage} />
        )}
      </Screen>
      <PlanGateSheet gate={f.plan} onClose={f.closePlan} />
    </AdminPage>
  );
}

const s = StyleSheet.create({ content: { gap: 14, paddingTop: 4 } });
