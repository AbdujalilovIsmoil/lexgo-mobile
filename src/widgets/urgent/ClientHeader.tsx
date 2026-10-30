import { View } from "react-native";
import { useCatalog } from "@/entities/urgent";
import { MineLink } from "./MineLink";
import { ServiceList } from "./ServiceList";
import { UrgentHero } from "./UrgentHero";
import { UrgentNote } from "./UrgentNote";

// The client's /urgent: the compact hero, the "request sent" note, every service as a row ("Xizmatni tanlang", the document flows
// last) and the "Mening so'rovlarim" row.
export function ClientHeader() {
  const cat = useCatalog();
  return (
    <View style={{ gap: 14 }}>
      <UrgentHero cat={cat.data} loading={cat.isLoading} />
      <UrgentNote />
      <ServiceList />
      <MineLink />
    </View>
  );
}
