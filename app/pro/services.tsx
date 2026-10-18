import { RoleGate } from "@/entities/access";
import { LocationCard } from "@/entities/location-sharing";
import ProServicesPage from "@/pages/pro-services/ProServicesPage";
import { PackagesPanel } from "@/widgets/package-list";

// Xizmatlar | Paketlar: the packages tab and the location-sharing card plug into the page's slots.
export default function Screen() {
  return (
    <RoleGate roles={["seller"]}>
      <ProServicesPage packages={<PackagesPanel scroll={false} />} aboveList={<LocationCard />} />
    </RoleGate>
  );
}
