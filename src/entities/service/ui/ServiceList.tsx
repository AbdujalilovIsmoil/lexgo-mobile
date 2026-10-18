import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ServiceCard } from "./ServiceCard";
import { ServiceCardSkeleton } from "./ServiceCardSkeleton";
import type { Service } from "../model/types";
import { Button, EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";

type Props = { services?: Service[]; loading?: boolean; onPick: (s: Service) => void; limit?: number };

// Service cards. Shows `limit` first; "Show more · N" reveals the rest.
export function ServiceList({ services, loading, onPick, limit = 6 }: Props) {
  const { t } = useT();
  const [shown, setShown] = useState(limit);
  if (loading) return <View style={s.col}>{[0, 1, 2].map((i) => <ServiceCardSkeleton key={i} />)}</View>;
  if (!services?.length) return <EmptyState icon="search" title={t("svc.noResults")} compact />;
  const left = services.length - shown;
  return (
    <View style={s.col}>
      {services.slice(0, shown).map((sv) => <ServiceCard key={sv.id} service={sv} onPress={() => onPick(sv)} />)}
      {left > 0 ? <Button title={`${t("svc.showMore")} · ${left}`} onPress={() => setShown(shown + limit)} variant="soft" full /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  col: { gap: 10 },
});
