import { View } from "react-native";
import type { FileRef } from "@/shared/ui/preview";
import type { DocCan, MyDoc, UnlockPolicy } from "@/entities/my-document";
import { AdvocateCard, FileActions, PaymentCard, RatingCard } from "@/features/my-documents";
import { AnswersSection } from "./AnswersSection";
import { DocSummary } from "./DocSummary";
import { ReviewSection } from "./ReviewSection";
import type { SheetKey } from "./sheetKey";

type Props = { doc: MyDoc; policy?: UnlockPolicy; can: DocCan; onSheet: (k: SheetKey) => void; onFile: (f: FileRef) => void; onRefresh: () => Promise<unknown> };

// The detail screen, top to bottom: summary (with its status block and timeline), payment, file, answers, advocate, review, rating.
export function DocDetailBody({ doc, policy, can, onSheet, onFile, onRefresh }: Props) {
  return (
    <View style={{ gap: 14 }}>
      <DocSummary doc={doc} paid={doc.paid || policy?.paid === true} />
      <PaymentCard doc={doc} can={can} onRefresh={onRefresh} />
      <FileActions doc={doc} policy={policy} onOpen={onFile} />
      <AnswersSection doc={doc} can={can} policy={policy} onOpen={() => onSheet("answers")} />
      {can.advocate ? <AdvocateCard doc={doc} /> : null}
      <ReviewSection doc={doc} can={can} onSend={() => onSheet("review")} />
      <RatingCard rating={doc.rating} workId={doc.workId} onRate={() => onSheet("rate")} />
    </View>
  );
}
