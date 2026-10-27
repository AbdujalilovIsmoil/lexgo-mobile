import { http } from "@/shared/api";
import { createOrderWarranty } from "./flowApi";

jest.mock("@/shared/api", () => ({ ...jest.requireActual("@/shared/api"), http: jest.fn() }));
const mockHttp = http as jest.MockedFunction<typeof http>;

describe("warranty claim (Enterprise contract §14)", () => {
  it("sends the kind, the reason and the client's own material-transfer consent", async () => {
    mockHttp.mockResolvedValue({ warranty: { status: "new" } });
    await expect(createOrderWarranty("o1", "", { kind: "no_response", reason: " Javob yo'q ", allowTransfer: true })).resolves.toEqual({ status: "new" });
    expect(mockHttp).toHaveBeenLastCalledWith("/marketplace/me/orders/o1/warranty", { method: "POST", body: { kind: "no_response", reason: "Javob yo'q", allow_material_transfer: true } });
    await createOrderWarranty("o1", "https://lexgo.api.cognilabs.org/marketplace/me/orders/o1/warranty", { kind: "abandoned", reason: "x", allowTransfer: false });
    expect(mockHttp).toHaveBeenLastCalledWith("/marketplace/me/orders/o1/warranty", { method: "POST", body: { kind: "abandoned", reason: "x", allow_material_transfer: false } });
  });
});
