import { useMemo, useState } from "react";
import { View } from "react-native";
import { ACTIVITY_GROUPS, ActivityRow, groupOf, useActivity } from "@/entities/security";
import { EmptyState } from "@/shared/ui";
import { ProfileSection, RowsSkeleton, ShowMore, useShowMore } from "@/shared/ui/profile";
import { ChipBar, SearchBox } from "@/shared/ui/admin";
import { useDebounced } from "@/shared/lib/useDebounced";
import { useT } from "@/shared/i18n";

// Web "Harakatlar jurnali" panel: group chips with counts + search over the user's own audit log (first 100).
export function ActivityPanel() {
  const { t } = useT();
  const q = useActivity();
  const [group, setGroup] = useState("all");
  const [search, setSearch] = useState("");
  const needle = useDebounced(search, 250).trim().toLowerCase();
  const all = useMemo(() => q.data ?? [], [q.data]);
  const found = useMemo(() => (needle ? all.filter((a) => `${a.action} ${a.detail} ${a.titleUz} ${a.descriptionUz} ${a.ip}`.toLowerCase().includes(needle)) : all), [all, needle]);
  const rows = group === "all" ? found : found.filter((a) => groupOf(a.action) === group);
  const page = useShowMore(rows.slice(0, 100), `${group}|${needle}`);
  const count = (g: string) => found.filter((a) => groupOf(a.action) === g).length;
  const options = [{ value: "all", label: t("adm.all"), count: found.length }, ...ACTIVITY_GROUPS.map((g) => ({ value: g, label: t(`admSecC.grp.${g}`), count: count(g) }))];
  return (
    <ProfileSection accent="slate" icon="clock" title={t("cpr.activity")} caption={q.data ? t("cpr.rows", { n: rows.length }) : undefined}>
      {all.length ? (
        <View style={{ marginHorizontal: -16, gap: 8 }}>
          <ChipBar options={options} value={group} onChange={setGroup} />
          <SearchBox value={search} onChangeText={setSearch} placeholder={t("admSecC.searchPh")} />
        </View>
      ) : null}
      {q.isLoading ? <RowsSkeleton n={1} /> : !rows.length ? (
        <EmptyState compact icon={all.length ? "search" : "clock"} title={t(all.length ? "admSecC.noMatch" : "admSecC.actEmpty")} text={t(all.length ? "admSecC.noMatchText" : "admSecC.actEmptyText")} />
      ) : (
        <View>{page.visible.map((a, i, arr) => <ActivityRow key={a.id} item={a} last={i === arr.length - 1} />)}<ShowMore left={page.left} expanded={page.expanded} onMore={page.more} onLess={page.less} /></View>
      )}
    </ProfileSection>
  );
}
