import type { ReactElement } from "react";
import { Pill } from "@/shared/ui";
import { CcTicket } from "@/shared/ui/cc";
import { PagedList } from "@/shared/ui/admin";
import { groupMeta, listRecords, studioKeys, useStudioText, type StudioRecord } from "@/entities/admin-studio";
import { timeAgo } from "@/shared/lib/format";
import { usePaged } from "@/shared/lib/usePaged";

type Props = { code: string; group: string; header: ReactElement; onOpen: (r: StudioRecord) => void };

// The constructor's catalogue: published runtime records and studio objects together, opened through the form context.
export function RecordsList({ code, group, header, onOpen }: Props) {
  const { t } = useStudioText();
  const { items, query } = usePaged([...studioKeys.all, "records", code], ({ limit, offset }) => listRecords(code, limit, offset).then((r) => ({ items: r.items, total: r.total, hasMore: offset + r.items.length < r.total })));
  return (
    <PagedList
      data={items}
      query={query}
      keyExtractor={(r) => `${r.source}:${r.id}`}
      header={header}
      empty={{ icon: "inbox", title: t("ntd.studioV2.noRecords") }}
      renderItem={(r) => (
        <CcTicket
          tint={groupMeta(group).color}
          icon="database"
          title={r.title || t("admStudio.list.untitled")}
          badge={r.status ? <Pill label={r.status} tone={r.status === "active" ? "ok" : "gray"} small /> : undefined}
          chips={<>{r.objectId ? <Pill label={t("ntd.studioV2.hasObject")} tone="blue" icon="edit-3" small /> : null}{r.updatedAt ? <Pill label={timeAgo(r.updatedAt, t)} tone="gray" icon="clock" small /> : null}</>}
          onPress={() => onOpen(r)}
        />
      )}
    />
  );
}
