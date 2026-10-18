import { Pill } from "@/shared/ui";
import { RowCard } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { fmtDate } from "@/shared/lib/format";
import { needsAction, type ConsentItem } from "../types";

// One legal document: version, when it was accepted, and whether it needs the user's answer.
export function ConsentRowCard({ item, onPress }: { item: ConsentItem; onPress: () => void }) {
  const { t, locale } = useT();
  const title = locale === "ru" && item.titleRu ? item.titleRu : item.title;
  const state = !item.accepted ? "py7.state.todo" : item.requiresReaccept ? "py7.state.again" : "py7.state.ok";
  return (
    <RowCard
      icon="file-text"
      title={title}
      subtitle={`${t("py7.version", { v: item.version })}${item.acceptedAt ? ` · ${fmtDate(item.acceptedAt, locale)}` : ""}`}
      onPress={onPress}
      right={<Pill label={t(state)} tone={needsAction(item) ? "warn" : "ok"} icon={needsAction(item) ? undefined : "check"} small />}
    />
  );
}
