import type { IconName } from "@/shared/ui";
import type { Access } from "./access";

export type GroupKey = "command" | "sales" | "catalog" | "studio" | "sellers" | "finance" | "support" | "system" | "internal";
export const GROUP_ORDER: GroupKey[] = ["command", "sales", "catalog", "studio", "sellers", "finance", "support", "internal", "system"];

export type AdminModule = {
  key: string; // also the i18n key (admHub.mod.<key>) and the route /manage/<key>
  group: GroupKey;
  icon: IconName;
  color: string;
  visible: (a: Access) => boolean; // same rules as the web AdminShell nav
  demoOnly?: boolean; // shown only where the backend's demo routes exist (staging)
};

