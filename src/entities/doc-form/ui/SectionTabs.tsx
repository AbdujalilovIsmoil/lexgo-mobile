import { ScrollView, StyleSheet } from "react-native";
import { Chip } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { sectionFilled } from "../lib/validate";
import type { DocAnswers, DocSection } from "../model/types";

type Props = { sections: DocSection[]; answers: DocAnswers; step: number; onStep: (i: number) => void };

// One chip per section ("Da'vogar 2/3"), plus the review; tap to jump.
export function SectionTabs({ sections, answers, step, onStep }: Props) {
  const { t } = useT();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.row}>
      {sections.map((sec, i) => {
        const done = sectionFilled(sec, answers);
        const full = done === sec.fields.length;
        return <Chip key={sec.id} label={`${sec.title || t("dc2.section", { n: i + 1 })} · ${done}/${sec.fields.length}`} icon={full ? "check" : undefined} active={i === step} onPress={() => onStep(i)} />;
      })}
      <Chip label={t("dc2.review")} icon="eye" active={step === sections.length} onPress={() => onStep(sections.length)} />
    </ScrollView>
  );
}

const s = StyleSheet.create({ row: { gap: 8, paddingHorizontal: 16 } });
