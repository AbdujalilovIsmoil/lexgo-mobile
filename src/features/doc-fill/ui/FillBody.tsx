import { View } from "react-native";
import { SectionForm, SectionTabs, type DocSchema } from "@/entities/doc-form";
import type { useDocFill } from "../model/useDocFill";
import { ReviewStep } from "./ReviewStep";

type Props = { f: ReturnType<typeof useDocFill>; schema: DocSchema; serviceId: string };

// Tabs + the current section (or the review) of the manual wizard.
export function FillBody({ f, schema, serviceId }: Props) {
  const { wiz } = f;
  return (
    <>
      <View style={{ marginHorizontal: -16 }}>
        <SectionTabs sections={schema.sections} answers={f.answers} step={wiz.step} onStep={wiz.go} />
      </View>
      {wiz.review ? (
        <ReviewStep schema={schema} serviceId={serviceId} answers={f.answers} wire={f.wire} problems={wiz.problems} onFix={wiz.jump} />
      ) : wiz.section ? (
        <SectionForm section={wiz.section} answers={f.answers} errorOf={wiz.errorOf} onChange={f.set} />
      ) : null}
    </>
  );
}
