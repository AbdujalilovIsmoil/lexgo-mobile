import { usePathname } from "expo-router";
import { GiftNudge } from "@/features/gift-nudge";
import { SupportMenu } from "@/features/support-menu";
import { registerHeaderExtra, registerHeaderRight } from "@/shared/ui/headerExtra";
import { useTabRole } from "@/widgets/tab-bar/useTabRole";

// What the shared page header shows for signed-in clients: the upsell banner under it and the
// support headset at its right end (sellers get the headset too, without the complaint row).
// A conversation (or the emergency / order page) needs the whole screen, so no banner sits above it; neither do the documents
// catalogue, the specialists directory, the works list and my documents, whose search has to be the first thing under the title, nor the new-complaint form.
const CHAT = /^\/(support\/(?!new)[^/]+|chat\/|manage\/chat|manage\/support\/ticket|cc\/assist\/|sos$|urgent(\/new)?$|services$|services\/direction$|(m\/)?lawyers$|(m\/)?works$|documents$|complaints\/new$)/;

function NudgeSlot() {
  const inChat = CHAT.test(usePathname());
  return <GiftNudge enabled={useTabRole() === "client" && !inChat} />;
}

function SupportSlot({ glass }: { glass?: boolean }) {
  const role = useTabRole();
  return role === "client" || role === "seller" ? <SupportMenu glass={glass} client={role === "client"} /> : null;
}

registerHeaderExtra(NudgeSlot);
registerHeaderRight(SupportSlot);
