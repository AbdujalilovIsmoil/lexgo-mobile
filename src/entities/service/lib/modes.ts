import type { IconName } from "@/shared/ui";

export type ModeKey = "consult" | "prep" | "review";
export type Mode = { key: ModeKey; icon: IconName; colors: [string, string]; titleKey: string; descKey: string };

// The three things people come to the catalogue for (servicesPage.tabs on the web).
export const MODES: Mode[] = [
  { key: "consult", icon: "message-circle", colors: ["#1668F0", "#00A6E6"], titleKey: "svc.modes.consultation.title", descKey: "svc.modes.consultation.desc" },
  { key: "prep", icon: "file-text", colors: ["#6A4DFF", "#A98BFF"], titleKey: "svc.modes.docPrep.title", descKey: "svc.modes.docPrep.desc" },
  { key: "review", icon: "check-square", colors: ["#00A870", "#3DDC97"], titleKey: "svc.modes.docReview.title", descKey: "svc.modes.docReview.desc" },
];
