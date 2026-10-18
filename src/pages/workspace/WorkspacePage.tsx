import { View } from "react-native";
import { useColors } from "@/shared/theme";
import { OrgEntryCard } from "@/widgets/org-entry";
import { SellerHome } from "@/widgets/seller-home";
import { useTabPad } from "@/widgets/tab-page";

// Ish maydoni (the professional's home tab), laid out like the client's Home: the hero carries the header row itself, so the page
// is not wrapped in a TabPage (see widgets/seller-home).
export function WorkspacePage() {
  const c = useColors();
  const pad = useTabPad();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <SellerHome bottomPad={pad} orgEntry={<OrgEntryCard />} />
    </View>
  );
}
