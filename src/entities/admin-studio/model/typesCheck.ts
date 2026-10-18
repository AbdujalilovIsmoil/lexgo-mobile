// The server's verdict on a draft (POST /studio/constructors/{code}/validate + /preview — a dry run, nothing is saved).
export type CheckError = { field: string; code: string; message: string };
export type StudioCheck = {
  ok: boolean; errors: CheckError[];
  target: string; operation: string; requiresApproval: boolean; warnings: string[];
  changed: string[]; // fields the draft would change on the runtime object
};
