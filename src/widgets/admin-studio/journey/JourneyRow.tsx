import { StyleSheet, View } from "react-native";
import { Button, Card, Pill, Text } from "@/shared/ui";
import { ProgressBar } from "@/shared/ui/charts";
import { tOr } from "@/shared/lib/pro/tOr";
import { fmtDate } from "@/shared/lib/format";
import { useSession } from "@/entities/session";
import type { Journey } from "@/entities/admin-studio";
import { useT } from "@/shared/i18n";

const TONE = { draft: "gray", in_progress: "blue", completed: "ok", abandoned: "err", archived: "gray" } as const;

type Props = { item: Journey; onPress: () => void; onAct?: (a: "abandon" | "archive" | "restore") => void };

// One creation process, as in the web's list: its name, the status, who started it and when, a progress bar with the percent and the
// step it is on; and the actions the server allows (stop, archive, restore).
export function JourneyRow({ item, onPress, onAct }: Props) {
  const { t, locale } = useT();
  const me = useSession()?.user.id ?? "";
  const type = tOr(t, `admStudioD.journeys.types.${item.type}`, item.type);
  const owner = item.ownerId && item.ownerId === me ? t("admStudioD.jlist.ownerYou") : item.ownerName ? t("admStudioD.jlist.ownerLine", { name: item.ownerName }) : t("admStudioD.jlist.ownerOther");
  const step = item.steps.find((s) => s.key === item.currentStep);
  const stepName = step ? tOr(t, `admStudioD.create.step.${step.key}`, step.title) : "";
  const a = item.actions;
  return (
    <Card onPress={onPress} style={s.card}>
      <View style={s.head}>
        <Text variant="body" weight="bold" numberOfLines={2} style={s.fill}>{item.title || type}</Text>
        <Pill small tone={TONE[item.status as keyof typeof TONE] ?? "gray"} label={tOr(t, `admStudioD.journeys.status.${item.status}`, item.status)} />
      </View>
      <Text variant="caption" tone="gray" numberOfLines={1}>{[type, owner, item.createdAt ? t("admStudioD.jlist.startedOn", { when: fmtDate(item.createdAt, locale) }) : ""].filter(Boolean).join(" · ")}</Text>
      <View style={s.prog}>
        <View style={s.fill}><ProgressBar value={item.percent / 100} /></View>
        <Text variant="caption" weight="bold" tone="gray">{item.percent}%</Text>
      </View>
      <Text variant="caption" tone="gray2" numberOfLines={1}>{t("admStudioD.journeys.progress", { done: item.done, total: item.total })}{stepName && item.status !== "completed" ? ` · ${t("admStudioD.jlist.stepNow")}: ${stepName}` : ""}</Text>
      {onAct && (a.abandon || a.archive || a.restore) ? (
        <View style={s.acts}>
          {a.abandon ? <Button title={t("admStudioD.jlist.abandon")} icon="x-circle" variant="line" size="sm" onPress={() => onAct("abandon")} /> : null}
          {a.archive ? <Button title={t("admStudioD.jlist.archive")} icon="archive" variant="line" size="sm" onPress={() => onAct("archive")} /> : null}
          {a.restore ? <Button title={t("admStudioD.jlist.restore")} icon="rotate-ccw" variant="soft" size="sm" onPress={() => onAct("restore")} /> : null}
        </View>
      ) : null}
    </Card>
  );
}

const s = StyleSheet.create({
  card: { padding: 14, gap: 8 },
  head: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  fill: { flex: 1 },
  prog: { flexDirection: "row", alignItems: "center", gap: 10 },
  acts: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 2 },
});
