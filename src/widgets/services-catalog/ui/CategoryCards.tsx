import type { ServiceCategory } from "@/entities/service";
import { EmptyState } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import { categoryImage } from "@/entities/service";
import { CardGrid } from "./CardGrid";
import { SubcatCard } from "./SubcatCard";

// Older backend (no subcategories): the plain list of areas, each opens its own directions.
export function CategoryCards({ cats, onOpen }: { cats: ServiceCategory[]; onOpen: (id: string) => void }) {
  const { t } = useT();
  if (!cats.length) return <EmptyState icon="briefcase" title={t("csv.empty")} text={t("csv.emptyText")} compact />;
  return (
    <CardGrid>
      {cats.map((c, i) => <SubcatCard key={c.id} name={c.name} count={c.servicesCount} index={i} family={c.description} samples={[]} art={categoryImage(c.name)} onPress={() => onOpen(c.id)} />)}
    </CardGrid>
  );
}

