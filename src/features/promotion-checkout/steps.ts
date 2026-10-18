export type StepKey = "place" | "package" | "banner" | "confirm";

/** The steps of the wizard: the banner step exists only when the chosen package takes a banner picture. */
export const stepsFor = (acceptsBanner: boolean): StepKey[] => (acceptsBanner ? ["place", "package", "banner", "confirm"] : ["place", "package", "confirm"]);

type Gate = { placement: boolean; needsService: boolean; hasService: boolean; hasPackage: boolean; bannerBlocked: boolean; ready: boolean };

/** May the seller leave this step forward? (The last step is «ready to send».) */
export function canLeave(step: StepKey, g: Gate): boolean {
  if (step === "place") return g.placement && (!g.needsService || g.hasService);
  if (step === "package") return g.hasPackage;
  if (step === "banner") return !g.bannerBlocked;
  return g.ready;
}

/** The step to show: the asked one, or the nearest earlier step when it no longer exists (the banner step vanished). */
export function visibleStep(steps: StepKey[], want: StepKey): StepKey {
  return steps.includes(want) ? want : steps[Math.min(1, steps.length - 1)];
}
