import { View } from "react-native";
import { useRouter } from "expo-router";
import { complaintStage, Stars, useComplaintDetail, useComplaintLabels, type ComplaintItem } from "@/entities/rating";
import { FormSheet } from "@/shared/ui/admin";
import { Button, Card, Skeleton, Text } from "@/shared/ui";
import { fmtDateTime } from "@/shared/lib/format";
import { useKept } from "@/shared/lib";
import { useT } from "@/shared/i18n";
import { ComplaintRelated } from "./ComplaintRelated";
import { ComplaintStateBox } from "./ComplaintStateBox";
import { ComplaintTimeline } from "./ComplaintTimeline";

// One complaint (web: ComplaintDetail): timeline, verdict, staff reply, your text / rating, linked work, chat.
export function ComplaintDetailSheet({ item, onClose }: { item: ComplaintItem | null; onClose: () => void }) {
  const { t, locale } = useT();
  const L = useComplaintLabels();
  const router = useRouter();
  const kept = useKept(item);
  const q = useComplaintDetail(item);
  const c = q.data ?? kept;
  if (!c) return <FormSheet visible={false} onClose={onClose} title="">{null}</FormSheet>;
  const stage = complaintStage(c.status);
  const decided = stage === "resolved" || stage === "rejected" || stage === "closed";
  const reviewed = decided || stage === "rework";
  const last = stage === "resolved" ? "ok" : stage === "rejected" ? "bad" : stage === "closed" ? "end" : stage === "rework" ? "rework" : "todo";
  const steps = [
    { tone: "done" as const, label: t("pwc.step.received"), sub: c.createdAt ? fmtDateTime(c.createdAt, locale) : "" },
    { tone: reviewed ? ("done" as const) : ("now" as const), label: t("pwc.step.review"), sub: reviewed ? "" : t(stage === "new" ? "pwc.step.queued" : "pwc.step.active") },
    { tone: last as "ok", label: t("pwc.step.decision"), sub: decided ? L.tag(c.status) : stage === "rework" ? L.stage("rework") : "" },
  ];
  const quality = c.kind === "quality";
  return (
    <FormSheet visible={!!item} onClose={onClose} title={c.subject || L.kind(c.kind)} subtitle={[quality ? L.kind("quality") : L.category(c.category) || L.kind("manual"), c.workId].filter(Boolean).join(" · ")}>
      <View style={{ gap: 14 }}>
        <ComplaintTimeline steps={steps} />
        <ComplaintStateBox c={c} />
        {c.operatorNote ? <Card style={{ gap: 4 }}><Text variant="caption" tone="gray">{t("pwc.reply.title")} · {c.operatorName || t("pwc.reply.staff")}</Text><Text variant="body">{c.operatorNote}</Text></Card> : null}
        {quality && q.isLoading ? <Skeleton height={44} round={14} /> : null}
        {quality && q.isError ? <Button title={t("pwc.detailError") + " · " + t("pwc.retry")} variant="line" size="sm" onPress={() => void q.refetch()} /> : null}
        {quality && !q.isLoading && !q.isError ? <Card style={{ gap: 6 }}><Text variant="small" weight="bold" tone="gray">{t("pwc.comment")}</Text>{c.stars ? <Stars value={c.stars} size={22} /> : null}<Text variant="body" tone={c.description ? "ink" : "gray"}>{c.description || t("pwc.noComment")}</Text></Card> : null}
        {!quality && c.description ? <Card style={{ gap: 6 }}><Text variant="small" weight="bold" tone="gray">{t("pwc.text")}</Text><Text variant="body">{c.description}</Text></Card> : null}
        <ComplaintRelated c={c} onClose={onClose} />
        <Button title={t("pwc.chatShort")} icon="message-circle" variant="line" size="sm" onPress={() => { onClose(); router.push("/support"); }} />
      </View>
    </FormSheet>
  );
}
