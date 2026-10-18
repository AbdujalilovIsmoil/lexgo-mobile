export type InstructorContract = {
  version: string;
  commandTypes: string[];
  mutatingActions: string[];
  allowedRoutes: string[];
  routeAliases: Record<string, string>;
  targetAliases: Record<string, string>;
  role: string;
  targetsLimit: number;
};

// One thing the assistant asks the app to do (TZ 9 actions). Unknown `type`s are carried and ignored later.
export type Command = {
  id: string;
  type: string;
  href: string;
  target: string;
  modal: string;
  text: string;
  style: string;
  durationMs: number;
  fields: Record<string, string>;
  action: string;
  payload: Record<string, unknown>;
  steps: string[];
};

export type SupportOffer = { available: boolean; reason: string; action: string };

export type ChatReply = {
  sessionId: string;
  responseId: string;
  answer: string;
  intent: string;
  commands: Command[];
  steps: string[];
  suggestions: string[];
  missing: string[];
  support: SupportOffer;
};
