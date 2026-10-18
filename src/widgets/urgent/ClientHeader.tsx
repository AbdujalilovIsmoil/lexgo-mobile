import { View } from "react-native";
import { useCatalog } from "@/entities/urgent";
import { ServiceCards } from "./ServiceCards";
import { UrgentHero } from "./UrgentHero";
import { UrgentNote } from "./UrgentNote";

// Top of /urgent: the hero, the service grid (its last tile: the document flows) (the requests follow in MineSection).
export function ClientHeader() {
  const cat = useCatalog();
  return (
    <View style={{ gap: 14, paddingBottom: 14 }}>
      <UrgentHero cat={cat.data} loading={cat.isLoading} />
      <UrgentNote />
      <ServiceCards withDocs />
    </View>
  );
}
