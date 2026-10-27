import { normRuntime } from "./normalize";

// The live public answer for a debt-collection service (2026-10-27), trimmed to the parts that matter here.
const LIVE = {
  service_id: "66025070-c421-4ebe-a0ba-2656e69acf27",
  duration: { value: 7, unit: "day", calendar: "business_days", starts_on: "seller_acceptance", business_weekdays: [1, 2, 3, 4, 5], business_days_label: "Monday-Friday" },
  review: { value: 0, unit: "hour", starts_on: "seller_acceptance", client_note: "" },
  template: { mode: "optional", source: "catalog", document_template_id: "64801945-598d-4386-bb6a-eaeb05b479a3" },
  minimum_requirements: { verified: true, minimum_experience_years: 0, minimum_rating: 1 },
  rules: [
    { id: "35171e3c", rule_key: "maxfiylik", version: "1.0", title: "Maxfiylik va Sir saqlash siyosati", body: "Mijoz bilan suxbat&nbsp;<br><ul><li>oshkor qilinsa</li></ul>", audience: "executor" },
    { id: "faf9571f", rule_key: "inline", version: "inline-a7e3115c4fca", title: "Bonus puli", body: "5% ,10% oraligida bonus", audience: "executor" },
  ],
  client_rules: [],
  seller_selectable_rules: [],
  guarantees: [
    {
      id: "d3d04973", studio_object_id: "d3d04973", version_id: "2e7f335b",
      conditions: { match: "any", service_ids: ["0c6ea8e5"], package_tiers: ["STANDARD"], paid_only: false },
      is_active: true, title: "Xizmat bajarilmasa pul qaytariladi ", icon: "shield-check",
      description: "Pul faqat ish bajarilmaganda qaytariladi . \n\nAgar ish mijozning aybi bilan to'xtasa, qaytarilmaydi ", audiences: ["client"],
    },
  ],
  placement: "service_detail",
  checklist_preview: [
    { id: "check_7a67", key: "check_7a67", title: "Mijoz bilan uchrashish va sudda ishtirok etish ", description: "", required: true, verification_methods: ["checkbox", "image"], image_required: true, order: 2 },
    { id: "check_d21d", key: "check_d21d", title: "Muammoni chuqur o'rganish", description: "", required: true, verification_methods: ["checkbox"], order: 1 },
  ],
};

describe("service runtime normaliser", () => {
  it("reads the live answer: business-day duration, no review, the client's guarantee, the checklist in order", () => {
    const r = normRuntime(LIVE, "x");
    expect(r.serviceId).toBe("66025070-c421-4ebe-a0ba-2656e69acf27");
    expect(r.placement).toBe("service_detail");
    expect(r.duration).toEqual({ value: 7, unit: "day", calendar: "business_days", weekdays: [1, 2, 3, 4, 5] });
    expect(r.review).toBeNull();
    expect(r.clientRules).toEqual([]);
    expect(r.guarantees).toEqual([{ id: "d3d04973", icon: "check", title: "Xizmat bajarilmasa pul qaytariladi", description: "Pul faqat ish bajarilmaganda qaytariladi . \n\nAgar ish mijozning aybi bilan to'xtasa, qaytarilmaydi", trigger: "", resolution: "", resolutionMinutes: 0 }]);
    expect(r.checklist.map((c) => c.title)).toEqual(["Muammoni chuqur o'rganish", "Mijoz bilan uchrashish va sudda ishtirok etish"]);
    expect(r.checklist[0]).toEqual({ id: "check_d21d", title: "Muammoni chuqur o'rganish", description: "", required: true });
  });

  it("never carries the executor's rules, Studio metadata or template internals", () => {
    const out = JSON.stringify(normRuntime(LIVE));
    for (const secret of ["Bonus puli", "Maxfiylik", "conditions", "STANDARD", "version_id", "2e7f335b", "audiences", "shield-check", "64801945", "minimum", "verification"]) expect(out).not.toContain(secret);
  });

  it("an empty or broken answer gives empty sections, not a crash", () => {
    const empty = { serviceId: "s1", placement: "service_detail", duration: null, review: null, clientRules: [], guarantees: [], checklist: [] };
    expect(normRuntime(null, "s1")).toEqual(empty);
    expect(normRuntime({ duration: "5 days", review: [], guarantees: {}, client_rules: "x", checklist_preview: [null, 3] }, "s1")).toEqual(empty);
    expect(normRuntime({ duration: { value: 0, unit: "day" } }).duration).toBeNull();
    expect(normRuntime({ duration: { value: 3, unit: "week" } }).duration).toBeNull();
  });

  it("shows the review only when its value is above zero, with the client note as plain text", () => {
    expect(normRuntime({ review: { value: 0, unit: "hour", client_note: "x" } }).review).toBeNull();
    const r = normRuntime({ review: { value: 2, unit: "hour", client_note: "<p>Avval &laquo;hujjatlar&raquo; ko'riladi</p>" } }).review;
    expect(r).toEqual({ time: { value: 2, unit: "hour", calendar: "calendar", weekdays: [] }, clientNote: "Avval «hujjatlar» ko'riladi" });
    expect(normRuntime({ review: { value: "3", unit: "parsec" } }).review).toEqual({ time: null, clientNote: "" });
  });

  it("takes the business week from the label when the weekdays are missing, and lends the duration's to the review", () => {
    const week = (duration: Record<string, unknown>) => normRuntime({ duration }).duration?.weekdays;
    expect(week({ value: 5, unit: "days", calendar: "business_days", business_days_label: "Monday-Saturday" })).toEqual([1, 2, 3, 4, 5, 6]);
    expect(week({ value: 5, unit: "day", calendar: "business_days", business_days_label: "Mon, Wed, Fri" })).toEqual([1, 3, 5]);
    expect(week({ value: 5, unit: "day", calendar: "business_days", business_weekdays: [5, 1, 9, "x", 3] })).toEqual([1, 3, 5]);
    expect(week({ value: 5, unit: "day", calendar: "calendar", business_weekdays: [1, 2] })).toEqual([]);
    // Nothing readable: the backend's documented Monday–Friday, never a week of the app's own.
    expect(week({ value: 5, unit: "day", calendar: "business_days", business_days_label: "Ish kunlari" })).toEqual([1, 2, 3, 4, 5]);
    const r = normRuntime({ duration: { value: 5, unit: "day", calendar: "business_days", business_weekdays: [1, 2, 3, 4, 5, 6] }, review: { value: 4, unit: "hour", calendar: "business_days" } });
    expect(r.review?.time?.weekdays).toEqual([1, 2, 3, 4, 5, 6]);
    expect(normRuntime({ review: { value: 4, unit: "hour", calendar: "working_days" } }).review?.time).toEqual({ value: 4, unit: "hour", calendar: "business_days", weekdays: [1, 2, 3, 4, 5] });
  });

  it("reads client rules with HTML bodies as text and skips rules for the professionals", () => {
    const r = normRuntime({ client_rules: [
      { id: "r1", rule_key: "k", version: "1.0", title: "To'lov tartibi", body: "Oldindan to'lov&nbsp;<br><ul><li>10%</li><li>qolgani &mdash; yakunda</li></ul>", audience: "client" },
      { id: "r2", title: "Ichki qoida", body: "x", audience: "executor" },
      { id: "r3", title: "", body: "" },
    ] });
    expect(r.clientRules).toEqual([{ id: "r1", title: "To'lov tartibi", version: "1.0", body: "Oldindan to'lov\n• 10%\n• qolgani — yakunda" }]);
  });

  it("keeps only active guarantees meant for the client (legacy audience aliases too) and hides snake_case codes", () => {
    const g = (extra: Record<string, unknown>) => ({ id: "g", title: "Kafolat", ...extra });
    const r = normRuntime({ guarantees: [
      g({ id: "a", audiences: ["client", "advokat"], trigger: "Mutaxassis javob bermasa", resolution: "full_refund", resolution_minutes: 180 }),
      g({ id: "b", audiences: ["advokat", "yurist"] }),
      g({ id: "c", audience: "advokat_yurist" }),
      g({ id: "d", audience: "client" }),
      g({ id: "e" }),
      g({ id: "f", audiences: ["client"], is_active: false }),
      { id: "h", audiences: ["client"] },
    ] });
    expect(r.guarantees.map((x) => x.id)).toEqual(["a", "d", "e"]);
    expect(r.guarantees[0]).toMatchObject({ trigger: "Mutaxassis javob bermasa", resolution: "", resolutionMinutes: 180 });
  });

  it("shows a guarantee that arrives twice once", () => {
    const g = { id: "g1", title: "Kafolat", audiences: ["client"] };
    expect(normRuntime({ guarantees: [g, { ...g, title: "Kafolat (yana)" }, { title: "Id'siz" }, { title: "Id'siz 2" }] }).guarantees.map((x) => x.title)).toEqual(["Kafolat", "Id'siz", "Id'siz 2"]);
  });

  it("shows the client's checklist labels; the seller's internal description never leaks", () => {
    const r = normRuntime({ checklist_preview: [
      { id: "i1", executor_title: "Verify the identity document", client_title: "Identity document verified", description: "Internal execution guidance", client_description: "The professional checks it.", required: true },
      { id: "i2", executor_title: "Internal only", description: "Internal", required: false },
      { key: "i3", title: "Sanitised item", description: "Client text", is_required: true },
      { id: "i4", title: "Upload the scan", description: "Internal hint", show_files_to_client: true },
    ] });
    expect(r.checklist).toEqual([
      { id: "i1", title: "Identity document verified", description: "The professional checks it.", required: true },
      { id: "i2", title: "Internal only", description: "", required: false },
      { id: "i3", title: "Sanitised item", description: "Client text", required: true },
      { id: "i4", title: "Upload the scan", description: "", required: false },
    ]);
  });

  it("reads the Studio icon as one of a few kinds", () => {
    const icons = normRuntime({ guarantees: ["shield-check", "refund", "clock", "lock", "", "rocket"].map((icon, i) => ({ id: `g${i}`, title: "K", icon })) }).guarantees.map((g) => g.icon);
    expect(icons).toEqual(["check", "refund", "clock", "lock", "shield", "shield"]);
  });
});
