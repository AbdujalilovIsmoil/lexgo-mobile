import { useRouter } from "expo-router";
import { Button } from "@/shared/ui";
import { useT } from "@/shared/i18n";

// Empty AI/search result: hand the client to an operator (web: /support?topic=marketplace).
export function AskSupport() {
  const { t } = useT();
  const router = useRouter();
  return <Button title={t("mk2.askSupport")} icon="headphones" variant="soft" full onPress={() => router.navigate({ pathname: "/support", params: { new: "1", topic: "marketplace" } })} />;
}
