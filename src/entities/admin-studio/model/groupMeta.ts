import type { IconName } from "@/shared/ui";

type GroupMeta = { icon: IconName; color: string };

// Icon and colour of the ten backend groups (ids from GET /studio/constructors). Advertising stays separate and last.
const GROUPS: Record<string, GroupMeta> = {
  services_packages: { icon: "package", color: "#3B82F6" },
  documents_texts: { icon: "file-text", color: "#8B5CF6" },
  process_quality: { icon: "check-square", color: "#22C55E" },
  communications: { icon: "message-circle", color: "#06B6D4" },
  finance_tariffs: { icon: "credit-card", color: "#F59E0B" },
  security_access: { icon: "shield", color: "#EF4444" },
  operations: { icon: "tool", color: "#0EA5E9" },
  integrations: { icon: "link", color: "#14B8A6" },
  system_reference: { icon: "database", color: "#64748B" },
  advertising: { icon: "volume-2", color: "#EC4899" },
};

export const groupMeta = (key: string): GroupMeta => GROUPS[key] ?? { icon: "grid", color: "#64748B" };
