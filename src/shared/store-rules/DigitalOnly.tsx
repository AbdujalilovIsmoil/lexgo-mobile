import type { ReactNode } from "react";
import { Redirect } from "expo-router";
import { DIGITAL_SALES } from "./rules";

// Route guard for a digital-goods screen: on iOS a link, push or deep link that still lands here goes home instead (the tab layout then
// sends a professional to their workspace).
export function DigitalOnly({ children }: { children: ReactNode }) {
  return DIGITAL_SALES ? <>{children}</> : <Redirect href="/" />;
}
