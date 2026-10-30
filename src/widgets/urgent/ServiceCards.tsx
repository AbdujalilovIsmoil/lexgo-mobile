import { useState, type ReactNode } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { ErrorView, Skeleton } from "@/shared/ui";
import { buildCards, orderHref, useCatalog, type UrgentCard } from "@/entities/urgent";
import { KindSheet } from "./KindSheet";
import { ServiceCard } from "./ServiceCard";

type Cell = { key: string; node: ReactNode };

// The services in catalog order, one per row: a ticket each, and the ones that go straight to the advocate on duty lit in their own
// colour. A grouped box asks for its kind first, a single one opens the form.
export function ServiceCards() {
  const router = useRouter();
  const cat = useCatalog();
  const [kinds, setKinds] = useState<UrgentCard | null>(null);
  const go = (key: string) => {
    setKinds(null);
    router.push(orderHref(key, "urgent"));
  };
  if (cat.isLoading) return <View style={{ gap: 10 }}>{[0, 1, 2].map((i) => <Skeleton key={i} height={150} round={20} />)}</View>;
  if (cat.isError) return <ErrorView error={cat.error} onRetry={() => void cat.refetch()} compact />;
  const cells: Cell[] = buildCards(cat.data).map((c) => ({ key: c.key, node: <ServiceCard card={c} onPress={() => (c.group ? setKinds(c) : go(c.items[0].key))} /> }));
  return (
    <View style={{ gap: 10 }}>
      {cells.map((cell) => <View key={cell.key}>{cell.node}</View>)}
      <KindSheet card={kinds} onClose={() => setKinds(null)} onPick={go} />
    </View>
  );
}
