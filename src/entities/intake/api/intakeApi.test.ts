import { http } from "@/shared/api";
import { classifyProblem, getLegalCorpus, sendIntakeFeedback } from "./intakeApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("classifyProblem", () => {
  it("POSTs the text to /ai/classify and reads the three offer levels", async () => {
    mockHttp.mockResolvedValueOnce({ category: "family", executor_type: "advokat", urgency: "high", summary: "S", lead_id: "L1", offer_levels: [{ level: "basic", service_id: "s1", title: "A", base_price: "150000", passport: { standard_duration: 3, required_documents: ["x", "", "y"], advokat_required: true } }, { level: "x", title: "no service" }], sources: [{ key: "k", title: "Lex.uz", url: "https://lex.uz", trust_level: "official" }, { title: "" }], disclaimer: "D" });
    const r = await classifyProblem("Nikoh bekor qilish");
    expect(mockHttp).toHaveBeenCalledWith("/ai/classify", { method: "POST", body: { text: "Nikoh bekor qilish" } });
    expect(r).toMatchObject({ category: "family", urgency: "high", leadId: "L1", disclaimer: "D" });
    expect(r.offers).toEqual([{ level: "basic", serviceId: "s1", title: "A", price: 150000, days: 3, docsCount: 2, advokatRequired: true }]);
    expect(r.sources).toHaveLength(1);
  });
  it("defaults: normal urgency, no lead, no price when it is 0 or junk", async () => {
    mockHttp.mockResolvedValueOnce({ offer_levels: [{ service_id: "s", base_price: 0 }, { service_id: "t", base_price: "abc" }] });
    const r = await classifyProblem("x");
    expect(r).toMatchObject({ urgency: "normal", leadId: undefined, summary: "" });
    expect(r.offers.map((o) => o.price)).toEqual([undefined, undefined]);
  });
});

it("legal corpus accepts items / data / sources wrappers", async () => {
  mockHttp.mockResolvedValueOnce({ sources: [{ title: "A", url: "u" }] });
  expect(await getLegalCorpus()).toEqual([{ key: "", title: "A", url: "u", trustLevel: "" }]);
});

it("feedback posts useful + request id", async () => {
  mockHttp.mockResolvedValueOnce({});
  await sendIntakeFeedback(false, "L1");
  expect(mockHttp).toHaveBeenCalledWith("/ai/feedback", { method: "POST", body: { useful: false, comment: "", request_id: "L1" } });
});
