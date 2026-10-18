import { getCeo } from "./ceoApi";

const mockHttp = jest.fn();
jest.mock("@/shared/api", () => ({ http: (...a: unknown[]) => mockHttp(...a) }));

describe("getCeo", () => {
  it("reads the monetisation numbers the dashboard shows", async () => {
    mockHttp.mockResolvedValue({ revenue: 1000, arr: 37_700_000, arpu: 1_400_000, take_rate: 17, ltv: 16_800_000, cac: { total: 5, client: 3, advocate: 7 }, funnel: [{ stage: "leads", value: 10 }] });
    const c = await getCeo();
    expect(mockHttp).toHaveBeenCalledWith("/analytics/ceo");
    expect(c).toMatchObject({ arr: 37_700_000, arpu: 1_400_000, takeRate: 17, ltv: 16_800_000, cac: 5, cacClient: 3, cacAdvocate: 7 });
    expect(c.funnel).toEqual([{ label: "leads", value: 10 }]);
  });
  it("accepts a plain cac number and survives an empty answer", async () => {
    mockHttp.mockResolvedValue({ cac: 9 });
    expect((await getCeo()).cac).toBe(9);
    mockHttp.mockResolvedValue(null);
    expect(await getCeo()).toMatchObject({ arr: 0, arpu: 0, takeRate: 0, ltv: 0, funnel: [] });
  });
  it("passes the region and date filter on", async () => {
    mockHttp.mockResolvedValue({});
    await getCeo({ region: "toshkent", from: "2026-10-01", to: "2026-10-12" });
    expect(mockHttp).toHaveBeenLastCalledWith("/analytics/ceo?region=toshkent&date_from=2026-10-01&date_to=2026-10-12");
  });
});
