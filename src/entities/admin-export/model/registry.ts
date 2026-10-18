import type { Access } from "@/entities/access";
import { CORE_EXPORTS } from "./registryCore";
import { MONEY_EXPORTS } from "./registryMoney";
import { OPS_EXPORTS } from "./registryOps";
import type { ExportDef } from "./types";

export const EXPORTS: ExportDef[] = [...CORE_EXPORTS, ...MONEY_EXPORTS, ...OPS_EXPORTS];
export const exportByKey = (key: string): ExportDef | undefined => EXPORTS.find((e) => e.key === key);
export const visibleExports = (a: Access): ExportDef[] => EXPORTS.filter((e) => e.visible(a));
