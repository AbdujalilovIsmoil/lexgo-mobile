import { normRuntime } from "./normalize";

const normSettings = (settings: unknown) => normRuntime({ settings }).settings;

// The public answer as the backend gave it on 2026-10-27 (no token: `access` is null).
const LIVE = {
  settings: {
    allowed_formats: ["pdf", "doc", "docx"],
    max_file_mb: 25,
    included_pages: 10,
    page_pricing: [],
    extra_page_price: 15000,
    modes: ["manual", "lawyer", "review", "analysis"],
    plan_requirements: { required: false, plan_ids: [], entitlement: "", per_mode: {} },
    review_policy: { enabled: false, reviewer_type: "any", sla_minutes: 1440 },
    download_policy: { plan_required: false, plan_ids: [], entitlement: "", formats: ["pdf", "docx"], watermark: false },
    currency: "UZS",
  },
  version: 1,
  settings_id: null,
  access: null,
  contract: { plan_requirements: {}, review_policy: {}, download_policy: {} },
  immutable_order_snapshot_required: true,
};

describe("normRuntime", () => {
  it("reads the live public answer", () => {
    expect(normRuntime(LIVE)).toEqual({
      settings: { formats: ["pdf", "doc", "docx"], maxFileMb: 25, includedPages: 10, modes: ["manual", "lawyer", "review", "analysis"], downloadFormats: ["pdf", "docx"] },
      access: null,
    });
  });
  it("reads the per-mode access of a signed-in answer (TZ.md §4)", () => {
    const rt = normRuntime({ ...LIVE, access: { manual: { allowed: true, mode: "manual", rule: {} }, analysis: { allowed: false, code: "document_plan_not_allowed", mode: "analysis", plan_id: "p1", rule: {} } } });
    expect(rt.access).toEqual({ manual: { allowed: true, code: "", message: "" }, analysis: { allowed: false, code: "document_plan_not_allowed", message: "" } });
  });
  it("takes a code without `allowed` as a refusal, a list of entries as well as an object, and skips unknown modes", () => {
    const rt = normRuntime({ settings: {}, access: [{ mode: "review", code: "document_mode_disabled", message: "O'chirilgan" }, { mode: "ai_draft", allowed: false }, { mode: "lawyer" }] });
    expect(rt.access).toEqual({ review: { allowed: false, code: "document_mode_disabled", message: "O'chirilgan" }, lawyer: { allowed: true, code: "", message: "" } });
  });
  it("an `allowed` flag that is not a boolean is not trusted: the code decides", () => {
    const rt = normRuntime({ access: { analysis: { allowed: "false", code: "document_entitlement_required" }, manual: { allowed: "yes" } } });
    expect(rt.access?.analysis?.allowed).toBe(false);
    expect(rt.access?.manual?.allowed).toBe(true);
  });
  it("leaves everything unstated for an empty, broken or foreign answer", () => {
    const none = { formats: null, maxFileMb: null, includedPages: null, modes: null, downloadFormats: null };
    for (const v of [undefined, null, "oops", [], {}, { settings: "x", access: "y" }]) expect(normRuntime(v)).toEqual({ settings: none, access: null });
  });
  it("reads the payload itself when it is not wrapped in `settings`", () => {
    expect(normRuntime({ allowed_formats: ["PDF"], max_file_mb: "30" }).settings).toMatchObject({ formats: ["pdf"], maxFileMb: 30 });
  });
});

describe("normRuntime settings", () => {
  it("cleans formats and modes: lower case, no dot, no repeats, known modes only", () => {
    const s = normSettings({ allowed_formats: [".PDF", "docx", "pdf", "", 7], modes: ["Analysis", "review", "magic"] });
    expect(s.formats).toEqual(["pdf", "docx", "7"]);
    expect(s.modes).toEqual(["analysis", "review"]);
  });
  it("an empty format or mode list is not stated; empty download formats close every format", () => {
    const s = normSettings({ allowed_formats: [], modes: [], download_policy: { formats: [] } });
    expect(s).toMatchObject({ formats: null, modes: null, downloadFormats: [] });
    expect(normSettings({ download_policy: {} }).downloadFormats).toBeNull();
  });
  it("keeps only positive sizes and whole page counts", () => {
    expect(normSettings({ max_file_mb: 0, included_pages: -2 })).toMatchObject({ maxFileMb: null, includedPages: null });
    expect(normSettings({ max_file_mb: 12.5, included_pages: 7.9 })).toMatchObject({ maxFileMb: 12.5, includedPages: 7 });
    expect(normSettings({ max_file_mb: "abc", included_pages: null })).toMatchObject({ maxFileMb: null, includedPages: null });
  });
});
