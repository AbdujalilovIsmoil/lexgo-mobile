import type { InstructorContract } from "@/entities/instructor";
import { setTargetAliases } from "@/shared/instructor";

// The live contract, readable from non-React code (the command runner).
let active: InstructorContract | null = null;

export function setActiveContract(c: InstructorContract | null | undefined): void {
  active = c ?? null;
  setTargetAliases(active?.targetAliases);
}

export const activeContract = (): InstructorContract | null => active;
