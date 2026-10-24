import { Stack } from "expo-router";
import { AdminDrawerHost } from "@/widgets/admin-drawer";

// Admin module screens (opened from the Boshqaruv tab). The host adds the module switcher
// (edge handle + left drawer; a permanent rail on tablets) to every screen of the area.
export default function ManageLayout() {
  return (
    <AdminDrawerHost>
      <Stack screenOptions={{ headerShown: false, animation: "slide_from_right", freezeOnBlur: true }} />
    </AdminDrawerHost>
  );
}
