import { View } from "react-native";
import { EmptyState, Text } from "@/shared/ui";
import { QueryBoundary } from "@/shared/ui/admin";
import { useT } from "@/shared/i18n";
import type { CandidateSource } from "../model/useCandidateSource";
import { CandidateRow } from "./CandidateRow";

type Props = { src: CandidateSource; ids: string[]; full: boolean; onToggle: (id: string) => void };

// Matching advocates first; those off the request's direction last, behind a warning.
export function CandidateList({ src, ids, full, onToggle }: Props) {
  const { t } = useT();
  const row = (c: (typeof src.matched)[number]) => (
    <CandidateRow key={c.userId} c={c} picked={ids.includes(c.userId)} disabled={full && !ids.includes(c.userId)} onPress={() => onToggle(c.userId)} />
  );
  return (
    <QueryBoundary query={src.query}>
      {src.matched.length + src.mismatched.length === 0 ? (
        <EmptyState compact icon="users" title={t("admCc.noAdvocates")} />
      ) : (
        <View style={{ gap: 10 }}>
          {src.matched.map(row)}
          {src.mismatched.length ? <Text variant="small" tone="warn">{t("admCc.offDirectionLead")}</Text> : null}
          {src.mismatched.map(row)}
        </View>
      )}
    </QueryBoundary>
  );
}
