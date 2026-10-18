import type { IconName } from "@/shared/ui";
import type { DocMode } from "../model/types";

// How the document is being produced: filled in by the client, drafted by AI, or by an advocate.
export const MODE_ICON: Record<DocMode, IconName> = { manual: "edit-3", ai: "cpu", lawyer: "briefcase" };
export const MODES: DocMode[] = ["manual", "ai", "lawyer"];
