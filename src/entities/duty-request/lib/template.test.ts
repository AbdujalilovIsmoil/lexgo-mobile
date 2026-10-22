import { answersToSave, blockedBy, ctorPromptFor, markCtorAsked, rememberStarted, resetCtorAsked, resetStarted, reviewBody, startedDoc } from "./template";

jest.mock("@/shared/lib/sessionReset", () => ({ registerSessionReset: () => () => undefined }));

const ctor = { available: true, promptRequired: true, title: "T", message: "M" };

describe("reviewBody", () => {
  it("defaults to page_count 0 and urgency normal, and drops an empty document type", () => {
    expect(reviewBody({ need: "Ariza" })).toEqual({ need: "Ariza", page_count: 0, urgency: "normal" });
  });
  it("carries the document type, the language and an explicit urgency", () => {
    expect(reviewBody({ need: "x", requestedType: "Ariza", pageCount: 2, urgency: "urgent", language: "uz-latn" })).toEqual({ need: "x", requested_document_type: "Ariza", page_count: 2, urgency: "urgent", language: "uz-latn" });
  });
});

describe("blockedBy (README §11.5)", () => {
  const doc = { id: "d1", workId: "W-1", status: "open_pool", lawyerActive: true, canSend: false, blockReason: "Already with the lawyers" };
  it("opens the existing request while one is active and sending is not allowed", () => {
    expect(blockedBy(doc)).toEqual({ id: "d1", workId: "W-1", status: "open_pool", message: "Already with the lawyers" });
  });
  it("does not block when sending is allowed, nothing is active, or there is no request", () => {
    expect(blockedBy({ ...doc, canSend: true })).toBeNull();
    expect(blockedBy({ ...doc, lawyerActive: false })).toBeNull();
    expect(blockedBy(undefined)).toBeNull();
  });
});

describe("answersToSave", () => {
  it("saves a draft as the full object and never an empty one (PUT would wipe the server's answers)", () => {
    expect(answersToSave({ a: "1", b: "  " })).toEqual({ a: "1" });
    expect(answersToSave({ a: "  " })).toBeNull();
    expect(answersToSave(undefined)).toBeNull();
  });
});

describe("ctorPromptFor (README §12)", () => {
  beforeEach(resetCtorAsked);
  it("asks once, only when the backend asks and the request was created", () => {
    const r = { docId: "d1", created: true, ctor };
    expect(ctorPromptFor(r)).toEqual(ctor);
    markCtorAsked("d1");
    expect(ctorPromptFor(r)).toBeNull();
    expect(ctorPromptFor({ docId: "d2", created: true, ctor: { ...ctor, promptRequired: false } })).toBeNull();
    expect(ctorPromptFor({ docId: "d3", created: true, ctor: { ...ctor, available: false } })).toBeNull();
    expect(ctorPromptFor({ docId: "d4", created: false, ctor })).toBeNull();
    expect(ctorPromptFor({ docId: "d5", created: true, ctor: null })).toBeNull();
  });
});

describe("started requests", () => {
  beforeEach(resetStarted);
  it("remembers the request started for a template, so a retry never creates a second one", () => {
    expect(startedDoc("t1")).toBe("");
    rememberStarted("t1", "d1");
    expect(startedDoc("t1")).toBe("d1");
    expect(startedDoc("t2")).toBe("");
  });
});
