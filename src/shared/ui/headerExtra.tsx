import type { ComponentType } from "react";

// Two slots on every page header. The app layer registers components here (the client upsell
// banner under the header, the support headset at its right end), so shared UI can show them on
// all screens without importing a feature.
let Extra: ComponentType | null = null;
let Right: ComponentType<{ glass?: boolean }> | null = null;

export const registerHeaderExtra = (c: ComponentType | null) => { Extra = c; };
export const registerHeaderRight = (c: ComponentType<{ glass?: boolean }> | null) => { Right = c; };

export const HeaderExtra = () => (Extra ? <Extra /> : null);
export const HeaderRight = ({ glass }: { glass?: boolean }) => (Right ? <Right glass={glass} /> : null);
