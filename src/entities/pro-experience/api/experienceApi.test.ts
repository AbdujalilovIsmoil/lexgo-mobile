import { http } from "@/shared/api";
import type { ExpInput } from "../model/types";
import { submitExperience } from "./experienceApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
jest.mock("@/shared/lib/upload", () => ({ appendFile: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;
beforeEach(() => mockHttp.mockReset());

const pos = (p: Partial<ExpInput["positions"][number]>): ExpInput["positions"][number] => ({ key: "k", title: " Advokat ", startedOn: "2019-01-01", endedOn: "2022-01-01", isCurrent: false, description: " ", ...p });
const input = (positions: ExpInput["positions"], p: Partial<ExpInput> = {}): ExpInput => ({ sourceId: "", categoryId: "c1", subcategoryId: "", workplace: " Byuro ", positions, description: " Tavsif ", stages: ["appeal"], results: [], evidenceIds: ["e1"], ...p });
const sent = () => (mockHttp.mock.calls[0][1] as { body: Record<string, unknown> }).body;

describe("submitExperience", () => {
  it("sends positions[] with the contract's names and ISO date-times", async () => {
    mockHttp.mockResolvedValueOnce({ id: "n1" });
    await submitExperience(input([pos({}), pos({ title: "Katta advokat", startedOn: "2022-01-01", endedOn: "", isCurrent: true, description: "Rahbar" })]));
    expect(mockHttp.mock.calls[0][0]).toBe("/marketplace/me/experience");
    expect(mockHttp.mock.calls[0][1]).toMatchObject({ method: "POST" });
    expect(sent().positions).toEqual([
      { title: "Advokat", started_at: "2019-01-01T00:00:00Z", ended_at: "2022-01-01T00:00:00Z", is_current: false, description: "" },
      { title: "Katta advokat", started_at: "2022-01-01T00:00:00Z", ended_at: null, is_current: true, description: "Rahbar" },
    ]);
    expect(sent()).toMatchObject({ category_id: "c1", workplace: "Byuro", description: "Tavsif", evidence_ids: ["e1"], source_id: null });
    expect(sent()).not.toHaveProperty("subcategory_id");
  });
  it("also sends the legacy single position, from the current one so an older backend reads it", async () => {
    mockHttp.mockResolvedValueOnce({});
    await submitExperience(input([pos({ title: "Eski", startedOn: "2010-01-01", endedOn: "2012-01-01" }), pos({ title: "Hozir", startedOn: "2020-01-01", endedOn: "", isCurrent: true })]));
    expect(sent()).toMatchObject({ position: "Hozir", started_at: "2020-01-01T00:00:00Z", ended_at: null, is_current: true });
  });
  it("takes the legacy fields from the newest position when none is current", async () => {
    mockHttp.mockResolvedValueOnce({});
    await submitExperience(input([pos({ title: "Eski", startedOn: "2010-01-01", endedOn: "2012-01-01" }), pos({ title: "Yangi", startedOn: "2013-01-01", endedOn: "2016-01-01" })]));
    expect(sent()).toMatchObject({ position: "Yangi", started_at: "2013-01-01T00:00:00Z", ended_at: "2016-01-01T00:00:00Z", is_current: false });
  });
  it("names the verified revision it edits and the direction when there is one", async () => {
    mockHttp.mockResolvedValueOnce({});
    await submitExperience(input([pos({})], { sourceId: "a1", subcategoryId: "s1" }));
    expect(sent()).toMatchObject({ source_id: "a1", subcategory_id: "s1" });
  });
});
