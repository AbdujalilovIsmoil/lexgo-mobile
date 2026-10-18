import type { ReactNode } from "react";
import type { Service } from "./types";

// Widgets that list services do not import each other: the page hands them a
// renderer for the detail of a tapped service (back = return to the list,
// navigate = close the drawer, then move).
export type DetailRenderer = (service: Service, back: () => void, navigate: (fn: () => void) => void) => ReactNode;
