import { View } from "react-native";
import { useRouter } from "expo-router";
import { RoleGate } from "@/entities/access";
import { useIsAuthed } from "@/entities/session";
import { UrgentTab } from "@/pages/urgent/UrgentPage";
import { lazyTab } from "@/widgets/tab-page";
import { EmptyState } from "@/shared/ui";
import { useColors } from "@/shared/theme";
import { useT } from "@/shared/i18n";

// The client's centre tab, Tezkor: the urgent advocate page inside the tab bar (no back button). /urgent stays the same page as a stack screen
// for links from elsewhere (deep links, the menu). A visitor is sent to sign in by the bar itself; one who lands here anyway gets the sign-in
// button, not a redirect (a tab stays mounted, so a redirect would fire again on every return).
function Screen() {
  const authed = useIsAuthed();
  const router = useRouter();
  const c = useColors();
  const { t } = useT();
  if (!authed) {
    return (
      <View style={{ flex: 1, backgroundColor: c.canvas, justifyContent: "center" }}>
        <EmptyState icon="lock" title={t("ug1.title")} text={t("dc1.method.login")} actionLabel={t("auth.submit")} onAction={() => router.push("/auth/login")} />
      </View>
    );
  }
  return (
    <RoleGate roles={["client"]}>
      <UrgentTab />
    </RoleGate>
  );
}

export default lazyTab(Screen);
