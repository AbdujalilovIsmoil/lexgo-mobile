import type { OnbStep } from "../model/types";
import { docStatus, heroKind, missingRequired, nextStep, stepStates, stepTarget, submitReadiness } from "./journey";
import { percentDone } from "./state";

const st = (key: string, completed: boolean, required = true): OnbStep => ({ key, title: key, required, completed });

describe("stepStates", () => {
  it("marks done, the first open required as current, others todo / optional", () => {
    const steps = [st("profile", true), st("identity", false), st("documents", false), st("pricing", false, false)];
    expect(stepStates(steps)).toEqual(["done", "current", "todo", "optional"]);
  });
  it("has no current step when only optional ones are open", () => {
    expect(stepStates([st("a", true), st("b", false, false)])).toEqual(["done", "optional"]);
  });
  it("finds the next step and counts missing required ones", () => {
    const steps = [st("a", true), st("b", false), st("c", false), st("d", false, false)];
    expect(nextStep(steps)?.key).toBe("b");
    expect(missingRequired(steps)).toBe(2);
  });
});

describe("submitReadiness", () => {
  const all = [st("a", true), st("b", true), st("c", false, false)];
  it("is ready when all required steps are done", () => expect(submitReadiness("ready", all)).toEqual({ mode: "ready", canSubmit: true, missing: 0 }));
  it("is blocked with a count otherwise", () => expect(submitReadiness("incomplete", [st("a", false), st("b", false)])).toEqual({ mode: "blocked", canSubmit: false, missing: 2 }));
  it("is blocked without steps", () => expect(submitReadiness("incomplete", []).canSubmit).toBe(false));
  it("hides when approved and waits while submitted", () => {
    expect(submitReadiness("approved", all).mode).toBe("hidden");
    expect(submitReadiness("submitted", all).mode).toBe("waiting");
  });
  it("allows a resubmit after a rejection", () => expect(submitReadiness("rejected", all).canSubmit).toBe(true));
});

describe("heroKind / percent / targets / doc status", () => {
  it("separates fresh from in progress", () => {
    expect(heroKind("incomplete", 0)).toBe("fresh");
    expect(heroKind("incomplete", 2)).toBe("progress");
    expect(heroKind("rejected", 3)).toBe("rejected");
  });
  it("percentDone rounds and guards empty", () => {
    expect(percentDone(undefined)).toBe(0);
    expect(percentDone({ status: "", completed: 1, total: 3, steps: [], reason: "" })).toBe(33);
    expect(percentDone({ status: "", completed: 0, total: 0, steps: [], reason: "" })).toBe(0);
  });
  it("routes steps", () => {
    expect(stepTarget("documents")).toEqual({ kind: "docs" });
    expect(stepTarget("identity")).toEqual({ kind: "route", path: "/security" });
    expect(stepTarget("zzz")).toBeNull();
  });
  it("maps document statuses", () => {
    expect(docStatus("REJECTED")).toBe("rejected");
    expect(docStatus("approved")).toBe("approved");
    expect(docStatus("in_review")).toBe("review");
    expect(docStatus("")).toBe("uploaded");
    expect(docStatus("new")).toBe("uploaded");
  });
});
