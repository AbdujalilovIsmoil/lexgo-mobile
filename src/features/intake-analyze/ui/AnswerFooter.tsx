import { StyleSheet, View } from "react-native";
import { Divider, Reveal } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { FeedbackPanel } from "./FeedbackPanel";
import { NoticeCard } from "./NoticeCard";
import { SosRow } from "./SosRow";

type Props = { unverified: boolean; disclaimer: string; leadId: string; urgent: boolean };

// Everything under an answer, in one calm stack that eases in: missing-source warning (when the backend says
// "reliable_source_required"), the permanent disclaimer, the feedback panel and — unless urgent — the SOS row.
export function AnswerFooter({ unverified, disclaimer, leadId, urgent }: Props) {
  const { t } = useT();
  return (
    <View style={s.col}>
      <Divider />
      {unverified ? <Reveal i={0}><NoticeCard tone="warn" icon="alert-triangle" text={t("cxIn.sourceUnverified")} /></Reveal> : null}
      <Reveal i={1}><NoticeCard tone="info" icon="info" text={disclaimer || t("cxIn.disclaimer")} /></Reveal>
      <Reveal i={2}><FeedbackPanel requestId={leadId} /></Reveal>
      {urgent ? null : <Reveal i={3}><SosRow /></Reveal>}
    </View>
  );
}

const s = StyleSheet.create({ col: { gap: 12 } });
