import { View } from "react-native";
import { useCatalog } from "@/entities/urgent";
import { HeaderExtra } from "@/shared/ui";
import { MineLink } from "./MineLink";
import { ServiceList } from "./ServiceList";
import { UrgentHero } from "./UrgentHero";
import { UrgentNote } from "./UrgentNote";

// The fixed top of the client's /urgent, above the scroll: the header and the hero as one blue block that never scrolls.
export function UrgentTop() {
  const cat = useCatalog();
  return <UrgentHero cat={cat.data} loading={cat.isLoading} />;
}

// The scrolling part of the client's /urgent, under UrgentTop: the "request sent" note, every service as a row ("Xizmatni tanlang",
// the document flows last) and the "Mening so'rovlarim" row.
export function ClientHeader() {
  return (
    <>
      <HeaderExtra />
      <View style={{ gap: 14, paddingHorizontal: 16, paddingTop: 14 }}>
        <UrgentNote />
        <ServiceList />
        <MineLink />
      </View>
    </>
  );
}
