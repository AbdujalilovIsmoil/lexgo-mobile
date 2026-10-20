export type JourneyStep = { key: string; title: string; code: string; formCode: string; sourceCode: string; order: number; required: boolean; fields: string[] };
export type JourneyActions = { update: boolean; abandon: boolean; archive: boolean; restore: boolean };
export type Journey = {
  id: string;
  type: string;
  title: string;
  status: string;
  steps: JourneyStep[];
  completed: string[];
  currentStep: string;
  done: number;
  total: number;
  percent: number;
  context: Record<string, unknown>;
  actions: JourneyActions;
  updatedAt: string;
};
export type JourneyDef = { type: string; steps: JourneyStep[] };
