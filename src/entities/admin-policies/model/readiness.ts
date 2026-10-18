// Status words of the readiness checklist: done / waiting on someone / failing.
export const READY_OK = ["ok", "ready", "done", "pass", "passed", "true", "configured", "production_ready"];
export const READY_WARN = ["needs_review", "warning", "partial", "pending", "needs_external_integrations"];
export const readinessOk = (status: string) => READY_OK.includes(status);
export const readinessTone = (status: string) => (readinessOk(status) ? "ok" : READY_WARN.includes(status) ? "warn" : "err");
