import { ScrollView } from "react-native";
import type { Folder } from "@/entities/pro-files";
import { useT } from "@/shared/i18n";
import { Chip } from "@/shared/ui";

// Breadcrumb: "Root › Folder › Sub", each part jumps back to that level.
export function Crumbs({ chain, onGo }: { chain: Folder[]; onGo: (id: string) => void }) {
  const { t } = useT();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, alignItems: "center" }}>
      <Chip label={t("aw8.root")} icon="home" active={chain.length === 0} onPress={() => onGo("")} />
      {chain.map((f, i) => <Chip key={f.id} label={f.name} icon="chevron-right" active={i === chain.length - 1} onPress={() => onGo(f.id)} />)}
    </ScrollView>
  );
}
