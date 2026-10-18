import { useMemo, useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ChipBar, PagedList, SearchBox } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import { MemberRow, useDashboard, type OrgMember } from "@/entities/organization";

type Filter = "all" | "verified" | "pending" | "busy";
const OK = new Set(["approved", "verified"]);
const busy = (m: OrgMember) => m.workload.orders + m.workload.cases + m.workload.urgent > 0;
const PASS: Record<Filter, (m: OrgMember) => boolean> = { all: () => true, verified: (m) => OK.has(m.verification), pending: (m) => !OK.has(m.verification), busy };

// The organization's members: search by name / role, filter by verification or load; tap opens the member.
export function MemberList({ orgId }: { orgId: string }) {
  const { t } = useT();
  const router = useRouter();
  const q = useDashboard(orgId);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const all = useMemo(() => q.data?.members ?? [], [q.data]);
  const rows = useMemo(() => {
    const needle = text.trim().toLowerCase();
    return all.filter((m) => PASS[filter](m) && (!needle || `${m.name} ${m.title} ${m.lexgoId}`.toLowerCase().includes(needle)));
  }, [all, text, filter]);
  const count = (f: Filter) => all.filter(PASS[f]).length;
  return (
    <PagedList
      data={rows}
      query={q}
      keyExtractor={(m) => m.userId}
      renderItem={(m) => <MemberRow member={m} onPress={() => router.push(`/org/members/${encodeURIComponent(m.userId)}` as never)} />}
      empty={{ icon: "users", title: t("og3.empty"), text: all.length ? t("og3.noMatch") : t("og3.emptyText") }}
      header={
        <View style={{ gap: 8, marginHorizontal: -16, marginBottom: 12 }}>
          <SearchBox value={text} onChangeText={setText} placeholder={t("og3.search")} />
          <ChipBar value={filter} onChange={setFilter} options={(["all", "verified", "pending", "busy"] as Filter[]).map((f) => ({ value: f, label: t(`og3.filter.${f}`), count: count(f) }))} />
        </View>
      }
    />
  );
}
