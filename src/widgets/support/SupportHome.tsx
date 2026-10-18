import { View } from "react-native";
import { Text } from "@/shared/ui";
import { useT } from "@/shared/i18n";
import type { SupportTicket } from "@/entities/support";
import { AiAskCard } from "./AiAskCard";
import { OngoingSection } from "./OngoingSection";
import { OperatorCard } from "./OperatorCard";
import { OtherWays } from "./OtherWays";
import { SupportHero } from "./SupportHero";

type Props = { ongoing: SupportTicket[]; more: boolean; onAll: () => void; onStart: (force: boolean) => void };

// Top of the help centre in the web hub's order: title + hours badge, ongoing chats, AI, operator, other ways.
export function SupportHome({ ongoing, more, onAll, onStart }: Props) {
  const { t } = useT();
  return (
    <View style={{ gap: 16, paddingTop: 4, paddingBottom: 12 }}>
      <SupportHero />
      <OngoingSection items={ongoing} more={more} onAll={onAll} />
      <AiAskCard onOperator={() => onStart(false)} />
      <OperatorCard onStart={() => onStart(false)} />
      <Text variant="h4">{t("sp1.other")}</Text>
      <OtherWays />
    </View>
  );
}
