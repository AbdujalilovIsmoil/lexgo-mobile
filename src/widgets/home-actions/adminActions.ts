import type { AdminModule } from "@/entities/access";
import { lighten } from "@/shared/lib/color";
import type { QuickAction } from "./actions";

// The admin modules staff reach most often, shown first on their Home rail.
export const ADMIN_SHORTCUTS = ["internal", "pipeline", "callcenter", "support", "meetings", "approvals", "payouts", "ceo"];

export const adminAction = (m: AdminModule, label: string): QuickAction => ({ key: `adm-${m.key}`, icon: m.icon, colors: [m.color, lighten(m.color)], href: `/manage/${m.key}`, auth: true, label });
