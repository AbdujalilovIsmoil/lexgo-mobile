import type { OrgNode } from "@/entities/admin-hrm";

export const NODE_W = 168;
export const NODE_H = 108;
export const GAP_X = 22;
export const GAP_Y = 46;
export const LINE = 2;

export type Placed = { node: OrgNode; x: number; y: number; people: string[] };
export type Bar = { x: number; y: number; w: number; h: number };
export type Layout = { placed: Placed[]; bars: Bar[]; width: number; height: number };
