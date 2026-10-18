import { StyleSheet, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useLawyer } from "@/entities/lawyer";
import { SpecialistSkeleton } from "@/widgets/specialist-profile";
import { EmptyState, ErrorView, Header } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";
import { SpecialistView, type SpecialistTab } from "./SpecialistView";

// /specialist/<userId> — the specialist's own page (web /portal/client/lawyers/<id>). GET /marketplace/lawyers/{id}
// (falling back to the /lawyers list) fills it; it loads as a skeleton.
export function SpecialistPage() {
  const { t } = useT();
  const c = useColors();
  const { id, tab } = useLocalSearchParams<{ id: string; tab?: string }>();
  const q = useLawyer(id ?? "");
  if (q.isPending) return <SpecialistSkeleton />;
  if (q.error || !q.data) {
    return (
      <View style={[s.fill, { backgroundColor: c.bg }]}>
        <Header />
        {q.error ? <ErrorView error={q.error} onRetry={() => void q.refetch()} /> : <EmptyState icon="user-x" title={t("mkd.notFound")} text={t("mkd.notFoundText")} />}
      </View>
    );
  }
  const initial: SpecialistTab = tab === "about" || tab === "reviews" ? tab : "services";
  return <SpecialistView lawyer={q.data} initialTab={initial} />;
}

const s = StyleSheet.create({ fill: { flex: 1 } });
