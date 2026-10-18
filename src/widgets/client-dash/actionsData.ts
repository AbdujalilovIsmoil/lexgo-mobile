import type { IconName } from "@/shared/ui";

// QUICK_ACTIONS of law-main portal/client/page.tsx, in the same order; `art` is the cut-out in assets/dash.
export type DashAction = { key: string; icon: IconName; art: number; href?: string; sub?: boolean; primary?: boolean; live?: boolean };

export const DASH_ACTIONS: DashAction[] = [
  { key: "describe", icon: "message-circle", art: require("../../../assets/dash/card-muammoni-tavsiflash.png"), sub: true, primary: true },
  { key: "urgent", icon: "zap", art: require("../../../assets/dash/card-advokatga-tezkor-boglanish.png"), href: "/urgent", sub: true, live: true },
  { key: "findSpecialist", icon: "search", art: require("../../../assets/dash/card-mutaxassis-topish.png"), href: "/(tabs)/lawyers", sub: true },
  { key: "consultation", icon: "alert-circle", art: require("../../../assets/dash/card-avtoavariya-huquqiy-konsultatsiya.png"), href: "/urgent/new?service=traffic_accident_consultation" },
  { key: "askAi", icon: "star", art: require("../../../assets/dash/card-lexgo-ai-sorash.png"), href: "/(tabs)/ai", sub: true },
  { key: "upload", icon: "download", art: require("../../../assets/dash/card-hujjat-tahlili.png"), href: "/doc-analysis", sub: true },
];
